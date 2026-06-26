import { createClient } from '@/lib/supabase/server'
import {
  isLocalhost,
  isPlatformHostname,
  normalizeHostname,
  PLATFORM_DOMAIN,
} from '@/lib/custom-domain'
import type { NextRequest } from 'next/server'

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
  custom_domain: string | null
  domain_verified: boolean
  logo_url: string | null
  description: string | null
  primary_color: string
  secondary_color: string
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

const STORE_SELECT_FIELDS =
  'id, owner_id, name, slug, domain, custom_domain, domain_verified, logo_url, description, primary_color, secondary_color, settings, created_at, updated_at'

function getTenantFromPath(pathname: string): string | null {
  const [firstSegment] = pathname.split('/').filter(Boolean)

  if (!firstSegment || RESERVED_PATH_SEGMENTS.has(firstSegment)) {
    return null
  }

  return firstSegment
}

export function getTenantFromHost(hostname: string): string | null {
  const host = normalizeHostname(hostname)

  if (isLocalhost(host)) {
    return null
  }

  const apexDomain = PLATFORM_DOMAIN

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

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const supabase = await createClient()

  const { data: store, error } = await supabase
    .from('stores')
    .select(STORE_SELECT_FIELDS)
    .eq('slug', slug)
    .maybeSingle()

  if (error || !store) {
    return null
  }

  return store as Store
}

export async function getStoreByCustomDomain(hostname: string): Promise<Store | null> {
  const host = normalizeHostname(hostname)
  const candidates = [host]

  if (host.startsWith('www.')) {
    candidates.push(host.slice(4))
  } else {
    candidates.push(`www.${host}`)
  }

  const supabase = await createClient()

  for (const candidate of candidates) {
    const apexCandidate = candidate.startsWith('www.') ? candidate.slice(4) : candidate

    const { data: store, error } = await supabase
      .from('stores')
      .select(STORE_SELECT_FIELDS)
      .eq('custom_domain', apexCandidate)
      .eq('domain_verified', true)
      .maybeSingle()

    if (!error && store) {
      return store as Store
    }
  }

  return null
}

export async function resolveStoreFromRequest(
  request: NextRequest,
): Promise<Store | null> {
  const hostname = request.nextUrl.hostname

  if (!isPlatformHostname(hostname)) {
    const storeByDomain = await getStoreByCustomDomain(hostname)

    if (storeByDomain) {
      return storeByDomain
    }
  }

  let slug = getTenantFromHost(hostname)

  if (!slug && isLocalhost(hostname)) {
    slug = getTenantFromPath(request.nextUrl.pathname)
  }

  if (!slug) {
    return null
  }

  return getStoreBySlug(slug)
}

export async function getCurrentStore(request: NextRequest): Promise<Store | null> {
  return resolveStoreFromRequest(request)
}

export { isPlatformHostname, isLocalhost, normalizeHostname, PLATFORM_DOMAIN }
