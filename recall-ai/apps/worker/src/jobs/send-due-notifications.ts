import { Task } from 'graphile-worker';
import { db } from '@recall/db';
import { users, memories, pushSubscriptions, notificationPreferences } from '@recall/db/schema';
import { eq, and, gte, inArray } from 'drizzle-orm';
import { pushNotificationService } from '@recall/ai/services/push-notification-service';

interface SendDueNotificationsPayload {
  // Runs periodically to check for due/overdue items
}

const task: Task = async (payload: SendDueNotificationsPayload) => {
  try {
    // Get all users with push notifications enabled
    const usersWithPush = await db.query.users.findMany({
      innerJoin: notificationPreferences,
      on: (u, np) => and(eq(u.id, np.userId), eq(np.pushNotificationsEnabled, true)),
    });

    for (const user of usersWithPush) {
      // Get due/overdue items for this user
      const now = new Date();
      const dueSoon = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

      const dueItems = await db.query.memories.findMany({
        where: and(
          eq(memories.userId, user.id),
          inArray(memories.status, ['DUE', 'OVERDUE', 'DUE_SOON']),
          gte(memories.dueAt, now),
          gte(dueSoon, memories.dueAt)
        ),
      });

      if (dueItems.length === 0) continue;

      // Get user's push subscriptions
      const subscriptions = await db.query.pushSubscriptions.findMany({
        where: eq(pushSubscriptions.userId, user.id),
      });

      for (const subscription of subscriptions) {
        // Build payload based on due items
        const overdue = dueItems.filter((m) => m.status === 'OVERDUE');
        const due = dueItems.filter((m) => m.status === 'DUE');

        let title = '';
        let body = '';

        if (overdue.length > 0) {
          title = `${overdue.length} overdue item${overdue.length > 1 ? 's' : ''}`;
          body = overdue[0].title;
        } else if (due.length > 0) {
          title = `${due.length} due today`;
          body = due[0].title;
        }

        const result = await pushNotificationService.send(
          {
            endpoint: subscription.endpoint,
            keys: {
              auth: subscription.auth,
              p256dh: subscription.p256dh,
            },
          },
          {
            title,
            body,
            icon: '/icon-192x192.png',
            data: {
              memoryId: dueItems[0].id,
              url: '/today',
            },
          }
        );

        if (!result.success) {
          if (result.error === 'Subscription expired') {
            // Delete expired subscription
            await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, subscription.id));
          }
        } else {
          // Update last used
          await db
            .update(pushSubscriptions)
            .set({ lastUsedAt: new Date() })
            .where(eq(pushSubscriptions.id, subscription.id));
        }
      }
    }

    console.log(`Sent due notifications to ${usersWithPush.length} users`);
  } catch (error) {
    console.error('Failed to send due notifications:', error);
    throw error;
  }
};

export default task;
