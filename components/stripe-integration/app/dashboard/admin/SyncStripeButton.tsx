'use client'

import { useTransition, useState } from 'react'

export function SyncStripeButton({ action }: { action: () => Promise<{ synced: number, errors: any[] }> }) {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<{ synced: number, errors: any[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded shadow"
        disabled={pending}
        onClick={() => {
          setError(null)
          startTransition(async () => {
            try {
              const res = await action()
              setResult(res)
            } catch (err) {
              setError(String(err))
            }
          })
        }}
      >
        {pending ? 'Syncing...' : 'Sync Stripe Data'}
      </button>
      {result && (
        <div className="mt-4">
          <div>Synced: {result.synced}</div>
          <div>Errors: {result.errors.length}</div>
        </div>
      )}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  )
} 