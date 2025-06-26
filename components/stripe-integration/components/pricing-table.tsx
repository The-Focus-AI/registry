import React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
        <Card key={plan.id} className="w-80 flex flex-col items-center">
          <CardHeader className="items-center">
            <CardTitle className="text-2xl capitalize">{plan.name}</CardTitle>
            <CardDescription>
              <span className="text-3xl font-extrabold">${plan.price_cents / 100}</span>
              <span className="text-base font-normal">/mo</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full px-0">
            <ul className="mb-4 w-full text-left px-6">
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
          </CardContent>
          {showBuyButton && (
            <CardFooter className="w-full flex justify-center">
              <form action="/api/stripe/checkout" method="POST" className="w-full flex justify-center">
                <input type="hidden" name="plan_id" value={plan.id} />
                <Button type="submit" className="w-full font-semibold">
                  Buy
                </Button>
              </form>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  )
} 