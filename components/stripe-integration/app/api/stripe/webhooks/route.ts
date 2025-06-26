import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@supabase/supabase-js'
import { syncSubscriptionToUser } from '@/lib/stripe/syncSubscription'

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  const body = await req.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const stripeSubscriptionId = session.subscription
    if (!stripeSubscriptionId) {
      return NextResponse.json({ error: 'No subscription ID in session' }, { status: 400 })
    }
    // Use Supabase service role for admin actions
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    // Fetch the Stripe subscription
    let subscription
    try {
      subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)
    } catch (err) {
      console.error('Failed to fetch Stripe subscription:', err)
      return NextResponse.json({ error: 'Failed to fetch Stripe subscription' }, { status: 500 })
    }
    // Use shared sync logic
    const result = await syncSubscriptionToUser({ supabase, stripe, subscription })
    if (result.error) {
      console.error('Failed to sync subscription:', result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json({ received: true, user: result.user, upserted: result.upserted })
  }

  // Handle subscription updates and cancellations
  if (
    event.type === 'customer.subscription.deleted' ||
    event.type === 'customer.subscription.updated'
  ) {
    const subscription = event.data.object as any
    if (!subscription || !subscription.id) {
      return NextResponse.json({ error: 'No subscription object in event' }, { status: 400 })
    }
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    // Use shared sync logic
    const result = await syncSubscriptionToUser({ supabase, stripe, subscription })
    if (result.error) {
      console.error('Failed to sync subscription:', result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json({ received: true, user: result.user, upserted: result.upserted })
  }

  return NextResponse.json({ received: true })
} 