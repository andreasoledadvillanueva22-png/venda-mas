import { createClient } from '@/lib/supabase/server'
import {
  DEFAULT_PLANS,
  type Plan,
  type PlanLimits,
  type StoreSubscription,
} from '@/lib/plans'

function parseLimits(value: unknown): PlanLimits {
  if (!value || typeof value !== 'object') {
    return { products: 0, orders_per_month: 0, users: 1 }
  }

  const limits = value as Partial<PlanLimits>
  return {
    products: Number(limits.products ?? 0),
    orders_per_month: Number(limits.orders_per_month ?? 0),
    users: Number(limits.users ?? 1),
  }
}

function mapPlanRow(row: {
  id: string
  name: string
  slug: string
  price_monthly: number
  price_yearly: number | null
  description: string | null
  features: unknown
  limits: unknown
  is_active: boolean | null
  is_popular: boolean | null
  sort_order: number | null
}): Plan {
  const features = Array.isArray(row.features)
    ? row.features.filter((item): item is string => typeof item === 'string')
    : []

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    priceMonthly: row.price_monthly,
    priceYearly: row.price_yearly,
    description: row.description,
    features,
    limits: parseLimits(row.limits),
    isActive: row.is_active ?? true,
    isPopular: row.is_popular ?? false,
    sortOrder: row.sort_order ?? 0,
  }
}

export async function fetchPublicPlans(): Promise<Plan[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('plans')
      .select(
        'id, name, slug, price_monthly, price_yearly, description, features, limits, is_active, is_popular, sort_order',
      )
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error || !data?.length) {
      return DEFAULT_PLANS
    }

    return data.map(mapPlanRow)
  } catch {
    return DEFAULT_PLANS
  }
}

export async function fetchPlanBySlug(slug: string): Promise<Plan | null> {
  const plans = await fetchPublicPlans()
  return plans.find((plan) => plan.slug === slug) ?? null
}

export async function fetchStorePlanContext(
  storeId: string,
  userId: string,
  planId: string | null,
): Promise<{ plan: Plan; subscription: StoreSubscription | null }> {
  const plans = await fetchPublicPlans()
  let plan = planId ? plans.find((item) => item.id === planId) ?? null : null

  if (!plan) {
    plan = plans.find((item) => item.slug === 'free') ?? DEFAULT_PLANS[0]
  }

  try {
    const supabase = await createClient()
    const { data: subscriptionRow } = await supabase
      .from('subscriptions')
      .select('status, trial_ends_at, current_period_end')
      .eq('store_id', storeId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!subscriptionRow) {
      return { plan, subscription: null }
    }

    return {
      plan,
      subscription: {
        status: subscriptionRow.status as StoreSubscription['status'],
        trialEndsAt: subscriptionRow.trial_ends_at,
        currentPeriodEnd: subscriptionRow.current_period_end,
      },
    }
  } catch {
    return { plan, subscription: null }
  }
}
