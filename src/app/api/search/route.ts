import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: "Config error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    const type = searchParams.get('type') || 'all'; // all, title, people, content

    if (!query || query.length < 2) {
      return Response.json({ results: [] });
    }

    let baseQuery = supabase
      .from('memories')
      .select('*');

    // Filter based on search type
    if (type === 'title' || type === 'all') {
      baseQuery = baseQuery.ilike('title', `%${query}%`);
    } else if (type === 'people') {
      baseQuery = baseQuery.ilike('tags', `%${query}%`);
    } else if (type === 'content') {
      baseQuery = baseQuery.ilike('content', `%${query}%`);
    }

    const { data, error } = await baseQuery
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Search error:', error);
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({
      query,
      count: data?.length || 0,
      results: data || []
    });
  } catch (error) {
    console.error("Search error:", error);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
