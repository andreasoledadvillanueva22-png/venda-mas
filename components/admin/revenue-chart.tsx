'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardRevenuePoint } from '@/lib/admin-dashboard'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

interface RevenueChartProps {
  className?: string
  data: DashboardRevenuePoint[]
}

export function RevenueChart({ className, data }: RevenueChartProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Ingresos</CardTitle>
        <p className="text-sm text-muted-foreground">Últimos 30 días</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px] w-full min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%" minHeight={200}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'oklch(0.45 0.02 250)', fontSize: 11 }}
                dy={10}
                interval={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'oklch(0.45 0.02 250)', fontSize: 11 }}
                tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(1 0 0)',
                  border: '1px solid oklch(0.91 0.005 240)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value) => [
                  formatCurrency(typeof value === 'number' ? value : Number(value ?? 0)),
                  'Ingresos',
                ]}
                labelStyle={{ color: 'oklch(0.13 0.02 250)', fontWeight: 600 }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="oklch(0.55 0.18 145)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, fill: 'oklch(0.55 0.18 145)', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
