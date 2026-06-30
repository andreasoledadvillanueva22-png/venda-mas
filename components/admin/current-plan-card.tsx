import Link from 'next/link'
import { Check, Crown } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatPlanPrice, getTrialDaysRemaining, type Plan, type StoreSubscription } from '@/lib/plans'

type CurrentPlanCardProps = {
  plan: Plan
  subscription: StoreSubscription | null
}

export function CurrentPlanCard({ plan, subscription }: CurrentPlanCardProps) {
  const trialDays = subscription?.status === 'trial' ? getTrialDaysRemaining(subscription.trialEndsAt) : null

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Mi plan
            </CardTitle>
            <CardDescription>Tu suscripción actual y funcionalidades incluidas.</CardDescription>
          </div>
          <Link
            href="/pricing"
            className={cn(buttonVariants({ variant: 'outline' }), 'rounded-xl border-brand-200')}
          >
            Cambiar plan
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-2xl font-bold text-brand-900">{plan.name}</p>
            {plan.isPopular ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                Popular
              </span>
            ) : null}
            {subscription?.status === 'trial' && trialDays !== null ? (
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
                Prueba · {trialDays} {trialDays === 1 ? 'día restante' : 'días restantes'}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-brand-700">
            {plan.priceMonthly === 0
              ? 'Plan gratuito activo'
              : `${formatPlanPrice(plan.priceMonthly)}/mes · Sin comisiones por venta`}
          </p>
          {plan.description ? <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p> : null}
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">Incluye:</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
