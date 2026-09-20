import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');
    if (!authToken) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return Response.json({ error: 'Config' }, { status: 500 });

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user } } = await supabase.auth.getUser(authToken);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get user's teams
    const { data: ownedTeams } = await supabase
      .from('teams')
      .select('*')
      .eq('owner_id', user.id);

    const { data: memberTeams } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id);

    const memberTeamIds = (memberTeams || []).map(m => m.team_id);

    return Response.json({
      success: true,
      ownedTeams: ownedTeams || [],
      memberTeams: memberTeamIds,
    });
  } catch (error) {
    console.error('Teams error:', error);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');
    if (!authToken) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return Response.json({ error: 'Config' }, { status: 500 });

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user } } = await supabase.auth.getUser(authToken);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, description, plan } = await request.json();
    if (!name?.trim()) return Response.json({ error: 'Name required' }, { status: 400 });

    const { data: team, error } = await supabase
      .from('teams')
      .insert([{
        owner_id: user.id,
        name: name.trim(),
        description,
        plan: plan || 'free',
      }])
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ success: true, team });
  } catch (error) {
    console.error('Create team error:', error);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
