export type StorefrontStore = {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  heroImageUrl: string | null
  description: string | null
  freeShippingThreshold: number
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
