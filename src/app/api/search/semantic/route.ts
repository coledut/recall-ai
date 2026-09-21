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

    const { query, limit = 10 } = await request.json();

    if (!query?.trim()) {
      return Response.json({ error: 'Query required' }, { status: 400 });
    }

    // Get all user's memories
    const { data: memories, error: memError } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', user.id)
      .limit(100); // Fetch recent 100 for semantic search

    if (memError || !memories) {
      return Response.json({ error: 'Failed to fetch memories' }, { status: 500 });
    }

    // Use Claude to understand the query intent and find best matches
    const client = new Anthropic();

    // Create a context of all memories
    const memoriesContext = memories
      .map((m, i) => `${i + 1}. ${m.title}: ${m.content?.substring(0, 100)}`)
      .join('\n');

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `You are a search assistant for a memory management system.

User's memories:
${memoriesContext}

User search query: "${query}"

Find the top ${Math.min(limit, 20)} most relevant memories that match the user's search intent.
Consider semantic meaning, not just keyword matching.

Return JSON array with memory indices only (1-based):
Example: [2, 5, 7]

Return ONLY the JSON array, nothing else:`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return Response.json({ error: 'Failed to process search' }, { status: 500 });
    }

    let indices: number[] = [];
    try {
      indices = JSON.parse(content.text);
    } catch {
      // Fallback to simple text search if Claude returns invalid JSON
      const queryLower = query.toLowerCase();
      indices = memories
        .map((m, i) => ({
          index: i,
          score: (
            (m.title?.toLowerCase().includes(queryLower) ? 2 : 0) +
            (m.content?.toLowerCase().includes(queryLower) ? 1 : 0)
          ),
        }))
        .filter(m => m.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(m => m.index + 1);
    }

    // Score results with TypeSafe if available
    let scoredResults: any[] = indices
      .map(idx => memories[idx - 1])
      .filter(m => m !== undefined)
      .map((m, i) => ({ memory: m, position: i }));

    if (typeSafeKey && scoredResults.length > 0) {
      try {
        // Score each result for relevance
        const questions: TypeSafeQuestion[] = [
          {
            id: 'relevance',
            instruction: `How relevant is this memory to the user's search query: "${query}"?`,
            type: 'score',
            criteria: '1=Not relevant, 5=Highly relevant and directly answers the query',
          },
          {
            id: 'recency',
            instruction: `Is this memory recent and useful for remembering what just happened?`,
            type: 'noul',
          },
          {
            id: 'importance',
            instruction: `Is this an important memory that the user frequently refers to?`,
            type: 'noul',
          },
        ];

        // Score results in batches to avoid rate limits
        const batchSize = 5;
        for (let i = 0; i < scoredResults.length; i += batchSize) {
          const batch = scoredResults.slice(i, i + batchSize);

          for (const item of batch) {
            try {
              const typeSafeResponse = await askTypeSafe(
                {
                  query,
                  memoryTitle: item.memory.title,
                  memoryContent: item.memory.content?.substring(0, 300) || '',
                  memorySource: item.memory.source,
                  createdAt: item.memory.created_at,
                },
                questions,
                typeSafeKey
              );

              // Extract scores from TypeSafe
              let relevanceScore = 3; // Default middle score
              let recencyScore = 0.5;
              let importanceScore = 0.5;

              for (const q of typeSafeResponse.questions) {
                if (q.id === 'relevance' && q.score !== undefined) {
                  relevanceScore = q.score;
                } else if (q.id === 'recency' && q.noul !== undefined) {
                  recencyScore = q.noul;
                } else if (q.id === 'importance' && q.noul !== undefined) {
                  importanceScore = q.noul;
                }
              }

              // Combine scores: relevance is primary (0-5), boost with recency and importance
              item.typeSafeScore =
                relevanceScore * 10 + recencyScore * 3 + importanceScore * 2;
              item.relevanceScore = relevanceScore;
              item.recencyScore = recencyScore;
              item.importanceScore = importanceScore;
            } catch (err) {
              console.error('TypeSafe scoring error:', err instanceof Error ? err.message : String(err));
              // Fallback to position-based scoring
              item.typeSafeScore = (scoredResults.length - item.position) * 5;
            }
          }
        }

        // Re-sort by TypeSafe scores
        scoredResults.sort((a, b) => (b.typeSafeScore || 0) - (a.typeSafeScore || 0));
      } catch (err) {
        console.error('TypeSafe integration error:', err instanceof Error ? err.message : String(err));
        // Continue with original order if TypeSafe fails
      }
    }

    // Return top results
    const results = scoredResults
      .slice(0, limit)
      .map(item => ({
        id: item.memory.id,
        title: item.memory.title,
        content: item.memory.content,
        source: item.memory.source,
        priority: item.memory.priority,
        due_date: item.memory.due_date,
        created_at: item.memory.created_at,
        ...(item.typeSafeScore && {
          relevanceScore: item.relevanceScore,
          recencyScore: item.recencyScore,
          importanceScore: item.importanceScore,
        }),
      }));

    return Response.json({
      success: true,
      query,
      resultsCount: results.length,
      results,
      enhanced: typeSafeKey ? 'TypeSafe relevance ranking enabled' : 'Basic semantic search',
    });
  } catch (error) {
    console.error('Semantic search error:', error);
    return Response.json({ error: 'Search failed' }, { status: 500 });
  }
}
