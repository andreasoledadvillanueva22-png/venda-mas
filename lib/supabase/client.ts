import { createBrowserClient } from '@supabase/ssr'

let browserClient: ReturnType<typeof createBrowserClient> | undefined

export function getSiteOrigin(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.location.origin
}

export function buildAuthCallbackUrl(nextPath = '/admin'): string {
  const origin = getSiteOrigin()

  if (!origin) {
    return `/auth/callback?next=${encodeURIComponent(nextPath)}`
  }

  const params = new URLSearchParams({ next: nextPath })
  return `${origin}/auth/callback?${params.toString()}`
}

export function buildAbsoluteRedirectUrl(path: string): string {
  const origin = getSiteOrigin()

  if (!origin) {
    return path
  }

  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

export function createClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return document.cookie.split('; ').filter(Boolean).map((cookie) => {
              const separatorIndex = cookie.indexOf('=')
              const name = cookie.slice(0, separatorIndex)
              const value = cookie.slice(separatorIndex + 1)
              return { name, value: decodeURIComponent(value) }
            })
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              const parts = [`${name}=${encodeURIComponent(value)}`, `path=${options?.path ?? '/'}`]

              if (options?.maxAge !== undefined) {
                parts.push(`max-age=${options.maxAge}`)
              }

              const sameSite = options?.sameSite ?? 'lax'
              parts.push(`SameSite=${sameSite}`)

              const isSecure =
                options?.secure === true || window.location.protocol === 'https:'

              if (isSecure) {
                parts.push('Secure')
              }

              document.cookie = parts.join('; ')

              console.log('[supabase/client] cookie set', {
                name,
                origin: window.location.origin,
                secure: isSecure,
                sameSite,
              })
            })
          },
        },
      },
    )
  }

  return browserClient
}
