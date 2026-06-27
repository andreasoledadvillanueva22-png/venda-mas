import type { SupabaseClient } from '@supabase/supabase-js'

export const STORE_SLUG_MIN_LENGTH = 3
export const STORE_SLUG_MAX_LENGTH = 50
export const STORE_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type StoreSlugValidationResult =
  | { valid: true; slug: string }
  | { valid: false; error: string }

export function validateStoreSlug(raw: string): StoreSlugValidationResult {
  const slug = raw.trim().toLowerCase()

  if (!slug) {
    return { valid: false, error: 'El slug no puede estar vacío.' }
  }

  if (slug.length < STORE_SLUG_MIN_LENGTH) {
    return { valid: false, error: `El slug debe tener al menos ${STORE_SLUG_MIN_LENGTH} caracteres.` }
  }

  if (slug.length > STORE_SLUG_MAX_LENGTH) {
    return { valid: false, error: `El slug no puede superar ${STORE_SLUG_MAX_LENGTH} caracteres.` }
  }

  if (!STORE_SLUG_REGEX.test(slug)) {
    return {
      valid: false,
      error: 'Solo se permiten minúsculas, números y guiones (sin espacios ni caracteres especiales).',
    }
  }

  return { valid: true, slug }
}

export async function isStoreSlugTaken(
  supabase: SupabaseClient,
  slug: string,
  excludeStoreId?: string,
): Promise<boolean> {
  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (!store) {
    return false
  }

  if (excludeStoreId && store.id === excludeStoreId) {
    return false
  }

  return true
}

export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)

  return slug || 'tienda'
}

export async function generateUniqueStoreSlug(
  supabase: SupabaseClient,
  storeName: string,
): Promise<string> {
  const base = slugify(storeName)
  let slug = base
  let counter = 0

  while (true) {
    const { data } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (!data) {
      return slug
    }

    counter += 1
    slug = `${base}-${counter}`
  }
}
