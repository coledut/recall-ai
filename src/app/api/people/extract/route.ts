import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

interface TypeSafeQuestion {
  id: string;
  instruction: string;
  type: 'choice' | 'score' | 'noul';
  criteria?: string[] | Record<string, string> | string;
}

interface TypeSafeResponse {
  questions: Array<{
    id: string;
    choice?: string;
    score?: number;
    noul?: number;
    confidence?: number;
  }>;
}

async function askTypeSafe(
  state: Record<string, any>,
  questions: TypeSafeQuestion[],
  apiKey: string
): Promise<TypeSafeResponse> {
  const response = await fetch('https://api.typesafe.ai/v1/judge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      state,
      questions,
    }),
  });

  if (!response.ok) {
    throw new Error(`TypeSafe API error: ${response.statusText}`);
  }

  return response.json();
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');

    if (!authToken) {
      return Response.json({ error: 'Missing auth token' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const typeSafeKey = process.env.TYPESAFE_API_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: 'Config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user } } = await supabase.auth.getUser(authToken);

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, memoryId } = await request.json();

    if (!text?.trim()) {
      return Response.json({ error: 'Text required' }, { status: 400 });
    }

    // Use Claude to extract people names
    const client = new Anthropic();
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Extract all person names from this text. Return as JSON array of strings.
Only return actual person names, not generic terms.
Example: "Meeting with John Smith and Sarah from Marketing" → ["John Smith", "Sarah"]

Text: "${text}"

JSON array:`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return Response.json({ error: 'Failed to extract people' }, { status: 500 });
    }

    let names: string[] = [];
    try {
      names = JSON.parse(content.text);
      if (!Array.isArray(names)) names = [];
    } catch {
      names = [];
    }

    // Add or link people to this memory
    const createdPeople = [];
    for (const name of names) {
      if (!name?.trim()) continue;

      let roleType = 'unknown';
      let importance = 3;
      let isProfessional = false;
      let context = '';

      // Use TypeSafe to understand the relationship (if API key available)
      if (typeSafeKey) {
        try {
          const typeSafeQuestions: TypeSafeQuestion[] = [
            {
              id: 'role',
              instruction: `What is ${name}'s primary role or relationship in this context?`,
              type: 'choice',
              criteria: {
                colleague: 'Works with me, professional peer',
                mentor: 'Teaches or guides me',
                friend: 'Personal friend, social relationship',
                manager: 'My supervisor or boss',
                client: 'Customer or client I serve',
                family: 'Family member',
                unknown: 'Role unclear or not mentioned',
              },
            },
            {
              id: 'importance',
              instruction: `How important is this person to me based on this interaction?`,
              type: 'score',
              criteria: '1=Mentioned once in passing, 5=Critically important to my work or life',
            },
            {
              id: 'isProfessional',
              instruction: `Is this interaction primarily professional or work-related?`,
              type: 'noul',
            },
          ];

          const typeSafeResponse = await askTypeSafe(
            {
              text,
              personName: name,
              context: 'Analyzing a person mentioned in a memory or message',
            },
            typeSafeQuestions,
            typeSafeKey
          );

          // Extract results from TypeSafe response
          for (const question of typeSafeResponse.questions) {
            if (question.id === 'role' && question.choice) {
              roleType = question.choice;
            } else if (question.id === 'importance' && question.score !== undefined) {
              importance = Math.round(question.score);
            } else if (question.id === 'isProfessional' && question.noul !== undefined) {
              isProfessional = question.noul > 0.5;
            }
          }

          context = `${roleType} (importance: ${importance}/5, professional: ${isProfessional})`;
        } catch (err) {
          console.error('TypeSafe extraction error:', err instanceof Error ? err.message : String(err));
          // Fall back to Claude for context if TypeSafe fails
          context = 'Relationship extracted with Claude';
        }
      } else {
        context = 'Relationship data not available';
      }

      // Check if person already exists
      const { data: existing } = await supabase
        .from('people')
        .select('id, interaction_count, role_type, importance_score')
        .eq('user_id', user.id)
        .eq('name', name.trim())
        .single();

      let personId: string;
      if (existing) {
        personId = existing.id;
        // Update last contact date, increment interaction count, and update relationship metadata
        await supabase
          .from('people')
          .update({
            last_contact_date: new Date().toISOString(),
            interaction_count: (existing.interaction_count || 1) + 1,
            role_type: roleType || existing.role_type,
            importance_score: Math.max(existing.importance_score || 0, importance),
            is_professional: isProfessional,
            context_notes: context,
          })
          .eq('id', personId);
      } else {
        // Create new person with relationship metadata
        const { data: newPerson, error: createError } = await supabase
          .from('people')
          .insert([
            {
              user_id: user.id,
              name: name.trim(),
              role_type: roleType,
              importance_score: importance,
              is_professional: isProfessional,
              context_notes: context,
              first_contact_date: new Date().toISOString(),
              last_contact_date: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (createError || !newPerson) {
          console.error('Failed to create person:', createError);
          continue;
        }
        personId = newPerson.id;
        createdPeople.push(newPerson);
      }

      // Link to memory if memoryId provided
      if (memoryId) {
        try {
          await supabase.from('memory_people').insert([
            {
              memory_id: memoryId,
              person_id: personId,
            },
          ]);
        } catch (err) {
          // Ignore if already linked
          console.log('Link already exists or error:', err instanceof Error ? err.message : String(err));
        }
      }
    }

    return Response.json({
      success: true,
      extracted: names,
      createdCount: createdPeople.length,
      people: createdPeople,
      enhanced: typeSafeKey ? 'TypeSafe relationship analysis enabled' : 'Basic extraction only',
    });
  } catch (error) {
    console.error('Extract people error:', error);
    return Response.json({ error: 'Failed to extract people' }, { status: 500 });
  }
}
