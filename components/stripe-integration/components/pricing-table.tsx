import React from 'react'

export type Plan = {
  id: string
  name: string
  price_cents: number
  features: Record<string, boolean>
}

interface PricingTableProps {
  plans: Plan[]
  showBuyButton?: boolean
}

export function PricingTable({ plans, showBuyButton = true }: PricingTableProps) {
  // Collect all possible features for table header
  const allFeatures = Array.from(
    new Set(plans.flatMap(plan => Object.keys(plan.features || {})))
  )

  return (
    <div className="flex flex-wrap gap-8 justify-center">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="bg-white border rounded-lg shadow-md p-6 flex flex-col items-center w-80 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-bold mb-2 capitalize">{plan.name}</h3>
          <div className="text-3xl font-extrabold mb-2">${plan.price_cents / 100}<span className="text-base font-normal">/mo</span></div>
          <ul className="mb-4 w-full text-left">
            {allFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                {plan.features?.[feature] ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-gray-300">✗</span>
                )}
                <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1')}</span>
              </li>
            ))}
          </ul>
          {showBuyButton && (
            <form action="/api/stripe/checkout" method="POST" className="w-full flex justify-center">
              <input type="hidden" name="plan_id" value={plan.id} />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors font-semibold"
              >
                Buy
              </button>
            </form>
          )}
        </div>
      ))}
    </div>
  )
} 