import {
  getMercadoPagoAccessToken,
  isPlatformTestMode,
} from '@/lib/payments/mercadopago/credentials'

export async function mercadopagoFetch<T>(
  path: string,
  options: RequestInit = {},
  accessTokenOverride?: string,
): Promise<T> {
  const accessToken = getMercadoPagoAccessToken(accessTokenOverride)

  const response = await fetch(`https://api.mercadopago.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    console.error(`Mercado Pago API error: ${response.status} - ${error}`)
    throw new Error(`Mercado Pago API error: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function getMercadoPagoOAuthConfig() {
  return {
    clientId: process.env.NEXT_MP_CLIENT_ID?.trim() ?? null,
    clientSecret: process.env.NEXT_MP_CLIENT_SECRET?.trim() ?? null,
    redirectUri: process.env.NEXT_MP_REDIRECT_URI?.trim() ?? null,
    isTestMode: isPlatformTestMode(),
  }
}
