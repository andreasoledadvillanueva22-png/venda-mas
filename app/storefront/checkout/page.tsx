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
  Store,
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

type ShippingConfig = {
  freeShippingThreshold: number
  shippingStandardCost: number
  shippingExpressCost: number
  freeShippingEnabled: boolean
}

const DEFAULT_SHIPPING_CONFIG: ShippingConfig = {
  freeShippingThreshold: 50000,
  shippingStandardCost: 5000,
  shippingExpressCost: 8500,
  freeShippingEnabled: true,
}

type LocalPickupConfig = {
  enabled: boolean
  address: string | null
  instructions: string | null
  schedule: string | null
}

const DEFAULT_LOCAL_PICKUP_CONFIG: LocalPickupConfig = {
  enabled: false,
  address: null,
  instructions: null,
  schedule: null,
}

type ShippingMethodOption = {
  id: 'standard' | 'express' | 'free' | 'local_pickup'
  label: string
  price: number
}

const paymentMethods = [
  { id: 'mercadopago', label: 'Mercado Pago', icon: '💳' },
  { id: 'bank_transfer', label: 'Transferencia Bancaria', icon: '🏦' },
  { id: 'effectivo', label: 'Efectivo Contra Entrega', icon: '💵' },
] as const

type PaymentMethodId = (typeof paymentMethods)[number]['id']

type BankDetailsConfig = {
  bankName: string | null
  cbu: string | null
  alias: string | null
  accountHolder: string | null
  cuit: string | null
}

const DEFAULT_BANK_DETAILS: BankDetailsConfig = {
  bankName: null,
  cbu: null,
  alias: null,
  accountHolder: null,
  cuit: null,
}

function isBankTransferConfigured(bankDetails: BankDetailsConfig): boolean {
  return Boolean(
    bankDetails.bankName?.trim() &&
      bankDetails.cbu?.trim() &&
      bankDetails.alias?.trim() &&
      bankDetails.accountHolder?.trim() &&
      bankDetails.cuit?.trim(),
  )
}

function BankTransferDetails({ bankDetails }: { bankDetails: BankDetailsConfig }) {
  const [copiedField, setCopiedField] = useState<'cbu' | 'alias' | null>(null)

  const copyToClipboard = async (value: string, field: 'cbu' | 'alias') => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      window.setTimeout(() => setCopiedField(null), 2000)
    } catch {
      setCopiedField(null)
    }
  }

  return (
    <div className="space-y-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
      <div>
        <p className="font-semibold text-slate-900">Datos para transferir</p>
        <p className="mt-2 text-slate-600">
          Realizá la transferencia y enviá el comprobante por WhatsApp.
        </p>
      </div>

      <div className="space-y-2">
        <p>
          <span className="font-semibold text-slate-900">Banco: </span>
          {bankDetails.bankName}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Titular: </span>
          {bankDetails.accountHolder}
        </p>
        <p>
          <span className="font-semibold text-slate-900">CUIT: </span>
          {bankDetails.cuit}
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-semibold text-slate-900">CBU: </span>
            <span className="font-mono">{bankDetails.cbu}</span>
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void copyToClipboard(bankDetails.cbu ?? '', 'cbu')}
          >
            {copiedField === 'cbu' ? 'CBU copiado' : 'Copiar CBU'}
          </Button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-semibold text-slate-900">Alias: </span>
            <span className="font-mono">{bankDetails.alias}</span>
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void copyToClipboard(bankDetails.alias ?? '', 'alias')}
          >
            {copiedField === 'alias' ? 'Alias copiado' : 'Copiar alias'}
          </Button>
        </div>
      </div>
    </div>
  )
}

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

function buildPickupCustomerAddress(config: LocalPickupConfig): string | null {
  if (!config.address?.trim()) {
    return null
  }

  const parts = [config.address.trim()]

  if (config.schedule?.trim()) {
    parts.push(`Horarios: ${config.schedule.trim()}`)
  }

  if (config.instructions?.trim()) {
    parts.push(`Instrucciones: ${config.instructions.trim()}`)
  }

  return parts.join(' · ')
}

function normalizeProductName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
}

