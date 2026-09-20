import { createClient } from "@supabase/supabase-js";
import { sendDailyBrief } from "@/lib/sendgrid";

export async function POST(request: Request) {
  try {
    const { userId, authToken, sendEmail = false } = await request.json();

    if (!userId || !authToken) {
      return Response.json({ error: "Missing userId or authToken" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: "Config error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user } } = await supabase.auth.getUser(authToken);

    if (!user || user.id !== userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's notifications
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: memories, error } = await supabase
      .from("memories")
      .select("*")
      .eq("user_id", user.id)
      .not("due_date", "is", null)
      .order("due_date", { ascending: true });

    if (error) {
      return Response.json({ error: "Failed to fetch memories" }, { status: 500 });
    }

    const overdue: any[] = [];
    const dueToday: any[] = [];
    const comingUp: any[] = [];

    for (const memory of memories || []) {
      if (!memory.due_date) continue;

      const dueDate = new Date(memory.due_date);
      dueDate.setHours(0, 0, 0, 0);

      const daysOverdue = Math.floor(
        (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysOverdue > 0) {
        overdue.push(memory);
      } else if (daysOverdue === 0) {
        dueToday.push(memory);
      } else {
        const daysUntilDue = Math.floor(
          (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilDue <= 7) {
          comingUp.push(memory);
        }
      }
    }

    const emailHtml = generateDailyBriefEmail(
      user.email || "User",
      overdue.slice(0, 5),
      dueToday.slice(0, 5),
      comingUp.slice(0, 5)
    );

    let emailResult = null;
    if (sendEmail && user.email) {
      emailResult = await sendDailyBrief(user.email, emailHtml, {
        overdue: overdue.length,
        dueToday: dueToday.length,
        comingUp: comingUp.length,
      });
    }

    return Response.json({
      success: true,
      email: user.email,
      overdue: overdue.length,
      dueToday: dueToday.length,
      comingUp: comingUp.length,
      emailSent: emailResult?.success || false,
      emailError: emailResult?.error || null,
    });
  } catch (error) {
    console.error("Daily brief error:", error);
    return Response.json({ error: "Failed to generate daily brief" }, { status: 500 });
  }
}

function generateDailyBriefEmail(
  userEmail: string,
  overdue: any[],
  dueToday: any[],
  comingUp: any[]
): string {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
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
    <div style="text-align: center; margin: 20px 0;"><a href="https://recall-ai-new.vercel.app/app/today" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #16a34a, #0d9488); color: white; text-decoration: none; border-radius: 6px;">View All Memories</a></div>
    <div class="footer"><p>Recall AI — Your memory assistant</p></div>
  </div>
</body>
</html>
  `;
}
