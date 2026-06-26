import { createClient } from '@/lib/supabase/server'

export type DashboardOrder = {
  id: string
  customer: string
  total: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  date: string
}

export type DashboardTopProduct = {
  id: string
  name: string
  image: string
  unitsSold: number
  revenue: number
}

export type DashboardRevenuePoint = {
  name: string
  revenue: number
}

export type DashboardStats = {
  revenueThisMonth: number
  revenueChange: number
  ordersThisMonth: number
  ordersChange: number
  customersCount: number
  customersChange: number
  conversionRate: number
  conversionChange: number
  recentOrders: DashboardOrder[]
  topProducts: DashboardTopProduct[]
  revenueChart: DashboardRevenuePoint[]
}

function formatOrderNumber(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`
}

function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))
}

function percentChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  return Math.round(((current - previous) / previous) * 1000) / 10
}

function sumOrderTotals(
  orders: { total: number | string; payment_status?: string }[],
  paidOnly = false,
): number {
  return orders.reduce((sum, order) => {
    if (paidOnly && order.payment_status !== 'paid') {
      return sum
    }
    return sum + Number(order.total)
  }, 0)
}

export async function getDashboardStats(storeId: string): Promise<DashboardStats> {
  const supabase = await createClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).toISOString()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  const [
    { data: ordersThisMonth },
    { data: ordersLastMonth },
    { data: recentOrdersRaw },
    { data: chartOrders },
    { data: customersThisMonth },
    { data: customersLastMonth },
    { data: paidOrderRows },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('total, payment_status')
      .eq('store_id', storeId)
      .gte('created_at', startOfMonth),
    supabase
      .from('orders')
      .select('total, payment_status')
      .eq('store_id', storeId)
      .gte('created_at', startOfLastMonth)
      .lte('created_at', endOfLastMonth),
    supabase
      .from('orders')
      .select('id, customer_name, total, status, created_at')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('orders')
      .select('total, payment_status, created_at')
      .eq('store_id', storeId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true }),
    supabase
      .from('customers')
      .select('id')
      .eq('store_id', storeId)
      .gte('created_at', startOfMonth),
    supabase
      .from('customers')
      .select('id')
      .eq('store_id', storeId)
      .gte('created_at', startOfLastMonth)
      .lte('created_at', endOfLastMonth),
    supabase
      .from('orders')
      .select('id')
      .eq('store_id', storeId)
      .gte('created_at', startOfMonth)
      .eq('payment_status', 'paid'),
  ])

  const paidOrderIds = (paidOrderRows ?? []).map((order) => order.id)
  type OrderItemRow = {
    product_id: string
    quantity: number
    total: number | string
    products: { name: string; images: string[] | null } | { name: string; images: string[] | null }[] | null
  }

  let orderItems: OrderItemRow[] = []

  if (paidOrderIds.length > 0) {
    const { data: items } = await supabase
      .from('order_items')
      .select('product_id, quantity, total, products(name, images)')
      .in('order_id', paidOrderIds)

    orderItems = (items ?? []) as OrderItemRow[]
  }

  const thisMonthOrders = ordersThisMonth ?? []
  const lastMonthOrders = ordersLastMonth ?? []
  const revenueThisMonth = sumOrderTotals(thisMonthOrders, true)
  const revenueLastMonth = sumOrderTotals(lastMonthOrders, true)
  const paidOrdersThisMonth = thisMonthOrders.filter((o) => o.payment_status === 'paid').length
  const paidOrdersLastMonth = lastMonthOrders.filter((o) => o.payment_status === 'paid').length

  const customersThisMonthCount = customersThisMonth?.length ?? 0
  const customersLastMonthCount = customersLastMonth?.length ?? 0

  const conversionThisMonth =
    thisMonthOrders.length > 0 ? (paidOrdersThisMonth / thisMonthOrders.length) * 100 : 0
  const conversionLastMonth =
    lastMonthOrders.length > 0 ? (paidOrdersLastMonth / lastMonthOrders.length) * 100 : 0

  const productStats = new Map<
    string,
    { name: string; image: string; unitsSold: number; revenue: number }
  >()

  for (const item of orderItems) {
    const rawProduct = item.products
    const product = Array.isArray(rawProduct) ? rawProduct[0] : rawProduct
    if (!product) continue

    const existing = productStats.get(item.product_id) ?? {
      name: product.name,
      image: product.images?.[0] ?? '/placeholder.svg?height=48&width=48',
      unitsSold: 0,
      revenue: 0,
    }

    existing.unitsSold += item.quantity
    existing.revenue += Number(item.total)
    productStats.set(item.product_id, existing)
  }

  const topProducts: DashboardTopProduct[] = Array.from(productStats.entries())
    .map(([id, stats]) => ({ id, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const revenueByDay = new Map<string, number>()
  for (let i = 0; i < 30; i += 1) {
    const day = new Date(thirtyDaysAgo)
    day.setDate(thirtyDaysAgo.getDate() + i)
    const key = day.toISOString().slice(0, 10)
    revenueByDay.set(key, 0)
  }

  for (const order of chartOrders ?? []) {
    if (order.payment_status !== 'paid') continue
    const key = order.created_at.slice(0, 10)
    if (revenueByDay.has(key)) {
      revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + Number(order.total))
    }
  }

  const revenueChart: DashboardRevenuePoint[] = Array.from(revenueByDay.entries()).map(
    ([isoDate, revenue]) => {
      const date = new Date(`${isoDate}T12:00:00`)
      const name = new Intl.DateTimeFormat('es-AR', { month: 'short', day: 'numeric' }).format(date)
      return { name, revenue }
    },
  )

  const recentOrders: DashboardOrder[] = (recentOrdersRaw ?? []).map((order) => ({
    id: formatOrderNumber(order.id),
    customer: order.customer_name,
    total: Number(order.total),
    status: order.status as DashboardOrder['status'],
    date: formatShortDate(order.created_at),
  }))

  return {
    revenueThisMonth,
    revenueChange: percentChange(revenueThisMonth, revenueLastMonth),
    ordersThisMonth: thisMonthOrders.length,
    ordersChange: percentChange(thisMonthOrders.length, lastMonthOrders.length),
    customersCount: customersThisMonthCount,
    customersChange: percentChange(customersThisMonthCount, customersLastMonthCount),
    conversionRate: Math.round(conversionThisMonth * 100) / 100,
    conversionChange: percentChange(conversionThisMonth, conversionLastMonth),
    recentOrders,
    topProducts,
    revenueChart,
  }
}
