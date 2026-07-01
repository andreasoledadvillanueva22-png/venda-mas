'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { OrderCompletedTracker } from '@/components/analytics/order-completed-tracker'

export default function CheckoutConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
      }
    >
      <CheckoutConfirmationPageContent />
    </Suspense>
  )
}

function CheckoutConfirmationPageContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  const orderLabel = orderId
    ? `#${orderId.slice(0, 8).toUpperCase()}`
    : '—'

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      {orderId ? (
        <OrderCompletedTracker orderId={orderId} source="checkout_confirmation" />
      ) : null}
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-6 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-slate-950">¡Compra confirmada!</h1>
            <p className="text-sm text-slate-500">Tu pedido fue registrado correctamente.</p>
          </div>
          <div className="w-full rounded-lg bg-slate-50 px-4 py-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Número de pedido
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold text-slate-950">{orderLabel}</p>
          </div>
          <p className="text-center text-sm text-slate-600">
            Te contactaremos pronto con los detalles de envío y pago.
          </p>
          <Link href="/storefront/products" className="w-full">
            <Button className="w-full bg-red-600 text-white hover:bg-red-700">
              Seguir comprando
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
