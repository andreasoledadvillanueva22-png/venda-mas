'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import {
  formatPlanPrice,
  getPlanCta,
  getPlanDisplayPrice,
  type Plan,
} from '@/lib/plans'
import { SubscribeButton } from '@/components/pricing/subscribe-button'
import { trackEvent } from '@/lib/posthog'
import { cn } from '@/lib/utils'

type PricingCardProps = {
  plan: Plan
  isYearly: boolean
  compact?: boolean
}

function FeatureCheck() {
  return (
    <span
      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 shadow-sm"
      aria-hidden="true"
    >
      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
    </span>
  )
}

export function PricingCard({ plan, isYearly, compact = false }: PricingCardProps) {
  const price = getPlanDisplayPrice(plan, isYearly)
  const cta = getPlanCta(plan)
  const isExternal = cta.href.startsWith('http')
  const periodLabel = isYearly ? '/año' : '/mes'
  const isFree = plan.priceMonthly === 0
  const showCheaperBadge = plan.slug === 'emprendedor'
  const useSubscriptionCheckout = !isFree && plan.slug !== 'empresa'
  const buttonClassName = cn(
    'inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition',
    plan.isPopular
      ? 'bg-white text-brand-800 hover:bg-white/90'
      : 'border border-white/30 bg-white/10 text-white hover:bg-white/20',
  )

  function handlePlanSelect() {
    trackEvent('plan_selected', {
      plan_name: plan.name,
      plan_slug: plan.slug,
      billing_period: isYearly ? 'yearly' : 'monthly',
    })
  }

  return (
    <article
      className={cn(
        'relative flex h-full flex-col rounded-2xl border bg-white/10 p-6 backdrop-blur-lg transition duration-300',
        plan.isPopular
          ? 'border-amber-300/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-300/40'
          : 'border-white/20 hover:border-white/30 hover:bg-white/15',
      )}
    >
      {plan.isPopular ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-amber-300/50 bg-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-900">
          Más elegido
        </span>
      ) : null}

      <div className="mb-4">
        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
        {plan.description ? (
          <p className="mt-2 text-sm leading-relaxed text-white/75">{plan.description}</p>
        ) : null}
      </div>

      <div className="mb-6">
        {showCheaperBadge ? (
          <span className="mb-3 inline-flex rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
            50% más barato que Tienda Nube
          </span>
        ) : null}

        <p className="text-4xl font-bold tracking-tight text-white transition-all duration-300">
          {isFree ? 'Gratis' : formatPlanPrice(price)}
        </p>
        {!isFree ? (
          <p className="mt-1 text-sm text-white/70 transition-all duration-300">{periodLabel}</p>
        ) : (
          <p className="mt-1 text-sm text-white/70">Para siempre</p>
        )}
      </div>

      {!compact ? (
        <ul className="mb-8 flex-1 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-white/85">
              <FeatureCheck />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-8 flex-1 text-sm text-white/80">{plan.features[0]}</p>
      )}

      {useSubscriptionCheckout ? (
        <SubscribeButton plan={plan} isYearly={isYearly} className={buttonClassName} />
      ) : isExternal ? (
        <a
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handlePlanSelect}
          className={buttonClassName}
        >
          {cta.label}
        </a>
      ) : (
        <Link href={cta.href} onClick={handlePlanSelect} className={buttonClassName}>
          {cta.label}
        </Link>
      )}
    </article>
  )
}
