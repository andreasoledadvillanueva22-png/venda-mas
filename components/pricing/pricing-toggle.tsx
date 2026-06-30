'use client'

import { cn } from '@/lib/utils'

type PricingToggleProps = {
  isYearly: boolean
  onChange: (isYearly: boolean) => void
}

export function PricingToggle({ isYearly, onChange }: PricingToggleProps) {
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
      <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-lg">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            'rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300',
            !isYearly ? 'bg-white text-brand-800 shadow-sm' : 'text-white/80 hover:text-white',
          )}
        >
          Mensual
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            'rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300',
            isYearly ? 'bg-white text-brand-800 shadow-sm' : 'text-white/80 hover:text-white',
          )}
        >
          Anual
        </button>
      </div>
      <span
        className={cn(
          'rounded-full border border-amber-300/40 bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-100 transition-opacity duration-300',
          isYearly ? 'opacity-100' : 'opacity-70',
        )}
      >
        Ahorrá 20%
      </span>
    </div>
  )
}
