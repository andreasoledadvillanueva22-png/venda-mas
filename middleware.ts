import { updateSession } from '@/lib/supabase/proxy'
import { isPlatformHostname, PLATFORM_DOMAIN } from '@/lib/custom-domain'
import { getStoreByCustomDomain, getStoreBySlug, getTenantFromHost } from '@/lib/tenant'
import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type StoredCookie = {
  name: string
  value: string
  options: CookieOptions
}

const CUSTOM_DOMAIN_STOREFRONT_REWRITES: Record<string, string> = {
  '/': '/storefront',
  '/products': '/storefront/products',
  '/cart': '/storefront/cart',
  '/checkout': '/storefront/checkout',
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

function getPlatformBaseUrl(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (configured) {
    return configured.replace(/\/$/, '')
  }

  const vercelUrl = process.env.VERCEL_URL?.trim()

  if (vercelUrl) {
    return `https://${vercelUrl}`
  }

  return `${request.nextUrl.protocol}//${PLATFORM_DOMAIN}`
}

function rewriteCustomDomainPath(pathname: string): string | null {
  if (pathname.startsWith('/storefront')) {
    return null
  }

  const mappedPath = CUSTOM_DOMAIN_STOREFRONT_REWRITES[pathname]

  if (mappedPath) {
    return mappedPath
  }

  if (pathname.startsWith('/product/')) {
    return `/storefront${pathname}`
  }

  return null
}

function applyCookies(from: NextResponse, to: NextResponse): NextResponse {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value)
  })

  return to
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
  const hostname = request.nextUrl.hostname
  const pathname = request.nextUrl.pathname

  if (!isPlatformHostname(hostname)) {
    const store = await getStoreByCustomDomain(hostname)

    if (store) {
      if (pathname.startsWith('/admin') || pathname.startsWith('/auth')) {
        const redirectUrl = new URL(pathname, getPlatformBaseUrl(request))
        redirectUrl.search = request.nextUrl.search
        const redirectResponse = NextResponse.redirect(redirectUrl)
        return applyCookies(response, redirectResponse)
      }

      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-store-id', store.id)
      requestHeaders.set('x-custom-domain', '1')

      const rewrittenPath = rewriteCustomDomainPath(pathname)

      if (rewrittenPath) {
        const rewriteUrl = request.nextUrl.clone()
        rewriteUrl.pathname = rewrittenPath

        const rewriteResponse = NextResponse.rewrite(rewriteUrl, {
          request: { headers: requestHeaders },
        })

        return applyCookies(response, rewriteResponse)
      }

      const nextResponse = NextResponse.next({
        request: { headers: requestHeaders },
      })

      return applyCookies(response, nextResponse)
    }
  }

  const slug = getTenantFromHost(hostname)

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

  return applyCookies(response, nextResponse)
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
