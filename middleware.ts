import { updateSession } from '@/lib/supabase/proxy'
import { getStoreBySlug, getTenantFromHost } from '@/lib/tenant'
import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type StoredCookie = {
  name: string
  value: string
  options: CookieOptions
}

function copySupabaseCookies(from: NextResponse, to: NextResponse, storedCookies: StoredCookie[]) {
  storedCookies.forEach(({ name, value, options }) => {
    to.cookies.set(name, value, options)
  })

  from.cookies.getAll().forEach((cookie) => {
    if (!storedCookies.some((storedCookie) => storedCookie.name === cookie.name)) {
      to.cookies.set(cookie.name, cookie.value)
    }
  })
}

function getSafeRedirectPath(pathname: string | null): string {
  if (pathname && pathname.startsWith('/') && !pathname.startsWith('//')) {
    return pathname
  }

  return '/admin'
}

async function handleProtectedAuthRoutes(request: NextRequest): Promise<NextResponse> {
  const storedCookies: StoredCookie[] = []
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          storedCookies.length = 0
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            storedCookies.push({ name, value, options })
          })
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    const redirectResponse = NextResponse.redirect(url)
    copySupabaseCookies(supabaseResponse, redirectResponse, storedCookies)
    return redirectResponse
  }

  if (pathname === '/auth/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = getSafeRedirectPath(url.searchParams.get('redirect'))
    url.searchParams.delete('redirect')
    url.searchParams.delete('error')
    const redirectResponse = NextResponse.redirect(url)
    copySupabaseCookies(supabaseResponse, redirectResponse, storedCookies)
    return redirectResponse
  }

  return supabaseResponse
}

async function withTenantHeader(
  request: NextRequest,
  response: NextResponse,
): Promise<NextResponse> {
  const slug = getTenantFromHost(request.nextUrl.hostname)

  if (!slug) {
    return response
  }

  const store = await getStoreBySlug(slug)

  if (!store) {
    return response
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-store-id', store.id)

  const nextResponse = NextResponse.next({
    request: { headers: requestHeaders },
  })

  response.cookies.getAll().forEach((cookie) => {
    nextResponse.cookies.set(cookie.name, cookie.value)
  })

  return nextResponse
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let response: NextResponse

  if (pathname.startsWith('/admin') || pathname === '/auth/login') {
    response = await handleProtectedAuthRoutes(request)
  } else {
    response = await updateSession(request)
  }

  if (response.headers.get('Location')) {
    return response
  }

  return withTenantHeader(request, response)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
