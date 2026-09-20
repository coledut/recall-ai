import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');
    if (!authToken) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return Response.json({ error: 'Config' }, { status: 500 });

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user } } = await supabase.auth.getUser(authToken);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan } = await request.json();
    if (!['pro', 'enterprise'].includes(plan)) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get or create Stripe customer
    let { data: stripeCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = stripeCustomer?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from('stripe_customers')
        .insert([{ user_id: user.id, stripe_customer_id: customerId }]);
    }

    // Plan pricing (in cents)
    const pricing: Record<string, number> = {
      pro: 900, // $9/month
      enterprise: 29900, // $299/month
    };

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan === 'pro' ? 'Recall AI Pro' : 'Recall AI Enterprise',
              description: plan === 'pro'
                ? 'Team collaboration, 10,000 API calls/month'
                : 'Unlimited everything, dedicated support',
            },
            unit_amount: pricing[plan],
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/billing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan,
      },
    });

    return Response.json({ session_id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
