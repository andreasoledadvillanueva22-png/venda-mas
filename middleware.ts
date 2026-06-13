import { updateSession } from '@/lib/supabase/proxy'
import { getStoreBySlug, getTenantFromHost } from '@/lib/tenant'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function copySupabaseCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value)
  })
}

async function handleProtectedAuthRoutes(request: NextRequest): Promise<NextResponse> {
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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
    copySupabaseCookies(supabaseResponse, redirectResponse)
    return redirectResponse
  }

  if (pathname === '/auth/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    const redirectResponse = NextResponse.redirect(url)
    copySupabaseCookies(supabaseResponse, redirectResponse)
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

  copySupabaseCookies(response, nextResponse)
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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
