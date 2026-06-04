'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Search, User, ArrowRight } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const customersMock = [
  {
    id: 'VM-1024',
    name: 'María González',
    email: 'maria@email.com',
    phone: '+54 9 11 1234-5678',
    total: 245800,
    orders: 12,
    lastOrder: new Date('2026-06-04T00:00:00'),
    segment: 'VIP',
  },
  {
    id: 'VM-1023',
    name: 'Carlos Pérez',
    email: 'carlos@email.com',
    phone: '+54 9 11 2345-6789',
    total: 89400,
    orders: 5,
    lastOrder: new Date('2026-06-03T00:00:00'),
    segment: 'Regular',
  },
  {
    id: 'VM-1022',
    name: 'Lucía Fernández',
    email: 'lucia@email.com',
    phone: '+54 9 11 3456-7890',
    total: 156200,
    orders: 8,
    lastOrder: new Date('2026-06-02T00:00:00'),
    segment: 'VIP',
  },
  {
    id: 'VM-1021',
    name: 'Jorge Ramírez',
    email: 'jorge@email.com',
    phone: '+54 9 11 4567-8901',
    total: 23500,
    orders: 2,
    lastOrder: new Date('2026-06-01T00:00:00'),
    segment: 'Nuevo',
  },
  {
    id: 'VM-1020',
    name: 'Ana Martínez',
    email: 'ana@email.com',
    phone: '+54 9 11 5678-9012',
    total: 0,
    orders: 0,
    lastOrder: new Date('2026-05-15T00:00:00'),
    segment: 'Inactivo',
  },
  {
    id: 'VM-1019',
    name: 'Pedro Sánchez',
    email: 'pedro@email.com',
    phone: '+54 9 11 6789-0123',
    total: 67300,
    orders: 4,
    lastOrder: new Date('2026-05-28T00:00:00'),
    segment: 'Regular',
  },
]

const segments = ['Todos', 'VIP', 'Regular', 'Nuevo', 'Inactivo']
const pageSizes = [10, 25, 50]

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

function segmentBadgeClasses(segment: string) {
  switch (segment) {
    case 'VIP':
      return 'bg-amber-100 text-amber-700'
    case 'Regular':
      return 'bg-blue-100 text-blue-700'
    case 'Nuevo':
      return 'bg-emerald-100 text-emerald-700'
    case 'Inactivo':
      return 'bg-slate-100 text-slate-700'
    default:
      return 'bg-muted text-foreground'
  }
}

export default function AdminCustomersPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [segment, setSegment] = useState('Todos')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const filteredCustomers = useMemo(() => {
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null

    return customersMock.filter((customer) => {
      const lowerSearch = search.toLowerCase()
      const matchesSearch =
        customer.name.toLowerCase().includes(lowerSearch) ||
        customer.email.toLowerCase().includes(lowerSearch) ||
        customer.phone.toLowerCase().includes(lowerSearch)
      const matchesSegment = segment === 'Todos' || customer.segment === segment
      const matchesDate =
        (!from || customer.lastOrder >= from) && (!to || customer.lastOrder <= to)

      return matchesSearch && matchesSegment && matchesDate
    })
  }, [search, segment, dateFrom, dateTo])

  const pageCount = Math.max(1, Math.ceil(filteredCustomers.length / pageSize))
  const displayedCustomers = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredCustomers.slice(start, start + pageSize)
  }, [filteredCustomers, page, pageSize])

  const handlePageSize = (value: string) => {
    setPageSize(Number(value))
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-border bg-white px-6 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold text-foreground">Clientes</h1>
              <Badge className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{customersMock.length}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Administra la lista de clientes y revisa su actividad.</p>
          </div>
          <Button onClick={() => router.push('/admin/customers')}>Actualizar</Button>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Filtros de clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 xl:grid-cols-[320px_220px_220px]">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    className="pl-9"
                    placeholder="Nombre, email o teléfono"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="segment">Segmento</Label>
                <Select value={segment} onValueChange={setSegment}>
                  <SelectTrigger id="segment" className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {segments.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date-from">Desde</Label>
                  <Input id="date-from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-to">Hasta</Label>
                  <Input id="date-to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Total gastado</TableHead>
                  <TableHead>Pedidos</TableHead>
                  <TableHead>Último pedido</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedCustomers.map((customer) => (
                  <TableRow key={customer.id} className="group hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Link href={`/admin/customers/${customer.id}`} className="font-medium text-red-600 hover:underline">
                          {customer.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell className="font-semibold">{formatPrice(customer.total)}</TableCell>
                    <TableCell>{customer.orders}</TableCell>
                    <TableCell>{formatDate(customer.lastOrder)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${segmentBadgeClasses(customer.segment)}`}>
                        {customer.segment}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/admin/customers/${customer.id}`)}
                          aria-label="Ver detalle"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.location.assign(`mailto:${customer.email}`)}
                          aria-label="Enviar email"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredCustomers.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">No hay clientes que coincidan con los filtros.</div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {displayedCustomers.length} de {filteredCustomers.length} clientes
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Mostrar</span>
              <select
                value={pageSize}
                onChange={(event) => handlePageSize(event.target.value)}
                className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none"
              >
                {pageSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button className="h-9 px-3" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                ‹
              </Button>
              <span className="text-sm text-foreground">Página {page} de {pageCount}</span>
              <Button className="h-9 px-3" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>
                ›
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
