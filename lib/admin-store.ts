import { createClient } from '@/lib/supabase/server'

const MAX_STORE_INITIALS = 3

export function getStoreInitials(storeName: string): string {
  const words = storeName.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return 'VM'
  }

  if (words.length >= 2) {
    const initials = words
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('')

    return initials.slice(0, MAX_STORE_INITIALS) || 'VM'
  }

  const singleWordInitials = words[0].slice(0, MAX_STORE_INITIALS).toUpperCase()
  return singleWordInitials.length > 0 ? singleWordInitials : 'VM'
}

export type OwnerStore = {
  id: string
  name: string
  slug: string
  initials: string
}

export type AdminLayoutData = {
  storeName: string
  storeSlug: string
  brandInitials: string
  userEmail: string
  userFullName: string | null
  ordersCount: number
}

export async function getOwnerStore(): Promise<OwnerStore | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, name, slug')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store) {
    return null
  }

  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    initials: getStoreInitials(store.name),
  }
}

export async function getAdminLayoutData(): Promise<AdminLayoutData | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user || !user.email) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, name, slug')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store) {
    return null
  }

  const { count, error: countError } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('store_id', store.id)

  if (countError) {
    return null
  }

  const ownerFullName = profile?.full_name?.trim() || null

  return {
    storeName: store.name,
    storeSlug: store.slug,
    brandInitials: getStoreInitials(store.name),
    userEmail: user.email,
    userFullName: ownerFullName,
    ordersCount: count ?? 0,
  }
}
