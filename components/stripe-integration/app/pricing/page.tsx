import { createServerClient } from '@supabase/ssr'
import { PricingTable, Plan } from '@/components/pricing-table'

async function getPlans(): Promise<Plan[]> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
  const { data } = await supabase.from('subscription_plans').select('id, name, price_cents, features').eq('is_active', true)
  return (data || []).map((plan: any) => ({ ...plan, features: plan.features || {} }))
}

export default async function PricingPage() {
  const plans = await getPlans()
  return (
    <main className="flex flex-col items-center gap-8 p-8">
      <h1 className="text-3xl font-bold mb-4">Pricing</h1>
      <PricingTable plans={plans} />
    </main>
  )
} 