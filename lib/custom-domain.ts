export const VERCEL_CNAME_TARGET =
  process.env.VERCEL_CNAME_TARGET?.trim() || 'cname.vercel-dns.com'

export const VERCEL_APEX_IP = process.env.VERCEL_APEX_IP?.trim() || '76.76.21.21'

export const PLATFORM_DOMAIN =
  process.env.NEXT_PUBLIC_PLATFORM_DOMAIN?.trim().toLowerCase() || 'vendamas.com.ar'

const DOMAIN_REGEX =
  /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/

export function normalizeHostname(hostname: string): string {
  return hostname.split(':')[0].toLowerCase()
}

export function normalizeCustomDomain(input: string): string | null {
  let value = input.trim().toLowerCase()
  value = value.replace(/^https?:\/\//, '')
  value = value.replace(/\/.*$/, '')
  value = value.replace(/\.$/, '')
  value = value.replace(/^www\./, '')

  if (!value || !DOMAIN_REGEX.test(value)) {
    return null
  }

  return value
}

export function generateDomainVerificationToken(): string {
  return crypto.randomUUID().replace(/-/g, '')
}

export function getDomainTxtHost(domain: string): string {
  return `_vendamas.${domain}`
}

export function getDomainTxtValue(token: string): string {
  return `vendamas-verify=${token}`
}

export function isLocalhost(hostname: string): boolean {
  const host = normalizeHostname(hostname)
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
}

export function isPlatformHostname(hostname: string): boolean {
  const host = normalizeHostname(hostname)

  if (isLocalhost(host)) {
    return true
  }

  if (host.endsWith('.vercel.app')) {
    return true
  }

  const platform = PLATFORM_DOMAIN

  if (host === platform || host === `www.${platform}`) {
    return true
  }

  if (host.endsWith(`.${platform}`)) {
    return true
  }

  return false
}

export function isReservedPlatformDomain(domain: string): boolean {
  const normalized = normalizeCustomDomain(domain)

  if (!normalized) {
    return true
  }

  const platform = PLATFORM_DOMAIN

  if (normalized === platform || normalized === `www.${platform}`) {
    return true
  }

  if (normalized.endsWith(`.${platform}`)) {
    return true
  }

  if (normalized.endsWith('.vercel.app')) {
    return true
  }

  return false
}
