'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  DollarSign,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Printer,
  Send,
  User,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const orders = [
  {
    id: '#VM-1024',
    date: new Date('2026-06-04T14:30:00'),
    status: 'Pagado',
    customer: {
      name: 'María González',
      email: 'maria@email.com',
      phone: '+54 11 1234-5678',
      document: 'DNI 34.567.890',
    },
    address: {
      street: 'Av. Libertador 1234',
      city: 'CABA',
      province: 'Buenos Aires',
      zip: '1428',
      notes: 'Entregar en recepción adelante del edificio.',
    },
    timeline: [
      { label: 'Creado', date: new Date('2026-06-04T14:30:00') },
      { label: 'Pagado', date: new Date('2026-06-04T14:32:00') },
      { label: 'Enviado', date: new Date('2026-06-05T09:15:00') },
      { label: 'Entregado', date: new Date('2026-06-06T12:10:00') },
    ],
    products: [
      { id: 'p1', name: 'Pack x3 Citrato de Magnesio', quantity: 1, price: 19900, image: '/products/magnesium.jpg' },
      { id: 'p2', name: 'Kit Limpieza Inalámbrico', quantity: 1, price: 20000, image: '/products/cleaning-kit.jpg' },
      { id: 'p3', name: 'Cepillo Vapor Mascotas', quantity: 1, price: 6000, image: '/products/pet-steam-brush.jpg' },
    ],
    shippingCost: 1000,
    discount: 0,
    payment: {
      method: 'Mercado Pago',
      status: 'Pagado',
      transactionId: 'MP-987654321',
      date: new Date('2026-06-04T14:32:00'),
      url: 'https://www.mercadopago.com/operacion/MP-987654321',
    },
    notes: 'Cliente prefiere entrega por la tarde.',
  },
  {
    id: '#VM-1023',
    date: new Date('2026-06-04T12:15:00'),
    status: 'Pendiente',
    customer: {
      name: 'Carlos Pérez',
      email: 'carlos@email.com',
      phone: '+54 11 9876-5432',
      document: 'CUIT 20-12345678-9',
    },
    address: {
      street: 'Calle Córdoba 456',
      city: 'Rosario',
      province: 'Santa Fe',
      zip: '2000',
      notes: '',
    },
    timeline: [
      { label: 'Creado', date: new Date('2026-06-04T12:15:00') },
      { label: 'Pagado', date: new Date('2026-06-04T12:20:00') },
      { label: 'Enviado', date: new Date('2026-06-05T08:00:00') },
      { label: 'Entregado', date: new Date('2026-06-06T15:30:00') },
    ],
    products: [
      { id: 'p4', name: 'Kit Limpieza Inalámbrico', quantity: 1, price: 12500, image: '/products/cleaning-kit.jpg' },
    ],
    shippingCost: 0,
    discount: 0,
    payment: {
      method: 'Transferencia',
      status: 'Pendiente',
      transactionId: '',
      date: null,
      url: '',
    },
    notes: '',
  },
  {
    id: '#VM-1022',
    date: new Date('2026-06-03T18:45:00'),
    status: 'Enviado',
    customer: {
      name: 'Lucía Fernández',
      email: 'lucia@email.com',
      phone: '+54 11 1122-3344',
      document: 'DNI 27.890.123',
    },
    address: {
      street: 'Av. Santa Fe 789',
      city: 'Córdoba',
      province: 'Córdoba',
      zip: '5000',
      notes: 'Llamar antes de llegar.',
    },
    timeline: [
      { label: 'Creado', date: new Date('2026-06-03T18:45:00') },
      { label: 'Pagado', date: new Date('2026-06-03T18:50:00') },
      { label: 'Enviado', date: new Date('2026-06-04T11:00:00') },
      { label: 'Entregado', date: new Date('2026-06-05T16:00:00') },
    ],
    products: [
      { id: 'p5', name: 'Moldes Silicona Premium', quantity: 2, price: 15000, image: '/products/silicone-molds.jpg' },
      { id: 'p6', name: 'Cepillo Vapor Mascotas', quantity: 1, price: 15000, image: '/products/pet-steam-brush.jpg' },
    ],
    shippingCost: 1200,
    discount: 0,
    payment: {
      method: 'Mercado Pago',
      status: 'Pagado',
      transactionId: 'MP-123456789',
      date: new Date('2026-06-03T18:50:00'),
      url: 'https://www.mercadopago.com/operacion/MP-123456789',
    },
    notes: 'Retira en sucursal si no encuentra al destinatario.',
  },
  {
    id: '#VM-1021',
    date: new Date('2026-06-03T10:20:00'),
    status: 'Entregado',
    customer: {
      name: 'Jorge Ramírez',
      email: 'jorge@email.com',
      phone: '+54 11 5566-7788',
      document: 'DNI 23.456.789',
    },
    address: {
      street: 'Calle San Martín 123',
      city: 'Mendoza',
      province: 'Mendoza',
      zip: '5500',
      notes: '',
    },
    timeline: [
      { label: 'Creado', date: new Date('2026-06-03T10:20:00') },
      { label: 'Pagado', date: new Date('2026-06-03T10:25:00') },
      { label: 'Enviado', date: new Date('2026-06-03T13:40:00') },
      { label: 'Entregado', date: new Date('2026-06-04T11:00:00') },
    ],
    products: [
      { id: 'p7', name: 'Porta Esponjas Silicona', quantity: 2, price: 5000, image: '/products/silicone-holder.jpg' },
    ],
    shippingCost: 900,
    discount: 0,
    payment: {
      method: 'Efectivo',
      status: 'Pagado',
      transactionId: '',
      date: new Date('2026-06-03T10:25:00'),
      url: '',
    },
    notes: 'Entregar en horario de oficina.',
  },
  {
    id: '#VM-1020',
    date: new Date('2026-06-02T09:00:00'),
    status: 'Cancelado',
    customer: {
      name: 'Ana Martínez',
      email: 'ana@email.com',
      phone: '+54 11 4422-1100',
      document: 'DNI 30.123.456',
    },
    address: {
      street: 'Av. San Juan 222',
      city: 'La Plata',
      province: 'Buenos Aires',
      zip: '1900',
      notes: 'No dejar en puerta.',
    },
    timeline: [
      { label: 'Creado', date: new Date('2026-06-02T09:00:00') },
      { label: 'Pagado', date: new Date('2026-06-02T09:05:00') },
      { label: 'Enviado', date: new Date('2026-06-03T10:00:00') },
      { label: 'Entregado', date: new Date('2026-06-04T14:00:00') },
    ],
    products: [
      { id: 'p8', name: 'Pack x3 Citrato de Magnesio', quantity: 3, price: 19900, image: '/products/magnesium.jpg' },
      { id: 'p9', name: 'Moldes Silicona Premium', quantity: 1, price: 15000, image: '/products/silicone-molds.jpg' },
    ],
    shippingCost: 1500,
    discount: 0,
    payment: {
      method: 'Mercado Pago',
      status: 'Cancelado',
      transactionId: 'MP-555555555',
      date: new Date('2026-06-02T09:05:00'),
      url: 'https://www.mercadopago.com/operacion/MP-555555555',
    },
    notes: 'Pedido cancelado por cliente antes del envío.',
  },
]

