import { sendPaymentReceiptEmail } from '@/lib/email-service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, name, plan, amount, currency, provider } = await request.json();

    if (!email || !name || !plan || !amount || !currency || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['pro', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    if (!['stripe', 'razorpay'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      );
    }

    const result = await sendPaymentReceiptEmail(
      email,
      name,
      plan as 'pro' | 'enterprise',
      amount,
      currency as 'usd' | 'inr',
      provider as 'stripe' | 'razorpay'
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Send payment receipt error:', error);
    return NextResponse.json(
      { error: 'Failed to send payment receipt' },
      { status: 500 }
    );
  }
}
