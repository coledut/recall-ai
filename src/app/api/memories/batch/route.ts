import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');
    if (!authToken) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return Response.json({ error: 'Config error' }, { status: 500 });

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user } } = await supabase.auth.getUser(authToken);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, ids, updates } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Response.json({ error: 'No IDs provided' }, { status: 400 });
    }

    let result;

    if (action === 'delete') {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('user_id', user.id)
        .in('id', ids);
      if (error) throw error;
      result = { deleted: ids.length };
    } else if (action === 'update') {
      const { error } = await supabase
        .from('memories')
        .update(updates || {})
        .eq('user_id', user.id)
        .in('id', ids);
      if (error) throw error;
      result = { updated: ids.length };
    } else if (action === 'mark-complete') {
      const { error } = await supabase
        .from('memories')
        .update({ status: 'completed' })
        .eq('user_id', user.id)
        .in('id', ids);
      if (error) throw error;
      result = { completed: ids.length };
    } else if (action === 'prioritize') {
      const { priority } = updates || {};
      const { error } = await supabase
        .from('memories')
        .update({ priority: priority || 'high' })
        .eq('user_id', user.id)
        .in('id', ids);
      if (error) throw error;
      result = { prioritized: ids.length, priority };
    } else {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error('Batch operation error:', error);
    return Response.json({ error: 'Operation failed' }, { status: 500 });
  }
}
