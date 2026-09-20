import { createClient } from '@supabase/supabase-js';

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

    const { event_type, webhook_url, active, events } = await request.json();

    if (!webhook_url?.trim()) return Response.json({ error: 'URL required' }, { status: 400 });

    // Validate URL
    try {
      new URL(webhook_url);
    } catch {
      return Response.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Store webhook
    const { data: webhook, error } = await supabase
      .from('webhooks')
      .insert([{
        user_id: user.id,
        url: webhook_url,
        events: events || ['memory.created', 'memory.completed'],
        active: active !== false,
      }])
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ success: true, webhook });
  } catch (error) {
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}

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

    const { data: webhooks } = await supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', user.id);

    return Response.json({ success: true, webhooks: webhooks || [] });
  } catch (error) {
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
