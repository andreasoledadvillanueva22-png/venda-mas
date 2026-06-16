import { completeUserOnboarding } from '@/lib/onboarding'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function getSafeRedirectPath(pathname: string | null): string {
  if (pathname && pathname.startsWith('/') && !pathname.startsWith('//')) {
    return pathname
  }

  return '/admin'
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = getSafeRedirectPath(searchParams.get('next'))
  const oauthError = searchParams.get('error')
  const oauthErrorDescription = searchParams.get('error_description')

  console.log('[auth/callback]', {
    origin,
    hasCode: Boolean(code),
    next,
    oauthError,
    oauthErrorDescription,
  })

  if (oauthError) {
    const message = oauthErrorDescription ?? oauthError
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(message)}`,
    )
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('[auth/callback] exchangeCodeForSession', {
      origin,
      error: error?.message ?? null,
    })

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await completeUserOnboarding(user)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=callback`)
}
