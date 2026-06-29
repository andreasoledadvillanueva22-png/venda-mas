import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/server'
import {
  generateDomainVerificationToken,
  getDomainTxtHost,
  getDomainTxtValue,
  isReservedPlatformDomain,
  normalizeCustomDomain,
  VERCEL_APEX_IP,
  VERCEL_CNAME_TARGET,
} from '@/lib/custom-domain'
import {
  registerDomainWithVercel,
  removeDomainFromVercel,
  verifyDomainDns,
} from '@/lib/domain-verification'
import { cn } from '@/lib/utils'
import { isStoreSlugTaken, validateStoreSlug } from '@/lib/slug'
import { StoreSlugField } from '@/components/admin/store-slug-field'
import Link from 'next/link'

type DbProfile = {
  id: string
  email: string
  full_name: string | null
}

type DbStore = {
  id: string
  owner_id: string
  name: string
  slug: string
  logo_url: string | null
  favicon_url: string | null
  hero_image_url: string | null
  description: string | null
  primary_color: string | null
  secondary_color: string | null
  mp_access_token: string | null
  mp_public_key: string | null
  mp_user_id: string | null
  free_shipping_threshold: number | null
  shipping_standard_cost: number | null
  shipping_express_cost: number | null
  free_shipping_enabled: boolean | null
  enable_local_pickup: boolean | null
  pickup_address: string | null
  pickup_instructions: string | null
  pickup_schedule: string | null
  bank_name: string | null
  cbu: string | null
  alias: string | null
  account_holder: string | null
  cuit: string | null
  custom_domain: string | null
  domain_verified: boolean | null
  domain_verification_token: string | null
  footer_email: string | null
  footer_phone: string | null
  footer_address: string | null
  footer_whatsapp: string | null
  footer_instagram: string | null
  footer_facebook: string | null
}

type DbTestimonial = {
  id: string
  customer_name: string
  customer_location: string | null
  product_name: string | null
  rating: number | null
  comment: string
  created_at: string
}

type DbFakePurchaseNotification = {
  id: string
  customer_name: string
  customer_city: string
  product_name: string
  minutes_ago: number
  is_active: boolean
  created_at: string
}

type SettingsData = {
  email: string
  profile: DbProfile
  store: DbStore
  testimonials: DbTestimonial[]
  fakePurchaseNotifications: DbFakePurchaseNotification[]
}

type SettingsPageProps = {
  searchParams: Promise<{
    saved?: string
    error?: string
    mp_saved?: string
    mp_deleted?: string
    mp_credentials_error?: string
    confirm_delete_mp?: string
    shipping_saved?: string
    shipping_error?: string
    pickup_saved?: string
    pickup_error?: string
    bank_saved?: string
    bank_error?: string
    domain_saved?: string
    domain_verified_msg?: string
    domain_removed?: string
    domain_error?: string
    hero_saved?: string
    hero_error?: string
    footer_saved?: string
    footer_error?: string
    testimonial_saved?: string
    testimonial_error?: string
    testimonial_deleted?: string
    fake_notification_saved?: string
    fake_notification_error?: string
    fake_notification_deleted?: string
  }>
}

const DEFAULT_PRIMARY_COLOR = '#DC2626'
const DEFAULT_SECONDARY_COLOR = '#16A34A'
const DEFAULT_FREE_SHIPPING_THRESHOLD = 50000
const DEFAULT_SHIPPING_STANDARD_COST = 5000
const DEFAULT_SHIPPING_EXPRESS_COST = 8500
const MAX_FAKE_PURCHASE_NOTIFICATIONS = 10

function normalizeHexColor(value: string, fallback: string): string {
  const normalized = value.trim()

  if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
    return normalized.toUpperCase()
  }

  return fallback
}

function maskMercadoPagoCredential(value: string | null): string {
  if (!value?.trim()) {
    return 'No configurado'
  }

  if (value.length <= 12) {
    return 'APP_USR-xxxxxxxx'
  }

  return `${value.slice(0, 8)}${'x'.repeat(8)}`
}

function isValidMercadoPagoCredential(value: string): boolean {
  const normalized = value.trim()
  return normalized.startsWith('APP_USR-') || normalized.startsWith('TEST-')
}

function parseShippingAmount(
  value: FormDataEntryValue | null,
  fieldLabel: string,
): { value: number } | { error: string } {
  if (typeof value !== 'string' || !value.trim()) {
    return { error: `${fieldLabel} es obligatorio.` }
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return { error: `${fieldLabel} debe ser un número mayor o igual a cero.` }
  }

  return { value: parsed }
}

function parseRequiredBankField(
  value: FormDataEntryValue | null,
  fieldLabel: string,
): { value: string } | { error: string } {
  if (typeof value !== 'string' || !value.trim()) {
    return { error: `${fieldLabel} es obligatorio.` }
  }

  return { value: value.trim() }
}

function parseOptionalText(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed || null
}

function parseFakeNotificationMinutes(value: FormDataEntryValue | null): number {
  const parsed = Number(typeof value === 'string' ? value.trim() : '')
  if (Number.isNaN(parsed) || parsed < 1) {
    return 5
  }
  return Math.min(120, Math.floor(parsed))
}

function parseTestimonialRating(value: FormDataEntryValue | null): number {
  if (typeof value !== 'string' || !value.trim()) {
    return 5
  }

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    return 5
  }

  return parsed
}

async function verifyOwnedStore(storeId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { supabase, user: null, store: null as null }
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, owner_id')
    .eq('id', storeId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store || store.owner_id !== user.id) {
    return { supabase, user, store: null as null }
  }

  return { supabase, user, store }
}

async function getSettingsData(): Promise<SettingsData | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user || !user.email) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile) {
    return null
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select(
      'id, owner_id, name, slug, logo_url, favicon_url, hero_image_url, description, primary_color, secondary_color, mp_access_token, mp_public_key, mp_user_id, free_shipping_threshold, shipping_standard_cost, shipping_express_cost, free_shipping_enabled, enable_local_pickup, pickup_address, pickup_instructions, pickup_schedule, bank_name, cbu, alias, account_holder, cuit, custom_domain, domain_verified, domain_verification_token, footer_email, footer_phone, footer_address, footer_whatsapp, footer_instagram, footer_facebook',
    )
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store || store.owner_id !== user.id) {
    return null
  }

  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('id, customer_name, customer_location, product_name, rating, comment, created_at')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  const { data: fakePurchaseNotifications } = await supabase
    .from('fake_purchase_notifications')
    .select('id, customer_name, customer_city, product_name, minutes_ago, is_active, created_at')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  return {
    email: user.email,
    profile: profile as DbProfile,
    store: store as DbStore,
    testimonials: (testimonials ?? []) as DbTestimonial[],
    fakePurchaseNotifications: (fakePurchaseNotifications ?? []) as DbFakePurchaseNotification[],
  }
}

