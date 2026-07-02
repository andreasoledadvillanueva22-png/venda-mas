import { sendOrderConfirmationEmail } from '@/lib/email'
import {
  fetchMercadoPagoPayment,
  getMercadoPagoPaymentMetadataValue,
  getPlatformAccessTokensForWebhook,
  isPlatformTestMode,
  isSubscriptionPayment,
  type MercadoPagoPayment,
} from '@/lib/mercadopago'
import { activateSubscription } from '@/lib/subscriptions'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

type MercadoPagoWebhookBody = {
  type?: string
  data?: {
    id?: string | number
  }
}

type OrderUpdatePayload = {
  status: string
  payment_status: string
}

type DbOrderItem = {
  quantity: number
  unit_price: number
  products: { name: string } | { name: string }[] | null
}

function extractPaymentId(body: MercadoPagoWebhookBody): string | null {
  const rawId = body.data?.id

  if (rawId === undefined || rawId === null) {
    return null
  }

  const paymentId = String(rawId).trim()
  return paymentId.length > 0 ? paymentId : null
}

function buildOrderUpdate(mpStatus: string): OrderUpdatePayload | null {
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

function getProductName(products: DbOrderItem['products']): string {
  if (!products) {
    return 'Producto'
  }

  if (Array.isArray(products)) {
    return products[0]?.name ?? 'Producto'
  }

  return products.name
}

async function getAllAccessTokens(): Promise<string[]> {
  const tokens: string[] = []
  const seen = new Set<string>()

  function addToken(rawToken: string | null | undefined) {
    const token = rawToken?.trim()
    if (!token || seen.has(token)) {
      return
    }
    seen.add(token)
    tokens.push(token)
  }

  for (const token of getPlatformAccessTokensForWebhook()) {
    addToken(token)
  }

  if (isPlatformTestMode()) {
    console.log('[MP Webhook] Modo test: usando solo tokens de plataforma TEST')
    return tokens
  }

  const admin = createAdminClient()
  const { data: stores, error } = await admin
    .from('stores')
    .select('mp_access_token')
    .not('mp_access_token', 'is', null)

  if (error) {
    console.error('[MP Webhook] Error al cargar tokens de tiendas:', error.message)
  }

  for (const store of stores ?? []) {
    addToken(store.mp_access_token)
  }

  return tokens
}

async function fetchPaymentWithAnyToken(
  paymentId: string,
): Promise<MercadoPagoPayment | null> {
  const tokens = await getAllAccessTokens()

  if (tokens.length === 0) {
    console.error('[MP Webhook] No hay tokens de Mercado Pago configurados')
    return null
  }

  for (const token of tokens) {
    const payment = await fetchMercadoPagoPayment(paymentId, token)
    if (payment) {
      return payment
    }
  }

  console.error('[MP Webhook] No se pudo resolver el pago con ningún token:', paymentId)
  return null
}

async function handleSubscriptionPayment(payment: MercadoPagoPayment): Promise<void> {
  if (payment.status.toLowerCase() !== 'approved') {
    console.log('[MP Webhook] Suscripción no aprobada:', payment.status)
    return
  }

  const storeId = getMercadoPagoPaymentMetadataValue(payment, 'store_id')
  const planId = getMercadoPagoPaymentMetadataValue(payment, 'plan_id')
  const userId = getMercadoPagoPaymentMetadataValue(payment, 'user_id')

  if (!storeId || !planId || !userId) {
    console.error('[MP Webhook] Suscripción sin metadata completa:', payment.id)
    return
  }

  try {
    await activateSubscription({ storeId, userId, planId })
    console.log('[MP Webhook] Suscripción activada:', { storeId, planId, userId })
  } catch (error) {
    console.error('[MP Webhook] Error al activar suscripción:', error)
  }
}

async function sendOrderPaidEmail(orderId: string, storeId: string): Promise<void> {
  const admin = createAdminClient()

  const { data: order, error: orderError } = await admin
    .from('orders')
    .select('id, customer_email, total')
    .eq('id', orderId)
    .eq('store_id', storeId)
    .maybeSingle()

  if (orderError || !order?.customer_email) {
    return
  }

  const { data: store } = await admin.from('stores').select('name').eq('id', storeId).maybeSingle()

  const { data: orderItems } = await admin
    .from('order_items')
    .select('quantity, unit_price, products(name)')
    .eq('order_id', orderId)

  const items = ((orderItems ?? []) as DbOrderItem[]).map((item) => ({
    name: getProductName(item.products),
    quantity: item.quantity,
    price: Number(item.unit_price) * item.quantity,
  }))

  try {
    await sendOrderConfirmationEmail({
      to: order.customer_email,
      orderNumber: order.id,
      total: Number(order.total),
      items,
      storeName: store?.name ?? 'Tu tienda',
    })
  } catch (error) {
    console.error('[MP Webhook] Error al enviar email de confirmación:', error)
  }
}

async function updateOrderFromPayment(
  payment: MercadoPagoPayment,
  paymentId: string,
): Promise<void> {
  const externalReference = payment.external_reference?.trim()

  if (!externalReference) {
    console.error('[MP Webhook] Pago sin external_reference:', paymentId)
    return
  }

  const orderUpdate = buildOrderUpdate(payment.status.toLowerCase())

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
    .select('id, store_id, status, payment_status')
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

  const wasAlreadyPaid = order.status === 'paid' || order.payment_status === 'paid'

  const { error: updateError } = await admin
    .from('orders')
    .update(orderUpdate)
    .eq('id', externalReference)
    .eq('store_id', order.store_id)

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
    storeId: order.store_id,
    paymentId,
    status: orderUpdate.status,
    paymentStatus: orderUpdate.payment_status,
  })

  if (orderUpdate.status === 'paid' && !wasAlreadyPaid) {
    await sendOrderPaidEmail(externalReference, order.store_id)
  }
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

    const payment = await fetchPaymentWithAnyToken(paymentId)

    if (!payment) {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    if (isSubscriptionPayment(payment)) {
      await handleSubscriptionPayment(payment)
    } else {
      await updateOrderFromPayment(payment, paymentId)
    }
  } catch (error) {
    console.error('[MP Webhook] Error inesperado:', error)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
