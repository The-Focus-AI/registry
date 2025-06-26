-- Migration: Consolidated schema for subscription_plans and user_subscriptions
-- Purpose: All SaaS product plans, Stripe price IDs, and user subscription tracking

-- Create subscription_plans table
create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique, -- e.g., 'basic', 'pro'
  stripe_price_id text unique, -- can be null initially, filled after Stripe sync
  monthly_credits integer not null,
  price_cents integer not null,
  features jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

comment on table public.subscription_plans is 'Stores all SaaS product plans and their Stripe price IDs.';

-- Enable Row Level Security
alter table public.subscription_plans enable row level security;

-- RLS: Public can view plans
create policy "Public can view plans" on public.subscription_plans
  for select to authenticated, anon
  using (true);

-- RLS: Allow upsert (insert/update) for all roles (dev only)
create policy "Allow upsert for all" on public.subscription_plans
  for insert to authenticated, anon
  with check (true);
create policy "Allow update for all" on public.subscription_plans
  for update to authenticated, anon
  using (true);

-- Create user_subscriptions table
create table public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  stripe_customer_id text unique not null,
  stripe_subscription_id text unique,
  subscription_status text not null default 'inactive',
  plan_type text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  monthly_credit_limit integer not null default 0,
  credits_used integer not null default 0,
  last_credit_reset timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint user_subscriptions_user_id_unique unique (user_id)
);

comment on table public.user_subscriptions is 'Links Supabase users to Stripe subscriptions and tracks subscription status and usage.';

-- Enable Row Level Security
alter table public.user_subscriptions enable row level security;

-- RLS: Allow users to view their own subscriptions
create policy "Users can view own subscriptions" on public.user_subscriptions
  for select to authenticated
  using (auth.uid() = user_id);

-- RLS: Allow users to update their own subscriptions
create policy "Users can update own subscriptions" on public.user_subscriptions
  for update to authenticated
  using (auth.uid() = user_id);

-- RLS: Allow users to insert their own subscriptions
create policy "Users can insert own subscriptions" on public.user_subscriptions
  for insert to authenticated
  with check (auth.uid() = user_id); 