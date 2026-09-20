import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
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

    const { data: team, error } = await supabase
      .from('teams')
      .select('api_key, api_key_created_at')
      .eq('id', params.teamId)
      .eq('owner_id', user.id)
      .single();

    if (error) return Response.json({ error: 'Not found' }, { status: 404 });

    return Response.json({ success: true, apiKey: team.api_key, createdAt: team.api_key_created_at });
  } catch (error) {
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
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

    // Regenerate API key (only for owner)
    const { data: team, error: fetchError } = await supabase
      .from('teams')
      .select('owner_id')
      .eq('id', params.teamId)
      .single();

    if (fetchError || team.owner_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const newApiKey = `recall_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const { data: updated, error: updateError } = await supabase
      .from('teams')
      .update({
        api_key: newApiKey,
        api_key_created_at: new Date().toISOString(),
      })
      .eq('id', params.teamId)
      .select()
      .single();

    if (updateError) return Response.json({ error: 'Failed' }, { status: 500 });

    return Response.json({ success: true, apiKey: newApiKey });
  } catch (error) {
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
