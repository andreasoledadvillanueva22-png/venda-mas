export function formatSharePrice(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}

export function toAbsoluteMediaUrl(url: string, origin: string): string {
  const trimmed = url.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  const normalizedOrigin = origin.replace(/\/$/, '')
  return trimmed.startsWith('/') ? `${normalizedOrigin}${trimmed}` : `${normalizedOrigin}/${trimmed}`
}

export function buildShareMessage(
  productName: string,
  formattedPrice: string,
  storeName: string,
): string {
  return `${productName} - ${formattedPrice} | ${storeName}`
}

export function buildProductSharePath(productId: string, storeSlug?: string | null): string {
  const params = new URLSearchParams()

  if (storeSlug?.trim()) {
    params.set('store', storeSlug.trim())
  }

  const query = params.toString()
  return query
    ? `/storefront/product/${productId}?${query}`
    : `/storefront/product/${productId}`
}

export function buildProductShareUrl(
  origin: string,
  productId: string,
  storeSlug?: string | null,
): string {
  const normalizedOrigin = origin.replace(/\/$/, '')
  return `${normalizedOrigin}${buildProductSharePath(productId, storeSlug)}`
}

export function buildWhatsappShareUrl(message: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${message}\n${url}`)}`
}

export function buildFacebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
}

export function buildTwitterShareUrl(message: string, url: string): string {
  const params = new URLSearchParams({
    text: message,
    url,
  })
  return `https://twitter.com/intent/tweet?${params.toString()}`
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined') {
    return false
  }

  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}
