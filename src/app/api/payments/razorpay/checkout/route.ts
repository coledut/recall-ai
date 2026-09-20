import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

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

    // Plan pricing in paise (₹ converted to paise: ₹299 = 29900 paise)
    const pricing: Record<string, number> = {
      pro: 29900, // ₹299/month
      enterprise: 499900, // ₹4999/month
    };

    // Create Razorpay order
    const orderData = {
      amount: pricing[plan],
      currency: 'INR',
      receipt: `order_${user.id}_${Date.now()}`,
      payment_capture: 1,
      notes: {
        user_id: user.id,
        plan,
        email: user.email,
      },
    };

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64'),
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to create Razorpay order');
    }

    const order = await response.json();

    // Store order in database
    await supabase
      .from('payment_history')
      .insert([{
        user_id: user.id,
        provider: 'razorpay',
        provider_id: order.id,
        amount_cents: Math.round(pricing[plan] / 100), // Convert paise to rupees (in cents for consistency)
        currency: 'inr',
        status: 'pending',
        metadata: { plan, order_id: order.id },
      }]);

    return Response.json({
      order_id: order.id,
      key: RAZORPAY_KEY_ID,
      amount: pricing[plan],
      currency: 'INR',
      email: user.email,
      name: 'Recall AI',
      description: plan === 'pro' ? 'Upgrade to Pro' : 'Upgrade to Enterprise',
    });
  } catch (error) {
    console.error('Razorpay checkout error:', error);
    return Response.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
