export type MercadoPagoStore = {
  mp_access_token: string | null
  mp_public_key: string | null
  is_test_mode?: boolean | null
}

export type MercadoPagoCredentials = {
  accessToken: string
  publicKey: string
  isTestMode: boolean
}

export type MercadoPagoPreferenceItem = {
  title: string
  quantity: number
  unit_price: number
  currency_id: string
}

export type MercadoPagoPreferencePayload = {
  items: MercadoPagoPreferenceItem[]
  payer?: {
    name?: string
    email?: string
    phone?: { number: string }
  }
  back_urls?: {
    success: string
    failure: string
    pending: string
  }
  auto_return?: 'approved'
  external_reference?: string
  metadata?: Record<string, string>
  notification_url?: string
}

export type MercadoPagoPreferenceResponse = {
  id: string
  init_point: string
  sandbox_init_point?: string
}

export type MercadoPagoErrorResponse = {
  message?: string
  error?: string
  cause?: Array<{ description?: string }>
}

export type MercadoPagoPayment = {
  id: number
  status: string
  external_reference?: string | null
  metadata?: Record<string, unknown> | null
}

function isTestCredential(value: string): boolean {
  return value.includes('TEST')
}

export function isPlatformTestMode(): boolean {
  return process.env.MP_MODE?.trim().toLowerCase() === 'test'
}

function resolvePlatformAccessToken(): string | null {
  if (isPlatformTestMode()) {
    return process.env.MP_ACCESS_TOKEN_TEST?.trim() ?? null
  }

  return (
    process.env.MP_ACCESS_TOKEN_PROD?.trim() ??
    process.env.NEXT_MP_CLIENT_SECRET?.trim() ??
    process.env.MP_ACCESS_TOKEN?.trim() ??
    null
  )
}

function resolvePlatformPublicKey(): string | null {
  if (isPlatformTestMode()) {
    return process.env.MP_PUBLIC_KEY_TEST?.trim() ?? null
  }

  return (
    process.env.MP_PUBLIC_KEY_PROD?.trim() ??
    process.env.NEXT_MP_CLIENT_ID?.trim() ??
    process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.trim() ??
    null
  )
}

/** Credenciales de plataforma (suscripciones / sandbox global). Solo servidor. */
export const mpConfig = {
  get isTestMode() {
    return isPlatformTestMode()
  },
  get publicKey() {
    return resolvePlatformPublicKey()
  },
  get accessToken() {
    return resolvePlatformAccessToken()
  },
}

export function isMercadoPagoTestMode(store: MercadoPagoStore): boolean {
  if (isPlatformTestMode()) {
    return true
  }

  if (store.is_test_mode) {
    return true
  }

  const token = store.mp_access_token?.trim()
  const key = store.mp_public_key?.trim()

  return Boolean(
    (token && isTestCredential(token)) || (key && isTestCredential(key)),
  )
}

function getPlatformTestCredentials(): MercadoPagoCredentials | null {
  const accessToken =
    process.env.MP_ACCESS_TOKEN_TEST?.trim() ?? process.env.MP_ACCESS_TOKEN?.trim()
  const publicKey =
    process.env.MP_PUBLIC_KEY_TEST?.trim() ?? process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.trim()

  if (!accessToken || !publicKey) {
    return null
  }

  return {
    accessToken,
    publicKey,
    isTestMode: true,
  }
}

function getPlatformProductionCredentials(): MercadoPagoCredentials | null {
  if (isPlatformTestMode()) {
    return null
  }

  const accessToken = mpConfig.accessToken
  const publicKey = mpConfig.publicKey

  if (!accessToken || !publicKey) {
    return null
  }

  return {
    accessToken,
    publicKey,
    isTestMode: isTestCredential(accessToken) || isTestCredential(publicKey),
  }
}

export function resolveStoreMercadoPagoCredentials(
  store: MercadoPagoStore,
): MercadoPagoCredentials | null {
  if (isPlatformTestMode()) {
    const platformTest = getPlatformTestCredentials()
    if (platformTest) {
      return platformTest
    }
  }

  const testMode = isMercadoPagoTestMode(store)

  if (testMode && !isPlatformTestMode()) {
    const platformTest = getPlatformTestCredentials()
    if (platformTest) {
      return platformTest
    }
  }

  const accessToken = store.mp_access_token?.trim()
  const publicKey = store.mp_public_key?.trim()

  if (!accessToken || !publicKey) {
    if (testMode) {
      return getPlatformTestCredentials()
    }
    return null
  }

  return {
    accessToken,
    publicKey,
    isTestMode: isTestCredential(accessToken) || isTestCredential(publicKey),
  }
}

export function resolvePlatformMercadoPagoCredentials(): MercadoPagoCredentials | null {
  if (isPlatformTestMode()) {
    return getPlatformTestCredentials() ?? getPlatformProductionCredentials()
  }

  return getPlatformProductionCredentials() ?? getPlatformTestCredentials()
}

export function getMercadoPagoInitPoint(
  preference: MercadoPagoPreferenceResponse,
  isTestMode: boolean,
): string | null {
  if (isTestMode && preference.sandbox_init_point) {
    return preference.sandbox_init_point
  }

  return preference.init_point ?? preference.sandbox_init_point ?? null
}

export async function createMercadoPagoPreference(
  accessToken: string,
  payload: MercadoPagoPreferencePayload,
): Promise<{ data?: MercadoPagoPreferenceResponse; error?: string }> {
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

    return { error: errorMessage }
  }

  return { data }
}

export async function fetchMercadoPagoPayment(
  paymentId: string,
  accessToken: string,
): Promise<MercadoPagoPayment | null> {
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
