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
  mp_payment_id?: string
  paid_at?: string
}

function getMercadoPagoAccessToken(): string | null {
  const token = process.env.MP_ACCESS_TOKEN?.trim()
  return token ? token : null
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
        status: 'approved',
        payment_status: 'paid',
        mp_payment_id: paymentId,
        paid_at: new Date().toISOString(),
      }
    case 'rejected':
    case 'cancelled':
      return {
        status: 'failed',
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

async function updateOrderFromPayment(
  payment: MercadoPagoPaymentResponse,
  paymentId: string,
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
    .select('id')
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

  const { error: updateError } = await admin
    .from('orders')
    .update(orderUpdate)
    .eq('id', externalReference)

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

    const accessToken = getMercadoPagoAccessToken()

    if (!accessToken) {
      console.error('[MP Webhook] MP_ACCESS_TOKEN no configurado')
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const payment = await fetchMercadoPagoPayment(paymentId, accessToken)

    if (!payment) {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    await updateOrderFromPayment(payment, paymentId)
  } catch (error) {
    console.error('[MP Webhook] Error inesperado:', error)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
