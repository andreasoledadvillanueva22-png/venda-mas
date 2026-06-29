import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getStoreBySlug } from '@/lib/tenant'
import type {
  StorefrontProductReview,
  StorefrontRecentPurchase,
  StorefrontStore,
  StorefrontTestimonial,
} from '@/lib/storefront'
import { isLikelyDirectImageUrl } from '@/lib/storefront'

const STOREFRONT_STORE_SELECT =
  'id, name, slug, logo_url, favicon_url, hero_image_url, description, free_shipping_threshold, footer_email, footer_phone, footer_address, footer_whatsapp, footer_instagram, footer_facebook'

function normalizeOptionalText(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function normalizeOptionalUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function normalizeHeroImageUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) {
    return null
  }
  return isLikelyDirectImageUrl(trimmed) ? trimmed : null
}

function normalizeFaviconUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) {
    return null
  }
  return isLikelyDirectImageUrl(trimmed) ? trimmed : null
}

function mapStoreRow(store: {
  id: string
  name: string
  slug: string
  logo_url: string | null
  favicon_url: string | null
  hero_image_url: string | null
  description: string | null
  free_shipping_threshold: number | null
  footer_email: string | null
  footer_phone: string | null
  footer_address: string | null
  footer_whatsapp: string | null
  footer_instagram: string | null
  footer_facebook: string | null
}): StorefrontStore {
  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    logoUrl: normalizeOptionalUrl(store.logo_url),
    faviconUrl: normalizeFaviconUrl(store.favicon_url),
    heroImageUrl: normalizeHeroImageUrl(store.hero_image_url),
    description: normalizeOptionalText(store.description),
    freeShippingThreshold: Number(store.free_shipping_threshold ?? 50000),
    footerEmail: normalizeOptionalText(store.footer_email),
    footerPhone: normalizeOptionalText(store.footer_phone),
    footerAddress: normalizeOptionalText(store.footer_address),
    footerWhatsapp: normalizeOptionalText(store.footer_whatsapp),
    footerInstagram: normalizeOptionalText(store.footer_instagram),
    footerFacebook: normalizeOptionalText(store.footer_facebook),
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

  return fetchStoreById(store.id)
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

export async function getStoreTestimonials(storeId: string): Promise<StorefrontTestimonial[]> {
  const supabase = await createClient()

  const { data: rows, error } = await supabase
    .from('testimonials')
    .select('id, customer_name, customer_location, product_name, rating, comment')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error || !rows) {
    return []
  }

  return rows.map((row) => ({
    id: row.id,
    customerName: row.customer_name,
    customerLocation: row.customer_location?.trim() || null,
    productName: row.product_name?.trim() || null,
    rating: Number(row.rating ?? 5),
    comment: row.comment,
  }))
}

function getCustomerFirstName(fullName: string): string {
  const firstName = fullName.trim().split(/\s+/)[0]
  return firstName || 'Alguien'
}

export async function getRecentPurchaseNotifications(
  storeId: string,
  limit = 10,
): Promise<StorefrontRecentPurchase[]> {
  const supabase = await createClient()

  const { data: rows, error } = await supabase
    .from('fake_purchase_notifications')
    .select('id, customer_name, customer_city, product_name, minutes_ago')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !rows) {
    return []
  }

  return rows.map((row) => ({
    id: row.id,
    customerFirstName: getCustomerFirstName(row.customer_name),
    customerCity: row.customer_city.trim(),
    productName: row.product_name.trim(),
    minutesAgo: Math.max(1, Number(row.minutes_ago) || 5),
  }))
}

export async function getProductReviews(
  productId: string,
  storeId: string,
): Promise<StorefrontProductReview[]> {
  const supabase = await createClient()

  const { data: rows, error } = await supabase
    .from('product_reviews')
    .select('id, customer_name, rating, comment, source, source_url')
    .eq('product_id', productId)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  if (error || !rows) {
    return []
  }

  return rows.map((row) => ({
    id: row.id,
    customerName: row.customer_name,
    rating: Number(row.rating ?? 5),
    comment: row.comment,
    source: row.source as StorefrontProductReview['source'],
    sourceUrl: row.source_url?.trim() || null,
  }))
}
