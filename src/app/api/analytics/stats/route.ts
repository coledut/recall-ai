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

    // Fetch all memories
    const { data: memories, error: memError } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', user.id);

    if (memError) {
      return Response.json({ error: 'Failed to fetch memories' }, { status: 500 });
    }

    // Fetch all people
    const { data: peopleData } = await supabase
      .from('people')
      .select('*')
      .eq('user_id', user.id);

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisWeek = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);

    // Calculate stats
    const allMemories = memories || [];
    const allPeople = peopleData || [];

    // Total counts
    const totalMemories = allMemories.length;
    const totalPeople = allPeople.length;
    const avgInteractionsPerPerson = allPeople.length > 0
      ? Math.round(allMemories.length / allPeople.length * 10) / 10
      : 0;

    // Priority breakdown
    const byPriority = {
      high: allMemories.filter(m => m.priority === 'high').length,
      medium: allMemories.filter(m => m.priority === 'medium').length,
      low: allMemories.filter(m => m.priority === 'low').length,
    };

    // Overdue/Due counts
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let overdue = 0;
    let dueToday = 0;
    let dueSoon = 0; // Next 7 days

    for (const memory of allMemories) {
      if (!memory.due_date) continue;

      const dueDate = new Date(memory.due_date);
      dueDate.setHours(0, 0, 0, 0);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysOverdue > 0) {
        overdue++;
      } else if (daysOverdue === 0) {
        dueToday++;
      } else {
        const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue <= 7) {
          dueSoon++;
        }
      }
    }

    // Timeline data (memories created this week)
    const weekTimeline: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(thisWeek);
      date.setDate(date.getDate() + i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      weekTimeline[dateStr] = 0;
    }

    for (const memory of allMemories) {
      const created = new Date(memory.created_at);
      if (created >= thisWeek) {
        const dateStr = created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dateStr in weekTimeline) {
          weekTimeline[dateStr]++;
        }
      }
    }

    // Source breakdown
    const bySource: Record<string, number> = {};
    for (const memory of allMemories) {
      bySource[memory.source] = (bySource[memory.source] || 0) + 1;
    }

    // Most active people
    const mostActive = allPeople
      .sort((a, b) => (b.interaction_count || 0) - (a.interaction_count || 0))
      .slice(0, 5);

    // Completion rate (items without due_date)
    const itemsWithDueDate = allMemories.filter(m => m.due_date).length;
    const completionRate = totalMemories > 0
      ? Math.round((itemsWithDueDate / totalMemories) * 100)
      : 0;

    return Response.json({
      success: true,
      summary: {
        totalMemories,
        totalPeople,
        avgInteractionsPerPerson,
        completionRate,
      },
      urgency: {
        overdue,
        dueToday,
        dueSoon,
      },
      priority: byPriority,
      sources: bySource,
      timeline: weekTimeline,
      mostActive,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
