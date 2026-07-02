import type { MercadoPagoPreferencePayload } from '@/lib/payments/mercadopago/types'
import type { MercadoPagoPreferenceResponse } from '@/lib/payments/mercadopago/credentials'

export type { MercadoPagoPreferencePayload }

type MercadoPagoErrorResponse = {
  message?: string
  error?: string
  cause?: Array<{ description?: string }>
}

function maskCredential(value: string, visible = 10): string {
  return value.length <= visible ? value : `${value.substring(0, visible)}...`
}

export async function createMercadoPagoPreference(
  accessToken: string,
  payload: MercadoPagoPreferencePayload,
): Promise<{ data?: MercadoPagoPreferenceResponse; error?: string }> {
  console.log('DEBUG createMercadoPagoPreference: accessToken starts with:', maskCredential(accessToken))

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = (await response.json()) as MercadoPagoPreferenceResponse & MercadoPagoErrorResponse

  if (!response.ok) {
    const errorMessage =
      data.message ??
      data.cause?.[0]?.description ??
      data.error ??
      'No se pudo crear la preferencia de pago'

    console.error('DEBUG createMercadoPagoPreference: error', errorMessage)
    return { error: errorMessage }
  }

  console.log('DEBUG createMercadoPagoPreference: preference id', data.id)
  console.log('DEBUG createMercadoPagoPreference: init_point:', data.init_point)
  console.log('DEBUG createMercadoPagoPreference: sandbox_init_point:', data.sandbox_init_point)

  return { data }
}
