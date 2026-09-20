import { createClient } from '@supabase/supabase-js';

// Zapier App Integration
// Exposes triggers and actions for Zapier workflows

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');
    if (!authToken) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, data } = await request.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return Response.json({ error: 'Config' }, { status: 500 });

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user } } = await supabase.auth.getUser(authToken);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Zapier Actions
    if (action === 'create_memory') {
      const { title, content, priority, due_date } = data;

      const { data: memory, error } = await supabase
        .from('memories')
        .insert([{
          user_id: user.id,
          title,
          content,
          source: 'zapier',
          priority: priority || 'medium',
          due_date,
          status: 'active',
        }])
        .select()
        .single();

      if (error) return Response.json({ error: error.message }, { status: 500 });
      return Response.json({ success: true, memory });
    }

    if (action === 'mark_complete') {
      const { memory_id } = data;

      const { data: memory, error } = await supabase
        .from('memories')
        .update({ status: 'completed' })
        .eq('id', memory_id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) return Response.json({ error: 'Not found' }, { status: 404 });
      return Response.json({ success: true, memory });
    }

    if (action === 'get_memories') {
      const { status, limit = 10 } = data;

      let query = supabase
        .from('memories')
        .select('*')
        .eq('user_id', user.id);

      if (status) query = query.eq('status', status);

      const { data: memories } = await query.limit(limit);
      return Response.json({ success: true, memories: memories || [] });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}

// Zapier Triggers
export async function GET(request: Request) {
  const trigger = new URL(request.url).searchParams.get('trigger');

  // memory.created trigger
  if (trigger === 'new_memory') {
    return Response.json({
      name: 'New Memory Created',
      description: 'Triggers when a new memory is captured',
      fields: [
        { key: 'id', label: 'Memory ID' },
        { key: 'title', label: 'Title' },
        { key: 'content', label: 'Content' },
        { key: 'priority', label: 'Priority' },
        { key: 'due_date', label: 'Due Date' },
        { key: 'created_at', label: 'Created At' },
      ],
    });
  }

  // memory.completed trigger
  if (trigger === 'memory_completed') {
    return Response.json({
      name: 'Memory Completed',
      description: 'Triggers when a memory is marked complete',
      fields: [
        { key: 'id', label: 'Memory ID' },
        { key: 'title', label: 'Title' },
        { key: 'completed_at', label: 'Completed At' },
      ],
    });
  }

  // Available actions
  if (trigger === 'actions') {
    return Response.json({
      actions: [
        {
          key: 'create_memory',
          name: 'Create Memory',
          description: 'Create a new memory in Recall AI',
        },
        {
          key: 'mark_complete',
          name: 'Mark Memory as Complete',
          description: 'Mark an existing memory as completed',
        },
        {
          key: 'get_memories',
          name: 'Get Memories',
          description: 'Retrieve memories from Recall AI',
        },
      ],
    });
  }

  return Response.json({ error: 'Invalid trigger' }, { status: 400 });
}
