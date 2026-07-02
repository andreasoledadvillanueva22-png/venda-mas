import { sendOrderConfirmationEmail } from '@/lib/email'
import {
  getPlatformAccessTokensForWebhook,
  isPlatformTestMode,
} from '@/lib/payments/mercadopago/credentials'
import {
  fetchMercadoPagoPayment,
  getMercadoPagoPaymentMetadataValue,
  isSubscriptionPayment,
} from '@/lib/payments/mercadopago/payments'
import type { MercadoPagoPayment } from '@/lib/payments/mercadopago/types'
import type { WebhookPayload, WebhookResult } from '@/lib/payments/provider'
import { recordPaymentEvent } from '@/lib/payments/payment-records'
import { activateSubscription } from '@/lib/subscriptions'
import { createAdminClient } from '@/lib/supabase/admin'

type OrderUpdatePayload = {
  status: string
  payment_status: string
}

type DbOrderItem = {
  quantity: number
  unit_price: number
  products: { name: string } | { name: string }[] | null
}

function buildOrderUpdate(mpStatus: string): OrderUpdatePayload | null {
  switch (mpStatus) {
    case 'approved':
      return { status: 'paid', payment_status: 'paid' }
    case 'rejected':
      return { status: 'pending_payment', payment_status: 'failed' }
    case 'cancelled':
      return { status: 'cancelled', payment_status: 'failed' }
    case 'pending':
    case 'in_process':
      return { status: 'pending_payment', payment_status: 'pending' }
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

async function fetchPaymentWithAnyToken(paymentId: string): Promise<MercadoPagoPayment | null> {
  const tokens = await getAllAccessTokens()

  for (const token of tokens) {
    const payment = await fetchMercadoPagoPayment(paymentId, token)
    if (payment) {
      return payment
    }
  }

  return null
}

async function handleSubscriptionPayment(payment: MercadoPagoPayment): Promise<WebhookResult> {
  if (payment.status.toLowerCase() !== 'approved') {
    return { success: true, action: 'ignore' }
  }

  const storeId = getMercadoPagoPaymentMetadataValue(payment, 'store_id')
  const planId = getMercadoPagoPaymentMetadataValue(payment, 'plan_id')
  const userId = getMercadoPagoPaymentMetadataValue(payment, 'user_id')

  if (!storeId || !planId || !userId) {
    return { success: false, errorMessage: 'Suscripción sin metadata completa' }
  }

  try {
    const subscriptionId = await activateSubscription({ storeId, userId, planId })

    await recordPaymentEvent({
      storeId,
      subscriptionId,
      providerPaymentId: String(payment.id),
      amount: Number(payment.transaction_amount ?? 0),
      currency: payment.currency_id ?? 'ARS',
      status: 'approved',
      rawResponse: payment,
      paidAt: new Date().toISOString(),
    })

    return { success: true, action: 'activate_plan' }
  } catch (error) {
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Error al activar suscripción',
    }
  }
}

async function sendOrderPaidEmail(orderId: string, storeId: string): Promise<void> {
  const admin = createAdminClient()

  const { data: order } = await admin
    .from('orders')
    .select('id, customer_email, total')
    .eq('id', orderId)
    .eq('store_id', storeId)
    .maybeSingle()

  if (!order?.customer_email) {
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
): Promise<WebhookResult> {
  const externalReference = payment.external_reference?.trim()

  if (!externalReference) {
    return { success: false, errorMessage: 'Pago sin external_reference' }
  }

  const orderUpdate = buildOrderUpdate(payment.status.toLowerCase())

  if (!orderUpdate) {
    return { success: false, errorMessage: `Estado de pago no reconocido: ${payment.status}` }
  }

  const admin = createAdminClient()

  const { data: order } = await admin
    .from('orders')
    .select('id, store_id, status, payment_status')
    .eq('id', externalReference)
    .maybeSingle()

  if (!order) {
    return { success: false, errorMessage: 'Orden no encontrada' }
  }

  const wasAlreadyPaid = order.status === 'paid' || order.payment_status === 'paid'

  const { error: updateError } = await admin
    .from('orders')
    .update(orderUpdate)
    .eq('id', externalReference)
    .eq('store_id', order.store_id)

  if (updateError) {
    return { success: false, errorMessage: updateError.message }
  }

  await recordPaymentEvent({
    storeId: order.store_id,
    providerPaymentId: paymentId,
    amount: Number(payment.transaction_amount ?? 0),
    currency: payment.currency_id ?? 'ARS',
    status: orderUpdate.payment_status === 'paid' ? 'approved' : orderUpdate.payment_status,
    rawResponse: payment,
    paidAt: orderUpdate.payment_status === 'paid' ? new Date().toISOString() : null,
  })

  if (orderUpdate.status === 'paid' && !wasAlreadyPaid) {
    await sendOrderPaidEmail(externalReference, order.store_id)
  }

  return { success: true, action: 'update_payment' }
}

export async function processMercadoPagoPaymentWebhook(
  payload: WebhookPayload,
): Promise<WebhookResult> {
  const paymentId = payload.data?.id?.trim()

  if (!paymentId) {
    return { success: false, errorMessage: 'Falta data.id' }
  }

  if (payload.type && payload.type !== 'payment') {
    return { success: true, action: 'ignore' }
  }

  const payment = await fetchPaymentWithAnyToken(paymentId)

  if (!payment) {
    return { success: true, action: 'ignore' }
  }

  if (isSubscriptionPayment(payment)) {
    return handleSubscriptionPayment(payment)
  }

  return updateOrderFromPayment(payment, paymentId)
}
