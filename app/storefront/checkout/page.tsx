'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Mail,
  MapPin,
  Shield,
  Truck,
  CreditCard,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const provincias = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Córdoba',
  'Corrientes',
  'Chaco',
  'Chubut',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
]

const shippingMethods = [
  { id: 'standard', label: 'Estándar (3-5 días)', price: 5000 },
  { id: 'express', label: 'Express (24-48hs)', price: 8500 },
  { id: 'free', label: 'Gratis (compra mayor a $50.000)', price: 0 },
]

const paymentMethods = [
  { id: 'mercadopago', label: 'Mercado Pago', icon: '💳' },
  { id: 'transfer', label: 'Transferencia Bancaria', icon: '🏦' },
  { id: 'effectivo', label: 'Efectivo Contra Entrega', icon: '💵' },
]

type CheckoutFormData = {
  email: string
  phone: string
  subscribir: boolean
  nombre: string
  dni: string
  calle: string
  piso: string
  ciudad: string
  provincia: string
  codigoPostal: string
  referencias: string
}

function buildCustomerAddress(formData: CheckoutFormData): string {
  const parts = [
    formData.calle.trim(),
    formData.piso.trim(),
    `${formData.ciudad.trim()}, ${formData.provincia.trim()}`,
    `CP ${formData.codigoPostal.trim()}`,
    formData.referencias.trim(),
    formData.dni.trim() ? `DNI: ${formData.dni.trim()}` : '',
  ].filter(Boolean)

  return parts.join(' · ')
}

function calculateShippingCost(orderSubtotal: number): number {
  return orderSubtotal > 50000 ? 0 : 5000
}

function resolveShippingMethod(orderSubtotal: number): 'free' | 'standard' {
  return orderSubtotal > 50000 ? 'free' : 'standard'
}

