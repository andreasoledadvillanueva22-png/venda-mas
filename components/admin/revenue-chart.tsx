'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// Static data to avoid hydration mismatch
const data = [
  { name: 'May 5', revenue: 2100 },
  { name: 'May 6', revenue: 1850 },
  { name: 'May 7', revenue: 2400 },
  { name: 'May 8', revenue: 1950 },
  { name: 'May 9', revenue: 3200 },
  { name: 'May 10', revenue: 2800 },
  { name: 'May 11', revenue: 2150 },
  { name: 'May 12', revenue: 1780 },
  { name: 'May 13', revenue: 2650 },
  { name: 'May 14', revenue: 3100 },
  { name: 'May 15', revenue: 2450 },
  { name: 'May 16', revenue: 2900 },
  { name: 'May 17', revenue: 3400 },
  { name: 'May 18', revenue: 2200 },
  { name: 'May 19', revenue: 1950 },
  { name: 'May 20', revenue: 2750 },
  { name: 'May 21', revenue: 3050 },
  { name: 'May 22', revenue: 2680 },
  { name: 'May 23', revenue: 3200 },
  { name: 'May 24', revenue: 3850 },
  { name: 'May 25', revenue: 4100 },
  { name: 'May 26', revenue: 3650 },
  { name: 'May 27', revenue: 2950 },
  { name: 'May 28', revenue: 3400 },
  { name: 'May 29', revenue: 3100 },
  { name: 'May 30', revenue: 2850 },
  { name: 'May 31', revenue: 3250 },
  { name: 'Jun 1', revenue: 3600 },
  { name: 'Jun 2', revenue: 3950 },
  { name: 'Jun 3', revenue: 4200 },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

interface RevenueChartProps {
  className?: string
}

export function RevenueChart({ className }: RevenueChartProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Revenue</CardTitle>
        <p className="text-sm text-muted-foreground">Last 30 days</p>
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
                tickFormatter={(value) => `$${value / 1000}k`}
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
                  'Revenue',
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
