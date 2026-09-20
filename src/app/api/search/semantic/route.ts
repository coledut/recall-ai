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

Find the top ${Math.min(limit, 10)} most relevant memories that match the user's search intent.
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

    // Get the actual memory objects
    const results = indices
      .map(idx => memories[idx - 1])
      .filter(m => m !== undefined);

    return Response.json({
      success: true,
      query,
      resultsCount: results.length,
      results: results.map(m => ({
        id: m.id,
        title: m.title,
        content: m.content,
        source: m.source,
        priority: m.priority,
        due_date: m.due_date,
        created_at: m.created_at,
      })),
    });
  } catch (error) {
    console.error('Semantic search error:', error);
    return Response.json({ error: 'Search failed' }, { status: 500 });
  }
}
