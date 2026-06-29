import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconBgColor?: string
  iconColor?: string
}

export function KPICard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon: Icon,
}: KPICardProps) {
  const getTrendIcon = () => {
    if (change === undefined) return null
    if (change > 0) return <TrendingUp className="h-3.5 w-3.5" />
    if (change < 0) return <TrendingDown className="h-3.5 w-3.5" />
    return <Minus className="h-3.5 w-3.5" />
  }

  const getTrendColor = () => {
    if (change === undefined) return 'text-white/80'
    if (change > 0) return 'text-emerald-200'
    if (change < 0) return 'text-red-200'
    return 'text-white/80'
  }

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30 hover:shadow-xl hover:shadow-brand-600/40">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
            {change !== undefined && (
              <div className={cn('flex items-center gap-1.5 text-sm', getTrendColor())}>
                {getTrendIcon()}
                <span className="font-semibold">
                  {change > 0 ? '+' : ''}
                  {change}%
                </span>
                <span className="text-xs text-white/70">{changeLabel}</span>
              </div>
            )}
          </div>
          <div className="rounded-xl bg-white/20 p-3">
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
