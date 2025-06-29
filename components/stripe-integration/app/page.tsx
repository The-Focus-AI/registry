import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import { PricingTable, Plan } from '@/components/pricing-table'
import Navbar from '@/components/navbar'

async function getPlans(): Promise<Plan[]> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
  // Fetch features as well
  const { data } = await supabase.from('subscription_plans').select('id, name, price_cents, features').eq('is_active', true)
  // Parse features JSON if needed
  return (data || []).map((plan: any) => ({ ...plan, features: plan.features || {} }))
}

export default async function LandingPage() {
  const plans = await getPlans()

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center gap-8 p-8">
        <h1 className="text-3xl font-bold">Welcome to Our SaaS!</h1>
        <p className="mb-4">Sign up or view our pricing to get started.</p>
        <section className="w-full flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-2">Pricing</h2>
          <PricingTable plans={plans} />
        </section>
      </main>
    </>
  )
}
