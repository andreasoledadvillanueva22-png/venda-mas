import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Eye, Mail, Phone, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

type DbOrder = {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  total: number
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: string | null
  created_at: string
}

type CustomerOrderRow = {
  id: string
  orderNumber: string
  createdAt: string
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethodLabel: string
}

type CustomerDetail = {
  name: string
  email: string
  phone: string
  ordersCount: number
  totalSpent: number
  averageTicket: number
  firstOrderAt: string
  lastOrderAt: string
  orders: CustomerOrderRow[]
}

type CustomerDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string }>
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
  }).format(new Date(value))
}

function formatDateTime(value: string) {
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

function resolveCustomerEmail(slug: string, emailParam: string | undefined): string | null {
  if (emailParam?.trim()) {
    return emailParam.trim()
  }

  if (!slug.trim()) {
    return null
  }

  try {
    return decodeURIComponent(slug)
  } catch {
    return null
  }
}

function mapOrder(order: DbOrder): CustomerOrderRow {
  return {
    id: order.id,
    orderNumber: formatOrderNumber(order.id),
    createdAt: order.created_at,
    total: Number(order.total),
    status: order.status,
    paymentStatus: order.payment_status,
    paymentMethodLabel: getPaymentMethodLabel(order.payment_method),
  }
}

function buildCustomerDetail(orders: DbOrder[]): CustomerDetail {
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
  const latestOrder = sortedOrders[0]
  const oldestOrder = sortedOrders[sortedOrders.length - 1]
  const totalSpent = sortedOrders.reduce((sum, order) => sum + Number(order.total), 0)
  const ordersCount = sortedOrders.length

  return {
    name: latestOrder.customer_name,
    email: latestOrder.customer_email.trim(),
    phone: latestOrder.customer_phone?.trim() || '—',
    ordersCount,
    totalSpent,
    averageTicket: ordersCount > 0 ? totalSpent / ordersCount : 0,
    firstOrderAt: oldestOrder.created_at,
    lastOrderAt: latestOrder.created_at,
    orders: sortedOrders.map(mapOrder),
  }
}

async function getCustomerDetail(customerEmail: string): Promise<CustomerDetail | null | 'unauthorized'> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return 'unauthorized'
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store) {
    return 'unauthorized'
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(
      'id, customer_name, customer_email, customer_phone, total, status, payment_status, payment_method, created_at',
    )
    .eq('store_id', store.id)
    .ilike('customer_email', customerEmail.trim())
    .order('created_at', { ascending: false })

  if (ordersError || !orders || orders.length === 0) {
    return null
  }

  return buildCustomerDetail(orders as DbOrder[])
}

function CustomerNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-white p-8 text-center shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Cliente no encontrado</p>
        <h1 className="mt-4 text-4xl font-semibold text-foreground">404</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          El cliente que buscás no existe o no tiene pedidos en tu tienda.
        </p>
        <Link
          href="/admin/customers"
          className="mt-8 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Volver a clientes
        </Link>
      </div>
    </div>
  )
}

export default async function CustomerDetailPage({ params, searchParams }: CustomerDetailPageProps) {
  const { id } = await params
  const { email: emailParam } = await searchParams
  const customerEmail = resolveCustomerEmail(id, emailParam)

  if (!customerEmail) {
    return <CustomerNotFound />
  }

  const redirectPath = `/admin/customers/${encodeURIComponent(customerEmail)}`
  const detailResult = await getCustomerDetail(customerEmail)

  if (detailResult === 'unauthorized') {
    redirect(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`)
  }

  if (!detailResult) {
    return <CustomerNotFound />
  }

  const customer = detailResult

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-white p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <Link
              href="/admin/customers"
              className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <ArrowLeft className="h-4 w-4" /> Volver a clientes
            </Link>
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarFallback>{customer.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-semibold text-foreground">{customer.name}</h1>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
              <Badge className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {customer.ordersCount} pedido{customer.ordersCount === 1 ? '' : 's'}
              </Badge>
            </div>
            <Link
              href={`mailto:${customer.email}`}
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              <Mail className="mr-2 h-4 w-4" /> Enviar email
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_28rem]">
          <Card>
            <CardHeader>
              <CardTitle>Historial de pedidos</CardTitle>
              <CardDescription>
                Todos los pedidos realizados por este cliente en tu tienda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customer.orders.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Este cliente aún no tiene pedidos registrados.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Pago</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.orders.map((order) => (
                      <TableRow key={order.id} className="group hover:bg-muted/50">
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                        <TableCell className="font-semibold">{formatPrice(order.total)}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              'rounded-full px-2 py-1 text-xs font-semibold',
                              orderStatusBadgeClasses(order.status),
                            )}
                          >
                            {orderStatusLabel(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              'rounded-full px-2 py-1 text-xs font-semibold',
                              paymentStatusBadgeClasses(order.paymentStatus),
                            )}
                          >
                            {paymentStatusLabel(order.paymentStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.paymentMethodLabel}</TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              aria-label="Ver pedido"
                              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Nombre</p>
                    <p className="text-sm text-muted-foreground">{customer.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Email</p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Teléfono</p>
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumen de actividad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-3xl border border-border bg-slate-50 p-5">
                  <p className="text-sm text-muted-foreground">Total gastado</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">
                    {formatPrice(customer.totalSpent)}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-border bg-white p-4">
                    <p className="text-sm text-muted-foreground">Cantidad de pedidos</p>
                    <p className="mt-2 text-xl font-semibold text-foreground">{customer.ordersCount}</p>
                  </div>
                  <div className="rounded-3xl border border-border bg-white p-4">
                    <p className="text-sm text-muted-foreground">Ticket promedio</p>
                    <p className="mt-2 text-xl font-semibold text-foreground">
                      {formatPrice(customer.averageTicket)}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-border bg-white p-4">
                    <p className="text-sm text-muted-foreground">Primer pedido</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {formatDate(customer.firstOrderAt)}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-border bg-white p-4">
                    <p className="text-sm text-muted-foreground">Último pedido</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {formatDate(customer.lastOrderAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
