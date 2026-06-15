import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

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
  description: string | null
  primary_color: string | null
  secondary_color: string | null
}

type SettingsData = {
  email: string
  profile: DbProfile
  store: DbStore
}

type SettingsPageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>
}

const DEFAULT_PRIMARY_COLOR = '#DC2626'
const DEFAULT_SECONDARY_COLOR = '#16A34A'

function normalizeHexColor(value: string, fallback: string): string {
  const normalized = value.trim()

  if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
    return normalized.toUpperCase()
  }

  return fallback
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
    .select('id, owner_id, name, slug, logo_url, description, primary_color, secondary_color')
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

export default async function AdminSettingsPage({ searchParams }: SettingsPageProps) {
  const { saved, error } = await searchParams
  const settings = await getSettingsData()

  if (!settings) {
    redirect('/auth/login?redirect=/admin/settings')
  }

  const { email, profile, store } = settings
  const primaryColor = store.primary_color ?? DEFAULT_PRIMARY_COLOR
  const secondaryColor = store.secondary_color ?? DEFAULT_SECONDARY_COLOR

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

        <form action={saveSettings} className="space-y-6">
          <input type="hidden" name="storeId" value={store.id} />

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
                  defaultValue={store.logo_url ?? ''}
                  placeholder="https://ejemplo.com/logo.png"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Color primario</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="primaryColor"
                      name="primaryColor"
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
            <Button type="submit" className="bg-red-600 text-white hover:bg-red-700">
              Guardar configuración
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
