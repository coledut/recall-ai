# Recall AI Payments Setup Guide

Complete guide to enable Stripe and Razorpay payments.

## Quick Start

### 1. Get API Keys (15 minutes)

#### Stripe Setup
1. Go to https://dashboard.stripe.com/register
2. Sign up with email + password
3. Click "Developers" (top right) → "API Keys"
4. Copy your keys:
   - **Publishable Key**: `pk_live_...`
   - **Secret Key**: `sk_live_...`
5. Go to "Webhooks" → "Add endpoint"
   - URL: `https://your-domain.com/api/payments/stripe/webhook`
   - Events: `customer.subscription.updated`, `invoice.payment_succeeded`, `customer.subscription.deleted`
   - Copy webhook secret: `whsec_...`

#### Razorpay Setup (India)
1. Go to https://razorpay.com/signup
2. Sign up with email + password
3. Complete KYC verification (upload ID photo)
4. Go to Settings → API Keys
5. Copy your keys:
   - **Key ID**: `rzp_live_...`
   - **Key Secret**: Your secret
6. Go to Settings → Webhooks
   - URL: `https://your-domain.com/api/payments/razorpay/webhook`
   - Events: `payment.authorized`, `payment.failed`
   - Copy webhook secret

### 2. Update Environment Variables

Add to `.env.production`:

```bash
# Stripe
STRIPE_PUBLIC_KEY=pk_live_YOUR_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET

# Razorpay
RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Run Database Migration

```bash
# Run the payments migration in Supabase
# Go to SQL Editor in Supabase Dashboard
# Paste contents of migrations/add_payments.sql
# Execute
```

Or via Supabase CLI:
```bash
supabase migration up
```

### 4. Deploy

```bash
git add .
git commit -m "feat: Add Stripe and Razorpay payments"
git push origin main
```

Vercel will automatically deploy and use your environment variables.

---

## How It Works

### Global Users (Non-India)
```
User clicks "Upgrade"
    ↓
System detects location (via IP)
    ↓
Shows USD pricing ($9/month)
    ↓
Redirects to Stripe checkout
    ↓
User enters card details
    ↓
Payment processed
    ↓
Subscription updated in database
```

### India Users
```
User clicks "Upgrade"
    ↓
System detects India location
    ↓
Shows INR pricing (₹299/month)
    ↓
Redirects to Razorpay checkout
    ↓
User selects payment method:
   - UPI (instant, 60%+ of users)
   - Netbanking
   - Card
   - Wallet
    ↓
Payment processed
    ↓
Subscription updated in database
```

---

## Pricing by Region

| Region | Currency | Free | Pro | Enterprise |
|--------|----------|------|-----|------------|
| India | INR | ₹0 | ₹299/mo | ₹4,999/mo |
| US | USD | $0 | $9/mo | $299/mo |
| UK | GBP | £0 | £7/mo | £250/mo |
| EU | EUR | €0 | €8/mo | €280/mo |

---

## API Endpoints

### Payments

```
POST /api/payments/stripe/checkout
  Initiates Stripe checkout session
  Headers: Authorization: Bearer {token}
  Body: { plan: "pro" | "enterprise" }
  Response: { session_id, url }

POST /api/payments/stripe/webhook
  Handles Stripe webhook events
  Events: subscription.updated, invoice.payment_succeeded, subscription.deleted

POST /api/payments/razorpay/checkout
  Initiates Razorpay order
  Headers: Authorization: Bearer {token}
  Body: { plan: "pro" | "enterprise" }
  Response: { order_id, key, amount, currency, ... }

POST /api/payments/razorpay/webhook
  Handles Razorpay webhook events
  Events: payment.authorized, payment.failed

GET /api/payments/subscription
  Gets current user subscription
  Headers: Authorization: Bearer {token}
  Response: { plan, status, currency, current_period_end, ... }
```

---

## Database Schema

### subscriptions
```sql
- id (UUID primary key)
- user_id (UUID, unique)
- plan (text: free, pro, enterprise)
- currency (text: usd, inr, gbp, eur)
- amount_cents (integer: monthly charge)
- stripe_subscription_id (text, unique nullable)
- razorpay_subscription_id (text, unique nullable)
- status (text: active, canceled, past_due)
- current_period_start (timestamp)
- current_period_end (timestamp)
- cancel_at_period_end (boolean)
- created_at, updated_at (timestamp)
```

### payment_history
```sql
- id (UUID primary key)
- user_id (UUID)
- provider (text: stripe, razorpay)
- provider_id (text: charge/payment ID)
- amount_cents (integer)
- currency (text)
- status (text: succeeded, failed, pending)
- payment_method (text: card, upi, netbanking, wallet)
- description (text)
- metadata (jsonb)
- created_at (timestamp)
```

### stripe_customers
```sql
- id (UUID primary key)
- user_id (UUID, unique)
- stripe_customer_id (text, unique)
- created_at (timestamp)
```

---

## Features

✅ **Location-Based Pricing**
  - Auto-detect user's country
  - Show appropriate currency & pricing
  - Route to correct payment provider

✅ **Subscription Management**
  - Create, update, cancel subscriptions
  - Track billing period
  - Support multiple currencies

✅ **Webhook Handling**
  - Real-time payment status updates
  - Automatic subscription updates
  - Failed payment tracking

✅ **Multi-Provider**
  - Stripe for global payments
  - Razorpay for India (UPI support)
  - Easy to add more providers

✅ **User Dashboard**
  - View current plan
  - Upgrade/downgrade
  - Payment history
  - Billing information

---

## Testing

### Test Stripe Checkout (Test Mode)
1. Use card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any CVC
4. Complete payment

### Test Razorpay (Test Mode)
1. Use test account
2. Complete payment flow
3. Check webhook events

### Verify Webhooks
```bash
# Stripe
stripe listen --forward-to localhost:3000/api/payments/stripe/webhook

# Razorpay
# Use Razorpay dashboard to view webhook logs
```

---

## Troubleshooting

### Missing Environment Variables
```
Error: process.env.STRIPE_SECRET_KEY is undefined
```
**Fix**: Add all payment keys to `.env.production`

### Webhook Signature Invalid
```
Error: Invalid signature
```
**Fix**: 
1. Verify webhook secret matches
2. Check request body hasn't been modified
3. Ensure webhook URL is correct

### Payment Not Updating Subscription
```
Subscription still shows 'free' after payment
```
**Fix**:
1. Check webhook received event
2. Verify user_id matches
3. Check database migration ran

### Razorpay Orders Fail
```
Error: Failed to create Razorpay order
```
**Fix**:
1. Verify Key ID and Secret
2. Check account is live (not sandbox)
3. Enable payment methods in Razorpay dashboard

---

## Next Steps

1. ✅ Add Stripe and Razorpay keys
2. ✅ Run database migration
3. ✅ Test checkout in staging
4. ✅ Enable webhooks in both providers
5. ✅ Deploy to production
6. ✅ Monitor payment events
7. 📈 Track conversion metrics
8. 💰 Revenue dashboard

---

## Revenue Tracking

Monitor payments in:
- **Stripe Dashboard**: stripe.com → Payments
- **Razorpay Dashboard**: razorpay.com → Transactions
- **App Database**: Check `payment_history` table

---

## Support

- Stripe Docs: https://stripe.com/docs
- Razorpay Docs: https://razorpay.com/docs
- Supabase Docs: https://supabase.com/docs

---

**Built with ❤️ for Recall AI**
