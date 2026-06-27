export type StorefrontStore = {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  heroImageUrl: string | null
  description: string | null
  freeShippingThreshold: number
  footerEmail: string | null
  footerPhone: string | null
  footerAddress: string | null
  footerWhatsapp: string | null
  footerInstagram: string | null
  footerFacebook: string | null
}

export type StorefrontTestimonial = {
  id: string
  customerName: string
  customerLocation: string | null
  productName: string | null
  rating: number
  comment: string
}

export function storefrontHref(path: string, storeSlug: string | null | undefined): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (!storeSlug?.trim()) {
    return normalizedPath
  }

  const [pathname, existingQuery = ''] = normalizedPath.split('?')
  const params = new URLSearchParams(existingQuery)
  params.set('store', storeSlug.trim())

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

export function buildWhatsappUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : '#'
}

export function normalizeSocialUrl(value: string, fallbackPrefix: string): string {
  const trimmed = value.trim()
  if (!trimmed) return '#'
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  if (trimmed.startsWith('@')) {
    return `${fallbackPrefix}${trimmed.slice(1)}`
  }
  return `${fallbackPrefix}${trimmed}`
}
