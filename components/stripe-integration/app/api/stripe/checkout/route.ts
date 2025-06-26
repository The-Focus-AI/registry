import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const planId = formData.get('plan_id') as string | null
    const email = formData.get('email') as string | null
    console.log('Received planId:', planId)
    if (!planId) {
      return NextResponse.json({ error: 'Missing plan_id' }, { status: 400 })
    }

    // Fetch plan details from DB
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )
    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .select('stripe_price_id, name')
      .eq('id', planId)
      .single()
    console.log('Fetched plan:', plan)
    if (error || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }
    if (!plan.stripe_price_id) {
      return NextResponse.json({ error: `Plan '${plan.name}' is missing a Stripe price ID.` }, { status: 400 })
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true`,
      customer_email: email || undefined, // Let Stripe collect if not provided
    })

    // Redirect to Stripe Checkout
    return NextResponse.redirect(session.url!, 303)
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 