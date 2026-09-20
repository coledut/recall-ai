import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');

    if (!authToken) {
      return Response.json({ error: 'Missing auth token' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

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

      // Check if person already exists
      const { data: existing } = await supabase
        .from('people')
        .select('id, interaction_count')
        .eq('user_id', user.id)
        .eq('name', name.trim())
        .single();

      let personId: string;
      if (existing) {
        personId = existing.id;
        // Update last contact date and increment interaction count
        await supabase
          .from('people')
          .update({
            last_contact_date: new Date().toISOString(),
            interaction_count: (existing.interaction_count || 1) + 1,
          })
          .eq('id', personId);
      } else {
        // Create new person
        const { data: newPerson, error: createError } = await supabase
          .from('people')
          .insert([
            {
              user_id: user.id,
              name: name.trim(),
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
    });
  } catch (error) {
    console.error('Extract people error:', error);
    return Response.json({ error: 'Failed to extract people' }, { status: 500 });
  }
}
