import Link from 'next/link'
import { Check, X, AlertCircle, Loader2 } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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

function formatPrice(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))
}

function formatOrderNumber(id: string) {
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

export default async function OrderConfirmationPage({ searchParams }: OrderConfirmationPageProps) {
  const { order_id: orderId, status } = await searchParams

  if (!orderId?.trim()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-lg font-semibold text-slate-950">Pedido no encontrado</p>
            <Link href="/storefront/products">
              <Button className="bg-red-600 text-white hover:bg-red-700">Volver a la tienda</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const order = await getOrderById(orderId.trim())
  const paymentStatus = status ?? 'pending'

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-lg font-semibold text-slate-950">Pedido no encontrado</p>
            <Link href="/storefront/products">
              <Button className="bg-red-600 text-white hover:bg-red-700">Volver a la tienda</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const orderNumber = formatOrderNumber(order.id)

  if (paymentStatus === 'approved') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center gap-6 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-slate-950">Pago exitoso</h1>
              <p className="text-sm text-slate-500">Tu pago fue procesado correctamente.</p>
            </div>
            <OrderDetails order={order} orderNumber={orderNumber} />
            <Link href="/storefront/products" className="w-full">
              <Button className="w-full bg-red-600 text-white hover:bg-red-700">
                Volver a la tienda
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentStatus === 'cancelled') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center gap-6 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-slate-950">Pago cancelado</h1>
              <p className="text-sm text-slate-500">
                Cancelaste el pago. Podés volver al checkout para intentarlo de nuevo.
              </p>
            </div>
            <OrderDetails order={order} orderNumber={orderNumber} />
            <div className="flex w-full flex-col gap-3">
              <Link href="/storefront/checkout" className="w-full">
                <Button className="w-full bg-red-600 text-white hover:bg-red-700">
                  Volver al checkout
                </Button>
              </Link>
              <Link href="/storefront/products" className="w-full">
                <Button variant="outline" className="w-full">
                  Volver a la tienda
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center gap-6 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-slate-950">Pago fallido</h1>
              <p className="text-sm text-slate-500">
                No se pudo completar el pago. Podés reintentar desde el checkout.
              </p>
            </div>
            <OrderDetails order={order} orderNumber={orderNumber} />
            <div className="flex w-full flex-col gap-3">
              <Link href="/storefront/checkout" className="w-full">
                <Button className="w-full bg-red-600 text-white hover:bg-red-700">
                  Reintentar pago
                </Button>
              </Link>
              <Link href="/storefront/products" className="w-full">
                <Button variant="outline" className="w-full">
                  Volver a la tienda
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-6 py-12">
          <Loader2 className="h-10 w-10 animate-spin text-red-600" />
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-slate-950">Pago pendiente</h1>
            <p className="text-sm text-slate-500">Estamos procesando la información de tu pago.</p>
          </div>
          <OrderDetails order={order} orderNumber={orderNumber} />
          <Link href="/storefront/products" className="w-full">
            <Button className="w-full bg-red-600 text-white hover:bg-red-700">
              Volver a la tienda
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

function OrderDetails({
  order,
  orderNumber,
}: {
  order: DbOrder
  orderNumber: string
}) {
  return (
    <div className="w-full space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
      <div className="flex justify-between gap-4">
        <span className="text-slate-500">Pedido</span>
        <span className="font-mono font-semibold text-slate-950">{orderNumber}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-500">Cliente</span>
        <span className="text-right text-slate-950">{order.customer_name}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-500">Email</span>
        <span className="text-right text-slate-950">{order.customer_email}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-500">Total</span>
        <span className="font-semibold text-slate-950">{formatPrice(Number(order.total))}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-500">Fecha</span>
        <span className="text-slate-950">{formatDate(order.created_at)}</span>
      </div>
    </div>
  )
}
