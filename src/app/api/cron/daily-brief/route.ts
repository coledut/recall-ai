import { createClient } from '@supabase/supabase-js';
import { sendDailyBrief } from '@/lib/sendgrid';

export async function GET(request: Request) {
  try {
    // Verify cron secret (for security - prevent unauthorized calls)
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('⚠️ Unauthorized cron call');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: 'Config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const now = new Date();
    const currentHour = String(now.getUTCHours()).padStart(2, '0');
    const currentMinute = String(now.getUTCMinutes()).padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;

    // Get all users with daily brief enabled and matching current time
    const { data: users, error: usersError } = await supabase
      .from('user_settings')
      .select('user_id, timezone, daily_brief_time, daily_brief_frequency, quiet_hours_enabled, quiet_hours_start, quiet_hours_end')
      .eq('email_daily_brief', true);

    if (usersError) {
      console.error('Failed to fetch users:', usersError);
      return Response.json({ error: 'Failed to fetch users', details: usersError }, { status: 500 });
    }

    let sentCount = 0;
    let skippedCount = 0;
    const errors: any[] = [];

    for (const userSettings of users || []) {
      try {
        // Check if current time matches user's preferred time (within 1 hour window)
        // For MVP, we do simple UTC comparison
        const [prefHour, prefMinute] = (userSettings.daily_brief_time || '08:00').split(':');
        if (currentHour !== prefHour) {
          skippedCount++;
          continue;
        }

        // Check quiet hours
        if (userSettings.quiet_hours_enabled) {
          const [quietStart] = (userSettings.quiet_hours_start || '21:00').split(':');
          const [quietEnd] = (userSettings.quiet_hours_end || '08:00').split(':');

          if (parseInt(quietStart) < parseInt(quietEnd)) {
            // Normal range (e.g., 21:00 - 23:59, 00:00 - 08:00)
            if (parseInt(currentHour) >= parseInt(quietStart) || parseInt(currentHour) < parseInt(quietEnd)) {
              skippedCount++;
              continue;
            }
          } else {
            // Range crosses midnight
            if (parseInt(currentHour) >= parseInt(quietStart) && parseInt(currentHour) < parseInt(quietEnd)) {
              skippedCount++;
              continue;
            }
          }
        }

        // Fetch user email and memories
        const { data: { user } } = await supabase.auth.admin.getUserById(userSettings.user_id);
        if (!user?.email) {
          skippedCount++;
          continue;
        }

        // Fetch user's memories with due dates
        const { data: memories } = await supabase
          .from('memories')
          .select('*')
          .eq('user_id', userSettings.user_id)
          .not('due_date', 'is', null)
          .order('due_date', { ascending: true });

        if (!memories || memories.length === 0) {
          skippedCount++;
          continue;
        }

        // Categorize memories
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdue: any[] = [];
        const dueToday: any[] = [];
        const comingUp: any[] = [];

        for (const memory of memories) {
          const dueDate = new Date(memory.due_date);
          dueDate.setHours(0, 0, 0, 0);
          const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysOverdue > 0) {
            overdue.push(memory);
          } else if (daysOverdue === 0) {
            dueToday.push(memory);
          } else {
            const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilDue <= 7) {
              comingUp.push(memory);
            }
          }
        }

        // Generate and send email
        const emailHtml = generateDailyBriefEmail(
          user.email,
          overdue.slice(0, 5),
          dueToday.slice(0, 5),
          comingUp.slice(0, 5)
        );

        const result = await sendDailyBrief(user.email, emailHtml, {
          overdue: overdue.length,
          dueToday: dueToday.length,
          comingUp: comingUp.length,
        });

        if (result.success) {
          sentCount++;
          console.log(`📧 Daily brief sent to ${user.email}`);
        } else {
          errors.push({ email: user.email, error: result.error });
        }
      } catch (error) {
        console.error(`Error processing user ${userSettings.user_id}:`, error);
        errors.push({ userId: userSettings.user_id, error: String(error) });
      }
    }

    return Response.json({
      success: true,
      sentCount,
      skippedCount,
      totalUsers: (users || []).length,
      errors: errors.length > 0 ? errors : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron error:', error);
    return Response.json({ error: 'Failed to run cron job', details: String(error) }, { status: 500 });
  }
}

function generateDailyBriefEmail(
  userEmail: string,
  overdue: any[],
  dueToday: any[],
  comingUp: any[]
): string {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { background: #f9fafb; padding: 20px; max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(to right, #16a34a, #0d9488); color: white; padding: 30px; border-radius: 8px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .section { background: white; padding: 20px; margin: 16px 0; border-radius: 8px; border-left: 4px solid #16a34a; }
    .section.overdue { border-left-color: #dc2626; }
    .section.duetoday { border-left-color: #ea580c; }
    .section.comingup { border-left-color: #2563eb; }
    .section h2 { margin: 0 0 16px 0; font-size: 18px; }
    .memory-item { padding: 12px; margin-bottom: 12px; background: #f3f4f6; border-radius: 6px; }
    .memory-title { font-weight: 600; color: #111; }
    .memory-meta { font-size: 13px; color: #666; margin-top: 4px; }
    .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
    .cta-button { display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #16a34a, #0d9488); color: white; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Your Daily Brief</h1>
      <p>${date}</p>
    </div>
    ${overdue.length > 0 ? `<div class="section overdue"><h2>🚨 Overdue (${overdue.length})</h2>${overdue.map(m => `<div class="memory-item"><div class="memory-title">${m.title}</div><div class="memory-meta">Due: ${new Date(m.due_date).toLocaleDateString()}</div></div>`).join('')}</div>` : ''}
    ${dueToday.length > 0 ? `<div class="section duetoday"><h2>⏰ Due Today (${dueToday.length})</h2>${dueToday.map(m => `<div class="memory-item"><div class="memory-title">${m.title}</div></div>`).join('')}</div>` : ''}
    ${comingUp.length > 0 ? `<div class="section comingup"><h2>📅 Coming Up (${comingUp.length})</h2>${comingUp.map(m => `<div class="memory-item"><div class="memory-title">${m.title}</div><div class="memory-meta">Due: ${new Date(m.due_date).toLocaleDateString()}</div></div>`).join('')}</div>` : ''}
    <div style="text-align: center; margin: 20px 0;"><a href="https://recall-ai.vercel.app/app/today" class="cta-button">View All Memories</a></div>
    <div class="footer"><p>Recall AI — Your memory assistant</p></div>
  </div>
</body>
</html>
  `;
}
