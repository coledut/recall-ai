import { Task } from 'graphile-worker';
import { db } from '@recall/db';
import { users, memories, notificationPreferences, memoryStatusEnum } from '@recall/db/schema';
import { eq, and, gte, lte, inArray } from 'drizzle-orm';
import { emailService } from '@recall/ai/services/email-service';
import { getEnv } from '@recall/config';

interface SendDailyBriefPayload {
  userId: string;
}

const task: Task = async (payload: SendDailyBriefPayload) => {
  const { userId } = payload;

  try {
    // Get user and preferences
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      console.log(`User ${userId} not found`);
      return;
    }

    const prefs = await db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, userId),
    });

    if (!prefs || prefs.emailDigestFrequency === 'off') {
      return; // User disabled digests
    }

    // Get today's memories for this user (in their timezone)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // TODO: Apply timezone offset to calculate user's "today"
    // For MVP, use UTC today

    const todaysMemories = await db.query.memories.findMany({
      where: and(
        eq(memories.userId, userId),
        gte(memories.detectedAt, today),
        lte(memories.detectedAt, tomorrow)
      ),
    });

    if (todaysMemories.length === 0) {
      return; // No memories today
    }

    // Group by status for brief
    const groups = {
      overdue: todaysMemories.filter((m) => m.status === 'OVERDUE'),
      due: todaysMemories.filter((m) => m.status === 'DUE'),
      dueSoon: todaysMemories.filter((m) => m.status === 'DUE_SOON'),
      open: todaysMemories.filter((m) => m.status === 'OPEN'),
    };

    // Generate HTML email
    const html = generateDailyBriefHtml(user.displayName || user.email, groups);

    // Send email
    const result = await emailService.send({
      to: user.email,
      subject: `Recall Daily Brief - ${today.toLocaleDateString()}`,
      html,
      text: `You have ${todaysMemories.length} memories to review today.`,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }

    console.log(`Sent daily brief to ${user.email}`);
  } catch (error) {
    console.error(`Failed to send daily brief to ${userId}:`, error);
    throw error;
  }
};

function generateDailyBriefHtml(
  userName: string,
  groups: Record<string, any[]>
): string {
  const env = getEnv();
  const baseUrl = env.NEXT_PUBLIC_APP_URL || 'https://recall.ai';

  let html = `
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 20px; border-radius: 8px; }
          .section { margin: 20px 0; }
          .section-title { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 12px; }
          .memory-item { background: #f9fafb; border-left: 4px solid #4f46e5; padding: 12px; margin: 8px 0; border-radius: 4px; }
          .memory-title { font-weight: 600; color: #1f2937; }
          .memory-summary { color: #6b7280; font-size: 14px; margin-top: 4px; }
          .memory-meta { color: #9ca3af; font-size: 12px; margin-top: 4px; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
          .badge-overdue { background: #fee2e2; color: #b91c1c; }
          .badge-due { background: #fef3c7; color: #b45309; }
          .badge-due-soon { background: #dbeafe; color: #1e40af; }
          .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          .button { display: inline-block; background: #4f46e5; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Recall Daily Brief</h1>
            <p style="margin: 8px 0 0 0;">Hi ${escapeHtml(userName)}, here's what you need to remember today.</p>
          </div>
  `;

  if (groups.overdue.length > 0) {
    html += `
      <div class="section">
        <div class="section-title">⚠️ Overdue (${groups.overdue.length})</div>
        ${groups.overdue.map((m) => renderMemoryItem(m)).join('')}
      </div>
    `;
  }

  if (groups.due.length > 0) {
    html += `
      <div class="section">
        <div class="section-title">📌 Due Today (${groups.due.length})</div>
        ${groups.due.map((m) => renderMemoryItem(m)).join('')}
      </div>
    `;
  }

  if (groups.dueSoon.length > 0) {
    html += `
      <div class="section">
        <div class="section-title">🔔 Due Soon (${groups.dueSoon.length})</div>
        ${groups.dueSoon.map((m) => renderMemoryItem(m)).join('')}
      </div>
    `;
  }

  if (groups.open.length > 0) {
    html += `
      <div class="section">
        <div class="section-title">📋 Open (${groups.open.length})</div>
        ${groups.open.map((m) => renderMemoryItem(m)).join('')}
      </div>
    `;
  }

  html += `
    <div class="footer">
      <p><a href="${baseUrl}/today" class="button">View in Recall</a></p>
      <p>© 2026 Recall AI. Manage your notifications in <a href="${baseUrl}/settings">Settings</a>.</p>
    </div>
    </div>
    </body>
    </html>
  `;

  return html;
}

function renderMemoryItem(memory: any): string {
  const dueDateStr = memory.dueAt
    ? new Date(memory.dueAt).toLocaleDateString()
    : '—';

  return `
    <div class="memory-item">
      <div>
        <span class="badge ${getBadgeClass(memory.status)}">${memory.type}</span>
        <div class="memory-title">${escapeHtml(memory.title)}</div>
      </div>
      <div class="memory-summary">${escapeHtml(memory.summary.substring(0, 100))}</div>
      <div class="memory-meta">Due: ${dueDateStr}</div>
    </div>
  `;
}

function getBadgeClass(status: string): string {
  if (status === 'OVERDUE') return 'badge-overdue';
  if (status === 'DUE') return 'badge-due';
  if (status === 'DUE_SOON') return 'badge-due-soon';
  return 'badge-open';
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export default task;
