-- Payment & Subscription Schema

-- Stripe customers mapping
create table if not exists stripe_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id text unique not null,
  created_at timestamp default now()
);

-- Subscriptions
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan text not null default 'free', -- free, pro, enterprise
  currency text default 'usd', -- usd, inr
  amount_cents integer, -- monthly charge in cents
  stripe_subscription_id text,
  razorpay_subscription_id text,
  status text default 'active', -- active, canceled, past_due
  current_period_start timestamp,
  current_period_end timestamp,
  cancel_at_period_end boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Payment history
create table if not exists payment_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null, -- stripe, razorpay
  provider_id text, -- Stripe charge ID or Razorpay payment ID
  amount_cents integer not null,
  currency text not null, -- usd, inr
  status text not null, -- succeeded, failed, pending
  payment_method text, -- card, upi, netbanking, wallet
  description text,
  metadata jsonb default '{}',
  created_at timestamp default now()
);

-- Enable RLS
alter table stripe_customers enable row level security;
alter table subscriptions enable row level security;
alter table payment_history enable row level security;

-- RLS Policies
create policy "Users can view their stripe customer"
  on stripe_customers using (auth.uid() = user_id);

create policy "Users can view their subscription"
  on subscriptions using (auth.uid() = user_id);

create policy "Users can view their payment history"
  on payment_history using (auth.uid() = user_id);

-- Indexes
create index idx_subscriptions_user_id on subscriptions(user_id);
create index idx_subscriptions_plan on subscriptions(plan);
create index idx_payment_history_user_id on payment_history(user_id);
create index idx_payment_history_created on payment_history(created_at);
create index idx_stripe_customers_user_id on stripe_customers(user_id);
