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

    const today = new Date().toISOString().split('T')[0];

    // Get overdue items (past due date)
    const { data: overdueData } = await supabase
      .from('memories')
      .select('*')
      .lt('due_date', today)
      .neq('due_date', null)
      .eq('status', 'processed');

    // Get due today items
    const { data: dueTodayData } = await supabase
      .from('memories')
      .select('*')
      .eq('due_date', today)
      .eq('status', 'processed');

    const overdue = overdueData || [];
    const dueToday = dueTodayData || [];

    return Response.json({
      overdue: overdue.map(m => ({
        id: m.id,
        title: m.title,
        daysOverdue: Math.floor((new Date().getTime() - new Date(m.due_date).getTime()) / (1000 * 60 * 60 * 24))
      })),
      dueToday: dueToday.map(m => ({
        id: m.id,
        title: m.title,
        priority: m.priority
      })),
      summary: {
        overdue: overdue.length,
        dueToday: dueToday.length,
        total: overdue.length + dueToday.length
      }
    });
  } catch (error) {
    console.error("Notifications error:", error);
    return Response.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
