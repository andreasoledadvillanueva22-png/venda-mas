import { createClient } from '@/lib/supabase/server'

export type OwnerStore = {
  id: string
  name: string
  slug: string
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

  return store as OwnerStore
}
