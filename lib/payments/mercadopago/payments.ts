import type { MercadoPagoPayment } from '@/lib/payments/mercadopago/types'
import { getMercadoPagoAccessToken } from '@/lib/payments/mercadopago/credentials'

export async function fetchMercadoPagoPayment(
  paymentId: string,
  accessToken?: string,
): Promise<MercadoPagoPayment | null> {
  const token = getMercadoPagoAccessToken(accessToken)

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (response.status === 404 || response.status === 401) {
    return null
  }

  if (!response.ok) {
    return null
  }

  return (await response.json()) as MercadoPagoPayment
}

export function getMercadoPagoPaymentMetadataValue(
  payment: MercadoPagoPayment,
  key: string,
): string | null {
  const value = payment.metadata?.[key]

  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return null
}

export function isSubscriptionPayment(payment: MercadoPagoPayment): boolean {
  return getMercadoPagoPaymentMetadataValue(payment, 'type') === 'subscription'
}
