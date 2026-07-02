'use client'

import { mpClientConfig } from '@/lib/mercadopago-client-config'
import { cn } from '@/lib/utils'

type MpTestModeBannerProps = {
  className?: string
  variant?: 'marketing' | 'checkout'
}

export function MpTestModeBanner({
  className,
  variant = 'marketing',
}: MpTestModeBannerProps) {
  if (!mpClientConfig.isTestMode) {
    return null
  }

  return (
    <div
      role="status"
      className={cn(
        'rounded-xl border px-4 py-3 text-sm font-medium',
        variant === 'marketing'
          ? 'border-amber-300/60 bg-amber-400/20 text-amber-50 backdrop-blur-sm'
          : 'mb-4 border-amber-300 bg-amber-50 text-amber-900',
        className,
      )}
    >
      Modo prueba activo — no se realizarán cobros reales.
    </div>
  )
}
