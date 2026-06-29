import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Tag } from 'lucide-react'
import { CreateDiscountDialog } from '@/components/admin/create-discount-dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type DiscountType = 'percentage' | 'fixed' | 'free_shipping'

type DbDiscount = {
  id: string
  store_id: string
  code: string
  type: DiscountType
  value: number
  max_uses: number | null
  used_count: number
  min_purchase: number | null
  expires_at: string | null
  active: boolean
  created_at: string
}

type DiscountRow = {
  id: string
  code: string
  type: DiscountType
  value: number
  usedCount: number
  maxUses: number | null
  expiresAt: string | null
  active: boolean
}

type StoreDiscountsResult = {
  storeId: string
  discounts: DiscountRow[]
}

const DISCOUNT_TYPES: DiscountType[] = ['percentage', 'fixed', 'free_shipping']

function formatPrice(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function discountTypeLabel(type: DiscountType): string {
  switch (type) {
    case 'percentage':
      return 'Porcentaje'
    case 'fixed':
      return 'Monto fijo'
    case 'free_shipping':
      return 'Envío gratis'
    default:
      return type
  }
}

function discountTypeBadgeClasses(type: DiscountType): string {
  switch (type) {
    case 'percentage':
      return 'bg-blue-100 text-blue-700'
    case 'fixed':
      return 'bg-emerald-100 text-emerald-700'
    case 'free_shipping':
      return 'bg-violet-100 text-violet-700'
    default:
      return 'bg-muted text-foreground'
  }
}

function formatDiscountValue(type: DiscountType, value: number): string {
  switch (type) {
    case 'percentage':
      return `${value}%`
    case 'fixed':
      return formatPrice(value)
    case 'free_shipping':
      return 'Gratis'
    default:
      return String(value)
  }
}

function formatUses(usedCount: number, maxUses: number | null): string {
  if (maxUses === null) {
    return `${usedCount}/∞`
  }

  return `${usedCount}/${maxUses}`
}

function formatExpiration(expiresAt: string | null): string {
  if (!expiresAt) {
    return 'Sin expiración'
  }

  return formatDate(expiresAt)
}

function mapDiscount(discount: DbDiscount): DiscountRow {
  return {
    id: discount.id,
    code: discount.code,
    type: discount.type,
    value: Number(discount.value),
    usedCount: discount.used_count,
    maxUses: discount.max_uses,
    expiresAt: discount.expires_at,
    active: discount.active,
  }
}

async function getStoreDiscounts(): Promise<StoreDiscountsResult | null> {
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
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store) {
    return null
  }

  const { data: discounts, error: discountsError } = await supabase
    .from('discounts')
    .select(
      'id, store_id, code, type, value, max_uses, used_count, min_purchase, expires_at, active, created_at',
    )
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  if (discountsError) {
    return null
  }

  return {
    storeId: store.id,
    discounts: (discounts ?? []).map((discount) => mapDiscount(discount as DbDiscount)),
  }
}

export async function createDiscount(formData: FormData): Promise<{ error?: string } | void> {
  'use server'

  const code = formData.get('code')
  const type = formData.get('type')
  const value = formData.get('value')
  const minPurchase = formData.get('minPurchase')
  const maxUses = formData.get('maxUses')
  const expiresAt = formData.get('expiresAt')

  if (typeof code !== 'string' || !code.trim()) {
    return { error: 'El código es obligatorio.' }
  }

  if (typeof type !== 'string' || !DISCOUNT_TYPES.includes(type as DiscountType)) {
    return { error: 'Seleccioná un tipo de descuento válido.' }
  }

  const discountType = type as DiscountType
  const normalizedCode = code.trim().toUpperCase()

  let numericValue = 1

  if (discountType !== 'free_shipping') {
    if (typeof value !== 'string' || !value.trim()) {
      return { error: 'El valor es obligatorio.' }
    }

    numericValue = Number(value)

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return { error: 'El valor debe ser un número mayor a cero.' }
    }

    if (discountType === 'percentage' && numericValue > 100) {
      return { error: 'El porcentaje no puede superar 100.' }
    }
  }

  let parsedMinPurchase: number | null = null

  if (typeof minPurchase === 'string' && minPurchase.trim()) {
    parsedMinPurchase = Number(minPurchase)

    if (!Number.isFinite(parsedMinPurchase) || parsedMinPurchase <= 0) {
      return { error: 'El mínimo de compra debe ser un número mayor a cero.' }
    }
  }

  let parsedMaxUses: number | null = null

  if (typeof maxUses === 'string' && maxUses.trim()) {
    parsedMaxUses = Number(maxUses)

    if (!Number.isFinite(parsedMaxUses) || parsedMaxUses <= 0 || !Number.isInteger(parsedMaxUses)) {
      return { error: 'El máximo de usos debe ser un entero mayor a cero.' }
    }
  }

  let parsedExpiresAt: string | null = null

  if (typeof expiresAt === 'string' && expiresAt.trim()) {
    const expirationDate = new Date(`${expiresAt}T23:59:59`)

    if (Number.isNaN(expirationDate.getTime())) {
      return { error: 'La fecha de expiración no es válida.' }
    }

    parsedExpiresAt = expirationDate.toISOString()
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Tenés que iniciar sesión para crear descuentos.' }
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store) {
    return { error: 'No se encontró tu tienda.' }
  }

  const { error: insertError } = await supabase.from('discounts').insert({
    store_id: store.id,
    code: normalizedCode,
    type: discountType,
    value: numericValue,
    min_purchase: parsedMinPurchase,
    max_uses: parsedMaxUses,
    expires_at: parsedExpiresAt,
    active: true,
  })

  if (insertError) {
    if (insertError.code === '23505') {
      return { error: 'Ese código ya existe. Elegí otro.' }
    }

    return { error: 'No se pudo crear el descuento. Intentá de nuevo.' }
  }

  revalidatePath('/admin/marketing')
}

