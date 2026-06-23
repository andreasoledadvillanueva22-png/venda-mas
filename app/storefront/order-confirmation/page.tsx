import Link from 'next/link'
import type { ReactNode } from 'react'
import { AlertCircle, Check, Clock } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'

type OrderConfirmationPageProps = {
  searchParams: Promise<{
    order_id?: string
    status?: string
  }>
}

type DbOrder = {
  id: string
  customer_name: string
  customer_email: string
  total: number
  payment_method: string | null
  status: string
  payment_status: string
  created_at: string
}

type OrderViewState = 'approved' | 'pending_payment' | 'failed' | 'not_found'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(value)
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))
}

function formatOrderNumber(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`
}

async function getOrderById(orderId: string): Promise<DbOrder | null> {
  const admin = createAdminClient()

  const { data: order, error } = await admin
    .from('orders')
    .select(
      'id, customer_name, customer_email, total, payment_method, status, payment_status, created_at',
    )
    .eq('id', orderId)
    .maybeSingle()

  if (error || !order) {
    return null
  }

  return order as DbOrder
}

function resolveOrderViewState(order: DbOrder, urlStatus?: string): OrderViewState {
  const normalizedUrlStatus = urlStatus?.trim().toLowerCase()

  if (
    normalizedUrlStatus === 'approved' ||
    normalizedUrlStatus === 'success'
  ) {
    return 'approved'
  }

  if (
    normalizedUrlStatus === 'cancelled' ||
    normalizedUrlStatus === 'canceled' ||
    normalizedUrlStatus === 'failed' ||
    normalizedUrlStatus === 'rejected'
  ) {
    return 'failed'
  }

  if (order.status === 'cancelled' || order.status === 'failed') {
    return 'failed'
  }

  if (order.payment_status === 'failed') {
    return 'failed'
  }

  if (order.status === 'pending_payment') {
    return 'pending_payment'
  }

  if (
    order.status === 'approved' ||
    order.status === 'paid' ||
    order.payment_status === 'paid'
  ) {
    return 'approved'
  }

  return 'pending_payment'
}

function OrderSummary({
  order,
  orderNumber,
}: {
  order: DbOrder
  orderNumber: string
}) {
  return (
    <div className="w-full space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-5 text-sm">
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-500">Número de orden</span>
        <span className="font-mono font-semibold text-slate-900">{orderNumber}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-500">Cliente</span>
        <span className="text-right text-slate-900">{order.customer_name}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-500">Email</span>
        <span className="text-right text-slate-900">{order.customer_email}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-500">Total</span>
        <span className="font-semibold text-slate-900">{formatPrice(Number(order.total))}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-500">Fecha</span>
        <span className="text-right text-slate-900">{formatDate(order.created_at)}</span>
      </div>
    </div>
  )
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}

export default async function OrderConfirmationPage({ searchParams }: OrderConfirmationPageProps) {
  const { order_id: orderIdParam, status: urlStatus } = await searchParams
  const orderId = orderIdParam?.trim()

  if (!orderId) {
    return (
      <PageShell>
        <div className="flex flex-col items-center gap-6 text-center">
          <AlertCircle className="h-12 w-12 text-slate-400" />
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">No encontramos tu pedido</h1>
            <p className="text-sm text-slate-500">
              El enlace no incluye un identificador de pedido válido.
            </p>
          </div>
          <Link href="/storefront" className="w-full">
            <Button className="w-full bg-red-600 text-white hover:bg-red-700">
              Volver a la tienda
            </Button>
          </Link>
        </div>
      </PageShell>
    )
  }

  const order = await getOrderById(orderId)

  if (!order) {
    return (
      <PageShell>
        <div className="flex flex-col items-center gap-6 text-center">
          <AlertCircle className="h-12 w-12 text-slate-400" />
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">No encontramos tu pedido</h1>
            <p className="text-sm text-slate-500">
              Verificá el enlace o contactá a la tienda si el problema persiste.
            </p>
          </div>
          <Link href="/storefront" className="w-full">
            <Button className="w-full bg-red-600 text-white hover:bg-red-700">
              Volver a la tienda
            </Button>
          </Link>
        </div>
      </PageShell>
    )
  }

  const orderNumber = formatOrderNumber(order.id)
  const viewState = resolveOrderViewState(order, urlStatus)

  if (viewState === 'approved') {
    return (
      <PageShell>
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">¡Tu pedido fue confirmado!</h1>
            <p className="text-sm text-slate-500">
              Recibimos tu pago correctamente. Te enviaremos novedades por email.
            </p>
          </div>
          <OrderSummary order={order} orderNumber={orderNumber} />
          <Link href="/storefront" className="w-full">
            <Button className="w-full bg-red-600 text-white hover:bg-red-700">
              Volver a la tienda
            </Button>
          </Link>
        </div>
      </PageShell>
    )
  }

  if (viewState === 'pending_payment') {
    return (
      <PageShell>
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">Tu pago está siendo procesado</h1>
            <p className="text-sm text-slate-500">
              Mercado Pago está confirmando el pago. Esto puede tardar unos minutos.
            </p>
          </div>
          <OrderSummary order={order} orderNumber={orderNumber} />
          <Link href="/storefront" className="w-full">
            <Button className="w-full bg-red-600 text-white hover:bg-red-700">
              Volver a la tienda
            </Button>
          </Link>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Hubo un problema con tu pago</h1>
          <p className="text-sm text-slate-500">
            No pudimos confirmar el pago de tu pedido. Podés intentarlo nuevamente.
          </p>
        </div>
        <OrderSummary order={order} orderNumber={orderNumber} />
        <div className="flex w-full flex-col gap-3">
          <Link href="/storefront/checkout" className="w-full">
            <Button className="w-full bg-red-600 text-white hover:bg-red-700">
              Reintentar pago
            </Button>
          </Link>
          <Link href="/storefront" className="w-full">
            <Button variant="outline" className="w-full">
              Volver a la tienda
            </Button>
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
