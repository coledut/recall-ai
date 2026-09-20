import webpush from 'web-push';
import { getEnv } from '@recall/config';

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, string>;
}

class PushNotificationService {
  constructor() {
    const env = getEnv();
    if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        env.VAPID_SUBJECT || 'mailto:support@recall.ai',
        env.VAPID_PUBLIC_KEY,
        env.VAPID_PRIVATE_KEY
      );
    }
  }

  async send(
    subscription: PushSubscriptionJSON,
    payload: PushPayload
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon || '/icon-192x192.png',
          badge: payload.badge || '/badge-72x72.png',
          data: payload.data || {},
        })
      );
      return { success: true };
    } catch (error) {
      console.error('Push notification error:', error);
      if (error instanceof webpush.WebPushError && error.statusCode === 410) {
        return { success: false, error: 'Subscription expired' };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  getPublicKey(): string {
    const env = getEnv();
    return env.VAPID_PUBLIC_KEY || '';
  }
}

export const pushNotificationService = new PushNotificationService();
