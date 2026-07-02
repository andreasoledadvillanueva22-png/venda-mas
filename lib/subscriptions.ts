import { createAdminClient } from '@/lib/supabase/admin'
import {
  createMercadoPagoPreference,
  getMercadoPagoInitPoint,
  resolvePlatformMercadoPagoCredentials,
  type MercadoPagoPreferencePayload,
} from '@/lib/mercadopago'
import { DEFAULT_PLANS, type Plan } from '@/lib/plans'

function mapPlanRow(row: {
  id: string
  name: string
  slug: string
  price_monthly: number
  price_yearly: number | null
}): Pick<Plan, 'id' | 'name' | 'slug' | 'priceMonthly' | 'priceYearly'> {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    priceMonthly: row.price_monthly,
    priceYearly: row.price_yearly,
  }
}

export async function getPlanById(planId: string) {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('plans')
      .select('id, name, slug, price_monthly, price_yearly')
      .eq('id', planId)
      .maybeSingle()

    if (!error && data) {
      return mapPlanRow(data)
    }
  } catch {
    // fallback below
  }

  const fallback = DEFAULT_PLANS.find((plan) => plan.id === planId)
  if (!fallback) {
    return null
  }

  return {
    id: fallback.id,
    name: fallback.name,
    slug: fallback.slug,
    priceMonthly: fallback.priceMonthly,
    priceYearly: fallback.priceYearly,
  }
}

export async function getPlanBySlug(slug: string) {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('plans')
      .select('id, name, slug, price_monthly, price_yearly')
      .eq('slug', slug)
      .maybeSingle()

    if (!error && data) {
      return mapPlanRow(data)
    }
  } catch {
    // fallback below
  }

  const fallback = DEFAULT_PLANS.find((plan) => plan.slug === slug)
  if (!fallback) {
    return null
  }

  return {
    id: fallback.id,
    name: fallback.name,
    slug: fallback.slug,
    priceMonthly: fallback.priceMonthly,
    priceYearly: fallback.priceYearly,
  }
}

export async function createSubscriptionPreference({
  planId,
  userId,
  storeId,
  payerEmail,
  payerName,
  origin,
}: {
  planId: string
  userId: string
  storeId: string
  payerEmail: string
  payerName: string
  origin: string
}) {
  const plan = await getPlanById(planId)

  if (!plan || plan.priceMonthly <= 0) {
    return { error: 'Plan no válido para suscripción' as const }
  }

  const credentials = resolvePlatformMercadoPagoCredentials()

  if (!credentials) {
    return { error: 'No hay credenciales de pago configuradas en la plataforma' as const }
  }

  const externalReference = `subscription:${storeId}:${planId}:${Date.now()}`

  const payload: MercadoPagoPreferencePayload = {
    items: [
      {
        title: `Plan ${plan.name} - VendaMás`,
        quantity: 1,
        unit_price: plan.priceMonthly,
        currency_id: 'ARS',
      },
    ],
    payer: {
      name: payerName,
      email: payerEmail,
    },
    back_urls: {
      success: `${origin}/admin/settings?subscription=success`,
      failure: `${origin}/admin/settings?subscription=failure`,
      pending: `${origin}/admin/settings?subscription=pending`,
    },
    auto_return: 'approved',
    external_reference: externalReference,
    metadata: {
      type: 'subscription',
      plan_id: planId,
      store_id: storeId,
      user_id: userId,
    },
  }

  const result = await createMercadoPagoPreference(credentials.accessToken, payload)

  if (result.error || !result.data) {
    console.error('DEBUG createSubscriptionPreference: error', result.error)
    return { error: result.error ?? 'No se pudo crear la preferencia de suscripción' }
  }

  console.log('DEBUG createSubscriptionPreference: isTestMode', credentials.isTestMode)
  console.log(
    'DEBUG createSubscriptionPreference: init_point exists:',
    !!result.data.init_point,
  )
  console.log(
    'DEBUG createSubscriptionPreference: sandbox_init_point exists:',
    !!result.data.sandbox_init_point,
  )

  const initPoint = getMercadoPagoInitPoint(result.data, credentials.isTestMode)

  if (!initPoint) {
    return {
      error: credentials.isTestMode
        ? 'No se recibió sandbox_init_point. Verificá MP_MODE=test y credenciales de prueba.'
        : 'No se recibió URL de pago',
    }
  }

  console.log('DEBUG createSubscriptionPreference: redirecting to', initPoint)
  console.log('DEBUG createSubscriptionPreference: is sandbox URL', initPoint.includes('sandbox'))

  return { initPoint }
}

export async function activateSubscription({
  storeId,
  userId,
  planId,
}: {
  storeId: string
  userId: string
  planId: string
}) {
  const admin = createAdminClient()
  const periodEnd = new Date()
  periodEnd.setDate(periodEnd.getDate() + 30)

  const { error: storeError } = await admin
    .from('stores')
    .update({ plan_id: planId })
    .eq('id', storeId)

  if (storeError) {
    throw new Error(storeError.message)
  }

  const { error: subscriptionError } = await admin.from('subscriptions').insert({
    user_id: userId,
    store_id: storeId,
    plan_id: planId,
    status: 'active',
    current_period_start: new Date().toISOString(),
    current_period_end: periodEnd.toISOString(),
  })

  if (subscriptionError) {
    throw new Error(subscriptionError.message)
  }
}
