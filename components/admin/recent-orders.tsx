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
import { cn } from '@/lib/utils'

interface Order {
  id: string
  customer: string
  total: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  date: string
}

const orders: Order[] = [
  {
    id: '#2847',
    customer: 'Sarah Johnson',
    total: 159.99,
    status: 'paid',
    date: 'Jun 4, 2:32 PM',
  },
  {
    id: '#2846',
    customer: 'Michael Chen',
    total: 89.50,
    status: 'shipped',
    date: 'Jun 4, 11:15 AM',
  },
  {
    id: '#2845',
    customer: 'Emily Davis',
    total: 245.00,
    status: 'delivered',
    date: 'Jun 4, 9:45 AM',
  },
  {
    id: '#2844',
    customer: 'James Wilson',
    total: 67.25,
    status: 'pending',
    date: 'Jun 3, 8:20 PM',
  },
  {
    id: '#2843',
    customer: 'Lisa Anderson',
    total: 132.75,
    status: 'cancelled',
    date: 'Jun 3, 5:50 PM',
  },
]

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 hover:bg-amber-100' },
  paid: { label: 'Paid', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
  shipped: { label: 'Shipped', className: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
  delivered: { label: 'Delivered', className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

interface RecentOrdersProps {
  className?: string
}

export function RecentOrders({ className }: RecentOrdersProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
            <p className="text-sm text-muted-foreground">Last 5 orders</p>
          </div>
          <a href="/admin/orders" className="text-sm font-medium text-primary hover:underline">
            View all
          </a>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-6">Date</TableHead>
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
      </CardContent>
    </Card>
  )
}
