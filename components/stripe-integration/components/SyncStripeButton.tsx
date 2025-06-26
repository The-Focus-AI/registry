'use client'

export function SyncStripeButton() {
  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/sync-stripe', {
      method: 'POST',
      credentials: 'include',
    })
    console.log('SyncStripeButton: response status', res.status)
    let result
    try {
      result = await res.json()
      console.log('SyncStripeButton: response body', result)
    } catch (err) {
      console.error('SyncStripeButton: failed to parse JSON', err)
      result = null
    }
    if (!res.ok) {
      const message = (result && result.error) || res.statusText
      alert(`Error: ${res.status} ${message}`)
      return
    }
    alert(`Synced: ${result.synced}\nErrors: ${result.errors.length}`)
  }

  return (
    <form onSubmit={handleSync}>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded shadow"
      >
        Sync Stripe Data
      </button>
    </form>
  )
} 