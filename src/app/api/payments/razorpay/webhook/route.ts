import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return Response.json({ error: 'Config' }, { status: 500 });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle payment success
    if (event.event === 'payment.authorized') {
      const payment = event.payload.payment.entity;
      const userId = payment.notes?.user_id;
      const plan = payment.notes?.plan || 'pro';

      if (userId) {
        // Update subscription
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (existingSub) {
          await supabase
            .from('subscriptions')
            .update({
              plan,
              razorpay_subscription_id: payment.id,
              status: 'active',
              currency: 'inr',
              amount_cents: Math.round(payment.amount / 100),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              updated_at: new Date(),
            })
            .eq('user_id', userId);
        } else {
          await supabase
            .from('subscriptions')
            .insert([{
              user_id: userId,
              plan,
              razorpay_subscription_id: payment.id,
              status: 'active',
              currency: 'inr',
              amount_cents: Math.round(payment.amount / 100),
              current_period_start: new Date(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }]);
        }

        // Record payment
        await supabase
          .from('payment_history')
          .update({
            status: 'succeeded',
          })
          .eq('provider_id', payment.id);
      }
    }

    if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;

      await supabase
        .from('payment_history')
        .update({
          status: 'failed',
        })
        .eq('provider_id', payment.id);
    }

    return Response.json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return Response.json({ error: 'Webhook failed' }, { status: 400 });
  }
}
