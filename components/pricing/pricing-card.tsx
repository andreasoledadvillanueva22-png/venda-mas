import Link from 'next/link'
import { Check } from 'lucide-react'
import {
  formatPlanPrice,
  getPlanCta,
  getPlanDisplayPrice,
  type Plan,
} from '@/lib/plans'
import { cn } from '@/lib/utils'

type PricingCardProps = {
  plan: Plan
  isYearly: boolean
  compact?: boolean
}

export function PricingCard({ plan, isYearly, compact = false }: PricingCardProps) {
  const price = getPlanDisplayPrice(plan, isYearly)
  const cta = getPlanCta(plan)
  const isExternal = cta.href.startsWith('http')
  const periodLabel = isYearly ? '/año' : '/mes'
  const isFree = plan.priceMonthly === 0

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
            <li key={feature} className="flex items-start gap-2 text-sm text-white/85">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-8 flex-1 text-sm text-white/80">{plan.features[0]}</p>
      )}

      {isExternal ? (
        <a
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition',
            plan.isPopular
              ? 'bg-white text-brand-800 hover:bg-white/90'
              : 'border border-white/30 bg-white/10 text-white hover:bg-white/20',
          )}
        >
          {cta.label}
        </a>
      ) : (
        <Link
          href={cta.href}
          className={cn(
            'inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition',
            plan.isPopular
              ? 'bg-white text-brand-800 hover:bg-white/90'
              : 'border border-white/30 bg-white/10 text-white hover:bg-white/20',
          )}
        >
          {cta.label}
        </Link>
      )}
    </article>
  )
}
