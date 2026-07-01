import { redirect } from 'next/navigation'
import { KPICard } from '@/components/admin/kpi-card'
import { RevenueChart } from '@/components/admin/revenue-chart'
import { RecentOrders } from '@/components/admin/recent-orders'
import { QuickActions } from '@/components/admin/quick-actions'
import { TopProducts } from '@/components/admin/top-products'
import { getDashboardStats } from '@/lib/admin-dashboard'
import { getOwnerStore } from '@/lib/admin-store'
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react'

function formatPrice(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function AdminDashboard() {
  const store = await getOwnerStore()

  if (!store) {
    redirect('/auth/login?redirect=/admin')
  }

  const stats = await getDashboardStats(store.id)

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Ingresos (este mes)"
            value={formatPrice(stats.revenueThisMonth)}
            change={stats.revenueChange}
            changeLabel="vs mes anterior"
            icon={DollarSign}
          />
          <KPICard
            title="Pedidos"
            value={String(stats.ordersThisMonth)}
            change={stats.ordersChange}
            changeLabel="vs mes anterior"
            icon={ShoppingCart}
          />
          <KPICard
            title="Clientes nuevos"
            value={String(stats.customersCount)}
            change={stats.customersChange}
            changeLabel="vs mes anterior"
            icon={Users}
          />
          <KPICard
            title="Tasa de conversión"
            value={`${stats.conversionRate}%`}
            change={stats.conversionChange}
            changeLabel="vs mes anterior"
            icon={TrendingUp}
          />
        </div>

        <RevenueChart data={stats.revenueChart} />

        <div className="grid gap-6 lg:grid-cols-3">
          <RecentOrders className="lg:col-span-2" orders={stats.recentOrders} />
          <TopProducts products={stats.topProducts} />
        </div>

        <QuickActions />
      </div>
    </div>
  )
}
// Deploy para activar variables de PostHog y se

