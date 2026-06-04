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
  iconBgColor = 'bg-primary/10',
  iconColor = 'text-primary',
}: KPICardProps) {
  const getTrendIcon = () => {
    if (change === undefined) return null
    if (change > 0) return <TrendingUp className="h-3.5 w-3.5" />
    if (change < 0) return <TrendingDown className="h-3.5 w-3.5" />
    return <Minus className="h-3.5 w-3.5" />
  }

  const getTrendColor = () => {
    if (change === undefined) return 'text-muted-foreground'
    if (change > 0) return 'text-success'
    if (change < 0) return 'text-destructive'
    return 'text-muted-foreground'
  }

  return (
    <Card className="bg-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
            {change !== undefined && (
              <div className={cn('flex items-center gap-1.5 text-sm', getTrendColor())}>
                {getTrendIcon()}
                <span className="font-semibold">
                  {change > 0 ? '+' : ''}
                  {change}%
                </span>
                <span className="text-muted-foreground text-xs">{changeLabel}</span>
              </div>
            )}
          </div>
          <div className={cn('rounded-xl p-3', iconBgColor)}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
