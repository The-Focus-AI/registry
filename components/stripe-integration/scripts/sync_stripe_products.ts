import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Define your plans here
const plans = [
  {
    name: 'basic',
    monthly_credits: 100,
    price_cents: 1000,
    features: { featureA: true },
  },
  {
    name: 'pro',
    monthly_credits: 1000,
    price_cents: 2000,
    features: { featureA: true, featureB: true },
  },
]

async function syncPlans() {
  for (const plan of plans) {
    try {
      // Create product in Stripe
      const product = await stripe.products.create({ name: plan.name })
      // Create price in Stripe
      const price = await stripe.prices.create({
        unit_amount: plan.price_cents,
        currency: 'usd',
        recurring: { interval: 'month' },
        product: product.id,
      })
      // Upsert into DB
      const { error: upsertError } = await supabase
        .from('subscription_plans')
        .upsert([
          {
            name: plan.name,
            stripe_price_id: price.id,
            monthly_credits: plan.monthly_credits,
            price_cents: plan.price_cents,
            features: plan.features,
            is_active: true,
          },
        ], { onConflict: 'name' })
      if (upsertError) {
        console.error(`Failed to upsert plan ${plan.name}:`, upsertError)
      } else {
        console.log(`Upserted plan '${plan.name}' with Stripe price ID: ${price.id}`)
      }
    } catch (err) {
      console.error(`Error syncing plan '${plan.name}':`, err)
    }
  }
}

syncPlans().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
}) 