import { createClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

const PLATFORM_DOMAIN =
  process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? 'vendamas.com.ar'

const RESERVED_PATH_SEGMENTS = new Set([
  'admin',
  'auth',
  'api',
  '_next',
  'storefront',
  'favicon.ico',
])

export type Store = {
  id: string
  owner_id: string
  name: string
  slug: string
  domain: string | null
  logo_url: string | null
  description: string | null
  primary_color: string
  secondary_color: string
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

function normalizeHostname(hostname: string): string {
  return hostname.split(':')[0].toLowerCase()
}

function isLocalhost(hostname: string): boolean {
  const host = normalizeHostname(hostname)
  return host === 'localhost' || host === '127.0.0.1'
}

export function getTenantFromHost(hostname: string): string | null {
  const host = normalizeHostname(hostname)

  if (isLocalhost(host)) {
    return null
  }

  const apexDomain = PLATFORM_DOMAIN.toLowerCase()

  if (host === apexDomain || host === `www.${apexDomain}`) {
    return null
  }

  const suffix = `.${apexDomain}`

  if (!host.endsWith(suffix)) {
    return null
  }

  const subdomain = host.slice(0, -suffix.length)

  if (!subdomain || subdomain === 'www') {
    return null
  }

  return subdomain
}

function getTenantFromPath(pathname: string): string | null {
  const [firstSegment] = pathname.split('/').filter(Boolean)

  if (!firstSegment || RESERVED_PATH_SEGMENTS.has(firstSegment)) {
    return null
  }

  return firstSegment
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const supabase = await createClient()

  const { data: store, error } = await supabase
    .from('stores')
    .select(
      'id, owner_id, name, slug, domain, logo_url, description, primary_color, secondary_color, settings, created_at, updated_at',
    )
    .eq('slug', slug)
    .maybeSingle()

  if (error || !store) {
    return null
  }

  return store as Store
}

export async function getCurrentStore(request: NextRequest): Promise<Store | null> {
  const hostname = request.nextUrl.hostname
  let slug = getTenantFromHost(hostname)

  if (!slug && isLocalhost(hostname)) {
    slug = getTenantFromPath(request.nextUrl.pathname)
  }

  if (!slug) {
    return null
  }

  return getStoreBySlug(slug)
}