function hasFreeShippingByName(productName: string): boolean {
  return normalizeProductName(productName).includes('ENVIO GRATIS')
}

function cartHasFreeShippingByName(cartItems: { name: string }[]): boolean {
  return cartItems.some((item) => hasFreeShippingByName(item.name))
}

function qualifiesForThresholdFreeShipping(
  orderSubtotal: number,
  config: ShippingConfig,
): boolean {
  return config.freeShippingEnabled && orderSubtotal >= config.freeShippingThreshold
}

function calculateShippingCost(
  orderSubtotal: number,
  hasProductFreeShipping: boolean,
  selectedMethod: string,
  config: ShippingConfig,
): number {
  if (selectedMethod === 'local_pickup') {
    return 0
  }

  if (hasProductFreeShipping || qualifiesForThresholdFreeShipping(orderSubtotal, config)) {
    return 0
  }

  if (selectedMethod === 'express') {
    return config.shippingExpressCost
  }

  return config.shippingStandardCost
}

function resolveShippingMethod(
  orderSubtotal: number,
  hasProductFreeShipping: boolean,
  selectedMethod: string,
  config: ShippingConfig,
): 'free' | 'standard' | 'express' | 'local_pickup' {
  if (selectedMethod === 'local_pickup') {
    return 'local_pickup'
  }

  if (hasProductFreeShipping || qualifiesForThresholdFreeShipping(orderSubtotal, config)) {
    return 'free'
  }

  if (selectedMethod === 'express') {
    return 'express'
  }

  return 'standard'
}

function buildShippingMethodOptions(
  config: ShippingConfig,
  localPickup: LocalPickupConfig,
): ShippingMethodOption[] {
  const methods: ShippingMethodOption[] = []

  if (localPickup.enabled) {
    methods.push({
      id: 'local_pickup',
      label: 'Retiro en local',
      price: 0,
    })
  }

  methods.push(
    {
      id: 'standard',
      label: 'Estándar (3-5 días)',
      price: config.shippingStandardCost,
    },
    {
      id: 'express',
      label: 'Express (24-48hs)',
      price: config.shippingExpressCost,
    },
  )

  if (config.freeShippingEnabled) {
    methods.push({
      id: 'free',
      label: `Gratis (compra mayor a $${config.freeShippingThreshold.toLocaleString('es-AR')})`,
      price: 0,
    })
  }

  return methods
}

function resolveFreeShippingFromProducts(
  cartItems: { name: string }[],
  dbProductNames: string[],
): boolean {
  if (cartHasFreeShippingByName(cartItems)) {
    return true
  }

  return dbProductNames.some((name) => hasFreeShippingByName(name))
}

type CheckoutStore = {
  id: string
  name: string
  shippingConfig: ShippingConfig
  localPickupConfig: LocalPickupConfig
  bankDetails: BankDetailsConfig
}

const STORE_SELECT_FIELDS =
  'id, name, free_shipping_threshold, shipping_standard_cost, shipping_express_cost, free_shipping_enabled, enable_local_pickup, pickup_address, pickup_instructions, pickup_schedule, bank_name, cbu, alias, account_holder, cuit'

function mapCheckoutStore(store: {
  id: string
  name: string
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
}): CheckoutStore {
  return {
    id: store.id,
    name: store.name,
    shippingConfig: {
      freeShippingThreshold: Number(
        store.free_shipping_threshold ?? DEFAULT_SHIPPING_CONFIG.freeShippingThreshold,
      ),
      shippingStandardCost: Number(
        store.shipping_standard_cost ?? DEFAULT_SHIPPING_CONFIG.shippingStandardCost,
      ),
      shippingExpressCost: Number(
        store.shipping_express_cost ?? DEFAULT_SHIPPING_CONFIG.shippingExpressCost,
      ),
      freeShippingEnabled:
        store.free_shipping_enabled ?? DEFAULT_SHIPPING_CONFIG.freeShippingEnabled,
    },
    localPickupConfig: {
      enabled: store.enable_local_pickup ?? DEFAULT_LOCAL_PICKUP_CONFIG.enabled,
      address: store.pickup_address ?? null,
      instructions: store.pickup_instructions ?? null,
      schedule: store.pickup_schedule ?? null,
    },
    bankDetails: {
      bankName: store.bank_name ?? null,
      cbu: store.cbu ?? null,
      alias: store.alias ?? null,
      accountHolder: store.account_holder ?? null,
      cuit: store.cuit ?? null,
    },
  }
}

