import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

interface SyncSubscriptionOptions {
  supabase: SupabaseClient<any, 'public', any>
  stripe: Stripe
  subscription: Stripe.Subscription
  userByEmail?: Record<string, any>
}

export async function syncSubscriptionToUser({ supabase, stripe, subscription, userByEmail }: SyncSubscriptionOptions) {
  // 1. Get customer email
  let email: string | null = null
  if (typeof subscription.customer === 'string') {
    const customer = await stripe.customers.retrieve(subscription.customer)
    if (typeof customer !== 'string' && 'email' in customer && customer.email) {
      email = customer.email
    }
  }
  console.log('[syncSubscriptionToUser] Processing subscription:', subscription.id)
  console.log('[syncSubscriptionToUser] Stripe customer email:', email)
  if (!email) {
    console.error('[syncSubscriptionToUser] No customer email found for subscription', subscription.id)
    return { error: 'No customer email found for subscription', user: null, upserted: null }
  }

  // 2. Find or create Supabase user by email (use userByEmail hash if provided)
  let user
  if (userByEmail) {
    user = userByEmail[email]
    if (user) {
      console.log('[syncSubscriptionToUser] Found user in hash:', user.id)
    } else {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: false,
      })
      console.log('[syncSubscriptionToUser] Supabase user creation result:', newUser, 'Error:', createError)
      if (createError) {
        console.error('[syncSubscriptionToUser] Error creating user:', createError)
        return { error: createError, user: null, upserted: null }
      }
      user = newUser.user
      userByEmail[email] = user
      console.log('[syncSubscriptionToUser] Created new Supabase user:', user.id)
    }
  } else {
    // fallback: list all users and filter (inefficient for large sets)
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    console.log('[syncSubscriptionToUser] Supabase user lookup result:', users, 'Error:', listError)
    if (listError) {
      console.error('[syncSubscriptionToUser] Error listing users:', listError)
      return { error: listError, user: null, upserted: null }
    }
    user = users?.users.find((u: any) => u.email === email)
    if (user) {
      console.log('[syncSubscriptionToUser] Found existing Supabase user:', user.id)
    } else {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: false,
      })
      console.log('[syncSubscriptionToUser] Supabase user creation result:', newUser, 'Error:', createError)
      if (createError) {
        console.error('[syncSubscriptionToUser] Error creating user:', createError)
        return { error: createError, user: null, upserted: null }
      }
      user = newUser.user
      console.log('[syncSubscriptionToUser] Created new Supabase user:', user.id)
    }
  }

  // 3. Get plan info from DB using price ID
  const priceId = subscription.items.data[0]?.price?.id
  let plan = null
  if (priceId) {
    const { data: planData } = await supabase
      .from('subscription_plans')
      .select('id, name, monthly_credits, price_cents, features')
      .eq('stripe_price_id', priceId)
      .single()
    if (planData) plan = planData
  }

  // 4. Get current period
  let currentPeriodStart = null
  let currentPeriodEnd = null
  if ('current_period_start' in subscription && typeof subscription.current_period_start === 'number') {
    currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString()
  }
  if ('current_period_end' in subscription && typeof subscription.current_period_end === 'number') {
    currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString()
  }

  // 5. Upsert user_subscriptions
  const { error: upsertError, data: upserted } = await supabase
    .from('user_subscriptions')
    .upsert([
      {
        user_id: user.id,
        stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : null,
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        plan_type: plan?.name || 'unknown',
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        monthly_credit_limit: plan?.monthly_credits || 0,
        credits_used: 0,
      },
    ], { onConflict: 'user_id' })
  console.log('[syncSubscriptionToUser] Upsert result:', upserted, 'Error:', upsertError)

  return { error: upsertError, user, upserted }
} 