export async function saveSettings(formData: FormData): Promise<void> {
  'use server'

  const storeId = formData.get('storeId')
  const fullName = formData.get('fullName')
  const storeName = formData.get('storeName')
  const storeSlugRaw = formData.get('storeSlug')
  const description = formData.get('description')
  const logoUrl = formData.get('logoUrl')
  const faviconUrl = formData.get('faviconUrl')
  const primaryColor = formData.get('primaryColor')
  const secondaryColor = formData.get('secondaryColor')

  if (typeof storeId !== 'string' || !storeId.trim()) {
    redirect(`/admin/settings?error=${encodeURIComponent('No se pudo identificar la tienda.')}`)
  }

  if (typeof fullName !== 'string' || !fullName.trim()) {
    redirect(`/admin/settings?error=${encodeURIComponent('El nombre completo es obligatorio.')}`)
  }

  if (typeof storeName !== 'string' || !storeName.trim()) {
    redirect(`/admin/settings?error=${encodeURIComponent('El nombre de la tienda es obligatorio.')}`)
  }

  if (typeof storeSlugRaw !== 'string') {
    redirect(`/admin/settings?error=${encodeURIComponent('El slug de la tienda es obligatorio.')}`)
  }

  const slugValidation = validateStoreSlug(storeSlugRaw)

  if (!slugValidation.valid) {
    redirect(`/admin/settings?error=${encodeURIComponent(slugValidation.error)}`)
  }

  if (typeof primaryColor !== 'string' || typeof secondaryColor !== 'string') {
    redirect(`/admin/settings?error=${encodeURIComponent('Los colores no son válidos.')}`)
  }

  const normalizedPrimaryColor = normalizeHexColor(primaryColor, DEFAULT_PRIMARY_COLOR)
  const normalizedSecondaryColor = normalizeHexColor(secondaryColor, DEFAULT_SECONDARY_COLOR)

  const parsedDescription =
    typeof description === 'string' && description.trim() ? description.trim() : null

  const parsedLogoUrl =
    typeof logoUrl === 'string' && logoUrl.trim() ? logoUrl.trim() : null

  const parsedFaviconUrl =
    typeof faviconUrl === 'string' && faviconUrl.trim() ? faviconUrl.trim() : null

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login?redirect=/admin/settings')
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, owner_id, slug')
    .eq('id', storeId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store || store.owner_id !== user.id) {
    redirect(`/admin/settings?error=${encodeURIComponent('No tenés permiso para editar esta tienda.')}`)
  }

  if (slugValidation.slug !== store.slug) {
    const slugTaken = await isStoreSlugTaken(supabase, slugValidation.slug, store.id)

    if (slugTaken) {
      redirect(
        `/admin/settings?error=${encodeURIComponent('Este slug ya está en uso. Probá con otro.')}`,
      )
    }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName.trim(),
      store_slug: slugValidation.slug,
    })
    .eq('id', user.id)

  if (profileError) {
    redirect(`/admin/settings?error=${encodeURIComponent('No se pudo actualizar el perfil.')}`)
  }

  const { error: storeUpdateError } = await supabase
    .from('stores')
    .update({
      name: storeName.trim(),
      slug: slugValidation.slug,
      description: parsedDescription,
      logo_url: parsedLogoUrl,
      favicon_url: parsedFaviconUrl,
      primary_color: normalizedPrimaryColor,
      secondary_color: normalizedSecondaryColor,
    })
    .eq('id', storeId)
    .eq('owner_id', user.id)

  if (storeUpdateError) {
    const message =
      storeUpdateError.code === '23505'
        ? 'Este slug ya está en uso. Probá con otro.'
        : 'No se pudo actualizar la tienda.'
    redirect(`/admin/settings?error=${encodeURIComponent(message)}`)
  }

  revalidatePath('/admin/settings')
  revalidatePath('/storefront')
  redirect('/admin/settings?saved=1')
}

export async function saveHeroImage(formData: FormData): Promise<void> {
  'use server'

  const storeId = formData.get('storeId')
  const heroImageUrl = formData.get('heroImageUrl')

  if (typeof storeId !== 'string' || !storeId.trim()) {
    redirect(
      `/admin/settings?hero_error=${encodeURIComponent('No se pudo identificar la tienda.')}`,
    )
  }

  const parsedHeroImageUrl =
    typeof heroImageUrl === 'string' && heroImageUrl.trim() ? heroImageUrl.trim() : null

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login?redirect=/admin/settings')
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, owner_id')
    .eq('id', storeId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store || store.owner_id !== user.id) {
    redirect(
      `/admin/settings?hero_error=${encodeURIComponent('No tenés permiso para editar esta tienda.')}`,
    )
  }

  const { error: updateError } = await supabase
    .from('stores')
    .update({ hero_image_url: parsedHeroImageUrl })
    .eq('id', storeId)
    .eq('owner_id', user.id)

  if (updateError) {
    redirect(
      `/admin/settings?hero_error=${encodeURIComponent('No se pudo guardar la imagen del hero.')}`,
    )
  }

  revalidatePath('/admin/settings')
  revalidatePath('/storefront')
  redirect('/admin/settings?hero_saved=1')
}

export async function saveFooterSettings(formData: FormData): Promise<void> {
  'use server'

  const storeId = formData.get('storeId')

  if (typeof storeId !== 'string' || !storeId.trim()) {
    redirect(
      `/admin/settings?footer_error=${encodeURIComponent('No se pudo identificar la tienda.')}`,
    )
  }

  const { supabase, user, store } = await verifyOwnedStore(storeId.trim())

  if (!user) {
    redirect('/auth/login?redirect=/admin/settings')
  }

  if (!store) {
    redirect(
      `/admin/settings?footer_error=${encodeURIComponent('No tenés permiso para editar esta tienda.')}`,
    )
  }

  const { error: updateError } = await supabase
    .from('stores')
    .update({
      footer_email: parseOptionalText(formData.get('footerEmail')),
      footer_phone: parseOptionalText(formData.get('footerPhone')),
      footer_address: parseOptionalText(formData.get('footerAddress')),
      footer_whatsapp: parseOptionalText(formData.get('footerWhatsapp')),
      footer_instagram: parseOptionalText(formData.get('footerInstagram')),
      footer_facebook: parseOptionalText(formData.get('footerFacebook')),
    })
    .eq('id', store.id)
    .eq('owner_id', user.id)

  if (updateError) {
    redirect(
      `/admin/settings?footer_error=${encodeURIComponent('No se pudo guardar el footer.')}`,
    )
  }

  revalidatePath('/admin/settings')
  revalidatePath('/storefront')
  redirect('/admin/settings?footer_saved=1')
}

export async function saveTestimonial(formData: FormData): Promise<void> {
  'use server'

  const storeId = formData.get('storeId')
  const customerName = formData.get('customerName')
  const comment = formData.get('comment')

  if (typeof storeId !== 'string' || !storeId.trim()) {
    redirect(
      `/admin/settings?testimonial_error=${encodeURIComponent('No se pudo identificar la tienda.')}`,
    )
  }

  if (typeof customerName !== 'string' || !customerName.trim()) {
    redirect(
      `/admin/settings?testimonial_error=${encodeURIComponent('El nombre del cliente es obligatorio.')}`,
    )
  }

  if (typeof comment !== 'string' || !comment.trim()) {
    redirect(
      `/admin/settings?testimonial_error=${encodeURIComponent('El comentario es obligatorio.')}`,
    )
  }

  const { supabase, user, store } = await verifyOwnedStore(storeId.trim())

  if (!user) {
    redirect('/auth/login?redirect=/admin/settings')
  }

  if (!store) {
    redirect(
      `/admin/settings?testimonial_error=${encodeURIComponent('No tenés permiso para editar esta tienda.')}`,
    )
  }

  const { error: insertError } = await supabase.from('testimonials').insert({
    store_id: store.id,
    customer_name: customerName.trim(),
    customer_location: parseOptionalText(formData.get('customerLocation')),
    product_name: parseOptionalText(formData.get('productName')),
    rating: parseTestimonialRating(formData.get('rating')),
    comment: comment.trim(),
  })

  if (insertError) {
    redirect(
      `/admin/settings?testimonial_error=${encodeURIComponent('No se pudo guardar el testimonio.')}`,
    )
  }

  revalidatePath('/admin/settings')
  revalidatePath('/storefront')
  redirect('/admin/settings?testimonial_saved=1')
}

