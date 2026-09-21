import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.NEXT_PUBLIC_APP_EMAIL || 'noreply@recall-ai.com';

export type EmailTemplate =
  | 'welcome'
  | 'payment-receipt'
  | 'payment-failed'
  | 'subscription-confirmed'
  | 'daily-brief';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (result.error) {
      console.error('Email send error:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log('Email sent:', result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// Welcome email
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #16a34a 0%, #0d9488 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px; }
          .cta { display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #0d9488 100%); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
          .feature { margin: 15px 0; padding: 10px; background: white; border-left: 4px solid #16a34a; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Recall AI! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>We're thrilled you've joined Recall AI! Your personal memory companion is now ready to help you remember what matters most.</p>

            <h2>Quick Start:</h2>
            <div class="feature">
              <strong>💾 Capture Memories</strong><br/>
              Save important moments, ideas, and information from emails, calendar events, and voice notes.
            </div>
            <div class="feature">
              <strong>🤖 Ask Questions</strong><br/>
              Use natural language to ask questions about your memories and get instant answers.
            </div>
            <div class="feature">
              <strong>👥 Track People</strong><br/>
              Keep track of relationships and never miss important follow-ups.
            </div>

            <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/today" class="cta">Start Using Recall AI</a>

            <p>Questions? Check out our help center or reply to this email.</p>
            <div class="footer">
              <p>© 2026 Recall AI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Welcome to Recall AI - Your Memory Companion',
    html,
  });
}

// Payment receipt email
export async function sendPaymentReceiptEmail(
  userEmail: string,
  userName: string,
  plan: 'pro' | 'enterprise',
  amount: number,
  currency: 'usd' | 'inr',
  provider: 'stripe' | 'razorpay'
) {
  const planName = plan === 'pro' ? 'Pro' : 'Enterprise';
  const currencySymbol = currency === 'usd' ? '$' : '₹';
  const features = plan === 'pro'
    ? ['Unlimited memories', 'All capture methods', 'AI-powered extraction', 'Daily email briefs', 'Advanced search', 'Priority support']
    : ['Everything in Pro', 'Team collaboration', 'Advanced analytics', 'Custom integrations', 'Zapier + Make support', 'Dedicated support'];

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #16a34a 0%, #0d9488 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px; }
          .receipt-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border: 2px solid #16a34a; }
          .amount { font-size: 32px; font-weight: bold; color: #16a34a; margin: 10px 0; }
          .feature-list { list-style: none; padding: 0; margin: 15px 0; }
          .feature-list li { padding: 8px 0; padding-left: 25px; position: relative; }
          .feature-list li:before { content: '✓'; position: absolute; left: 0; color: #16a34a; font-weight: bold; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmed ✓</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Thank you for upgrading to Recall AI ${planName}! Your payment has been processed successfully.</p>

            <div class="receipt-box">
              <h3>Order Summary</h3>
              <p><strong>Plan:</strong> Recall AI ${planName}</p>
              <p><strong>Amount:</strong> <span class="amount">${currencySymbol}${amount}</span></p>
              <p><strong>Billing Cycle:</strong> Monthly</p>
              <p><strong>Payment Method:</strong> ${provider === 'stripe' ? 'Credit Card (Stripe)' : 'Razorpay (UPI/Card/Netbanking)'}</p>
            </div>

            <h3>Your ${planName} Features:</h3>
            <ul class="feature-list">
              ${features.map(f => `<li>${f}</li>`).join('')}
            </ul>

            <p><strong>Subscription Details:</strong></p>
            <p>Your subscription renews automatically each month. You can upgrade, downgrade, or cancel anytime from your account settings.</p>

            <div class="footer">
              <p>Questions about your subscription? <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/settings">Visit Settings</a> or contact support.</p>
              <p>© 2026 Recall AI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Payment Confirmation - Recall AI ${planName} (${currencySymbol}${amount})`,
    html,
  });
}

// Subscription canceled email
export async function sendSubscriptionCanceledEmail(
  userEmail: string,
  userName: string,
  plan: 'pro' | 'enterprise'
) {
  const planName = plan === 'pro' ? 'Pro' : 'Enterprise';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px; }
          .cta { display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #0d9488 100%); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Canceled</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>We've canceled your Recall AI ${planName} subscription. You'll continue to have access until the end of your billing period.</p>

            <p><strong>What happens next:</strong></p>
            <ul>
              <li>You'll revert to the Free plan after your current billing period ends</li>
              <li>All your memories will be preserved</li>
              <li>You can still access your memories and use basic features</li>
              <li>You can upgrade again anytime</li>
            </ul>

            <p><strong>We'd love your feedback:</strong> If there's anything we can improve, please let us know.</p>

            <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/billing" class="cta">Manage Subscription</a>

            <div class="footer">
              <p>Questions? Contact support or visit your account settings.</p>
              <p>© 2026 Recall AI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Subscription Canceled - Recall AI ${planName}`,
    html,
  });
}

export { sendEmail };
