'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trackEvent } from '@/lib/posthog'
import { cn } from '@/lib/utils'
import type { Plan } from '@/lib/plans'

type SubscribeButtonProps = {
  plan: Plan
  isYearly: boolean
  className?: string
}

export function SubscribeButton({ plan, isYearly, className }: SubscribeButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubscribe() {
    trackEvent('plan_selected', {
      plan_name: plan.name,
      plan_slug: plan.slug,
      billing_period: isYearly ? 'yearly' : 'monthly',
    })

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/subscriptions/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
      })

      const data = (await response.json()) as { initPoint?: string; error?: string }

      if (response.status === 401) {
        router.push(`/auth/register?plan=${encodeURIComponent(plan.slug)}`)
        return
      }

      if (!response.ok || !data.initPoint) {
        setError(data.error ?? 'No se pudo iniciar el pago. Intentá de nuevo.')
        return
      }

      window.location.href = data.initPoint
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={loading}
        className={cn(className, loading && 'opacity-70')}
      >
        {loading ? 'Redirigiendo...' : 'Elegir plan'}
      </button>
      {error ? <p className="text-center text-xs text-red-200">{error}</p> : null}
    </div>
  )
}
