import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type MercadoPagoTokenResponse = {
  access_token: string
  public_key: string
  user_id: number
  token_type?: string
  expires_in?: number
  scope?: string
  refresh_token?: string
}

type MercadoPagoErrorResponse = {
  message?: string
  error?: string
  status?: number
}

function getSettingsRedirectUrl(request: Request, params: Record<string, string>): URL {
  const redirectUrl = new URL('/admin/settings', request.url)

  for (const [key, value] of Object.entries(params)) {
    redirectUrl.searchParams.set(key, value)
  }

  return redirectUrl
}

function getRedirectUri(request: Request): string {
  const configuredRedirectUri = process.env.NEXT_MP_REDIRECT_URI?.trim()

  if (configuredRedirectUri) {
    return configuredRedirectUri
  }

  const callbackUrl = new URL('/api/mercadopago/auth', request.url)
  return callbackUrl.toString()
}

async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
): Promise<MercadoPagoTokenResponse> {
  const clientId = process.env.NEXT_MP_CLIENT_ID?.trim()
  const clientSecret = process.env.NEXT_MP_CLIENT_SECRET?.trim()

  if (!clientId || !clientSecret) {
    throw new Error('Faltan NEXT_MP_CLIENT_ID o NEXT_MP_CLIENT_SECRET')
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  })

  const response = await fetch('https://api.mercadopago.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  })

  const payload = (await response.json()) as MercadoPagoTokenResponse & MercadoPagoErrorResponse

  if (!response.ok) {
    const errorMessage =
      payload.message ?? payload.error ?? 'No se pudo intercambiar el código de Mercado Pago'
    throw new Error(errorMessage)
  }

  if (!payload.access_token || !payload.public_key || payload.user_id === undefined) {
    throw new Error('Mercado Pago no devolvió credenciales completas')
  }

  return payload
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const oauthError = searchParams.get('error')
  const oauthErrorDescription = searchParams.get('error_description')

  if (oauthError) {
    const message = oauthErrorDescription ?? oauthError
    return NextResponse.redirect(
      getSettingsRedirectUrl(request, {
        mp_error: message,
      }),
    )
  }

  if (!code?.trim()) {
    return NextResponse.redirect(
      getSettingsRedirectUrl(request, {
        mp_error: 'No se recibió el código de autorización de Mercado Pago',
      }),
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', '/admin/settings')
    return NextResponse.redirect(loginUrl)
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, owner_id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store || store.owner_id !== user.id) {
    return NextResponse.redirect(
      getSettingsRedirectUrl(request, {
        mp_error: 'No se encontró la tienda del usuario autenticado',
      }),
    )
  }

  try {
    const redirectUri = getRedirectUri(request)
    const tokenData = await exchangeCodeForToken(code.trim(), redirectUri)

    const { error: updateError } = await supabase
      .from('stores')
      .update({
        mp_access_token: tokenData.access_token,
        mp_public_key: tokenData.public_key,
        mp_user_id: String(tokenData.user_id),
      })
      .eq('id', store.id)
      .eq('owner_id', user.id)

    if (updateError) {
      return NextResponse.redirect(
        getSettingsRedirectUrl(request, {
          mp_error: 'No se pudieron guardar las credenciales de Mercado Pago',
        }),
      )
    }

    return NextResponse.redirect(
      getSettingsRedirectUrl(request, {
        mp_connected: '1',
      }),
    )
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error inesperado al conectar con Mercado Pago'

    return NextResponse.redirect(
      getSettingsRedirectUrl(request, {
        mp_error: message,
      }),
    )
  }
}
