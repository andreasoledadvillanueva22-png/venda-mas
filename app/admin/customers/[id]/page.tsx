'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, MapPin, Pencil, ShieldCheck, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const customers = [
  {
    id: 'VM-1024',
    name: 'María González',
    email: 'maria@email.com',
    phone: '+54 9 11 1234-5678',
    document: 'DNI 34.567.890',
    registered: new Date('2025-10-12T10:30:00'),
    lastActive: new Date('2026-06-04T14:30:00'),
    segment: 'VIP',
    addresses: [
      {
        id: 'a1',
        label: 'Principal',
        line: 'Av. Libertador 1234',
        city: 'CABA',
        province: 'Buenos Aires',
        zip: '1428',
        main: true,
      },
      {
        id: 'a2',
        label: 'Segunda',
        line: 'Calle Paraná 580',
        city: 'Córdoba',
        province: 'Córdoba',
        zip: '5000',
        main: false,
      },
    ],
    notes: [
      { id: 'n1', text: 'Contactar para actualización de datos.', date: new Date('2026-05-20T11:00:00') },
      { id: 'n2', text: 'Preferencia de entrega: tarde.', date: new Date('2026-06-01T09:30:00') },
    ],
    totalSpent: 245800,
    orders: 12,
    averageTicket: 20483,
    lastOrder: new Date('2026-06-04T14:30:00'),
    recentOrders: [
      { id: 'VM-1024', date: new Date('2026-06-04T14:30:00'), total: 45900, status: 'Pagado' },
      { id: 'VM-1018', date: new Date('2026-05-28T11:10:00'), total: 18900, status: 'Entregado' },
      { id: 'VM-1015', date: new Date('2026-05-20T16:45:00'), total: 22400, status: 'Entregado' },
      { id: 'VM-1010', date: new Date('2026-05-10T09:20:00'), total: 39500, status: 'Entregado' },
      { id: 'VM-1008', date: new Date('2026-05-05T13:00:00'), total: 25200, status: 'Entregado' },
    ],
    favorites: [
      { id: 'p1', name: 'Pack x3 Citrato de Magnesio', quantity: 4, image: '/products/magnesium.jpg' },
      { id: 'p2', name: 'Cepillo Vapor Mascotas', quantity: 2, image: '/products/pet-steam-brush.jpg' },
    ],
  },
]

const segmentBadgeClasses = {
  VIP: 'bg-amber-100 text-amber-700',
  Regular: 'bg-blue-100 text-blue-700',
  Nuevo: 'bg-emerald-100 text-emerald-700',
  Inactivo: 'bg-slate-100 text-slate-700',
}

const orderStatusBadgeClasses = {
  Pagado: 'bg-emerald-100 text-emerald-700',
  Entregado: 'bg-slate-100 text-slate-700',
  Cancelado: 'bg-red-100 text-red-700',
  Pendiente: 'bg-amber-100 text-amber-700',
}

function formatPrice(value: number) {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  })
}

function formatDate(date: Date) {
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDateTime(date: Date) {
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const [noteText, setNoteText] = useState('')
  const [notes, setNotes] = useState<{ id: string; text: string; date: Date }[]>([])

  const customer = useMemo(
    () => customers.find((item) => item.id === params.id),
    [params.id]
  )

  useEffect(() => {
    if (customer) {
      setNotes(customer.notes)
    }
  }, [customer])

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-white p-8 text-center shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Cliente no encontrado</p>
          <h1 className="mt-4 text-4xl font-semibold text-foreground">404</h1>
          <p className="mt-4 text-sm text-muted-foreground">El cliente que buscas no existe o fue eliminado.</p>
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

  const handleSaveNote = () => {
    if (!noteText.trim()) return
    setNotes((current) => [
      { id: String(Date.now()), text: noteText.trim(), date: new Date() },
      ...current,
    ])
    setNoteText('')
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-white p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700">
                <ArrowLeft className="h-4 w-4" /> Volver a clientes
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-semibold text-foreground">{customer.name}</h1>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${segmentBadgeClasses[customer.segment as keyof typeof segmentBadgeClasses]}`}>
                {customer.segment}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => window.location.assign(`mailto:${customer.email}`)}>
                <Mail className="mr-2 h-4 w-4" /> Enviar email
              </Button>
              <Button>
                <Pencil className="mr-2 h-4 w-4" /> Editar cliente
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_28rem]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Nombre completo</p>
                    <p className="text-sm text-muted-foreground">{customer.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Email</p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Teléfono</p>
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">DNI/CUIT</p>
                    <p className="text-sm text-muted-foreground">{customer.document}</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Fecha de registro</p>
                    <p className="text-sm text-muted-foreground">{formatDate(customer.registered)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Última actividad</p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(customer.lastActive)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Direcciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customer.addresses.map((address) => (
                  <div key={address.id} className="rounded-3xl border border-border bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">{address.label}</p>
                        <p className="text-sm text-muted-foreground">{address.line}</p>
                        <p className="text-sm text-muted-foreground">{address.city}, {address.province} {address.zip}</p>
                      </div>
                      {address.main ? (
                        <Badge className="rounded-full bg-red-100 text-red-700">Principal</Badge>
                      ) : null}
                    </div>
                  </div>
                ))}
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Agregar dirección
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notas internas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note">Agregar nota</Label>
                  <textarea
                    id="note"
                    value={noteText}
                    onChange={(event) => setNoteText(event.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-ring/50"
                    placeholder="Escribe una nota interna..."
                  />
                </div>
                <Button type="button" onClick={handleSaveNote}>Guardar nota</Button>
                <Separator />
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="rounded-3xl border border-border bg-white p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">{formatDateTime(note.date)}</p>
                      </div>
                      <p className="mt-2 text-sm text-foreground">{note.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de actividad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-3xl border border-border bg-slate-50 p-5">
                  <p className="text-sm text-muted-foreground">Total gastado</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">{formatPrice(customer.totalSpent)}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-border bg-white p-4">
                    <p className="text-sm text-muted-foreground">Cantidad de pedidos</p>
                    <p className="mt-2 text-xl font-semibold text-foreground">{customer.orders}</p>
                  </div>
                  <div className="rounded-3xl border border-border bg-white p-4">
                    <p className="text-sm text-muted-foreground">Ticket promedio</p>
                    <p className="mt-2 text-xl font-semibold text-foreground">{formatPrice(customer.averageTicket)}</p>
                  </div>
                </div>
                <div className="rounded-3xl border border-border bg-white p-4">
                  <p className="text-sm text-muted-foreground">Último pedido</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{formatDate(customer.lastOrder)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pedidos recientes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customer.recentOrders.map((order) => (
                  <div key={order.id} className="rounded-3xl border border-border bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">#{order.id}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(order.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatPrice(order.total)}</p>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${orderStatusBadgeClasses[order.status as keyof typeof orderStatusBadgeClasses]}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700">
                  Ver todos los pedidos
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Productos favoritos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customer.favorites.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 rounded-3xl border border-border bg-slate-50 p-4">
                    <img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">Cantidad: {product.quantity}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
