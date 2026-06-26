import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { DashboardOrder } from '@/lib/admin-dashboard'
import { cn } from '@/lib/utils'

const statusConfig = {
  pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-800 hover:bg-amber-100' },
  paid: { label: 'Pagado', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
  shipped: { label: 'Enviado', className: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
  delivered: { label: 'Entregado', className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(value)
}

interface RecentOrdersProps {
  className?: string
  orders: DashboardOrder[]
}

export function RecentOrders({ className, orders }: RecentOrdersProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Pedidos recientes</CardTitle>
            <p className="text-sm text-muted-foreground">Últimos 5 pedidos</p>
          </div>
          <a href="/admin/orders" className="text-sm font-medium text-primary hover:underline">
            Ver todos
          </a>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {orders.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground">Todavía no hay pedidos.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="pr-6">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer">
                  <TableCell className="pl-6 font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn('text-xs font-medium', statusConfig[order.status].className)}
                    >
                      {statusConfig[order.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-muted-foreground">{order.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