export async function deleteTestimonial(formData: FormData): Promise<void> {
  'use server'

  const storeId = formData.get('storeId')
  const testimonialId = formData.get('testimonialId')

  if (typeof storeId !== 'string' || !storeId.trim()) {
    redirect(
      `/admin/settings?testimonial_error=${encodeURIComponent('No se pudo identificar la tienda.')}`,
    )
  }

  if (typeof testimonialId !== 'string' || !testimonialId.trim()) {
    redirect(
      `/admin/settings?testimonial_error=${encodeURIComponent('No se pudo identificar el testimonio.')}`,
    )
  }

  const { supabase, user, store } = await verifyOwnedStore(storeId.trim())

  if (!user) {
    redirect('/auth/login?redirect=/admin/settings')
  }

  if (!store) {
    redirect(
      `/admin/settings?testimonial_error=${encodeURIComponent('No tenés permiso para editar esta tienda.')}`,
    )
  }

  const { error: deleteError } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', testimonialId.trim())
    .eq('store_id', store.id)

  if (deleteError) {
    redirect(
      `/admin/settings?testimonial_error=${encodeURIComponent('No se pudo eliminar el testimonio.')}`,
    )
  }

  revalidatePath('/admin/settings')
  revalidatePath('/storefront')
  redirect('/admin/settings?testimonial_deleted=1')
}

