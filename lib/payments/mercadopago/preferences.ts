import {
  getMercadoPagoInitPoint,
  isPlatformTestMode,
  resolvePlatformMercadoPagoCredentials,
} from '@/lib/payments/mercadopago/credentials'
import { createMercadoPagoPreference } from '@/lib/payments/mercadopago/preferences-api'
import type {
  CreatePreferenceParams,
  CreatePreferenceResult,
  PaymentInfo,
  PaymentProvider,
  RefundResult,
  WebhookPayload,
  WebhookResult,
} from '@/lib/payments/provider'
import { fetchMercadoPagoPayment } from '@/lib/payments/mercadopago/payments'
import { processMercadoPagoPaymentWebhook } from '@/lib/payments/mercadopago/webhooks'

function getNotificationUrl(): string | undefined {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ??
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ??
    `https://${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? 'vendemas.app'}`

  return `${baseUrl.replace(/\/$/, '')}/api/webhooks/mercadopago`
}

export class MercadoPagoProvider implements PaymentProvider {
  async createPreference(params: CreatePreferenceParams): Promise<CreatePreferenceResult> {
    const credentials = resolvePlatformMercadoPagoCredentials()

    if (!credentials) {
      throw new Error('Credenciales de pago no configuradas')
    }

    const body = {
      items: params.items,
      payer: params.payer,
      back_urls: params.back_urls,
      auto_return: 'approved' as const,
      external_reference: params.external_reference,
      metadata: params.metadata,
      notification_url: params.notification_url ?? getNotificationUrl(),
    }

    console.log('Creating preference with body:', JSON.stringify(body, null, 2))

    const result = await createMercadoPagoPreference(credentials.accessToken, body)

    if (result.error || !result.data) {
      throw new Error(result.error ?? 'No se pudo crear la preferencia')
    }

    console.log('Preference created:', {
      id: result.data.id,
      init_point: result.data.init_point,
      sandbox_init_point: result.data.sandbox_init_point,
    })

    const initPoint = getMercadoPagoInitPoint(result.data, credentials.isTestMode)

    if (!initPoint) {
      throw new Error(
        credentials.isTestMode
          ? 'No se recibió sandbox_init_point en modo test'
          : 'No se recibió init_point',
      )
    }

    console.log('Redirecting to:', initPoint)
    console.log('isTestMode:', credentials.isTestMode)

    return {
      preferenceId: result.data.id,
      initPoint,
      sandboxInitPoint: result.data.sandbox_init_point,
      isTestMode: credentials.isTestMode,
    }
  }

  async getPayment(paymentId: string): Promise<PaymentInfo | null> {
    const payment = await fetchMercadoPagoPayment(paymentId)

    if (!payment) {
      return null
    }

    return {
      id: String(payment.id),
      status: payment.status,
      amount: Number(payment.transaction_amount ?? 0),
      currency: payment.currency_id ?? 'ARS',
      metadata: payment.metadata ?? undefined,
    }
  }

  async processWebhook(payload: WebhookPayload): Promise<WebhookResult> {
    return processMercadoPagoPaymentWebhook(payload)
  }

  async refund(_paymentId: string, _amount?: number): Promise<RefundResult> {
    return { success: false }
  }
}

export const mercadoPagoProvider = new MercadoPagoProvider()

export function createPreference(params: CreatePreferenceParams): Promise<CreatePreferenceResult> {
  return mercadoPagoProvider.createPreference(params)
}

export function isPaymentsTestMode(): boolean {
  return isPlatformTestMode()
}
