import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
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

    // Get sort parameter
    const url = new URL(request.url);
    const sortBy = url.searchParams.get('sort') || 'last_contact_date';

    const orderDirection = sortBy === 'interaction_count' ? 'desc' : 'desc';

    // Fetch people
    const { data: people, error } = await supabase
      .from('people')
      .select('*')
      .eq('user_id', user.id)
      .order(sortBy, { ascending: sortBy === 'name' });

    if (error) {
      console.error('Failed to fetch people:', error);
      return Response.json({ error: 'Failed to fetch people' }, { status: 500 });
    }

    return Response.json({
      success: true,
      people: people || [],
      count: (people || []).length,
    });
  } catch (error) {
    console.error('People error:', error);
    return Response.json({ error: 'Failed to fetch people' }, { status: 500 });
  }
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

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: 'Config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user } } = await supabase.auth.getUser(authToken);

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, company, role, relationship, notes } = await request.json();

    if (!name?.trim()) {
      return Response.json({ error: 'Name is required' }, { status: 400 });
    }

    // Insert person
    const { data: person, error } = await supabase
      .from('people')
      .insert([
        {
          user_id: user.id,
          name: name.trim(),
          email: email || null,
          company: company || null,
          role: role || null,
          relationship: relationship || 'contact',
          notes: notes || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Failed to create person:', error);
      return Response.json(
        { error: error.message || 'Failed to create person' },
        { status: 500 }
      );
    }

    return Response.json({ success: true, person });
  } catch (error) {
    console.error('Create person error:', error);
    return Response.json({ error: 'Failed to create person' }, { status: 500 });
  }
}
