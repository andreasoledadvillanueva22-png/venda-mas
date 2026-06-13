import type { User } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateUniqueStoreSlug } from '@/lib/slug'

type OnboardingInput = {
  fullName: string
  storeName: string
}

type OnboardingResult =
  | { success: true; storeId: string; slug: string }
  | { success: false; error: string }

export function getOnboardingDataFromUser(user: User): OnboardingInput | null {
  const fullName =
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    (user.user_metadata?.name as string | undefined)?.trim()

  const storeName = (user.user_metadata?.store_name as string | undefined)?.trim()

  if (!fullName || !storeName) {
    return null
  }

  return { fullName, storeName }
}

export async function completeUserOnboarding(
  user: User,
  input?: Partial<OnboardingInput>,
): Promise<OnboardingResult> {
  if (!user.email) {
    return { success: false, error: 'El usuario no tiene email asociado' }
  }

  const metadata = getOnboardingDataFromUser(user)
  const fullName = input?.fullName?.trim() || metadata?.fullName
  const storeName = input?.storeName?.trim() || metadata?.storeName

  if (!fullName || !storeName) {
    return { success: false, error: 'Datos de onboarding incompletos' }
  }

  const admin = createAdminClient()

  const { data: existingStore } = await admin
    .from('stores')
    .select('id, slug')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (existingStore) {
    return {
      success: true,
      storeId: existingStore.id,
      slug: existingStore.slug,
    }
  }

  const slug = await generateUniqueStoreSlug(admin, storeName)

  const { error: profileError } = await admin.from('profiles').upsert(
    {
      id: user.id,
      email: user.email,
      full_name: fullName,
      store_name: storeName,
      store_slug: slug,
      role: 'owner',
    },
    { onConflict: 'id' },
  )

  if (profileError) {
    console.error('Error creando perfil:', profileError)
    return { success: false, error: 'No se pudo crear el perfil' }
  }

  const { data: store, error: storeError } = await admin
    .from('stores')
    .insert({
      owner_id: user.id,
      name: storeName,
      slug,
    })
    .select('id, slug')
    .single()

  if (storeError) {
    console.error('Error creando tienda:', storeError)
    return { success: false, error: 'No se pudo crear la tienda' }
  }

  return {
    success: true,
    storeId: store.id,
    slug: store.slug,
  }
}