export async function toggleDiscountActive(formData: FormData): Promise<void> {
  'use server'

  const discountId = formData.get('discountId')
  const storeId = formData.get('storeId')
  const active = formData.get('active')

  if (
    typeof discountId !== 'string' ||
    typeof storeId !== 'string' ||
    typeof active !== 'string' ||
    (active !== 'true' && active !== 'false')
  ) {
    return
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id')
    .eq('id', storeId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store) {
    return
  }

  const { error: updateError } = await supabase
    .from('discounts')
    .update({ active: active === 'true' })
    .eq('id', discountId)
    .eq('store_id', storeId)

  if (updateError) {
    return
  }

  revalidatePath('/admin/marketing')
}

export default async function AdminMarketingPage() {
  const result = await getStoreDiscounts()

  if (!result) {
    redirect('/auth/login?redirect=/admin/marketing')
  }

  const { storeId, discounts } = result
  const activeDiscountsCount = discounts.filter((discount) => discount.active).length

  return (
    <div className="min-h-full">
      <div className="border-b border-brand-200 bg-white/60 px-6 py-6 backdrop-blur-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-brand-900">Marketing</h1>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm font-semibold">
                {discounts.length}
              </Badge>
            </div>
            <p className="text-sm text-brand-600">
              Gestioná los códigos de descuento de tu tienda.
            </p>
          </div>
          <CreateDiscountDialog createDiscount={createDiscount} />
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-6">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <Tag className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-foreground">{discounts.length}</p>
                <p className="text-sm text-muted-foreground">Códigos creados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-6">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <Tag className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-foreground">{activeDiscountsCount}</p>
                <p className="text-sm text-muted-foreground">Descuentos activos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-6">
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                <Tag className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-foreground">
                  {discounts.reduce((sum, discount) => sum + discount.usedCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Usos totales</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {discounts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <p className="text-lg font-medium text-foreground">
                Aún no tenés códigos de descuento creados
              </p>
              <p className="text-sm text-muted-foreground">
                Creá tu primer código para ofrecer promociones en tu tienda.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Códigos de descuento</CardTitle>
              <CardDescription>
                Listado de promociones configuradas para tu tienda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Usos</TableHead>
                    <TableHead>Expiración</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discounts.map((discount) => (
                    <TableRow key={discount.id} className="group hover:bg-muted/50">
                      <TableCell>
                        <Badge className="rounded-lg bg-red-100 px-2 py-1 font-mono text-sm font-semibold text-red-700">
                          {discount.code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            'rounded-full px-2 py-1 text-xs font-semibold',
                            discountTypeBadgeClasses(discount.type),
                          )}
                        >
                          {discountTypeLabel(discount.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatDiscountValue(discount.type, discount.value)}
                      </TableCell>
                      <TableCell>{formatUses(discount.usedCount, discount.maxUses)}</TableCell>
                      <TableCell>{formatExpiration(discount.expiresAt)}</TableCell>
                      <TableCell>
                        <form action={toggleDiscountActive}>
                          <input type="hidden" name="discountId" value={discount.id} />
                          <input type="hidden" name="storeId" value={storeId} />
                          <input
                            type="hidden"
                            name="active"
                            value={String(!discount.active)}
                          />
                          <button
                            type="submit"
                            className={cn(
                              'inline-flex rounded-full px-2 py-1 text-xs font-semibold transition-opacity hover:opacity-80',
                              discount.active
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-700',
                            )}
                          >
                            {discount.active ? 'Activo' : 'Inactivo'}
                          </button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
