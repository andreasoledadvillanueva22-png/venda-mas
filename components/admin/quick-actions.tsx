import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Package, 
  Percent, 
  BarChart3,
  ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface QuickAction {
  title: string
  description: string
  icon: LucideIcon
  href: string
  iconBg: string
  iconColor: string
}

const quickActions: QuickAction[] = [
  {
    title: 'Add product',
    description: 'Add a new item to your catalog',
    icon: Package,
    href: '/admin/products/new',
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
  },
  {
    title: 'Create discount',
    description: 'Set up coupons and promotions',
    icon: Percent,
    href: '/admin/marketing/discounts',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    title: 'View analytics',
    description: 'Check your store performance',
    icon: BarChart3,
    href: '/admin/analytics',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
]

interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className }: QuickActionsProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {quickActions.map((action) => (
          <a
            key={action.title}
            href={action.href}
            className="group flex items-center gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
          >
            <div className={`rounded-lg p-2.5 ${action.iconBg}`}>
              <action.icon className={`h-5 w-5 ${action.iconColor}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{action.title}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        ))}
      </CardContent>
    </Card>
  )
}
