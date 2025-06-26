import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { SyncStripeButton } from './SyncStripeButton'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { syncSubscriptionToUser } from '@/lib/stripe/syncSubscription'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }
  if (data.user.email !== 'wschenk@thefocus.ai') {
    return <div className="p-8">Unauthorized</div>
  }

  async function syncStripeData() {
    'use server'
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' })
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    // Load all users into a hash for efficient lookup
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    if (usersError) throw usersError
    const userByEmail: Record<string, any> = Object.fromEntries((usersData?.users || []).map(u => [u.email, u]))

    let synced = 0
    let errors: any[] = []
    let results: any[] = []
    let hasMore = true
    let startingAfter: string | undefined = undefined
    while (hasMore) {
      const subs: Stripe.ApiList<Stripe.Subscription> = await stripe.subscriptions.list({ limit: 100, starting_after: startingAfter })
      for (const sub of subs.data) {
        const result = await syncSubscriptionToUser({ supabase: supabaseAdmin, stripe, subscription: sub, userByEmail })
        if (result.error) {
          errors.push({ sub: sub.id, error: result.error })
        } else {
          synced++
          results.push({ sub: sub.id, user: result.user, upserted: result.upserted })
        }
      }
      hasMore = subs.has_more
      startingAfter = subs.data.length > 0 ? subs.data[subs.data.length - 1].id : undefined
    }
    return { synced, errors, results }
  }

  return (
    <main className="p-8">
      <div className="mb-4 text-gray-700">
        <div><span className="font-semibold">User ID:</span> {data.user.id}</div>
        <div><span className="font-semibold">Email:</span> {data.user.email}</div>
      </div>
      <h1 className="text-2xl font-bold mb-4">Admin: Sync Stripe Data</h1>
      <SyncStripeButton action={syncStripeData} />

      {/* Upcoming Charges Section */}
      <h2 className="text-xl font-bold mt-8 mb-4">Upcoming Stripe Charges</h2>
      <UpcomingChargesTable />
    </main>
  )
}

// Server component to fetch and display upcoming charges
async function UpcomingChargesTable() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' })
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  // Get all user subscriptions with a Stripe customer ID
  const { data: subscriptions, error } = await supabaseAdmin
    .from('user_subscriptions')
    .select('user_id, stripe_customer_id, stripe_subscription_id, plan_type, subscription_status')
    .not('stripe_customer_id', 'is', null)
  if (error) {
    return <div className="text-red-600">Error loading subscriptions: {error.message}</div>
  }
  // Fetch upcoming invoices for each customer using the new preview invoice API
  const results = await Promise.all(
    (subscriptions || []).map(async (sub: any) => {
      try {
        if (!sub.stripe_customer_id || !sub.stripe_subscription_id) {
          return { ...sub, amount_due: null, next_payment_attempt: null, currency: null, error: 'Missing customer or subscription ID' }
        }
        // @ts-ignore: createPreview is the new method for previewing invoices in Basil
        const invoice = await stripe.invoices.createPreview({ customer: sub.stripe_customer_id, subscription: sub.stripe_subscription_id })
        return {
          ...sub,
          amount_due: invoice.amount_due,
          next_payment_attempt: invoice.next_payment_attempt,
          currency: invoice.currency,
        }
      } catch (err: any) {
        // No upcoming invoice or error
        return { ...sub, amount_due: null, next_payment_attempt: null, currency: null, error: err.message }
      }
    })
  )
  return (
    <table className="min-w-full border mt-2">
      <thead>
        <tr>
          <th className="border px-2 py-1">User ID</th>
          <th className="border px-2 py-1">Stripe Customer ID</th>
          <th className="border px-2 py-1">Stripe Customer (Link)</th>
          <th className="border px-2 py-1">Stripe Subscription (Link)</th>
          <th className="border px-2 py-1">Plan</th>
          <th className="border px-2 py-1">Status</th>
          <th className="border px-2 py-1">Next Charge</th>
          <th className="border px-2 py-1">Amount</th>
        </tr>
      </thead>
      <tbody>
        {results.map((row, i) => (
          <tr key={row.stripe_customer_id || i}>
            <td className="border px-2 py-1">{row.user_id}</td>
            <td className="border px-2 py-1">{row.stripe_customer_id}</td>
            <td className="border px-2 py-1">
              {row.stripe_customer_id ? (
                <a
                  href={`https://dashboard.stripe.com/test/customers/${row.stripe_customer_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Customer
                </a>
              ) : '-'}
            </td>
            <td className="border px-2 py-1">
              {row.stripe_subscription_id ? (
                <a
                  href={`https://dashboard.stripe.com/test/subscriptions/${row.stripe_subscription_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Subscription
                </a>
              ) : '-'}
            </td>
            <td className="border px-2 py-1">{row.plan_type}</td>
            <td className="border px-2 py-1">{row.subscription_status}</td>
            <td className="border px-2 py-1">
              {row.next_payment_attempt
                ? new Date(row.next_payment_attempt * 1000).toLocaleString()
                : row.error || 'No upcoming charge'}
            </td>
            <td className="border px-2 py-1">
              {row.amount_due !== null && row.amount_due !== undefined
                ? `${(row.amount_due / 100).toFixed(2)} ${row.currency?.toUpperCase()}`
                : '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
} 