'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  DollarSign,
  Eye,
  Printer,
  Search,
  Truck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const initialOrders = [
  {
    id: '#VM-1024',
    date: new Date('2026-06-04T14:30:00'),
    customerName: 'María González',
    customerEmail: 'maria@email.com',
    items: 3,
    total: 45900,
    status: 'Pagado',
    paymentMethod: 'Mercado Pago',
    paymentIcon: 'card',
  },
  {
    id: '#VM-1023',
    date: new Date('2026-06-04T12:15:00'),
    customerName: 'Carlos Pérez',
    customerEmail: 'carlos@email.com',
    items: 1,
    total: 12500,
    status: 'Pendiente',
    paymentMethod: 'Transferencia',
    paymentIcon: 'bank',
  },
  {
    id: '#VM-1022',
    date: new Date('2026-06-03T18:45:00'),
    customerName: 'Lucía Fernández',
    customerEmail: 'lucia@email.com',
    items: 5,
    total: 89200,
    status: 'Enviado',
    paymentMethod: 'Mercado Pago',
    paymentIcon: 'card',
  },
  {
    id: '#VM-1021',
    date: new Date('2026-06-03T10:20:00'),
    customerName: 'Jorge Ramírez',
    customerEmail: 'jorge@email.com',
    items: 2,
    total: 34000,
    status: 'Entregado',
    paymentMethod: 'Efectivo',
    paymentIcon: 'cash',
  },
  {
    id: '#VM-1020',
    date: new Date('2026-06-02T09:00:00'),
    customerName: 'Ana Martínez',
    customerEmail: 'ana@email.com',
    items: 8,
    total: 156700,
    status: 'Cancelado',
    paymentMethod: 'Mercado Pago',
    paymentIcon: 'card',
  },
]

const statusOptions = ['Todos', 'Pagado', 'Pendiente', 'Enviado', 'Entregado', 'Cancelado']
const paymentOptions = ['Todos', 'Mercado Pago', 'Transferencia', 'Efectivo']
const pageSizes = [10, 25, 50]

function formatPrice(value: number) {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  })
}

