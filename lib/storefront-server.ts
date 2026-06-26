import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getStoreBySlug } from '@/lib/tenant'
import type { StorefrontStore } from '@/lib/storefront'

const STOREFRONT_STORE_SELECT =
  'id, name, slug, logo_url, hero_image_url, description, free_shipping_threshold'

function normalizeOptionalUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function mapStoreRow(store: {
  id: string
  name: string
  slug: string
  logo_url: string | null
  hero_image_url: string | null
  description: string | null
  free_shipping_threshold: number | null
}): StorefrontStore {
  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    logoUrl: normalizeOptionalUrl(store.logo_url),
    heroImageUrl: normalizeOptionalUrl(store.hero_image_url),
    description: store.description?.trim() || null,
    freeShippingThreshold: Number(store.free_shipping_threshold ?? 50000),
  }
}

async function fetchStoreById(storeId: string): Promise<StorefrontStore | null> {
  const supabase = await createClient()
  const { data: store, error } = await supabase
    .from('stores')
    .select(STOREFRONT_STORE_SELECT)
    .eq('id', storeId)
    .maybeSingle()

  if (error || !store) {
    return null
  }

  return mapStoreRow(store)
}

export async function fetchStorefrontStoreBySlug(
  slug: string,
): Promise<StorefrontStore | null> {
  const store = await getStoreBySlug(slug)

  if (!store) {
    return null
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('stores')
    .select(STOREFRONT_STORE_SELECT)
    .eq('id', store.id)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return mapStoreRow(data)
}

export async function resolveStorefrontStore(
  storeSlugFromQuery?: string,
): Promise<StorefrontStore | null> {
  const slug = storeSlugFromQuery?.trim()

  if (slug) {
    return fetchStorefrontStoreBySlug(slug)
  }

  const headersList = await headers()
  const storeIdFromHeader = headersList.get('x-store-id')?.trim()
  const storeSlugFromHeader = headersList.get('x-store-slug')?.trim()

  if (storeSlugFromHeader) {
    return fetchStorefrontStoreBySlug(storeSlugFromHeader)
  }

  if (storeIdFromHeader) {
    return fetchStoreById(storeIdFromHeader)
  }

  return null
}

export async function getStoreCategories(storeId: string): Promise<string[]> {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('category')
    .eq('store_id', storeId)
    .eq('active', true)
    .not('category', 'is', null)

  if (error || !products) {
    return []
  }

  const categories = new Set<string>()

  for (const product of products) {
    const category = product.category?.trim()
    if (category) {
      categories.add(category)
    }
  }

  return Array.from(categories).sort((a, b) => a.localeCompare(b, 'es'))
}
