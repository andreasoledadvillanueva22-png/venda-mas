'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export type IncomeChartPoint = {
  date: string
  ingresos: number
  pedidos: number
}

type IncomeAreaChartProps = {
  data: IncomeChartPoint[]
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)

const formatTooltipCurrency = (value: number) => formatCurrency(value)

export function IncomeAreaChart({ data }: IncomeAreaChartProps) {
  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPedidos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748B', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`}
            tick={{ fill: '#64748B', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              borderColor: '#E2E8F0',
              backgroundColor: '#ffffff',
            }}
            formatter={(value) => formatTooltipCurrency(Number(value ?? 0))}
            labelStyle={{ color: '#0F172A' }}
          />
          <Legend verticalAlign="top" align="right" iconType="circle" />
          <Area
            type="monotone"
            dataKey="ingresos"
            name="Ingresos"
            stroke="#DC2626"
            fillOpacity={1}
            fill="url(#colorIngresos)"
            strokeWidth={3}
          />
          <Area
            type="monotone"
            dataKey="pedidos"
            name="Pedidos"
            stroke="#16A34A"
            fillOpacity={1}
            fill="url(#colorPedidos)"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
