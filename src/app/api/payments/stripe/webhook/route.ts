import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16',
});

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return Response.json({ error: 'Config' }, { status: 500 });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle subscription events
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.user_id;

      if (userId) {
        await supabase
          .from('subscriptions')
          .update({
            plan: subscription.metadata?.plan || 'pro',
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
            updated_at: new Date(),
          })
          .eq('user_id', userId);
      }
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      if (customerId) {
        const { data: customer } = await supabase
          .from('stripe_customers')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (customer) {
          // Record payment
          await supabase
            .from('payment_history')
            .insert([{
              user_id: customer.user_id,
              provider: 'stripe',
              provider_id: invoice.id,
              amount_cents: invoice.amount_paid,
              currency: invoice.currency,
              status: 'succeeded',
              payment_method: 'card',
              description: `Invoice for ${invoice.lines.data[0]?.description}`,
            }]);

          // Get user email and plan for receipt email (lazy import to avoid build-time API key requirement)
          try {
            const { sendPaymentReceiptEmail } = await import('@/lib/email-service');
            const { data: { user } } = await supabase.auth.admin.getUserById(customer.user_id);
            const { data: subscription } = await supabase
              .from('subscriptions')
              .select('plan')
              .eq('user_id', customer.user_id)
              .single();

            if (user?.email && subscription?.plan) {
              const amount = Math.round(invoice.amount_paid / 100);
              const plan = subscription.plan as 'pro' | 'enterprise';
              await sendPaymentReceiptEmail(
                user.email,
                user.user_metadata?.full_name || 'User',
                plan,
                amount,
                'usd',
                'stripe'
              );
            }
          } catch (emailError) {
            console.error('Failed to send payment receipt email:', emailError);
            // Don't fail webhook if email fails
          }
        }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.user_id;

      if (userId) {
        await supabase
          .from('subscriptions')
          .update({
            plan: 'free',
            status: 'canceled',
            updated_at: new Date(),
          })
          .eq('user_id', userId);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return Response.json({ error: 'Webhook failed' }, { status: 400 });
  }
}
