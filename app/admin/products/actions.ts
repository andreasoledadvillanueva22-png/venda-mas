'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type ActionResult = {
  success?: boolean
  error?: string
  message?: string
  newStatus?: boolean
}

type DbProductRow = {
  id: string
  store_id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null
  category: string | null
  stock: number
  sku: string | null
  images: string[] | null
  tags: string[] | null
  video_url: string | null
  featured: boolean
  active: boolean
}

function slugifyProductName(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)

  return slug || 'producto'
}

async function generateUniqueProductSlug(
  storeId: string,
  productName: string,
): Promise<string> {
  const admin = createAdminClient()
  const base = slugifyProductName(productName)
  let slug = base
  let counter = 0

  while (true) {
    const { data } = await admin
      .from('products')
      .select('id')
      .eq('store_id', storeId)
      .eq('slug', slug)
      .maybeSingle()

    if (!data) {
      return slug
    }

    counter += 1
    slug = `${base}-${counter}`
  }
}

async function verifyOwnedProduct(
  productId: string,
  storeId: string,
): Promise<DbProductRow | null> {
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
    .select('id')
    .eq('id', storeId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store) {
    return null
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return null
  }

  const { data: product, error: productError } = await admin
    .from('products')
    .select(
      'id, store_id, name, slug, description, price, compare_at_price, category, stock, sku, images, tags, video_url, featured, active',
    )
    .eq('id', productId)
    .eq('store_id', storeId)
    .maybeSingle()

  if (productError || !product) {
    return null
  }

  return product as DbProductRow
}

export async function duplicateProduct(
  productId: string,
  storeId: string,
): Promise<ActionResult> {
  const original = await verifyOwnedProduct(productId, storeId)

  if (!original) {
    return { error: 'No se pudo encontrar el producto o no tenés permiso.' }
  }

  try {
    const admin = createAdminClient()
    const copyName = `${original.name} (copia)`
    const slug = await generateUniqueProductSlug(storeId, copyName)

    const { error: insertError } = await admin.from('products').insert({
      store_id: storeId,
      name: copyName,
      slug,
      description: original.description,
      price: original.price,
      compare_at_price: original.compare_at_price,
      category: original.category,
      stock: original.stock,
      sku: original.sku,
      images: original.images ?? [],
      tags: original.tags ?? [],
      video_url: original.video_url,
      featured: false,
      active: false,
    })

    if (insertError) {
      console.error('[duplicateProduct]', insertError)
      return { error: insertError.message || 'No se pudo duplicar el producto.' }
    }

    revalidatePath('/admin/products')
    return { success: true, message: 'Producto duplicado correctamente' }
  } catch (error) {
    console.error('[duplicateProduct]', error)
    return { error: 'No se pudo duplicar el producto.' }
  }
}

export async function toggleProductStatus(
  productId: string,
  storeId: string,
): Promise<ActionResult> {
  const product = await verifyOwnedProduct(productId, storeId)

  if (!product) {
    return { error: 'No se pudo encontrar el producto o no tenés permiso.' }
  }

  const nextStatus = !product.active

  try {
    const admin = createAdminClient()
    const { error: updateError } = await admin
      .from('products')
      .update({ active: nextStatus })
      .eq('id', productId)
      .eq('store_id', storeId)

    if (updateError) {
      console.error('[toggleProductStatus]', updateError)
      return { error: updateError.message || 'No se pudo cambiar el estado del producto.' }
    }

    revalidatePath('/admin/products')
    return {
      success: true,
      newStatus: nextStatus,
      message: nextStatus ? 'Producto activado' : 'Producto desactivado',
    }
  } catch (error) {
    console.error('[toggleProductStatus]', error)
    return { error: 'No se pudo cambiar el estado del producto.' }
  }
}

export async function deleteProduct(
  productId: string,
  storeId: string,
): Promise<ActionResult> {
  const product = await verifyOwnedProduct(productId, storeId)

  if (!product) {
    return { error: 'No se pudo encontrar el producto o no tenés permiso.' }
  }

  try {
    const admin = createAdminClient()
    const { error: deleteError } = await admin
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('store_id', storeId)

    if (deleteError) {
      console.error('[deleteProduct]', deleteError)
      return { error: deleteError.message || 'No se pudo eliminar el producto.' }
    }

    revalidatePath('/admin/products')
    return { success: true, message: 'Producto eliminado' }
  } catch (error) {
    console.error('[deleteProduct]', error)
    return { error: 'No se pudo eliminar el producto.' }
  }
}
