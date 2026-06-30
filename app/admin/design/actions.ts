'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { HomepageConfig, ThemeColors } from '@/lib/store-design'

type SaveDesignInput = {
  storeId: string
  themeId: string
  colors: ThemeColors
  homepage: HomepageConfig
  pagesConfig: Record<string, unknown>
  fontHeading: string
  fontBody: string
  baseFontSize: number
}

async function verifyStoreOwner(storeId: string) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('id', storeId)
    .eq('owner_id', user.id)
    .maybeSingle()

  return store?.id ?? null
}

export async function saveStoreDesignSettings(
  input: SaveDesignInput,
): Promise<{ error?: string; success?: boolean }> {
  const ownedStoreId = await verifyStoreOwner(input.storeId)

  if (!ownedStoreId) {
    return { error: 'No tenés permiso para editar esta tienda.' }
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return { error: 'Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor.' }
  }

  const payload = {
    store_id: ownedStoreId,
    theme_id: input.themeId,
    theme_colors: input.colors,
    homepage_config: input.homepage,
    pages_config: input.pagesConfig,
    font_heading: input.fontHeading,
    font_body: input.fontBody,
    base_font_size: input.baseFontSize,
    updated_at: new Date().toISOString(),
  }

  const { error } = await admin.from('store_design_settings').upsert(payload, {
    onConflict: 'store_id',
  })

  if (error) {
    console.error('[saveStoreDesignSettings]', error)
    return { error: error.message || 'No se pudo guardar la configuración de diseño.' }
  }

  revalidatePath('/admin/design')
  revalidatePath('/storefront', 'layout')
  return { success: true }
}

export async function loadStoreDesignSettings(storeId: string) {
  const ownedStoreId = await verifyStoreOwner(storeId)
  if (!ownedStoreId) {
    return null
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return null
  }

  const { data } = await admin
    .from('store_design_settings')
    .select(
      'theme_id, theme_colors, homepage_config, pages_config, font_heading, font_body, base_font_size',
    )
    .eq('store_id', ownedStoreId)
    .maybeSingle()

  return data
}