async function getAuthenticatedStoreId(
  supabase: ReturnType<typeof createClient>,
): Promise<string | null> {
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

  return store.id
}

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const { items, subtotal, clearCart } = useCart()

  const [authLoading, setAuthLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    phone: '',
    subscribir: false,
    nombre: '',
    dni: '',
    calle: '',
    piso: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    referencias: '',
  })

  const [shippingMethod, setShippingMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('mercadopago')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadAuthenticatedStore() {
      setAuthLoading(true)
      const resolvedStoreId = await getAuthenticatedStoreId(supabase)
      setStoreId(resolvedStoreId)
      setIsAuthenticated(Boolean(resolvedStoreId))
      setAuthLoading(false)
    }

    void loadAuthenticatedStore()
  }, [supabase])

  const shippingCost = calculateShippingCost(subtotal)
  const total = subtotal + shippingCost

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <p className="text-sm text-slate-500">Verificando sesión...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-lg font-semibold text-slate-900">Tu carrito está vacío</p>
            <p className="text-center text-sm text-slate-500">
              No hay productos para comprar. Volvé a la tienda para agregar productos.
            </p>
            <Link href="/storefront/products">
              <Button className="mt-4 bg-red-600 text-white hover:bg-red-700">
                Ir a productos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated || !storeId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-lg font-semibold text-slate-900">
              Iniciá sesión para completar la compra
            </p>
            <p className="text-center text-sm text-slate-500">
              Necesitás una cuenta activa con tienda para registrar tu pedido.
            </p>
            <Link href="/auth/login?redirect=/storefront/checkout">
              <Button className="mt-2 bg-red-600 text-white hover:bg-red-700">
                Iniciar sesión
              </Button>
            </Link>
            <Link
              href="/storefront/cart"
              className="text-sm text-red-600 hover:text-red-700"
            >
              Volver al carrito
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email requerido'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Teléfono requerido'
    }
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Nombre requerido'
    }
    if (!formData.calle.trim()) {
      newErrors.calle = 'Dirección requerida'
    }
    if (!formData.ciudad.trim()) {
      newErrors.ciudad = 'Ciudad requerida'
    }
    if (!formData.provincia) {
      newErrors.provincia = 'Provincia requerida'
    }
    if (!formData.codigoPostal.trim()) {
      newErrors.codigoPostal = 'Código postal requerido'
    }
    if (!acceptTerms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      const productIds = items.map((item) => item.id)

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .in('id', productIds)
        .eq('store_id', storeId)
        .eq('active', true)

      if (productsError || !products || products.length !== productIds.length) {
        setSubmitError('Algunos productos del carrito ya no están disponibles.')
        return
      }

      const orderSubtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      )
      const orderShippingCost = calculateShippingCost(orderSubtotal)
      const orderTotal = orderSubtotal + orderShippingCost
      const orderShippingMethod = resolveShippingMethod(orderSubtotal)

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          store_id: storeId,
          customer_name: formData.nombre.trim(),
          customer_email: formData.email.trim(),
          customer_phone: formData.phone.trim(),
          customer_address: buildCustomerAddress(formData),
          status: 'pending',
          payment_status: 'pending',
          payment_method: paymentMethod as 'mercadopago' | 'transfer' | 'effectivo',
          shipping_method: orderShippingMethod,
          shipping_cost: orderShippingCost,
          subtotal: orderSubtotal,
          total: orderTotal,
          discount_amount: 0,
        })
        .select('id')
        .single()

      if (orderError || !order) {
        setSubmitError(orderError?.message ?? 'No se pudo crear el pedido.')
        return
      }

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total: item.price * item.quantity,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

      if (itemsError) {
        setSubmitError(itemsError.message)
        return
      }

      clearCart()
      router.push(`/storefront/checkout/confirmation?orderId=${order.id}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/storefront/cart"
            className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al carrito
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 font-semibold text-red-600">
              F
            </div>
            <h1 className="text-2xl font-semibold text-slate-950">Fashion Store - Checkout</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {submitError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="rounded-[2rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-red-600" />
                  Datos de contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                    className="mt-1"
                    disabled={submitting}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono/WhatsApp *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+54 9 11 1234-5678"
                    value={formData.phone}
                    onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                    className="mt-1"
                    disabled={submitting}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.subscribir}
                    onChange={(event) =>
                      setFormData({ ...formData, subscribir: event.target.checked })
                    }
                    disabled={submitting}
                    className="h-4 w-4 rounded border-slate-300 text-red-600 accent-red-600"
                  />
                  <span className="text-sm text-slate-700">
                    Enviarme novedades y promociones por email
                  </span>
                </label>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  Dirección de envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre completo *</Label>
                  <Input
                    id="nombre"
                    placeholder="Juan Pérez"
                    value={formData.nombre}
                    onChange={(event) => setFormData({ ...formData, nombre: event.target.value })}
                    className="mt-1"
                    disabled={submitting}
                  />
                  {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
                </div>
                <div>
                  <Label htmlFor="dni">DNI (opcional)</Label>
                  <Input
                    id="dni"
                    placeholder="12.345.678"
                    value={formData.dni}
                    onChange={(event) => setFormData({ ...formData, dni: event.target.value })}
                    className="mt-1"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label htmlFor="calle">Calle y número *</Label>
                  <Input
                    id="calle"
                    placeholder="Av. Libertador 1234"
                    value={formData.calle}
                    onChange={(event) => setFormData({ ...formData, calle: event.target.value })}
                    className="mt-1"
                    disabled={submitting}
                  />
                  {errors.calle && <p className="mt-1 text-xs text-red-600">{errors.calle}</p>}
                </div>
                <div>
                  <Label htmlFor="piso">Piso/Departamento (opcional)</Label>
                  <Input
                    id="piso"
                    placeholder="5° B"
                    value={formData.piso}
                    onChange={(event) => setFormData({ ...formData, piso: event.target.value })}
                    className="mt-1"
                    disabled={submitting}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="ciudad">Ciudad *</Label>
                    <Input
                      id="ciudad"
                      placeholder="Buenos Aires"
                      value={formData.ciudad}
                      onChange={(event) => setFormData({ ...formData, ciudad: event.target.value })}
                      className="mt-1"
                      disabled={submitting}
                    />
                    {errors.ciudad && (
                      <p className="mt-1 text-xs text-red-600">{errors.ciudad}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="provincia">Provincia *</Label>
                    <Select
                      value={formData.provincia}
                      onValueChange={(value) => {
                        if (value) {
                          setFormData({ ...formData, provincia: value })
                        }
                      }}
                      disabled={submitting}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {provincias.map((prov) => (
                          <SelectItem key={prov} value={prov}>
                            {prov}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.provincia && (
                      <p className="mt-1 text-xs text-red-600">{errors.provincia}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="codigoPostal">Código postal *</Label>
                  <Input
                    id="codigoPostal"
                    placeholder="1010"
                    value={formData.codigoPostal}
                    onChange={(event) =>
                      setFormData({ ...formData, codigoPostal: event.target.value })
                    }
                    className="mt-1"
                    disabled={submitting}
                  />
                  {errors.codigoPostal && (
                    <p className="mt-1 text-xs text-red-600">{errors.codigoPostal}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="referencias">Referencias (opcional)</Label>
                  <textarea
                    id="referencias"
                    placeholder="Ej: Casa con portón azul, timbre en la derecha"
                    value={formData.referencias}
                    onChange={(event) =>
                      setFormData({ ...formData, referencias: event.target.value })
                    }
                    rows={3}
                    disabled={submitting}
                    className="mt-1 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-ring/50"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-red-600" />
                  Método de envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {shippingMethods.map((method) => (
                  <label
                    key={method.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={method.id}
                      checked={shippingMethod === method.id}
                      onChange={(event) => setShippingMethod(event.target.value)}
                      disabled={submitting}
                      className="h-4 w-4 accent-red-600"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{method.label}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {subtotal > 50000 && method.id === 'free'
                        ? 'Gratis'
                        : method.id === 'free'
                          ? '—'
                          : method.price === 0
                            ? 'Gratis'
                            : `$${method.price.toLocaleString('es-AR')}`}
                    </span>
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[2rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-red-600" />
                  Método de pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                      disabled={submitting}
                      className="h-4 w-4 accent-red-600"
                    />
                    <span className="text-lg">{method.icon}</span>
                    <span className="text-sm font-semibold text-slate-900">{method.label}</span>
                  </label>
                ))}
                {paymentMethod === 'transfer' && (
                  <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Datos de transferencia:</p>
                    <p className="mt-2">CBU: 0072001720000000000000</p>
                    <p>Alias: fashionstore.tienda</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[2rem]">
              <CardContent className="pt-6">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(event) => setAcceptTerms(event.target.checked)}
                    disabled={submitting}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600 accent-red-600"
                  />
                  <span className="text-sm text-slate-600">
                    Acepto los{' '}
                    <a href="#" className="text-red-600 hover:underline">
                      términos y condiciones
                    </a>{' '}
                    y la{' '}
                    <a href="#" className="text-red-600 hover:underline">
                      política de privacidad
                    </a>
                  </span>
                </label>
                {errors.terms && <p className="mt-2 text-xs text-red-600">{errors.terms}</p>}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 w-full rounded-full bg-red-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-red-600/10 hover:bg-red-700"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitting ? 'Procesando pedido...' : 'Confirmar compra'}
                </Button>
              </CardContent>
            </Card>
          </form>

          <aside className="sticky top-6 space-y-6">
            <Card className="rounded-[2rem]">
              <CardHeader>
                <CardTitle>Resumen del pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-48 space-y-3 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 text-sm">
                        <p className="line-clamp-2 font-semibold text-slate-900">{item.name}</p>
                        <p className="text-slate-500">x{item.quantity}</p>
                        <p className="font-semibold text-slate-900">
                          ${(item.price * item.quantity).toLocaleString('es-AR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Envío</span>
                    <span>
                      {shippingCost === 0 ? 'Gratis' : `$${shippingCost.toLocaleString('es-AR')}`}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-2xl font-semibold text-red-600">
                    ${total.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  Pago seguro con Mercado Pago
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
