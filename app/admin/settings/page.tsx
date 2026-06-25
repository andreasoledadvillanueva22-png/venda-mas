import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
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
}

type SettingsData = {
  email: string
  profile: DbProfile
  store: DbStore
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
    hero_saved?: string
    hero_error?: string
  }>
}

const DEFAULT_PRIMARY_COLOR = '#DC2626'
const DEFAULT_SECONDARY_COLOR = '#16A34A'
const DEFAULT_FREE_SHIPPING_THRESHOLD = 50000
const DEFAULT_SHIPPING_STANDARD_COST = 5000
const DEFAULT_SHIPPING_EXPRESS_COST = 8500

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
  return value.trim().startsWith('APP_USR-')
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
      'id, owner_id, name, slug, logo_url, hero_image_url, description, primary_color, secondary_color, mp_access_token, mp_public_key, mp_user_id, free_shipping_threshold, shipping_standard_cost, shipping_express_cost, free_shipping_enabled, enable_local_pickup, pickup_address, pickup_instructions, pickup_schedule',
    )
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store || store.owner_id !== user.id) {
    return null
  }

  return {
    email: user.email,
    profile: profile as DbProfile,
    store: store as DbStore,
  }
}

export async function saveSettings(formData: FormData): Promise<void> {
  'use server'

  const storeId = formData.get('storeId')
  const fullName = formData.get('fullName')
  const storeName = formData.get('storeName')
  const description = formData.get('description')
  const logoUrl = formData.get('logoUrl')
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

  if (typeof primaryColor !== 'string' || typeof secondaryColor !== 'string') {
    redirect(`/admin/settings?error=${encodeURIComponent('Los colores no son válidos.')}`)
  }

  const normalizedPrimaryColor = normalizeHexColor(primaryColor, DEFAULT_PRIMARY_COLOR)
  const normalizedSecondaryColor = normalizeHexColor(secondaryColor, DEFAULT_SECONDARY_COLOR)

  const parsedDescription =
    typeof description === 'string' && description.trim() ? description.trim() : null

  const parsedLogoUrl =
    typeof logoUrl === 'string' && logoUrl.trim() ? logoUrl.trim() : null

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
    redirect(`/admin/settings?error=${encodeURIComponent('No tenés permiso para editar esta tienda.')}`)
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: fullName.trim() })
    .eq('id', user.id)

  if (profileError) {
    redirect(`/admin/settings?error=${encodeURIComponent('No se pudo actualizar el perfil.')}`)
  }

  const { error: storeUpdateError } = await supabase
    .from('stores')
    .update({
      name: storeName.trim(),
      description: parsedDescription,
      logo_url: parsedLogoUrl,
      primary_color: normalizedPrimaryColor,
      secondary_color: normalizedSecondaryColor,
    })
    .eq('id', storeId)
    .eq('owner_id', user.id)

  if (storeUpdateError) {
    redirect(`/admin/settings?error=${encodeURIComponent('No se pudo actualizar la tienda.')}`)
  }

  revalidatePath('/admin/settings')
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
      `/admin/settings?mp_credentials_error=${encodeURIComponent('La Public Key debe comenzar con APP_USR-.')}`,
    )
  }

  if (!isValidMercadoPagoCredential(normalizedAccessToken)) {
    redirect(
      `/admin/settings?mp_credentials_error=${encodeURIComponent('El Access Token debe comenzar con APP_USR-.')}`,
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
    hero_saved,
    hero_error,
  } = await searchParams
  const settings = await getSettingsData()

  if (!settings) {
    redirect('/auth/login?redirect=/admin/settings')
  }

  const { email, profile, store } = settings
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

                <div className="space-y-2">
                  <Label htmlFor="storeSlug">Slug de la tienda</Label>
                  <Input
                    id="storeSlug"
                    name="storeSlug"
                    value={store.slug}
                    readOnly
                    className="bg-muted font-mono text-muted-foreground"
                  />
                </div>
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
        </div>

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
      </div>
    </div>
  )
}
