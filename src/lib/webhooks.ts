import { createClient } from '@supabase/supabase-js';

export type WebhookEvent =
  | 'memory.created'
  | 'memory.completed'
  | 'memory.updated'
  | 'memory.deleted'
  | 'person.added'
  | 'person.updated'
  | 'team.member.added'
  | 'team.member.removed'
  | 'email.sent';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  user_id: string;
  data: any;
}

export async function dispatchWebhook(
  userId: string,
  event: WebhookEvent,
  data: any
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get active webhooks for user
    const { data: webhooks } = await supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true);

    if (!webhooks || webhooks.length === 0) return;

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      user_id: userId,
      data,
    };

    // Send to all matching webhooks (fire and forget)
    for (const webhook of webhooks) {
      const events = webhook.events || [];
      if (!events.includes(event)) continue;

      fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Recall-Signature': generateSignature(webhook.id, JSON.stringify(payload)),
        },
        body: JSON.stringify(payload),
      }).catch(err => {
        console.error(`Webhook failed for ${webhook.url}:`, err);
        // Optionally: update webhook failed_count, disable after 10 failures
      });
    }
  } catch (error) {
    console.error('Webhook dispatch error:', error);
  }
}

function generateSignature(webhookId: string, payload: string): string {
  // In production, use HMAC-SHA256 with webhook secret
  // For now, simple hash for validation
  return `sha256=${Buffer.from(webhookId + payload).toString('base64')}`;
}
