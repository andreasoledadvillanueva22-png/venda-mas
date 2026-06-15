import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Mail } from 'lucide-react'
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

type DbOrder = {
  customer_name: string
  customer_email: string
  customer_phone: string | null
  total: number
  created_at: string
}

type CustomerRow = {
  name: string
  email: string
  phone: string
  orders_count: number
  total_spent: number
  last_order_at: string
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

function customerDetailHref(email: string) {
  return `/admin/customers/${encodeURIComponent(email)}`
}

function aggregateCustomersByEmail(orders: DbOrder[]): CustomerRow[] {
  const customersMap = new Map<string, CustomerRow>()

  for (const order of orders) {
    const emailKey = order.customer_email.trim().toLowerCase()
    const existing = customersMap.get(emailKey)

    if (!existing) {
      customersMap.set(emailKey, {
        name: order.customer_name,
        email: order.customer_email.trim(),
        phone: order.customer_phone?.trim() || '—',
        orders_count: 1,
        total_spent: Number(order.total),
        last_order_at: order.created_at,
      })
      continue
    }

    existing.orders_count += 1
    existing.total_spent += Number(order.total)
  }

  return [...customersMap.values()].sort(
    (a, b) => new Date(b.last_order_at).getTime() - new Date(a.last_order_at).getTime(),
  )
}

async function getStoreCustomers(): Promise<CustomerRow[] | null> {
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
    .select('customer_name, customer_email, customer_phone, total, created_at')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  if (ordersError || !orders) {
    return null
  }

  return aggregateCustomersByEmail(orders as DbOrder[])
}

export default async function AdminCustomersPage() {
  const customers = await getStoreCustomers()

  if (!customers) {
    redirect('/auth/login?redirect=/admin/customers')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-border bg-white px-6 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold text-foreground">Clientes</h1>
              <Badge className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {customers.length}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Clientes únicos agrupados por email según los pedidos recibidos.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {customers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <p className="text-lg font-medium text-foreground">Aún no tenés clientes</p>
              <p className="text-sm text-muted-foreground">
                Cuando recibas pedidos en tu tienda, los clientes aparecerán acá automáticamente.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-1">
                <CardTitle>Lista de clientes</CardTitle>
                <CardDescription>
                  Datos calculados a partir de los pedidos de tu tienda.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Pedidos</TableHead>
                    <TableHead>Gastado total</TableHead>
                    <TableHead>Último pedido</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.email} className="group hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            <AvatarFallback>{customer.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <Link
                            href={customerDetailHref(customer.email)}
                            className="font-medium text-foreground hover:text-red-600 hover:underline"
                          >
                            {customer.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={customerDetailHref(customer.email)}
                          className="text-foreground hover:text-red-600 hover:underline"
                        >
                          {customer.email}
                        </Link>
                      </TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.orders_count}</TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(customer.total_spent)}
                      </TableCell>
                      <TableCell>{formatDate(customer.last_order_at)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Link
                            href={`mailto:${customer.email}`}
                            aria-label="Enviar email"
                            className={cn(
                              buttonVariants({ variant: 'ghost', size: 'icon' }),
                            )}
                          >
                            <Mail className="h-4 w-4" />
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
