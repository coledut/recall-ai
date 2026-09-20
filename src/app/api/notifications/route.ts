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

    // Fetch all memories with due dates
    const { data: memories, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', user.id)
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return Response.json({ error: 'Failed to fetch memories' }, { status: 500 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue: any[] = [];
    const dueToday: any[] = [];
    const comingUp: any[] = [];

    // Categorize memories
    for (const memory of memories || []) {
      if (!memory.due_date) continue;

      const dueDate = new Date(memory.due_date);
      dueDate.setHours(0, 0, 0, 0);

      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysOverdue > 0) {
        // Overdue
        overdue.push({
          id: memory.id,
          title: memory.title,
          priority: memory.priority,
          daysOverdue,
          dueDate: memory.due_date,
        });
      } else if (daysOverdue === 0) {
        // Due today
        dueToday.push({
          id: memory.id,
          title: memory.title,
          priority: memory.priority,
          dueDate: memory.due_date,
        });
      } else {
        // Coming up (next 7 days)
        const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue <= 7) {
          comingUp.push({
            id: memory.id,
            title: memory.title,
            priority: memory.priority,
            daysUntilDue,
            dueDate: memory.due_date,
          });
        }
      }
    }

    return Response.json({
      summary: {
        overdue: overdue.length,
        dueToday: dueToday.length,
        comingUp: comingUp.length,
      },
      overdue: overdue.sort((a, b) => b.daysOverdue - a.daysOverdue),
      dueToday: dueToday.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3) - 
               (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3);
      }),
      comingUp: comingUp.sort((a, b) => a.daysUntilDue - b.daysUntilDue),
    });
  } catch (error) {
    console.error('Notifications error:', error);
    return Response.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
