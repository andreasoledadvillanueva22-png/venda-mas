import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  BarChart3,
  DollarSign,
  Eye,
  Percent,
  PieChart,
  ShoppingCart,
} from 'lucide-react'
import { IncomeAreaChart, type IncomeChartPoint } from '@/components/admin/income-area-chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const dateRanges = ['Últimos 7 días', 'Últimos 30 días', 'Últimos 90 días'] as const

type AnalyticsData = {
  storeName: string
  totalRevenue: number
  totalOrders: number
  averageTicket: number
  conversionRate: number
  incomeChartData: IncomeChartPoint[]
  hasOrders: boolean
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)

function formatDayLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`)
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(date)
}

function buildDailyChartData(
  orders: Array<{ total: number; created_at: string }>,
  days: number,
): IncomeChartPoint[] {
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  const buckets = new Map<string, IncomeChartPoint>()

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    const key = date.toISOString().slice(0, 10)
    buckets.set(key, {
      date: formatDayLabel(key),
      ingresos: 0,
      pedidos: 0,
    })
  }

  for (const order of orders) {
    const key = order.created_at.slice(0, 10)
    const bucket = buckets.get(key)
    if (!bucket) {
      continue
    }
    bucket.ingresos += Number(order.total)
    bucket.pedidos += 1
  }

  return Array.from(buckets.values())
}

async function getAnalyticsData(): Promise<AnalyticsData | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, store_name')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile) {
    return null
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, name')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store) {
    return null
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, total, created_at, status')
    .eq('store_id', store.id)
    .in('status', ['paid', 'delivered'])
    .order('created_at', { ascending: true })

  if (ordersError) {
    return null
  }

  const paidOrders = orders ?? []
  const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total), 0)
  const totalOrders = paidOrders.length
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  const recentOrders = paidOrders.filter(
    (order) => new Date(order.created_at) >= thirtyDaysAgo,
  )

  return {
    storeName: store.name,
    totalRevenue,
    totalOrders,
    averageTicket,
    conversionRate: 0,
    incomeChartData: buildDailyChartData(recentOrders, 30),
    hasOrders: totalOrders > 0,
  }
}

export default async function AnalyticsPage() {
  const analytics = await getAnalyticsData()

  if (!analytics) {
    redirect('/auth/login?redirect=/admin/analytics')
  }

  return (
    <div className="min-h-full">
      <div className="border-b border-brand-200 bg-white/60 px-6 py-6 backdrop-blur-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-900">Analíticas</h1>
            <p className="text-sm text-brand-600">
              Monitoreá el rendimiento de {analytics.storeName} con datos reales de tu tienda.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-brand-100 bg-brand-50/50 px-4 py-3">
              <Label className="text-xs uppercase tracking-[0.3em] text-brand-600">Rango</Label>
              <div className="mt-2 w-48">
                <Select defaultValue="Últimos 30 días">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Últimos 30 días" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button>
              <Eye className="mr-2 h-4 w-4" /> Ver período
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!analytics.hasOrders && (
          <div className="mb-4 rounded-lg border border-dashed border-border bg-white px-4 py-3 text-sm text-muted-foreground">
            Sin datos aún. Cuando recibas pedidos pagados o entregados, verás tus métricas acá.
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>Ingresos totales</CardTitle>
                <p className="text-2xl font-semibold text-foreground">
                  {formatCurrency(analytics.totalRevenue)}
                </p>
              </div>
              <div className="rounded-2xl bg-red-50 p-2 text-red-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Pedidos pagados o entregados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>Pedidos totales</CardTitle>
                <p className="text-2xl font-semibold text-foreground">{analytics.totalOrders}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Pedidos pagados o entregados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>Ticket promedio</CardTitle>
                <p className="text-2xl font-semibold text-foreground">
                  {formatCurrency(analytics.averageTicket)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                <Percent className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {analytics.totalOrders > 0 ? 'Promedio por pedido' : 'Sin pedidos registrados'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>Tasa de conversión</CardTitle>
                <p className="text-2xl font-semibold text-foreground">{analytics.conversionRate}%</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                <PieChart className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Sin datos de visitas disponibles</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6">
          <Card className="w-full">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle>Ingresos en el tiempo</CardTitle>
                <p className="text-sm text-muted-foreground">Ingresos y pedidos de los últimos 30 días.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-brand-100 bg-brand-50/50 px-4 py-2 text-sm">
                <BarChart3 className="h-4 w-4 text-foreground" />
                <span>Últimos 30 días</span>
              </div>
            </CardHeader>
            <CardContent>
              <IncomeAreaChart data={analytics.incomeChartData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
