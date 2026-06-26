import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

type MercadoPagoWebhookBody = {
  type?: string
  data?: {
    id?: string | number
  }
}

type MercadoPagoPaymentResponse = {
  id: number
  status: string
  external_reference?: string | null
}

type OrderUpdatePayload = {
  status: string
  payment_status: string
}

type StoreToken = {
  storeId: string
  token: string
}

function extractPaymentId(body: MercadoPagoWebhookBody): string | null {
  const rawId = body.data?.id

  if (rawId === undefined || rawId === null) {
    return null
  }

  const paymentId = String(rawId).trim()
  return paymentId.length > 0 ? paymentId : null
}

function buildOrderUpdate(
  mpStatus: string,
  paymentId: string,
): OrderUpdatePayload | null {
  switch (mpStatus) {
    case 'approved':
      return {
        status: 'paid',
        payment_status: 'paid',
      }
    case 'rejected':
      return {
        status: 'pending_payment',
        payment_status: 'failed',
      }
    case 'cancelled':
      return {
        status: 'cancelled',
        payment_status: 'failed',
      }
    case 'pending':
    case 'in_process':
      return {
        status: 'pending_payment',
        payment_status: 'pending',
      }
    default:
      return null
  }
}

async function fetchMercadoPagoPayment(
  paymentId: string,
  accessToken: string,
): Promise<MercadoPagoPaymentResponse | null> {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (response.status === 404 || response.status === 401) {
    return null
  }

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('[MP Webhook] Error al consultar pago en MP:', {
      paymentId,
      status: response.status,
      body: errorBody,
    })
    return null
  }

  return (await response.json()) as MercadoPagoPaymentResponse
}

async function getStoreAccessTokens(): Promise<StoreToken[]> {
  const admin = createAdminClient()
  const { data: stores, error } = await admin
    .from('stores')
    .select('id, mp_access_token')
    .not('mp_access_token', 'is', null)

  if (error) {
    console.error('[MP Webhook] Error al cargar tokens de tiendas:', error.message)
    return []
  }

  const tokens: StoreToken[] = []
  const seen = new Set<string>()

  for (const store of stores ?? []) {
    const token = store.mp_access_token?.trim()
    if (!token || seen.has(token)) {
      continue
    }
    seen.add(token)
    tokens.push({ storeId: store.id, token })
  }

  const globalToken = process.env.MP_ACCESS_TOKEN?.trim()
  if (globalToken && !seen.has(globalToken)) {
    tokens.push({ storeId: 'global', token: globalToken })
  }

  return tokens
}

async function resolvePaymentWithStoreToken(
  paymentId: string,
): Promise<{ payment: MercadoPagoPaymentResponse; storeId: string } | null> {
  const tokens = await getStoreAccessTokens()

  if (tokens.length === 0) {
    console.error('[MP Webhook] No hay tokens de Mercado Pago configurados')
    return null
  }

  for (const { storeId, token } of tokens) {
    const payment = await fetchMercadoPagoPayment(paymentId, token)
    if (!payment) {
      continue
    }

    const externalReference = payment.external_reference?.trim()
    if (!externalReference) {
      console.error('[MP Webhook] Pago sin external_reference:', paymentId)
      return null
    }

    const admin = createAdminClient()
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('store_id')
      .eq('id', externalReference)
      .maybeSingle()

    if (orderError) {
      console.error('[MP Webhook] Error al verificar orden:', orderError.message)
      return null
    }

    if (!order) {
      console.error('[MP Webhook] Orden no encontrada:', externalReference)
      return null
    }

    if (storeId !== 'global' && order.store_id !== storeId) {
      console.warn('[MP Webhook] Token no coincide con la tienda de la orden:', {
        paymentId,
        orderId: externalReference,
        expectedStoreId: order.store_id,
        tokenStoreId: storeId,
      })
      continue
    }

    return { payment, storeId: order.store_id }
  }

  console.error('[MP Webhook] No se pudo resolver el pago con ningún token:', paymentId)
  return null
}

async function updateOrderFromPayment(
  payment: MercadoPagoPaymentResponse,
  paymentId: string,
  storeId: string,
): Promise<void> {
  const externalReference = payment.external_reference?.trim()

  if (!externalReference) {
    console.error('[MP Webhook] Pago sin external_reference:', paymentId)
    return
  }

  const orderUpdate = buildOrderUpdate(payment.status.toLowerCase(), paymentId)

  if (!orderUpdate) {
    console.error('[MP Webhook] Estado de pago no reconocido:', {
      paymentId,
      status: payment.status,
    })
    return
  }

  const admin = createAdminClient()

  const { data: order, error: orderError } = await admin
    .from('orders')
    .select('id, store_id')
    .eq('id', externalReference)
    .maybeSingle()

  if (orderError) {
    console.error('[MP Webhook] Error al buscar orden:', {
      orderId: externalReference,
      message: orderError.message,
    })
    return
  }

  if (!order) {
    console.error('[MP Webhook] Orden no encontrada:', externalReference)
    return
  }

  if (order.store_id !== storeId) {
    console.error('[MP Webhook] Intento de actualizar orden de otra tienda:', {
      orderId: externalReference,
      orderStoreId: order.store_id,
      webhookStoreId: storeId,
    })
    return
  }

  const { error: updateError } = await admin
    .from('orders')
    .update(orderUpdate)
    .eq('id', externalReference)
    .eq('store_id', storeId)

  if (updateError) {
    console.error('[MP Webhook] Error al actualizar orden:', {
      orderId: externalReference,
      paymentId,
      message: updateError.message,
    })
    return
  }

  console.log('[MP Webhook] Orden actualizada:', {
    orderId: externalReference,
    storeId,
    paymentId,
    status: orderUpdate.status,
    paymentStatus: orderUpdate.payment_status,
  })
}

export async function POST(request: Request) {
  let body: MercadoPagoWebhookBody

  try {
    body = (await request.json()) as MercadoPagoWebhookBody
  } catch (error) {
    console.error('[MP Webhook] Body inválido:', error)
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const paymentId = extractPaymentId(body)

  if (!paymentId) {
    return NextResponse.json({ error: 'Falta data.id' }, { status: 400 })
  }

  try {
    if (body.type && body.type !== 'payment') {
      console.log('[MP Webhook] Notificación ignorada (tipo no soportado):', body.type)
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const resolved = await resolvePaymentWithStoreToken(paymentId)

    if (!resolved) {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    await updateOrderFromPayment(resolved.payment, paymentId, resolved.storeId)
  } catch (error) {
    console.error('[MP Webhook] Error inesperado:', error)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