async function resolveCheckoutStore(
  supabase: ReturnType<typeof createClient>,
  storeSlug: string | null,
  productIds: string[],
): Promise<CheckoutStore | null> {
  if (storeSlug) {
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select(STORE_SELECT_FIELDS)
      .eq('slug', storeSlug)
      .maybeSingle()

    if (!storeError && store) {
      return mapCheckoutStore(store)
    }
  }

  if (productIds.length > 0) {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('store_id')
      .in('id', productIds)
      .eq('active', true)

    if (productsError || !products || products.length === 0) {
      return null
    }

    const storeIds = [...new Set(products.map((product: { store_id: string }) => product.store_id))]

    if (storeIds.length !== 1) {
      return null
    }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select(STORE_SELECT_FIELDS)
      .eq('id', storeIds[0])
      .maybeSingle()

    if (!storeError && store) {
      return mapCheckoutStore(store)
    }
  }

  return null
}

async function prefillCustomerFromSession(
  supabase: ReturnType<typeof createClient>,
): Promise<Partial<CheckoutFormData>> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {}
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle()

  return {
    email: profile?.email ?? user.email ?? '',
    nombre: profile?.full_name ?? '',
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const { items, subtotal, clearCart } = useCart()

  const [storeLoading, setStoreLoading] = useState(true)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [storeName, setStoreName] = useState<string | null>(null)
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>(DEFAULT_SHIPPING_CONFIG)
  const [localPickupConfig, setLocalPickupConfig] = useState<LocalPickupConfig>(
    DEFAULT_LOCAL_PICKUP_CONFIG,
  )
  const [bankDetails, setBankDetails] = useState<BankDetailsConfig>(DEFAULT_BANK_DETAILS)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)
  const [hasProductFreeShipping, setHasProductFreeShipping] = useState(false)

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
    async function loadCheckoutStore() {
      setStoreLoading(true)

      const storeSlug = new URLSearchParams(window.location.search).get('store')
      const productIds = items.map((item) => item.id)
      const store = await resolveCheckoutStore(supabase, storeSlug, productIds)
      const customerPrefill = await prefillCustomerFromSession(supabase)

      setStoreId(store?.id ?? null)
      setStoreName(store?.name ?? null)

      if (store) {
        setShippingConfig(store.shippingConfig)
        setLocalPickupConfig(store.localPickupConfig)
        setBankDetails(store.bankDetails)
      }

      if (customerPrefill.email || customerPrefill.nombre) {
        setFormData((prev) => ({
          ...prev,
          email: customerPrefill.email || prev.email,
          nombre: customerPrefill.nombre || prev.nombre,
        }))
      }

      setStoreLoading(false)
    }

    void loadCheckoutStore()
  }, [supabase, items])

  useEffect(() => {
    async function loadProductFreeShipping() {
      const fromCart = cartHasFreeShippingByName(items)
      setHasProductFreeShipping(fromCart)

      if (fromCart || !storeId || items.length === 0) {
        return
      }

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name')
        .in(
          'id',
          items.map((item) => item.id),
        )
        .eq('store_id', storeId)

      if (productsError || !products) {
        return
      }

      setHasProductFreeShipping(
        resolveFreeShippingFromProducts(
          items,
          products.map((product: { name: string }) => product.name),
        ),
      )
    }

    void loadProductFreeShipping()
  }, [items, storeId, supabase])

  useEffect(() => {
    if (shippingMethod === 'local_pickup') {
      return
    }

    const qualifiesForFree =
      hasProductFreeShipping ||
      (shippingConfig.freeShippingEnabled && subtotal >= shippingConfig.freeShippingThreshold)

    if (qualifiesForFree) {
      setShippingMethod('free')
    } else if (shippingMethod === 'free') {
      setShippingMethod('standard')
    }
  }, [
    hasProductFreeShipping,
    subtotal,
    shippingConfig.freeShippingEnabled,
    shippingConfig.freeShippingThreshold,
    shippingMethod,
  ])

  useEffect(() => {
    if (!localPickupConfig.enabled && shippingMethod === 'local_pickup') {
      setShippingMethod('standard')
    }
  }, [localPickupConfig.enabled, shippingMethod])

  useEffect(() => {
    if (!isBankTransferConfigured(bankDetails) && paymentMethod === 'bank_transfer') {
      setPaymentMethod('mercadopago')
    }
  }, [bankDetails, paymentMethod])

  const availablePaymentMethods = useMemo(
    () =>
      paymentMethods.filter(
        (method) => method.id !== 'bank_transfer' || isBankTransferConfigured(bankDetails),
      ),
    [bankDetails],
  )

  const isLocalPickup = shippingMethod === 'local_pickup'

  const shippingMethods = useMemo(
    () => buildShippingMethodOptions(shippingConfig, localPickupConfig),
    [shippingConfig, localPickupConfig],
  )

  const qualifiesForFreeShipping =
    hasProductFreeShipping || qualifiesForThresholdFreeShipping(subtotal, shippingConfig)

  const shippingCost = calculateShippingCost(
    subtotal,
    hasProductFreeShipping,
    shippingMethod,
    shippingConfig,
  )

  const freeShippingRemaining = Math.max(0, shippingConfig.freeShippingThreshold - subtotal)

  const freeShippingProgressPercent = shippingConfig.freeShippingThreshold
    ? Math.min(100, (subtotal / shippingConfig.freeShippingThreshold) * 100)
    : 0

  const showFreeShippingProgress =
    !isLocalPickup &&
    shippingConfig.freeShippingEnabled &&
    !hasProductFreeShipping &&
    subtotal < shippingConfig.freeShippingThreshold

  const total = subtotal + shippingCost

  if (storeLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <p className="text-sm text-slate-500">Cargando checkout...</p>
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

  if (!storeId) {
    const storeSlug = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('store')
      : null

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-lg font-semibold text-slate-900">
              No pudimos identificar la tienda
            </p>
            <p className="text-center text-sm text-slate-500">
              Volvé al catálogo, agregá productos al carrito e intentá nuevamente.
            </p>
            <Link
              href={
                storeSlug
                  ? `/storefront/products?store=${encodeURIComponent(storeSlug)}`
                  : '/storefront/products'
              }
            >
              <Button className="mt-2 bg-red-600 text-white hover:bg-red-700">
                Ir al catálogo
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
    if (!isLocalPickup) {
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
    }
    if (!acceptTerms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const createOrder = async (): Promise<{ orderId: string } | { error: string }> => {
    if (!storeId) {
      return { error: 'No se pudo identificar la tienda.' }
    }

    const customerAddress = isLocalPickup
      ? buildPickupCustomerAddress(localPickupConfig)
      : buildCustomerAddress(formData)

    const response = await fetch('/api/storefront/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storeId,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        customer: {
          name: formData.nombre.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: customerAddress,
        },
        shippingMethod,
        paymentMethod,
        shippingConfig,
      }),
    })

    const payload = (await response.json()) as { orderId?: string; error?: string }

    if (!response.ok || !payload.orderId) {
      return { error: payload.error ?? 'No se pudo crear el pedido.' }
    }

    return { orderId: payload.orderId }
  }

  const startMercadoPagoPayment = async (
    orderId: string,
  ): Promise<{ ok: true } | { error: string }> => {
    const response = await fetch('/api/mercadopago/create-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
    })

    const payload = (await response.json()) as { initPoint?: string; error?: string }

    if (!response.ok || !payload.initPoint) {
      return { error: payload.error ?? 'No se pudo iniciar el pago con Mercado Pago.' }
    }

    clearCart()
    window.location.href = payload.initPoint
    return { ok: true }
  }

  const handleRetryPayment = async () => {
    if (!pendingOrderId) {
      return
    }

    setSubmitting(true)
    setPaymentError('')
    setSubmitError('')

    try {
      const paymentResult = await startMercadoPagoPayment(pendingOrderId)

      if ('error' in paymentResult) {
        setPaymentError(paymentResult.error)
      }
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    setSubmitError('')
    setPaymentError('')

    try {
      const orderResult = await createOrder()

      if ('error' in orderResult) {
        setSubmitError(orderResult.error)
        return
      }

      if (paymentMethod === 'mercadopago') {
        setPendingOrderId(orderResult.orderId)
        const paymentResult = await startMercadoPagoPayment(orderResult.orderId)

        if ('error' in paymentResult) {
          setPaymentError(paymentResult.error)
        }

        return
      }

      clearCart()
      router.push(`/storefront/checkout/confirmation?orderId=${orderResult.orderId}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.')
    } finally {
      setSubmitting(false)
    }
  }

  const checkoutTitle = `${storeName?.trim() || 'Tu Tienda'} - Checkout`

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
            <h1 className="text-2xl font-semibold text-slate-950">{checkoutTitle}</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {submitError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {submitError}
          </div>
        )}

        {paymentError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p>{paymentError}</p>
            {pendingOrderId ? (
              <Button
                type="button"
                onClick={handleRetryPayment}
                disabled={submitting}
                className="mt-4 bg-red-600 text-white hover:bg-red-700"
              >
                {submitting ? 'Reintentando...' : 'Reintentar pago'}
              </Button>
            ) : null}
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
                <p className="text-sm text-muted-foreground">
                  Comprá sin crear cuenta.{' '}
                  <Link
                    href={`/auth/login?redirect=${encodeURIComponent('/storefront/checkout')}`}
                    className="font-medium text-red-600 hover:text-red-700"
                  >
                    ¿Ya tenés cuenta? Iniciá sesión
                  </Link>
                </p>
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
                {isLocalPickup ? (
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
                ) : null}
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

            {isLocalPickup ? (
              <Card className="rounded-[2rem]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-red-600" />
                    Retiro en local
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                  {localPickupConfig.address ? (
                    <p>
                      <span className="font-semibold text-slate-900">Dirección: </span>
                      {localPickupConfig.address}
                    </p>
                  ) : null}
                  {localPickupConfig.schedule ? (
                    <p>
                      <span className="font-semibold text-slate-900">Horarios: </span>
                      {localPickupConfig.schedule}
                    </p>
                  ) : null}
                  {localPickupConfig.instructions ? (
                    <p>
                      <span className="font-semibold text-slate-900">Instrucciones: </span>
                      {localPickupConfig.instructions}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ) : (
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
            )}

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
                      <p className="text-sm font-semibold text-slate-900">
                        {method.id === 'free' && hasProductFreeShipping
                          ? 'Gratis (producto con envío incluido)'
                          : method.label}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {method.id === 'local_pickup' || method.price === 0 || qualifiesForFreeShipping
                        ? 'Gratis'
                        : method.id === 'free'
                          ? '—'
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
                {availablePaymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(event) =>
                        setPaymentMethod(event.target.value as PaymentMethodId)
                      }
                      disabled={submitting}
                      className="h-4 w-4 accent-red-600"
                    />
                    <span className="text-lg">{method.icon}</span>
                    <span className="text-sm font-semibold text-slate-900">{method.label}</span>
                  </label>
                ))}
                {paymentMethod === 'bank_transfer' && isBankTransferConfigured(bankDetails) ? (
                  <BankTransferDetails bankDetails={bankDetails} />
                ) : null}
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
                  {showFreeShippingProgress ? (
                    <div className="space-y-2 rounded-lg bg-slate-50 p-3">
                      <p className="text-sm font-medium text-slate-800">
                        ¡Te faltan ${freeShippingRemaining.toLocaleString('es-AR')} para envío gratis!
                      </p>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-red-600 transition-all duration-300"
                          style={{ width: `${freeShippingProgressPercent}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                  {qualifiesForFreeShipping && !hasProductFreeShipping ? (
                    <p className="text-sm font-medium text-emerald-600">
                      ¡Alcanzaste el envío gratis por monto de compra!
                    </p>
                  ) : null}
                  <div className="flex justify-between text-slate-600">
                    <span>Envío</span>
                    <span>
                      {isLocalPickup
                        ? 'Retiro en local (Gratis)'
                        : shippingCost === 0
                          ? 'Gratis'
                          : `$${shippingCost.toLocaleString('es-AR')}`}
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
