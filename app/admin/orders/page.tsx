import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type OrderStatus = 'pending' | 'pending_payment' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

type DbOrder = {
  id: string
  customer_name: string
  customer_email: string
  total: number
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: string | null
  created_at: string
}

type OrderRow = {
  id: string
  orderNumber: string
  createdAt: string
  customerName: string
  customerEmail: string
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethodLabel: string
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

function getPaymentMethodLabel(method: string | null): string {
  switch (method) {
    case 'mercadopago':
      return 'Mercado Pago'
    case 'transfer':
      return 'Transferencia'
    case 'effectivo':
      return 'Efectivo'
    default:
      return '—'
  }
}

function orderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'Pendiente'
    case 'paid':
      return 'Pagado'
    case 'shipped':
      return 'Enviado'
    case 'delivered':
      return 'Entregado'
    case 'cancelled':
      return 'Cancelado'
    default:
      return status
  }
}

function paymentStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case 'pending':
      return 'Pendiente'
    case 'paid':
      return 'Pagado'
    case 'failed':
      return 'Fallido'
    case 'refunded':
      return 'Reembolsado'
    default:
      return status
  }
}

function orderStatusBadgeClasses(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-700'
    case 'paid':
      return 'bg-emerald-100 text-emerald-700'
    case 'shipped':
      return 'bg-blue-100 text-blue-700'
    case 'delivered':
      return 'bg-slate-100 text-slate-700'
    case 'cancelled':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-muted text-foreground'
  }
}

function paymentStatusBadgeClasses(status: PaymentStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-700'
    case 'paid':
      return 'bg-emerald-100 text-emerald-700'
    case 'failed':
      return 'bg-red-100 text-red-700'
    case 'refunded':
      return 'bg-slate-100 text-slate-700'
    default:
      return 'bg-muted text-foreground'
  }
}

function mapOrder(order: DbOrder): OrderRow {
  return {
    id: order.id,
    orderNumber: formatOrderNumber(order.id),
    createdAt: order.created_at,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    total: Number(order.total),
    status: order.status,
    paymentStatus: order.payment_status,
    paymentMethodLabel: getPaymentMethodLabel(order.payment_method),
  }
}

async function getStoreOrders(): Promise<OrderRow[] | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store) {
    return null
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(
      'id, customer_name, customer_email, total, status, payment_status, payment_method, created_at',
    )
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  if (ordersError) {
    return null
  }

  return (orders ?? []).map((order) => mapOrder(order as DbOrder))
}

export default async function AdminOrdersPage() {
  const orders = await getStoreOrders()

  if (!orders) {
    redirect('/auth/login?redirect=/admin/orders')
  }

  return (
    <div className="min-h-full">
      <div className="border-b border-brand-200 bg-white/60 px-6 py-6 backdrop-blur-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold text-foreground">Pedidos</h1>
              <Badge className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {orders.length}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Gestiona los pedidos recibidos y revisá su estado de pago y envío.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <p className="text-lg font-medium text-foreground">No tenés pedidos aún</p>
              <p className="text-sm text-muted-foreground">
                Cuando recibas compras en tu tienda, aparecerán acá.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-1">
                <CardTitle>Lista de pedidos</CardTitle>
                <CardDescription>
                  Hacé click en cualquier fila para ver el detalle del pedido.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº de pedido</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="group">
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-red-600 underline hover:text-red-700"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="font-medium text-foreground">{order.customerName}</p>
                          <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${orderStatusBadgeClasses(order.status)}`}
                        >
                          {orderStatusLabel(order.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${paymentStatusBadgeClasses(order.paymentStatus)}`}
                        >
                          {paymentStatusLabel(order.paymentStatus)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {order.paymentMethodLabel}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            aria-label="Ver pedido"
                            className={cn(
                              buttonVariants({ variant: 'outline', size: 'icon' }),
                            )}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
