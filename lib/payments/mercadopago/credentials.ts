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

export type MercadoPagoPreferenceResponse = {
  id: string
  init_point: string
  sandbox_init_point?: string
}

function maskCredential(value: string | null | undefined, visible = 10): string {
  if (!value) {
    return '(missing)'
  }

  return value.length <= visible ? value : `${value.substring(0, visible)}...`
}

function isTestCredential(value: string): boolean {
  return value.includes('TEST')
}

export function isPlatformTestMode(): boolean {
  const mpMode = process.env.MP_MODE?.trim().toLowerCase()
  const publicMpMode = process.env.NEXT_PUBLIC_MP_MODE?.trim().toLowerCase()

  return (
    mpMode === 'test' ||
    publicMpMode === 'test' ||
    process.env.MP_USE_TEST_CREDENTIALS === 'true' ||
    process.env.NODE_ENV === 'development'
  )
}

function resolvePlatformAccessToken(): string | null {
  if (isPlatformTestMode()) {
    return process.env.MP_ACCESS_TOKEN_TEST?.trim() ?? null
  }

  return (
    process.env.MP_ACCESS_TOKEN_PROD?.trim() ??
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
    process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.trim() ??
    null
  )
}

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

  if (process.env.NODE_ENV === 'development') {
    return true
  }

  const token = store.mp_access_token?.trim()
  const key = store.mp_public_key?.trim()

  return Boolean(
    (token && isTestCredential(token)) || (key && isTestCredential(key)),
  )
}

function getPlatformTestCredentials(): MercadoPagoCredentials | null {
  const accessToken = process.env.MP_ACCESS_TOKEN_TEST?.trim()
  const publicKey = process.env.MP_PUBLIC_KEY_TEST?.trim()

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
  const accessToken = resolvePlatformAccessToken()
  const publicKey = resolvePlatformPublicKey()

  if (!accessToken || !publicKey) {
    return null
  }

  return {
    accessToken,
    publicKey,
    isTestMode: false,
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
    isTestMode: testMode,
  }
}

export function resolvePlatformMercadoPagoCredentials(): MercadoPagoCredentials | null {
  console.log('========================================')
  console.log('DEBUG: resolvePlatformMercadoPagoCredentials')
  console.log('MP_MODE:', process.env.MP_MODE)
  console.log('NEXT_PUBLIC_MP_MODE:', process.env.NEXT_PUBLIC_MP_MODE)
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('isPlatformTestMode:', isPlatformTestMode())

  const testToken = process.env.MP_ACCESS_TOKEN_TEST
  const testKey = process.env.MP_PUBLIC_KEY_TEST
  const prodToken = process.env.MP_ACCESS_TOKEN_PROD ?? process.env.MP_ACCESS_TOKEN
  const prodKey = process.env.MP_PUBLIC_KEY_PROD ?? process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY

  console.log('MP_ACCESS_TOKEN_TEST exists:', !!testToken)
  console.log('MP_ACCESS_TOKEN_TEST starts with:', maskCredential(testToken))
  console.log('MP_PUBLIC_KEY_TEST exists:', !!testKey)
  console.log('MP_PUBLIC_KEY_TEST starts with:', maskCredential(testKey))
  console.log('MP_ACCESS_TOKEN_PROD exists:', !!prodToken)
  console.log('MP_ACCESS_TOKEN_PROD starts with:', maskCredential(prodToken))
  console.log('MP_PUBLIC_KEY_PROD exists:', !!prodKey)
  console.log('MP_PUBLIC_KEY_PROD starts with:', maskCredential(prodKey))

  if (isPlatformTestMode()) {
    console.log('MODE: Using TEST credentials only (no production fallback)')
    const testCreds = getPlatformTestCredentials()
    console.log('TEST credentials result:', testCreds ? 'SUCCESS' : 'NULL')

    if (testCreds) {
      console.log('TEST accessToken starts with:', maskCredential(testCreds.accessToken))
      console.log('TEST publicKey starts with:', maskCredential(testCreds.publicKey))
    }

    return testCreds
  }

  console.log('MODE: Using PRODUCTION credentials')
  const prodCreds = getPlatformProductionCredentials()
  console.log('PRODUCTION credentials result:', prodCreds ? 'SUCCESS' : 'NULL')
  return prodCreds
}

export function getMercadoPagoInitPoint(
  preference: MercadoPagoPreferenceResponse,
  isTestMode: boolean,
): string | null {
  if (isTestMode) {
    if (!preference.sandbox_init_point) {
      console.error('ERROR: sandbox_init_point is missing in test mode')
      console.error('Preference:', JSON.stringify(preference, null, 2))
    }

    return preference.sandbox_init_point?.trim() ?? null
  }

  return preference.init_point?.trim() ?? preference.sandbox_init_point?.trim() ?? null
}

export function getPlatformAccessTokensForWebhook(): string[] {
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

  if (isPlatformTestMode()) {
    addToken(process.env.MP_ACCESS_TOKEN_TEST)
    return tokens
  }

  addToken(process.env.MP_ACCESS_TOKEN_PROD)
  addToken(process.env.MP_ACCESS_TOKEN)
  addToken(process.env.MP_ACCESS_TOKEN_TEST)

  return tokens
}

export function getMercadoPagoAccessToken(accessTokenOverride?: string): string {
  if (accessTokenOverride?.trim()) {
    return accessTokenOverride.trim()
  }

  const credentials = resolvePlatformMercadoPagoCredentials()

  if (!credentials?.accessToken) {
    throw new Error(
      isPlatformTestMode()
        ? 'MP_ACCESS_TOKEN_TEST no configurada'
        : 'MP_ACCESS_TOKEN_PROD no configurada',
    )
  }

  return credentials.accessToken
}

export function getMercadoPagoPublicKey(): string {
  const credentials = resolvePlatformMercadoPagoCredentials()

  if (!credentials?.publicKey) {
    throw new Error(
      isPlatformTestMode()
        ? 'MP_PUBLIC_KEY_TEST no configurada'
        : 'MP_PUBLIC_KEY_PROD no configurada',
    )
  }

  return credentials.publicKey
}