function formatDate(date: Date) {
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

function nextOrderStatus(status: string) {
  const order = ['Pendiente', 'Pagado', 'Enviado', 'Entregado']
  const current = order.indexOf(status)
  return current === -1 || current === order.length - 1 ? status : order[current + 1]
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [paymentFilter, setPaymentFilter] = useState('Todos')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [massStatus, setMassStatus] = useState('Pagado')

  const filteredOrders = useMemo(() => {
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null

    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'Todos' || order.status === statusFilter
      const matchesPayment = paymentFilter === 'Todos' || order.paymentMethod === paymentFilter
      const matchesDate =
        (!from || order.date >= from) && (!to || order.date <= to)

      return matchesSearch && matchesStatus && matchesPayment && matchesDate
    })
  }, [orders, search, statusFilter, paymentFilter, dateFrom, dateTo])

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize))
  const currentPageOrders = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredOrders.slice(start, start + pageSize)
  }, [filteredOrders, page, pageSize])

  const allSelected = currentPageOrders.length > 0 && currentPageOrders.every((order) => selectedIds.includes(order.id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((current) => current.filter((id) => !currentPageOrders.some((order) => order.id === id)))
      return
    }
    setSelectedIds((current) => [...new Set([...current, ...currentPageOrders.map((order) => order.id)])])
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  const handleChangeStatusSelected = () => {
    setOrders((current) =>
      current.map((order) =>
        selectedIds.includes(order.id) ? { ...order, status: massStatus } : order
      )
    )
    setSelectedIds([])
  }

  const handleExportSelected = () => {
    alert(`Exportando ${selectedIds.length} pedido(s)`)
  }

  const handleDeleteSelected = () => {
    if (!confirm('¿Estás seguro de eliminar los pedidos seleccionados?')) return
    setOrders((current) => current.filter((order) => !selectedIds.includes(order.id)))
    setSelectedIds([])
  }

  const handleAdvanceStatus = (id: string) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, status: nextOrderStatus(order.status) } : order
      )
    )
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-border bg-white px-6 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold text-foreground">Pedidos</h1>
              <Badge className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{orders.length}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Gestiona los pedidos recibidos y revisá su estado de pago y envío.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/orders" className="inline-flex items-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
              <ArrowLeft className="mr-2 h-4 w-4" /> Refrescar lista
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Filtros de pedidos</CardTitle>
            <CardDescription>Busca por ID, cliente, estado, método de pago o fechas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-[280px_240px_240px_240px]">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    className="pl-9"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="ID o nombre de cliente"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-filter">Estado</Label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                  <SelectTrigger id="status-filter" className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-filter">Método de pago</Label>
                <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value)}>
                  <SelectTrigger id="payment-filter" className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentOptions.map((option) => (
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
                  <Input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(event) => setDateFrom(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-to">Hasta</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={dateTo}
                    onChange={(event) => setDateTo(event.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedIds.length > 0 && (
          <Card className="border-l-4 border-red-600 bg-white p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold">{selectedIds.length} pedido(s) seleccionado(s)</p>
                <p className="text-sm text-muted-foreground">Elige una acción masiva para los pedidos seleccionados.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={massStatus} onValueChange={(value) => setMassStatus(value)}>
                  <SelectTrigger className="min-w-[180px]">
                    <SelectValue placeholder="Cambiar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Pagado', 'Pendiente', 'Enviado', 'Entregado', 'Cancelado'].map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleChangeStatusSelected}>Aplicar</Button>
                <Button variant="outline" onClick={handleExportSelected}>Exportar</Button>
                <Button variant="destructive" onClick={handleDeleteSelected}>Eliminar</Button>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-1">
              <CardTitle>Lista de pedidos</CardTitle>
              <CardDescription>Haz click en cualquier fila para ver el detalle del pedido.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[48px] px-2">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border border-input text-red-600 focus:ring-red-500"
                    />
                  </TableHead>
                  <TableHead>ID del pedido</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Método de pago</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPageOrders.map((order) => {
                  const PaymentIcon = paymentIcon(order.paymentMethod)
                  return (
                    <TableRow
                      key={order.id}
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      className="group cursor-pointer"
                    >
                      <TableCell className="px-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(order.id)}
                          onChange={(event) => {
                            event.stopPropagation()
                            toggleSelection(order.id)
                          }}
                          className="h-4 w-4 rounded border border-input text-red-600 focus:ring-red-500"
                        />
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-red-600 underline">{order.id}</span>
                      </TableCell>
                      <TableCell>{formatDate(order.date)}</TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="font-medium text-foreground">{order.customerName}</p>
                          <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.items} item{order.items > 1 ? 's' : ''}</TableCell>
                      <TableCell className="font-semibold">{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClasses(order.status)}`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-2 text-sm text-foreground">
                          <PaymentIcon className="h-4 w-4 text-muted-foreground" />
                          {order.paymentMethod}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(event) => {
                              event.stopPropagation()
                              router.push(`/admin/orders/${order.id}`)
                            }}
                            aria-label="Ver pedido"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleAdvanceStatus(order.id)
                            }}
                            aria-label="Cambiar estado"
                          >
                            <Truck className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(event) => {
                              event.stopPropagation()
                              window.print()
                            }}
                            aria-label="Imprimir pedido"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {filteredOrders.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">No se encontraron pedidos con esos filtros.</div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {currentPageOrders.length} de {filteredOrders.length} pedidos
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Mostrar</span>
              <select
                value={pageSize}
                onChange={(event) => handlePageSizeChange(event.target.value)}
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
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-foreground">
                Página {page} de {pageCount}
              </span>
              <Button className="h-9 px-3" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>
                <ArrowLeft className="-scale-x-100 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
