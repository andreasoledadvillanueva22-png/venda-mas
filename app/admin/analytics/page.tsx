'use client'

import { useState } from 'react'
import {
  BarChart3,
  DollarSign,
  Eye,
  Percent,
  PieChart,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const dateRanges = ['Últimos 7 días', 'Últimos 30 días', 'Últimos 90 días']

const incomeData = [
  { date: '1 Jun', ingresos: 32000, pedidos: 18 },
  { date: '5 Jun', ingresos: 42000, pedidos: 24 },
  { date: '10 Jun', ingresos: 52000, pedidos: 28 },
  { date: '15 Jun', ingresos: 46000, pedidos: 26 },
  { date: '20 Jun', ingresos: 61000, pedidos: 33 },
  { date: '25 Jun', ingresos: 69000, pedidos: 38 },
  { date: '30 Jun', ingresos: 74500, pedidos: 42 },
]

const categorySales = [
  { category: 'Suplementos', value: 128 },
  { category: 'Hogar', value: 96 },
  { category: 'Mascotas', value: 72 },
  { category: 'Tecnología', value: 54 },
  { category: 'Manualidades', value: 48 },
]

const trafficSources = [
  { name: 'Búsqueda orgánica (Google)', percent: 45, color: '#16A34A' },
  { name: 'Redes sociales (Instagram/Facebook)', percent: 30, color: '#DC2626' },
  { name: 'Tráfico directo', percent: 15, color: '#2563EB' },
  { name: 'Email marketing', percent: 10, color: '#F59E0B' },
]

const topProducts = [
  {
    product: 'Pack x3 Citrato de Magnesio',
    units: 142,
    revenue: 2825800,
    share: '22%',
  },
  {
    product: 'Kit Limpieza Inalámbrico',
    units: 89,
    revenue: 1780000,
    share: '14%',
  },
  {
    product: 'Cepillo Vapor Mascotas',
    units: 76,
    revenue: 1140000,
    share: '9%',
  },
  {
    product: 'Moldes Silicona Premium',
    units: 54,
    revenue: 810000,
    share: '6%',
  },
  {
    product: 'Porta Esponjas Silicona',
    units: 45,
    revenue: 225000,
    share: '2%',
  },
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)

const formatTooltipCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState('Últimos 30 días')

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-border bg-white px-6 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Analíticas</h1>
            <p className="text-sm text-muted-foreground">Monitoreá el rendimiento de tu tienda con datos claros y comparativos.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-border bg-slate-50 px-4 py-3">
              <Label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Rango</Label>
              <div className="mt-2 w-48">
                <Select value={selectedRange} onValueChange={setSelectedRange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Últimos 30 días" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRanges.map((range) => (
                      <SelectItem key={range} value={range}>{range}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="bg-red-600 text-white hover:bg-red-700">
              <Eye className="mr-2 h-4 w-4" /> Ver período
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-4 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>Ingresos totales</CardTitle>
                <p className="text-2xl font-semibold text-foreground">$1.245.800</p>
              </div>
              <div className="rounded-2xl bg-red-50 p-2 text-red-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>+12.5% vs periodo anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>Pedidos totales</CardTitle>
                <p className="text-2xl font-semibold text-foreground">342</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>+8.2% vs periodo anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>Ticket promedio</CardTitle>
                <p className="text-2xl font-semibold text-foreground">$3.642</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                <Percent className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>+2.1% vs periodo anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>Tasa de conversión</CardTitle>
                <p className="text-2xl font-semibold text-foreground">3.82%</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                <PieChart className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>+0.5% vs periodo anterior</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6">
          <Card className="w-full">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle>Ingresos en el tiempo</CardTitle>
                <p className="text-sm text-muted-foreground">Compará ingresos y pedidos del último mes.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-slate-50 px-4 py-2 text-sm">
                <BarChart3 className="h-4 w-4 text-foreground" />
                <span>Últimos 30 días</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={incomeData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
                    <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(value) => `$${Math.round(value / 1000)}k`} tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 16, borderColor: '#E2E8F0', backgroundColor: '#ffffff' }}
                      formatter={(value: number) => formatTooltipCurrency(value)}
                      labelStyle={{ color: '#0F172A' }}
                    />
                    <Legend verticalAlign="top" align="right" iconType="circle" />
                    <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#DC2626" fillOpacity={1} fill="url(#colorIngresos)" strokeWidth={3} />
                    <Area type="monotone" dataKey="pedidos" name="Pedidos" stroke="#16A34A" fillOpacity={1} fill="url(#colorPedidos)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