function formatPrice(value: number) {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  })
}

function formatDateTime(date: Date | null) {
  if (!date) return 'Sin registro'
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function statusBadgeClasses(status: string) {
  switch (status) {
    case 'Pagado':
      return 'bg-emerald-100 text-emerald-700'
    case 'Pendiente':
      return 'bg-amber-100 text-amber-700'
    case 'Enviado':
      return 'bg-blue-100 text-blue-700'
    case 'Entregado':
      return 'bg-slate-100 text-slate-700'
    case 'Cancelado':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-muted text-foreground'
  }
}

function paymentIcon(method: string) {
  switch (method) {
    case 'Mercado Pago':
      return CreditCard
    case 'Transferencia':
      return Banknote
    case 'Efectivo':
      return DollarSign
    default:
      return CreditCard
  }
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [savedNote, setSavedNote] = useState(false)
  const [status, setStatus] = useState('')

  const order = useMemo(
    () => orders.find((item) => item.id === params.id),
    [params.id]
  )

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (order) {
      setStatus(order.status)
    }
  }, [order])

  const totalProducts = order?.products.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0
  const totalOrder = totalProducts + (order?.shippingCost ?? 0) - (order?.discount ?? 0)
  const PaymentIcon = order ? paymentIcon(order.payment.method) : CreditCard

  if (!order && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-white p-8 text-center shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Pedido no encontrado</p>
          <h1 className="mt-4 text-4xl font-semibold text-foreground">404</h1>
          <p className="mt-4 text-sm text-muted-foreground">El pedido que estás buscando no existe o fue eliminado.</p>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-32 rounded-3xl bg-slate-100" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-6">
              <div className="h-60 rounded-3xl bg-slate-100" />
              <div className="h-72 rounded-3xl bg-slate-100" />
            </div>
            <div className="space-y-6">
              <div className="h-40 rounded-3xl bg-slate-100" />
              <div className="h-56 rounded-3xl bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-border bg-white px-6 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700">
              <ArrowLeft className="h-4 w-4" /> Volver a pedidos
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-foreground">{order.id}</h1>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusBadgeClasses(status)}`}>
                {status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Detalle completo del pedido, estado y seguimiento.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setStatus('Enviado')}>Cambiar estado</Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
            <Button variant="secondary" onClick={() => {
              setSavedNote(true)
              setTimeout(() => setSavedNote(false), 1500)
            }}>
              <Send className="mr-2 h-4 w-4" /> Enviar email
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {savedNote && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Email enviado correctamente.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_28rem]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del cliente</CardTitle>
                <CardDescription>Datos de contacto y documento.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-4 rounded-3xl border border-border bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-red-600 p-3 text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{order.customer.name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer.document}</p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <Mail className="mt-1 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Email</p>
                        <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="mt-1 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Teléfono</p>
                        <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dirección de envío</CardTitle>
                <CardDescription>Datos del domicilio y notas del cliente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl border border-border bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-4 w-4 text-muted-foreground" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">{order.address.street}</p>
                      <p className="text-sm text-muted-foreground">{order.address.city}, {order.address.province} {order.address.zip}</p>
                    </div>
                  </div>
                </div>
                {order.address.notes ? (
                  <div className="rounded-3xl border border-border bg-slate-50 p-4">
                    <p className="text-sm font-medium text-foreground">Notas del cliente</p>
                    <p className="text-sm text-muted-foreground">{order.address.notes}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline de estados</CardTitle>
                <CardDescription>Registro de cada etapa del pedido.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {order.timeline.map((step, index) => {
                    const isActive = step.label === status || (status === 'Cancelado' && step.label === 'Pagado')
                    return (
                      <div key={step.label} className="flex items-start gap-4">
                        <div className="relative">
                          <span className={`mt-1 inline-flex h-3.5 w-3.5 rounded-full ${isActive ? 'bg-red-600' : 'bg-slate-300'}`} />
                          {index < order.timeline.length - 1 && <span className="absolute left-1/2 top-4 h-full w-px -translate-x-1/2 bg-slate-200" />}
                        </div>
                        <div>
                          <p className={`font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                          <p className="text-sm text-muted-foreground">{formatDateTime(step.date)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
                <CardDescription>Resumen de los artículos del pedido.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        <th className="px-3 py-3">Producto</th>
                        <th className="px-3 py-3">Cantidad</th>
                        <th className="px-3 py-3">Precio unitario</th>
                        <th className="px-3 py-3">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.products.map((item) => (
                        <tr key={item.id} className="border-t border-border">
                          <td className="px-3 py-3 align-top">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                              <div>
                                <p className="font-medium text-foreground">{item.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 align-top">{item.quantity}</td>
                          <td className="px-3 py-3 align-top">{formatPrice(item.price)}</td>
                          <td className="px-3 py-3 align-top">{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Separator className="my-4" />
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalProducts)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Envío</span>
                    <span>{formatPrice(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Descuento</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
                    <span>Total</span>
                    <span>{formatPrice(totalOrder)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información de pago</CardTitle>
                <CardDescription>Detalle de la transacción y estado.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-3xl border border-border bg-slate-50 px-4 py-4">
                  <div className="rounded-2xl bg-white p-3 text-red-600 shadow-sm">
                    <PaymentIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{order.payment.method}</p>
                    <p className="text-sm text-muted-foreground">Estado: {order.payment.status}</p>
                  </div>
                </div>
                {order.payment.transactionId ? (
                  <div className="rounded-3xl border border-border bg-slate-50 px-4 py-4">
                    <p className="text-sm font-medium text-foreground">ID de transacción</p>
                    <p className="text-sm text-muted-foreground">{order.payment.transactionId}</p>
                  </div>
                ) : null}
                <div className="rounded-3xl border border-border bg-slate-50 px-4 py-4">
                  <p className="text-sm font-medium text-foreground">Fecha de pago</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(order.payment.date)}</p>
                </div>
                {order.payment.url ? (
                  <Link
                    href={order.payment.url}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    <ExternalLink className="h-4 w-4" /> Ver en Mercado Pago
                  </Link>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notas internas</CardTitle>
                <CardDescription>Agrega comentarios para el equipo administrativo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label htmlFor="internal-notes">Nota</Label>
                <textarea
                  id="internal-notes"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={6}
                  className="w-full rounded-2xl border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-ring/50"
                  placeholder="Agrega una nota interna para el pedido"
                />
                <Button type="button" onClick={() => {
                  setSavedNote(true)
                  setTimeout(() => setSavedNote(false), 1500)
                }}>
                  Guardar nota
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
