import { use } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  Store,
  User,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
  store_id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  customer_address: string | null
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: string | null
  shipping_method: string | null
  shipping_cost: number
  subtotal: number
  total: number
  discount_code: string | null
  discount_amount: number | null
  notes: string | null
  created_at: string
}

type DbProductJoin = {
  name: string
  images: string[] | null
}

type DbOrderItem = {
  id: string
  quantity: number
  unit_price: number
  total: number
  product_id: string
  products: DbProductJoin | DbProductJoin[] | null
}

type OrderItemDetail = {
  id: string
  name: string
  image: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
}

function getProductFromJoin(
  products: DbProductJoin | DbProductJoin[] | null,
): DbProductJoin | null {
  if (!products) {
    return null
  }
  return Array.isArray(products) ? (products[0] ?? null) : products
}

function mapOrderItem(item: DbOrderItem): OrderItemDetail {
  const product = getProductFromJoin(item.products)

  return {
    id: item.id,
    name: product?.name ?? 'Producto',
    image: product?.images?.[0] ?? null,
    quantity: item.quantity,
    unitPrice: Number(item.unit_price),
    lineTotal: Number(item.total),
  }
}

type OrderDetailData = {
  storeId: string
  order: DbOrder
  items: OrderItemDetail[]
}

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
]

type OrderDetailPageProps = {
  params: Promise<{ id: string }>
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

function getShippingMethodLabel(method: string | null): string {
  switch (method) {
    case 'local_pickup':
      return 'Retiro en local'
    case 'standard':
      return 'Envío estándar'
    case 'express':
      return 'Envío express'
    case 'free':
      return 'Envío gratis'
    default:
      return 'Envío a domicilio'
  }
}

function getPaymentMethodLabel(method: string | null): string {
  switch (method) {
    case 'mercadopago':
      return 'Mercado Pago'
    case 'transfer':
    case 'bank_transfer':
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

async function getOrderDetail(orderId: string): Promise<OrderDetailData | null | 'not_found'> {
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

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(
      'id, store_id, customer_name, customer_email, customer_phone, customer_address, status, payment_status, payment_method, shipping_method, shipping_cost, subtotal, total, discount_code, discount_amount, notes, created_at',
    )
    .eq('id', orderId)
    .eq('store_id', store.id)
    .maybeSingle()

  if (orderError || !order) {
    return 'not_found'
  }

  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select(
      'id, quantity, unit_price, total, product_id, products ( name, images )',
    )
    .eq('order_id', orderId)

  if (itemsError) {
    return 'not_found'
  }

  return {
    storeId: store.id,
    order: order as DbOrder,
    items: (orderItems ?? []).map((item) => mapOrderItem(item as unknown as DbOrderItem)),
  }
}

async function updateOrderStatus(formData: FormData) {
  'use server'

  const orderId = formData.get('orderId')
  const storeId = formData.get('storeId')
  const status = formData.get('status')

  if (
    typeof orderId !== 'string' ||
    typeof storeId !== 'string' ||
    typeof status !== 'string' ||
    !ORDER_STATUSES.includes(status as OrderStatus)
  ) {
    return
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id')
    .eq('id', storeId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store) {
    return
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: status as OrderStatus })
    .eq('id', orderId)
    .eq('store_id', storeId)

  if (updateError) {
    return
  }

  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin/orders')
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params)
  const result = use(getOrderDetail(id))

  if (result === null) {
    redirect(`/auth/login?redirect=${encodeURIComponent(`/admin/orders/${id}`)}`)
  }

  if (result === 'not_found') {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-white p-8 text-center shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Pedido no encontrado
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-foreground">404</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            El pedido que estás buscando no existe o no tenés permiso para verlo.
          </p>
          <Link
            href="/admin/orders"
            className="mt-8 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Volver a pedidos
          </Link>
        </div>
      </div>
    )
  }

  const { order, items, storeId } = result
  const discountAmount = Number(order.discount_amount ?? 0)
  const isLocalPickup = order.shipping_method === 'local_pickup'

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-border bg-white px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <ArrowLeft className="h-4 w-4" /> Volver a pedidos
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-foreground">
                {formatOrderNumber(order.id)}
              </h1>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${orderStatusBadgeClasses(order.status)}`}
              >
                {orderStatusLabel(order.status)}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${paymentStatusBadgeClasses(order.payment_status)}`}
              >
                Pago: {paymentStatusLabel(order.payment_status)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {getShippingMethodLabel(order.shipping_method)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Pedido del {formatDate(order.created_at)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {ORDER_STATUSES.map((status) => (
              <form key={status} action={updateOrderStatus}>
                <input type="hidden" name="orderId" value={order.id} />
                <input type="hidden" name="storeId" value={storeId} />
                <input type="hidden" name="status" value={status} />
                <Button
                  type="submit"
                  variant={order.status === status ? 'default' : 'outline'}
                  className={order.status === status ? 'bg-red-600 hover:bg-red-700' : ''}
                  disabled={order.status === status}
                >
                  {orderStatusLabel(status)}
                </Button>
              </form>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_28rem]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del cliente</CardTitle>
                <CardDescription>Datos de contacto del comprador.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-4 rounded-3xl border border-border bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-red-600 p-3 text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <Mail className="mt-1 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Email</p>
                        <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="mt-1 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Teléfono</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer_phone || '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {isLocalPickup ? 'Retiro en local' : 'Dirección de envío'}
                </CardTitle>
                <CardDescription>
                  {isLocalPickup
                    ? 'El cliente retirará el pedido en el local.'
                    : 'Domicilio de entrega del pedido.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-3xl border border-border bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    {isLocalPickup ? (
                      <Store className="mt-1 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <MapPin className="mt-1 h-4 w-4 text-muted-foreground" />
                    )}
                    <p className="text-sm text-foreground">
                      {order.customer_address ||
                        (isLocalPickup
                          ? 'Retiro en local sin dirección registrada'
                          : 'Sin dirección registrada')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {order.notes ? (
              <Card>
                <CardHeader>
                  <CardTitle>Notas del pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-3xl border border-border bg-slate-50 p-4">
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
                <CardDescription>Artículos incluidos en el pedido.</CardDescription>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay items en este pedido.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Cant.</TableHead>
                        <TableHead>P. unit.</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-semibold text-slate-400">
                                    {item.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <p className="font-medium text-foreground">{item.name}</p>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatPrice(item.unitPrice)}</TableCell>
                          <TableCell>{formatPrice(item.lineTotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                <Separator className="my-4" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(Number(order.subtotal))}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Envío</span>
                    <span>{formatPrice(Number(order.shipping_cost))}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>
                        Descuento
                        {order.discount_code ? ` (${order.discount_code})` : ''}
                      </span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
                    <span>Total</span>
                    <span>{formatPrice(Number(order.total))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información de pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método</span>
                  <span className="font-medium text-foreground">
                    {getPaymentMethodLabel(order.payment_method)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado del pago</span>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${paymentStatusBadgeClasses(order.payment_status)}`}
                  >
                    {paymentStatusLabel(order.payment_status)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