export async function saveFakePurchaseNotification(formData: FormData): Promise<void> {
  'use server'

  const storeId = formData.get('storeId')
  const customerName = formData.get('customerName')
  const customerCity = formData.get('customerCity')
  const productName = formData.get('productName')

  if (typeof storeId !== 'string' || !storeId.trim()) {
    redirect(
      `/admin/settings?fake_notification_error=${encodeURIComponent('No se pudo identificar la tienda.')}`,
    )
  }

  if (typeof customerName !== 'string' || !customerName.trim()) {
    redirect(
      `/admin/settings?fake_notification_error=${encodeURIComponent('El nombre del cliente es obligatorio.')}`,
    )
  }

  if (typeof customerCity !== 'string' || !customerCity.trim()) {
    redirect(
      `/admin/settings?fake_notification_error=${encodeURIComponent('La ciudad es obligatoria.')}`,
    )
  }

  if (typeof productName !== 'string' || !productName.trim()) {
    redirect(
      `/admin/settings?fake_notification_error=${encodeURIComponent('El nombre del producto es obligatorio.')}`,
    )
  }

  const { supabase, user, store } = await verifyOwnedStore(storeId.trim())

  if (!user) {
    redirect('/auth/login?redirect=/admin/settings')
  }

  if (!store) {
    redirect(
      `/admin/settings?fake_notification_error=${encodeURIComponent('No tenés permiso para editar esta tienda.')}`,
    )
  }

  const { count, error: countError } = await supabase
    .from('fake_purchase_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('store_id', store.id)

  if (countError) {
    redirect(
      `/admin/settings?fake_notification_error=${encodeURIComponent('No se pudo validar el límite de mensajes.')}`,
    )
  }

  if ((count ?? 0) >= MAX_FAKE_PURCHASE_NOTIFICATIONS) {
    redirect(
      `/admin/settings?fake_notification_error=${encodeURIComponent(`Podés configurar hasta ${MAX_FAKE_PURCHASE_NOTIFICATIONS} mensajes ficticios.`)}`,
    )
  }

  const isActive = formData.get('isActive') === 'on'

  const { error: insertError } = await supabase.from('fake_purchase_notifications').insert({
    store_id: store.id,
    customer_name: customerName.trim(),
    customer_city: customerCity.trim(),
    product_name: productName.trim(),
    minutes_ago: parseFakeNotificationMinutes(formData.get('minutesAgo')),
    is_active: isActive,
  })

  if (insertError) {
    redirect(
      `/admin/settings?fake_notification_error=${encodeURIComponent('No se pudo guardar el mensaje ficticio.')}`,
    )
  }

  revalidatePath('/admin/settings')
  revalidatePath('/storefront')
  redirect('/admin/settings?fake_notification_saved=1')
}

export async function deleteFakePurchaseNotification(formData: FormData): Promise<void> {
  'use server'

  const storeId = formData.get('storeId')
  const notificationId = formData.get('notificationId')

  if (typeof storeId !== 'string' || !storeId.trim()) {
    redirect(
      `/admin/settings?fake_notification_error=${encodeURIComponent('No se pudo identificar la tienda.')}`,
    )
  }

  if (typeof notificationId !== 'string' || !notificationId.trim()) {
    redirect(
      `/admin/settings?fake_notification_error=${encodeURIComponent('No se pudo identificar el mensaje.')}`,
    )
  }

  const { supabase, user, store } = await verifyOwnedStore(storeId.trim())

  if (!user) {
    redirect('/auth/login?redirect=/admin/settings')
  }

  if (!store) {
    redirect(
      `/admin/settings?fake_notification_error=${encodeURIComponent('No tenés permiso para editar esta tienda.')}`,
    )
  }

  const { error: deleteError } = await supabase
    .from('fake_purchase_notifications')
    .delete()
    .eq('id', notificationId.trim())
    .eq('store_id', store.id)

  if (deleteError) {
    redirect(
      `/admin/settings?fake_notification_error=${encodeURIComponent('No se pudo eliminar el mensaje ficticio.')}`,
    )
  }

  revalidatePath('/admin/settings')
  revalidatePath('/storefront')
  redirect('/admin/settings?fake_notification_deleted=1')
}

export async function saveMercadoPagoCredentials(formData: FormData): Promise<void> {
  'use server'

  const storeId = formData.get('storeId')
  const mpPublicKey = formData.get('mpPublicKey')
  const mpAccessToken = formData.get('mpAccessToken')

  if (typeof storeId !== 'string' || !storeId.trim()) {
    redirect(
      `/admin/settings?mp_credentials_error=${encodeURIComponent('No se pudo identificar la tienda.')}`,
    )
  }

  if (typeof mpPublicKey !== 'string' || !mpPublicKey.trim()) {
    redirect(
      `/admin/settings?mp_credentials_error=${encodeURIComponent('La Public Key es obligatoria.')}`,
    )
  }

  if (typeof mpAccessToken !== 'string' || !mpAccessToken.trim()) {
    redirect(
      `/admin/settings?mp_credentials_error=${encodeURIComponent('El Access Token es obligatorio.')}`,
    )
  }

  const normalizedPublicKey = mpPublicKey.trim()
  const normalizedAccessToken = mpAccessToken.trim()

  if (!isValidMercadoPagoCredential(normalizedPublicKey)) {
    redirect(
      `/admin/settings?mp_credentials_error=${encodeURIComponent('La Public Key debe comenzar con APP_USR- o TEST-.')}`,
    )
  }

  if (!isValidMercadoPagoCredential(normalizedAccessToken)) {
    redirect(
      `/admin/settings?mp_credentials_error=${encodeURIComponent('El Access Token debe comenzar con APP_USR- o TEST-.')}`,
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login?redirect=/admin/settings')
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, owner_id')
    .eq('id', storeId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store || store.owner_id !== user.id) {
    redirect(
      `/admin/settings?mp_credentials_error=${encodeURIComponent('No tenés permiso para editar esta tienda.')}`,
    )
  }

  const { error: updateError } = await supabase
    .from('stores')
    .update({
      mp_public_key: normalizedPublicKey,
      mp_access_token: normalizedAccessToken,
    })
    .eq('id', storeId)
    .eq('owner_id', user.id)

  if (updateError) {
    redirect(
      `/admin/settings?mp_credentials_error=${encodeURIComponent('No se pudieron guardar las credenciales.')}`,
    )
  }

  revalidatePath('/admin/settings')
  redirect('/admin/settings?mp_saved=1')
}

export async function deleteMercadoPagoCredentials(formData: FormData): Promise<void> {
  'use server'

  const storeId = formData.get('storeId')

  if (typeof storeId !== 'string' || !storeId.trim()) {
    redirect(
      `/admin/settings?mp_credentials_error=${encodeURIComponent('No se pudo identificar la tienda.')}`,
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login?redirect=/admin/settings')
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, owner_id')
    .eq('id', storeId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store || store.owner_id !== user.id) {
    redirect(
      `/admin/settings?mp_credentials_error=${encodeURIComponent('No tenés permiso para editar esta tienda.')}`,
    )
  }

  const { error: updateError } = await supabase
    .from('stores')
    .update({
      mp_access_token: null,
      mp_public_key: null,
      mp_user_id: null,
    })
    .eq('id', storeId)
    .eq('owner_id', user.id)

  if (updateError) {
    redirect(
      `/admin/settings?mp_credentials_error=${encodeURIComponent('No se pudieron eliminar las credenciales.')}`,
    )
  }

  revalidatePath('/admin/settings')
  redirect('/admin/settings?mp_deleted=1')
}

export async function saveShippingSettings(formData: FormData): Promise<void> {
  'use server'

  const storeId = formData.get('storeId')
  const freeShippingEnabled = formData.get('freeShippingEnabled') === 'true'
  const freeShippingThreshold = parseShippingAmount(
    formData.get('freeShippingThreshold'),
    'El umbral de envío gratis',
  )
  const shippingStandardCost = parseShippingAmount(
    formData.get('shippingStandardCost'),
    'El costo de envío estándar',
  )
  const shippingExpressCost = parseShippingAmount(
    formData.get('shippingExpressCost'),
    'El costo de envío express',
  )

  if (typeof storeId !== 'string' || !storeId.trim()) {
    redirect(
      `/admin/settings?shipping_error=${encodeURIComponent('No se pudo identificar la tienda.')}`,
    )
  }

  if ('error' in freeShippingThreshold) {
    redirect(`/admin/settings?shipping_error=${encodeURIComponent(freeShippingThreshold.error)}`)
  }

  if ('error' in shippingStandardCost) {
    redirect(`/admin/settings?shipping_error=${encodeURIComponent(shippingStandardCost.error)}`)
  }

  if ('error' in shippingExpressCost) {
    redirect(`/admin/settings?shipping_error=${encodeURIComponent(shippingExpressCost.error)}`)
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login?redirect=/admin/settings')
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, owner_id')
    .eq('id', storeId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store || store.owner_id !== user.id) {
    redirect(
      `/admin/settings?shipping_error=${encodeURIComponent('No tenés permiso para editar esta tienda.')}`,
    )
  }

  const { error: updateError } = await supabase
    .from('stores')
    .update({
      free_shipping_enabled: freeShippingEnabled,
      free_shipping_threshold: freeShippingThreshold.value,
      shipping_standard_cost: shippingStandardCost.value,
      shipping_express_cost: shippingExpressCost.value,
    })
    .eq('id', storeId)
    .eq('owner_id', user.id)

  if (updateError) {
    redirect(
      `/admin/settings?shipping_error=${encodeURIComponent('No se pudo guardar la configuración de envíos.')}`,
    )
  }

  revalidatePath('/admin/settings')
  redirect('/admin/settings?shipping_saved=1')
}

export async function saveLocalPickupSettings(formData: FormData): Promise<void> {
  'use server'

  const storeId = formData.get('storeId')
  const enableLocalPickup = formData.get('enableLocalPickup') === 'true'
  const pickupAddress = formData.get('pickupAddress')
  const pickupInstructions = formData.get('pickupInstructions')
  const pickupSchedule = formData.get('pickupSchedule')

  if (typeof storeId !== 'string' || !storeId.trim()) {
    redirect(
      `/admin/settings?pickup_error=${encodeURIComponent('No se pudo identificar la tienda.')}`,
    )
  }

  const parsedPickupAddress =
    typeof pickupAddress === 'string' && pickupAddress.trim() ? pickupAddress.trim() : null

  const parsedPickupInstructions =
    typeof pickupInstructions === 'string' && pickupInstructions.trim()
      ? pickupInstructions.trim()
      : null

  const parsedPickupSchedule =
    typeof pickupSchedule === 'string' && pickupSchedule.trim() ? pickupSchedule.trim() : null

  if (enableLocalPickup && !parsedPickupAddress) {
    redirect(
      `/admin/settings?pickup_error=${encodeURIComponent('La dirección del local es obligatoria cuando el retiro está habilitado.')}`,
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login?redirect=/admin/settings')
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, owner_id')
    .eq('id', storeId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store || store.owner_id !== user.id) {
    redirect(
      `/admin/settings?pickup_error=${encodeURIComponent('No tenés permiso para editar esta tienda.')}`,
    )
  }

  const { error: updateError } = await supabase
    .from('stores')
    .update({
      enable_local_pickup: enableLocalPickup,
      pickup_address: parsedPickupAddress,
      pickup_instructions: parsedPickupInstructions,
      pickup_schedule: parsedPickupSchedule,
    })
    .eq('id', storeId)
    .eq('owner_id', user.id)

  if (updateError) {
    redirect(
      `/admin/settings?pickup_error=${encodeURIComponent('No se pudo guardar la configuración de retiro en local.')}`,
    )
  }

  revalidatePath('/admin/settings')
  revalidatePath('/storefront/checkout')
  redirect('/admin/settings?pickup_saved=1')
}

export async function saveBankDetails(formData: FormData): Promise<void> {
  'use server'

  const storeId = formData.get('storeId')
  const bankName = parseRequiredBankField(formData.get('bankName'), 'El banco')
  const cbu = parseRequiredBankField(formData.get('cbu'), 'El CBU')
  const alias = parseRequiredBankField(formData.get('alias'), 'El alias')
  const accountHolder = parseRequiredBankField(formData.get('accountHolder'), 'El titular')
  const cuit = parseRequiredBankField(formData.get('cuit'), 'El CUIT')

  if (typeof storeId !== 'string' || !storeId.trim()) {
    redirect(
      `/admin/settings?bank_error=${encodeURIComponent('No se pudo identificar la tienda.')}`,
    )
  }

  if ('error' in bankName) {
    redirect(`/admin/settings?bank_error=${encodeURIComponent(bankName.error)}`)
  }

  if ('error' in cbu) {
    redirect(`/admin/settings?bank_error=${encodeURIComponent(cbu.error)}`)
  }

  if ('error' in alias) {
    redirect(`/admin/settings?bank_error=${encodeURIComponent(alias.error)}`)
  }

  if ('error' in accountHolder) {
    redirect(`/admin/settings?bank_error=${encodeURIComponent(accountHolder.error)}`)
  }

  if ('error' in cuit) {
    redirect(`/admin/settings?bank_error=${encodeURIComponent(cuit.error)}`)
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login?redirect=/admin/settings')
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, owner_id')
    .eq('id', storeId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store || store.owner_id !== user.id) {
    redirect(
      `/admin/settings?bank_error=${encodeURIComponent('No tenés permiso para editar esta tienda.')}`,
    )
  }

  const { error: updateError } = await supabase
    .from('stores')
    .update({
      bank_name: bankName.value,
      cbu: cbu.value,
      alias: alias.value,
      account_holder: accountHolder.value,
      cuit: cuit.value,
    })
    .eq('id', storeId)
    .eq('owner_id', user.id)

  if (updateError) {
    redirect(
      `/admin/settings?bank_error=${encodeURIComponent('No se pudieron guardar los datos bancarios.')}`,
    )
  }

  revalidatePath('/admin/settings')
  revalidatePath('/storefront/checkout')
  redirect('/admin/settings?bank_saved=1')
}

export async function addCustomDomain(formData: FormData): Promise<void> {
  'use server'

  const storeId = formData.get('storeId')
  const customDomainInput = formData.get('customDomain')

  if (typeof storeId !== 'string' || !storeId.trim()) {
    redirect(
      `/admin/settings?domain_error=${encodeURIComponent('No se pudo identificar la tienda.')}`,
    )
  }

  if (typeof customDomainInput !== 'string' || !customDomainInput.trim()) {
    redirect(
      `/admin/settings?domain_error=${encodeURIComponent('Ingresá un dominio válido.')}`,
    )
  }

  const normalizedDomain = normalizeCustomDomain(customDomainInput)

  if (!normalizedDomain) {
    redirect(
      `/admin/settings?domain_error=${encodeURIComponent('El dominio ingresado no es válido.')}`,
    )
  }

  if (isReservedPlatformDomain(normalizedDomain)) {
    redirect(
      `/admin/settings?domain_error=${encodeURIComponent('No podés usar un dominio reservado de la plataforma.')}`,
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login?redirect=/admin/settings')
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, owner_id')
    .eq('id', storeId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store || store.owner_id !== user.id) {
    redirect(
      `/admin/settings?domain_error=${encodeURIComponent('No tenés permiso para editar esta tienda.')}`,
    )
  }

  const { data: existingDomainStore, error: existingDomainError } = await supabase
    .from('stores')
    .select('id')
    .eq('custom_domain', normalizedDomain)
    .neq('id', storeId)
    .maybeSingle()

  if (existingDomainError) {
    redirect(
      `/admin/settings?domain_error=${encodeURIComponent('No se pudo validar la disponibilidad del dominio.')}`,
    )
  }

  if (existingDomainStore) {
    redirect(
      `/admin/settings?domain_error=${encodeURIComponent('Ese dominio ya está en uso por otra tienda.')}`,
    )
  }

  const verificationToken = generateDomainVerificationToken()

  const { error: updateError } = await supabase
    .from('stores')
    .update({
      custom_domain: normalizedDomain,
      domain_verified: false,
      domain_verification_token: verificationToken,
      domain: normalizedDomain,
    })
    .eq('id', storeId)
    .eq('owner_id', user.id)

  if (updateError) {
    redirect(
      `/admin/settings?domain_error=${encodeURIComponent('No se pudo guardar el dominio.')}`,
    )
  }

  revalidatePath('/admin/settings')
  redirect('/admin/settings?domain_saved=1')
}

export async function verifyCustomDomain(formData: FormData): Promise<void> {
  'use server'

  const storeId = formData.get('storeId')

  if (typeof storeId !== 'string' || !storeId.trim()) {
    redirect(
      `/admin/settings?domain_error=${encodeURIComponent('No se pudo identificar la tienda.')}`,
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login?redirect=/admin/settings')
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, owner_id, custom_domain, domain_verification_token')
    .eq('id', storeId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store || store.owner_id !== user.id) {
    redirect(
      `/admin/settings?domain_error=${encodeURIComponent('No tenés permiso para editar esta tienda.')}`,
    )
  }

  if (!store.custom_domain?.trim() || !store.domain_verification_token?.trim()) {
    redirect(
      `/admin/settings?domain_error=${encodeURIComponent('Primero agregá un dominio personalizado.')}`,
    )
  }

  const verification = await verifyDomainDns(
    store.custom_domain,
    store.domain_verification_token,
  )

  if (!verification.verified) {
    redirect(
      `/admin/settings?domain_error=${encodeURIComponent(verification.message)}`,
    )
  }

  const vercelResult = await registerDomainWithVercel(store.custom_domain)

  if ('error' in vercelResult) {
    redirect(
      `/admin/settings?domain_error=${encodeURIComponent(vercelResult.error)}`,
    )
  }

  const { error: updateError } = await supabase
    .from('stores')
    .update({
      domain_verified: true,
      domain: store.custom_domain,
    })
    .eq('id', storeId)
    .eq('owner_id', user.id)

  if (updateError) {
    redirect(
      `/admin/settings?domain_error=${encodeURIComponent('El dominio se verificó pero no se pudo guardar el estado.')}`,
    )
  }

  revalidatePath('/admin/settings')
  redirect(`/admin/settings?domain_verified_msg=${encodeURIComponent(verification.message)}`)
}

export async function removeCustomDomain(formData: FormData): Promise<void> {
  'use server'

  const storeId = formData.get('storeId')

  if (typeof storeId !== 'string' || !storeId.trim()) {
    redirect(
      `/admin/settings?domain_error=${encodeURIComponent('No se pudo identificar la tienda.')}`,
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login?redirect=/admin/settings')
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, owner_id, custom_domain')
    .eq('id', storeId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store || store.owner_id !== user.id) {
    redirect(
      `/admin/settings?domain_error=${encodeURIComponent('No tenés permiso para editar esta tienda.')}`,
    )
  }

  if (store.custom_domain?.trim()) {
    await removeDomainFromVercel(store.custom_domain)
  }

  const { error: updateError } = await supabase
    .from('stores')
    .update({
      custom_domain: null,
      domain_verified: false,
      domain_verification_token: null,
      domain: null,
    })
    .eq('id', storeId)
    .eq('owner_id', user.id)

  if (updateError) {
    redirect(
      `/admin/settings?domain_error=${encodeURIComponent('No se pudo eliminar el dominio.')}`,
    )
  }

  revalidatePath('/admin/settings')
  redirect('/admin/settings?domain_removed=1')
}

export default async function AdminSettingsPage({ searchParams }: SettingsPageProps) {
  const {
    saved,
    error,
    mp_saved,
    mp_deleted,
    mp_credentials_error,
    confirm_delete_mp,
    shipping_saved,
    shipping_error,
    pickup_saved,
    pickup_error,
    bank_saved,
    bank_error,
    domain_saved,
    domain_verified_msg,
    domain_removed,
    domain_error,
    hero_saved,
    hero_error,
    footer_saved,
    footer_error,
    testimonial_saved,
    testimonial_error,
    testimonial_deleted,
    fake_notification_saved,
    fake_notification_error,
    fake_notification_deleted,
  } = await searchParams
  const settings = await getSettingsData()

  if (!settings) {
    redirect('/auth/login?redirect=/admin/settings')
  }

  const { email, profile, store, testimonials, fakePurchaseNotifications } = settings
  const primaryColor = store.primary_color ?? DEFAULT_PRIMARY_COLOR
  const secondaryColor = store.secondary_color ?? DEFAULT_SECONDARY_COLOR
  const hasMercadoPagoCredentials = Boolean(store.mp_access_token && store.mp_public_key)
  const freeShippingEnabled = store.free_shipping_enabled ?? true
  const freeShippingThreshold = Number(
    store.free_shipping_threshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD,
  )
  const shippingStandardCost = Number(
    store.shipping_standard_cost ?? DEFAULT_SHIPPING_STANDARD_COST,
  )
  const shippingExpressCost = Number(store.shipping_express_cost ?? DEFAULT_SHIPPING_EXPRESS_COST)
  const enableLocalPickup = store.enable_local_pickup ?? false
  const customDomain = store.custom_domain
  const domainVerified = store.domain_verified ?? false
  const domainVerificationToken = store.domain_verification_token
  const domainTxtHost = customDomain ? getDomainTxtHost(customDomain) : null
  const domainTxtValue = domainVerificationToken
    ? getDomainTxtValue(domainVerificationToken)
    : null
  const platformStorefrontUrl = `https://${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? 'venda-mas.vercel.app'}/storefront?store=${encodeURIComponent(store.slug)}`
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? 'venda-mas.vercel.app'

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-border bg-white px-6 py-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Configuración</h1>
          <p className="text-sm text-muted-foreground">
            Administrá tu perfil y la información de tu tienda.
          </p>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {saved === '1' ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Configuración guardada
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {mp_saved === '1' ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Credenciales de Mercado Pago guardadas correctamente
          </div>
        ) : null}

        {mp_deleted === '1' ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Credenciales de Mercado Pago eliminadas
          </div>
        ) : null}

        {mp_credentials_error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {mp_credentials_error}
          </div>
        ) : null}

        {shipping_saved === '1' ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Configuración de envíos guardada correctamente
          </div>
        ) : null}

        {shipping_error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {shipping_error}
          </div>
        ) : null}

        {pickup_saved === '1' ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Configuración de retiro en local guardada correctamente
          </div>
        ) : null}

        {pickup_error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {pickup_error}
          </div>
        ) : null}

        {bank_saved === '1' ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Datos bancarios guardados correctamente
          </div>
        ) : null}

        {bank_error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {bank_error}
          </div>
        ) : null}

        {domain_saved === '1' ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Dominio guardado. Configurá el DNS y luego hacé clic en &quot;Verificar dominio&quot;.
          </div>
        ) : null}

        {domain_verified_msg ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {domain_verified_msg}
          </div>
        ) : null}

        {domain_removed === '1' ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Dominio personalizado eliminado
          </div>
        ) : null}

        {domain_error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {domain_error}
          </div>
        ) : null}

        {hero_saved === '1' ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Imagen del hero guardada correctamente
          </div>
        ) : null}

        {hero_error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {hero_error}
          </div>
        ) : null}

        {footer_saved === '1' ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Datos del footer guardados correctamente
          </div>
        ) : null}

        {footer_error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {footer_error}
          </div>
        ) : null}

        {testimonial_saved === '1' ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Testimonio agregado correctamente
          </div>
        ) : null}

        {testimonial_deleted === '1' ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Testimonio eliminado
          </div>
        ) : null}

        {testimonial_error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {testimonial_error}
          </div>
        ) : null}

        <form action={saveSettings} id="settings-form" className="hidden">
          <input type="hidden" name="storeId" value={store.id} />
        </form>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Perfil de usuario</CardTitle>
              <CardDescription>Datos personales de tu cuenta.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  form="settings-form"
                  defaultValue={profile.full_name ?? ''}
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  readOnly
                  className="bg-muted text-muted-foreground"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración de la tienda</CardTitle>
              <CardDescription>Información visible en tu storefront.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Nombre de la tienda</Label>
                  <Input
                    id="storeName"
                    name="storeName"
                    form="settings-form"
                    defaultValue={store.name}
                    placeholder="Mi tienda"
                    required
                  />
                </div>

                <StoreSlugField
                  defaultSlug={store.slug}
                  formId="settings-form"
                  platformDomain={platformDomain}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción de la tienda</Label>
                <textarea
                  id="description"
                  name="description"
                  form="settings-form"
                  rows={4}
                  defaultValue={store.description ?? ''}
                  placeholder="Contá brevemente de qué se trata tu tienda..."
                  className={cn(
                    'w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition',
                    'focus-visible:border-ring focus-visible:ring-ring/50',
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">URL del logo</Label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  type="url"
                  form="settings-form"
                  defaultValue={store.logo_url ?? ''}
                  placeholder="https://ejemplo.com/logo.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faviconUrl">URL del favicon</Label>
                <Input
                  id="faviconUrl"
                  name="faviconUrl"
                  type="url"
                  form="settings-form"
                  defaultValue={store.favicon_url ?? ''}
                  placeholder="https://ejemplo.com/favicon.ico"
                />
                <p className="text-xs text-muted-foreground">
                  Ícono de la pestaña del navegador (ICO, PNG o SVG). Si está vacío, se usa el favicon
                  predeterminado de VendaMás.
                </p>
                {store.favicon_url ? (
                  <img
                    src={store.favicon_url}
                    alt="Vista previa del favicon"
                    className="h-8 w-8 rounded border border-border object-contain"
                  />
                ) : null}
              </div>

              <form action={saveHeroImage} className="space-y-4 border-t border-border pt-6">
                <input type="hidden" name="storeId" value={store.id} />

                <div className="space-y-2">
                  <Label htmlFor="heroImageUrl">Imagen del Hero (URL)</Label>
                  <Input
                    id="heroImageUrl"
                    name="heroImageUrl"
                    type="url"
                    defaultValue={store.hero_image_url ?? ''}
                    placeholder="https://ejemplo.com/hero.jpg"
                  />
                </div>

                {store.hero_image_url ? (
                  <img
                    src={store.hero_image_url}
                    alt="Vista previa del hero"
                    className="rounded-lg border border-border object-cover"
                    style={{ maxWidth: '300px' }}
                  />
                ) : null}

                <Button type="submit" className="bg-red-600 text-white hover:bg-red-700">
                  Guardar
                </Button>
              </form>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Color primario</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="primaryColor"
                      name="primaryColor"
                      form="settings-form"
                      type="color"
                      defaultValue={primaryColor}
                      className="h-11 w-16 cursor-pointer p-1"
                    />
                    <span className="font-mono text-sm text-muted-foreground">{primaryColor}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Color secundario</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="secondaryColor"
                      name="secondaryColor"
                      form="settings-form"
                      type="color"
                      defaultValue={secondaryColor}
                      className="h-11 w-16 cursor-pointer p-1"
                    />
                    <span className="font-mono text-sm text-muted-foreground">{secondaryColor}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              form="settings-form"
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Guardar configuración
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Footer del storefront</CardTitle>
              <CardDescription>
                Datos de contacto y redes sociales visibles en el pie de tu tienda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={saveFooterSettings} className="space-y-4">
                <input type="hidden" name="storeId" value={store.id} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="footerEmail">Email de contacto</Label>
                    <Input
                      id="footerEmail"
                      name="footerEmail"
                      type="email"
                      defaultValue={store.footer_email ?? ''}
                      placeholder="contacto@mitienda.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footerPhone">Teléfono</Label>
                    <Input
                      id="footerPhone"
                      name="footerPhone"
                      defaultValue={store.footer_phone ?? ''}
                      placeholder="+54 9 11 1234 5678"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerAddress">Dirección</Label>
                  <Input
                    id="footerAddress"
                    name="footerAddress"
                    defaultValue={store.footer_address ?? ''}
                    placeholder="Ciudad, Provincia, Argentina"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="footerWhatsapp">WhatsApp</Label>
                    <Input
                      id="footerWhatsapp"
                      name="footerWhatsapp"
                      defaultValue={store.footer_whatsapp ?? ''}
                      placeholder="5491123456789"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footerInstagram">Instagram</Label>
                    <Input
                      id="footerInstagram"
                      name="footerInstagram"
                      defaultValue={store.footer_instagram ?? ''}
                      placeholder="https://instagram.com/tutienda"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footerFacebook">Facebook</Label>
                    <Input
                      id="footerFacebook"
                      name="footerFacebook"
                      defaultValue={store.footer_facebook ?? ''}
                      placeholder="https://facebook.com/tutienda"
                    />
                  </div>
                </div>

                <Button type="submit" className="bg-red-600 text-white hover:bg-red-700">
                  Guardar footer
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pop-ups de urgencia ficticios</CardTitle>
              <CardDescription>
                Mensajes de compra reciente que rotan en tu tienda. Máximo{' '}
                {MAX_FAKE_PURCHASE_NOTIFICATIONS} mensajes. Si no hay mensajes activos, el pop-up no
                se muestra.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fake_notification_saved === '1' ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Mensaje ficticio guardado
                </div>
              ) : null}

              {fake_notification_deleted === '1' ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Mensaje ficticio eliminado
                </div>
              ) : null}

              {fake_notification_error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {fake_notification_error}
                </div>
              ) : null}

              {fakePurchaseNotifications.length > 0 ? (
                <div className="space-y-3">
                  {fakePurchaseNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">
                          {notification.customer_name} de {notification.customer_city}
                        </p>
                        <p className="text-sm text-foreground">
                          Compró <span className="font-medium">{notification.product_name}</span> hace{' '}
                          {notification.minutes_ago}{' '}
                          {notification.minutes_ago === 1 ? 'minuto' : 'minutos'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.is_active ? 'Activo' : 'Inactivo'}
                        </p>
                      </div>
                      <form action={deleteFakePurchaseNotification}>
                        <input type="hidden" name="storeId" value={store.id} />
                        <input type="hidden" name="notificationId" value={notification.id} />
                        <Button type="submit" variant="outline" size="sm">
                          Eliminar
                        </Button>
                      </form>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Todavía no configuraste mensajes ficticios de compra.
                </p>
              )}

              {fakePurchaseNotifications.length < MAX_FAKE_PURCHASE_NOTIFICATIONS ? (
                <form
                  action={saveFakePurchaseNotification}
                  className="space-y-4 border-t border-border pt-6"
                >
                  <input type="hidden" name="storeId" value={store.id} />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fakeCustomerName">Nombre del cliente</Label>
                      <Input
                        id="fakeCustomerName"
                        name="customerName"
                        placeholder="Ej. María"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fakeCustomerCity">Ciudad</Label>
                      <Input
                        id="fakeCustomerCity"
                        name="customerCity"
                        placeholder="Ej. Córdoba"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fakeProductName">Producto comprado</Label>
                      <Input
                        id="fakeProductName"
                        name="productName"
                        placeholder="Ej. Remera básica"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fakeMinutesAgo">Hace cuántos minutos</Label>
                      <Input
                        id="fakeMinutesAgo"
                        name="minutesAgo"
                        type="number"
                        min={1}
                        max={120}
                        defaultValue={5}
                        required
                      />
                    </div>
                  </div>

                  <Label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked
                      className="h-4 w-4 rounded border border-input text-red-600 focus:ring-red-500"
                    />
                    Mensaje activo (visible en la tienda)
                  </Label>

                  <Button type="submit" className="bg-red-600 text-white hover:bg-red-700">
                    Agregar mensaje ficticio
                  </Button>
                </form>
              ) : (
                <p className="border-t border-border pt-6 text-sm text-muted-foreground">
                  Alcanzaste el máximo de {MAX_FAKE_PURCHASE_NOTIFICATIONS} mensajes. Eliminá uno para
                  agregar otro.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Testimonios de clientes</CardTitle>
              <CardDescription>
                Opiniones que se muestran en la home de tu tienda. Si no hay testimonios, la sección
                se oculta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {testimonials.length > 0 ? (
                <div className="space-y-3">
                  {testimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{testimonial.customer_name}</p>
                        {testimonial.customer_location ? (
                          <p className="text-sm text-muted-foreground">
                            {testimonial.customer_location}
                          </p>
                        ) : null}
                        <p className="text-sm text-foreground">&ldquo;{testimonial.comment}&rdquo;</p>
                        <p className="text-xs text-muted-foreground">
                          {testimonial.rating ?? 5} estrellas
                          {testimonial.product_name ? ` · ${testimonial.product_name}` : ''}
                        </p>
                      </div>
                      <form action={deleteTestimonial}>
                        <input type="hidden" name="storeId" value={store.id} />
                        <input type="hidden" name="testimonialId" value={testimonial.id} />
                        <Button type="submit" variant="outline" size="sm">
                          Eliminar
                        </Button>
                      </form>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Todavía no agregaste testimonios para tu tienda.
                </p>
              )}

              <form action={saveTestimonial} className="space-y-4 border-t border-border pt-6">
                <input type="hidden" name="storeId" value={store.id} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Nombre del cliente</Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      placeholder="María González"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerLocation">Ubicación</Label>
                    <Input
                      id="customerLocation"
                      name="customerLocation"
                      placeholder="Buenos Aires"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Producto comprado (opcional)</Label>
                    <Input id="productName" name="productName" placeholder="Remera clásica" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating">Calificación (1-5)</Label>
                    <Input
                      id="rating"
                      name="rating"
                      type="number"
                      min={1}
                      max={5}
                      defaultValue={5}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Comentario</Label>
                  <textarea
                    id="comment"
                    name="comment"
                    rows={3}
                    required
                    placeholder="Excelente atención y productos de calidad..."
                    className={cn(
                      'w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition',
                      'focus-visible:border-ring focus-visible:ring-ring/50',
                    )}
                  />
                </div>

                <Button type="submit" className="bg-red-600 text-white hover:bg-red-700">
                  Agregar testimonio
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dominio personalizado</CardTitle>
            <CardDescription>
              Conectá tu propio dominio para que tus clientes visiten tu tienda con una URL profesional.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-border bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-medium text-slate-900">URL actual de tu tienda</p>
              <p className="mt-1 break-all font-mono text-xs">{platformStorefrontUrl}</p>
            </div>

            {customDomain ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-medium text-foreground">{customDomain}</p>
                  {domainVerified ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Verificado
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                      Pendiente de verificación
                    </span>
                  )}
                </div>

                {!domainVerified && domainTxtHost && domainTxtValue ? (
                  <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                    <p className="font-semibold">Configurá estos registros DNS en tu proveedor de dominio</p>

                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">1. Verificación (TXT)</p>
                        <p className="mt-1 text-xs text-amber-900">
                          Host / Nombre: <span className="font-mono">{domainTxtHost}</span>
                        </p>
                        <p className="text-xs text-amber-900">
                          Valor: <span className="font-mono break-all">{domainTxtValue}</span>
                        </p>
                      </div>

                      <div>
                        <p className="font-medium">2. Tráfico web (CNAME para www)</p>
                        <p className="mt-1 text-xs text-amber-900">
                          Host: <span className="font-mono">www.{customDomain}</span>
                        </p>
                        <p className="text-xs text-amber-900">
                          Apunta a: <span className="font-mono">{VERCEL_CNAME_TARGET}</span>
                        </p>
                      </div>

                      <div>
                        <p className="font-medium">3. Dominio raíz (A record)</p>
                        <p className="mt-1 text-xs text-amber-900">
                          Host: <span className="font-mono">@</span>
                        </p>
                        <p className="text-xs text-amber-900">
                          Apunta a: <span className="font-mono">{VERCEL_APEX_IP}</span>
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-amber-900">
                      La propagación DNS puede tardar entre 5 minutos y 48 horas. Vercel emitirá el
                      certificado SSL automáticamente una vez verificado el dominio.
                    </p>
                  </div>
                ) : null}

                {domainVerified ? (
                  <p className="text-sm text-muted-foreground">
                    Tu tienda está disponible en{' '}
                    <a
                      href={`https://${customDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-red-600 hover:text-red-700"
                    >
                      https://{customDomain}
                    </a>
                  </p>
                ) : (
                  <form action={verifyCustomDomain}>
                    <input type="hidden" name="storeId" value={store.id} />
                    <Button type="submit" className="bg-red-600 text-white hover:bg-red-700">
                      Verificar dominio
                    </Button>
                  </form>
                )}

                <form action={removeCustomDomain}>
                  <input type="hidden" name="storeId" value={store.id} />
                  <Button type="submit" variant="outline">
                    Eliminar dominio
                  </Button>
                </form>
              </div>
            ) : (
              <form action={addCustomDomain} className="space-y-4">
                <input type="hidden" name="storeId" value={store.id} />

                <div className="space-y-2">
                  <Label htmlFor="customDomain">Tu dominio</Label>
                  <Input
                    id="customDomain"
                    name="customDomain"
                    placeholder="andreatiendaonline.com"
                    autoComplete="off"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingresá solo el dominio, sin https:// ni www.
                  </p>
                </div>

                <Button type="submit" className="bg-red-600 text-white hover:bg-red-700">
                  Agregar dominio
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medios de Pago</CardTitle>
            <CardDescription>
              Ingresá tus credenciales de Mercado Pago manualmente desde tu panel de desarrolladores.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {hasMercadoPagoCredentials ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <p className="font-medium">Credenciales configuradas</p>
                <p className="mt-1">Public Key: {maskMercadoPagoCredential(store.mp_public_key)}</p>
                <p>Access Token: {maskMercadoPagoCredential(store.mp_access_token)}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Todavía no configuraste Mercado Pago. Ingresá tus credenciales de prueba o producción.
              </p>
            )}

            <form action={saveMercadoPagoCredentials} className="space-y-4">
              <input type="hidden" name="storeId" value={store.id} />

              <div className="space-y-2">
                <Label htmlFor="mpPublicKey">Public Key</Label>
                <Input
                  id="mpPublicKey"
                  name="mpPublicKey"
                  placeholder="APP_USR-xxxxxxxx..."
                  autoComplete="off"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mpAccessToken">Access Token</Label>
                <Input
                  id="mpAccessToken"
                  name="mpAccessToken"
                  type="password"
                  placeholder="APP_USR-xxxxxxxx..."
                  autoComplete="off"
                  required
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Ambos valores deben comenzar con <span className="font-mono">APP_USR-</span>.
              </p>

              <Button type="submit" className="bg-red-600 text-white hover:bg-red-700">
                Guardar credenciales
              </Button>
            </form>

            {hasMercadoPagoCredentials ? (
              confirm_delete_mp === '1' ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-800">
                    ¿Eliminar las credenciales de Mercado Pago?
                  </p>
                  <p className="mt-1 text-sm text-red-700">
                    Tu tienda dejará de poder cobrar con Mercado Pago hasta que vuelvas a configurarlas.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <form action={deleteMercadoPagoCredentials}>
                      <input type="hidden" name="storeId" value={store.id} />
                      <Button type="submit" variant="destructive">
                        Sí, eliminar credenciales
                      </Button>
                    </form>
                    <Link href="/admin/settings">
                      <Button type="button" variant="outline">
                        Cancelar
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <Link href="/admin/settings?confirm_delete_mp=1">
                  <Button type="button" variant="outline">
                    Eliminar credenciales
                  </Button>
                </Link>
              )
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración de Envíos</CardTitle>
            <CardDescription>
              Definí los costos de envío y el umbral para ofrecer envío gratis en tu tienda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveShippingSettings} className="space-y-6">
              <input type="hidden" name="storeId" value={store.id} />

              <label className="flex items-center gap-3 rounded-lg border border-border bg-white p-4">
                <input
                  type="checkbox"
                  name="freeShippingEnabled"
                  value="true"
                  defaultChecked={freeShippingEnabled}
                  className="h-4 w-4 rounded border border-input text-red-600 accent-red-600"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Habilitar envío gratis por umbral
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Si está activo, los pedidos que superen el umbral tendrán envío gratis.
                  </p>
                </div>
              </label>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="freeShippingThreshold">Umbral de envío gratis ($)</Label>
                  <Input
                    id="freeShippingThreshold"
                    name="freeShippingThreshold"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={freeShippingThreshold}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingStandardCost">Costo envío estándar ($)</Label>
                  <Input
                    id="shippingStandardCost"
                    name="shippingStandardCost"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={shippingStandardCost}
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2 sm:max-w-md">
                  <Label htmlFor="shippingExpressCost">Costo envío express ($)</Label>
                  <Input
                    id="shippingExpressCost"
                    name="shippingExpressCost"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={shippingExpressCost}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="bg-red-600 text-white hover:bg-red-700">
                Guardar configuración de envíos
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retiro en local</CardTitle>
            <CardDescription>
              Permití que tus clientes retiren sus pedidos en tu local sin costo de envío.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveLocalPickupSettings} className="space-y-6">
              <input type="hidden" name="storeId" value={store.id} />

              <label className="flex items-center gap-3 rounded-lg border border-border bg-white p-4">
                <input
                  type="checkbox"
                  name="enableLocalPickup"
                  value="true"
                  defaultChecked={enableLocalPickup}
                  className="h-4 w-4 rounded border border-input text-red-600 accent-red-600"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">Habilitar retiro en local</p>
                  <p className="text-xs text-muted-foreground">
                    Si está activo, los clientes podrán elegir retirar el pedido en tu local.
                  </p>
                </div>
              </label>

              <div className="space-y-2">
                <Label htmlFor="pickupAddress">Dirección del local</Label>
                <Input
                  id="pickupAddress"
                  name="pickupAddress"
                  defaultValue={store.pickup_address ?? ''}
                  placeholder="Av. Corrientes 1234, CABA"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupSchedule">Horarios de retiro</Label>
                <Input
                  id="pickupSchedule"
                  name="pickupSchedule"
                  defaultValue={store.pickup_schedule ?? ''}
                  placeholder="Lunes a Viernes 9-18hs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupInstructions">Instrucciones para el cliente</Label>
                <textarea
                  id="pickupInstructions"
                  name="pickupInstructions"
                  rows={3}
                  defaultValue={store.pickup_instructions ?? ''}
                  placeholder="Ej: Tocar timbre 2, pedir por nombre en recepción..."
                  className={cn(
                    'w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition',
                    'focus-visible:border-ring focus-visible:ring-ring/50',
                  )}
                />
              </div>

              <Button type="submit" className="bg-red-600 text-white hover:bg-red-700">
                Guardar configuración de retiro
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transferencia bancaria</CardTitle>
            <CardDescription>
              Configurá los datos para que tus clientes puedan pagar por transferencia en el checkout.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveBankDetails} className="space-y-6">
              <input type="hidden" name="storeId" value={store.id} />

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Banco</Label>
                  <Input
                    id="bankName"
                    name="bankName"
                    defaultValue={store.bank_name ?? ''}
                    placeholder="Ej: Banco Galicia"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Titular de la cuenta</Label>
                  <Input
                    id="accountHolder"
                    name="accountHolder"
                    defaultValue={store.account_holder ?? ''}
                    placeholder="Nombre y apellido o razón social"
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="cbu">CBU</Label>
                  <Input
                    id="cbu"
                    name="cbu"
                    defaultValue={store.cbu ?? ''}
                    placeholder="0000000000000000000000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alias">Alias</Label>
                  <Input
                    id="alias"
                    name="alias"
                    defaultValue={store.alias ?? ''}
                    placeholder="mi.tienda.alias"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cuit">CUIT</Label>
                  <Input
                    id="cuit"
                    name="cuit"
                    defaultValue={store.cuit ?? ''}
                    placeholder="20-12345678-9"
                    required
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Todos los campos son obligatorios para habilitar la transferencia bancaria en el checkout.
              </p>

              <Button type="submit" className="bg-red-600 text-white hover:bg-red-700">
                Guardar datos bancarios
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
