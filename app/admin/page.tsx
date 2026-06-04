import { AdminHeader } from '@/components/admin/header'
import { KPICard } from '@/components/admin/kpi-card'
import { RevenueChart } from '@/components/admin/revenue-chart'
import { RecentOrders } from '@/components/admin/recent-orders'
import { QuickActions } from '@/components/admin/quick-actions'
import { TopProducts } from '@/components/admin/top-products'
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp,
} from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      
      <div className="flex-1 space-y-6 p-6">
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Revenue (this month)"
            value="$24,568"
            change={12.5}
            icon={DollarSign}
            iconBgColor="bg-success/10"
            iconColor="text-success"
          />
          <KPICard
            title="Orders"
            value="342"
            change={8.2}
            icon={ShoppingCart}
            iconBgColor="bg-primary/10"
            iconColor="text-primary"
          />
          <KPICard
            title="Visitors"
            value="8,942"
            change={-3.1}
            icon={Users}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <KPICard
            title="Conversion Rate"
            value="3.82%"
            change={0.5}
            icon={TrendingUp}
            iconBgColor="bg-amber-100"
            iconColor="text-amber-600"
          />
        </div>

        {/* Revenue Chart */}
        <RevenueChart />

        {/* Orders and Products Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          <RecentOrders className="lg:col-span-2" />
          <TopProducts />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  )
}
