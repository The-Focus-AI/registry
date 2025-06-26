import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  // Fetch subscription info
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', data.user.id)
    .single()

  return (
    <main className="p-8">
      <div className="mb-4 text-gray-700">
        <div><span className="font-semibold">User ID:</span> {data.user.id}</div>
        <div><span className="font-semibold">Email:</span> {data.user.email}</div>
      </div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="mt-4">
        {subscription ? (
          <div className="border rounded p-4 bg-green-50">
            <div><span className="font-semibold">Plan:</span> {subscription.plan_type}</div>
            <div><span className="font-semibold">Status:</span> {subscription.subscription_status}</div>
          </div>
        ) : (
          <div className="border rounded p-4 bg-yellow-50">No active subscription found.</div>
        )}
      </div>
    </main>
  )
} 