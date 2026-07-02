import { dispatchWebhook } from '@/lib/payments/dispatcher'
import { debugMercadoPagoCredentials } from '@/lib/payments/mercadopago/debug'
import { NextRequest, NextResponse } from 'next/server'

type MercadoPagoWebhookBody = {
  type?: string
  data?: {
    id?: string | number
  }
}

export async function POST(request: NextRequest) {
  let body: MercadoPagoWebhookBody

  try {
    body = (await request.json()) as MercadoPagoWebhookBody
  } catch (error) {
    console.error('[MP Webhook] Body inválido:', error)
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const eventType = body.type ?? 'unknown'
  const paymentId = body.data?.id

  if (eventType === 'payment' && (paymentId === undefined || paymentId === null)) {
    return NextResponse.json({ error: 'Falta data.id' }, { status: 400 })
  }

  const result = await dispatchWebhook('mercadopago', eventType, body)

  if (!result.success) {
    console.error('[MP Webhook] Processing failed:', result.errorMessage)
  }

  return NextResponse.json({ received: true, action: result.action ?? 'ignore' })
}
