import type { SupabaseClient } from '@supabase/supabase-js'

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
