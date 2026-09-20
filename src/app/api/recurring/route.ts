import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
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

    // Check for memories that should recur today
    const { data: memories } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', user.id)
      .contains('tags', ['recurring']); // Find marked recurring

    if (!memories) return Response.json({ recurring: [], created: 0 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let createdCount = 0;

    for (const memory of memories) {
      // Parse recurrence pattern if it exists in notes/content
      const recurPattern = extractRecurPattern(memory.content);
      if (!recurPattern) continue;

      const lastDue = memory.due_date ? new Date(memory.due_date) : null;
      const shouldCreate = shouldRecurToday(lastDue, recurPattern, today);

      if (shouldCreate) {
        const newDueDate = calculateNextDueDate(today, recurPattern);
        const { error } = await supabase.from('memories').insert([
          {
            user_id: user.id,
            title: memory.title,
            content: memory.content,
            source: 'recurring',
            type: memory.type,
            priority: memory.priority,
            due_date: newDueDate,
            tags: memory.tags,
            status: 'active',
          },
        ]);
        if (!error) createdCount++;
      }
    }

    return Response.json({
      success: true,
      recurringMemories: memories.length,
      createdToday: createdCount,
    });
  } catch (error) {
    console.error('Recurring error:', error);
    return Response.json({ error: 'Recurring check failed' }, { status: 500 });
  }
}

function extractRecurPattern(content: string): string | null {
  const patterns = ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'];
  for (const pattern of patterns) {
    if (content?.toLowerCase().includes(pattern)) return pattern;
  }
  return null;
}

function shouldRecurToday(lastDue: Date | null, pattern: string, today: Date): boolean {
  if (!lastDue) return true;

  const daysDiff = Math.floor((today.getTime() - lastDue.getTime()) / (1000 * 60 * 60 * 24));

  const intervals: Record<string, number> = {
    daily: 1,
    weekly: 7,
    biweekly: 14,
    monthly: 30,
    quarterly: 90,
    yearly: 365,
  };

  return daysDiff >= (intervals[pattern] || 1);
}

function calculateNextDueDate(today: Date, pattern: string): string {
  const next = new Date(today);
  const increments: Record<string, number> = {
    daily: 1,
    weekly: 7,
    biweekly: 14,
    monthly: 30,
    quarterly: 90,
    yearly: 365,
  };

  next.setDate(next.getDate() + (increments[pattern] || 1));
  return next.toISOString().split('T')[0];
}
