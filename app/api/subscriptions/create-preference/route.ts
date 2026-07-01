import { createClient } from '@/lib/supabase/server'
import { createSubscriptionPreference } from '@/lib/subscriptions'
import { NextRequest, NextResponse } from 'next/server'

type CreateSubscriptionBody = {
  planId?: string
}

function getRequestOrigin(request: NextRequest): string {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, '')
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (siteUrl) {
    return siteUrl.replace(/\/$/, '')
  }

  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'http'

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }

  return new URL(request.url).origin
}

export async function POST(request: NextRequest) {
  let body: CreateSubscriptionBody

  try {
    body = (await request.json()) as CreateSubscriptionBody
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
  }

  const planId = body.planId?.trim()

  if (!planId) {
    return NextResponse.json({ error: 'planId es obligatorio' }, { status: 400 })
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Debés iniciar sesión para suscribirte' }, { status: 401 })
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, name')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store) {
    return NextResponse.json(
      { error: 'Primero creá tu tienda para elegir un plan' },
      { status: 404 },
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const origin = getRequestOrigin(request)
  const payerName = profile?.full_name?.trim() || user.email?.split('@')[0] || 'Usuario'
  const payerEmail = user.email?.trim()

  if (!payerEmail) {
    return NextResponse.json({ error: 'Tu cuenta no tiene email configurado' }, { status: 400 })
  }

  const result = await createSubscriptionPreference({
    planId,
    userId: user.id,
    storeId: store.id,
    payerEmail,
    payerName,
    origin,
  })

  if ('error' in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }

  return NextResponse.json({ initPoint: result.initPoint })
}
