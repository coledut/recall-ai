import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
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

    // Get or create subscription (default: free)
    let { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !subscription) {
      const newSub = {
        user_id: user.id,
        plan: 'free',
        status: 'active',
        currency: 'usd',
      };

      const { data: created } = await supabase
        .from('subscriptions')
        .insert([newSub])
        .select()
        .single();

      subscription = created;
    }

    return Response.json({
      plan: subscription.plan,
      status: subscription.status,
      currency: subscription.currency,
      current_period_end: subscription.current_period_end,
      stripe_subscription_id: subscription.stripe_subscription_id,
      razorpay_subscription_id: subscription.razorpay_subscription_id,
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return Response.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}
