import { createAdminClient } from '@/lib/supabase/admin'

const GUEST_ORDER_RATE_LIMIT_MS = 5 * 60 * 1000

export type CheckoutCartItem = {
  id: string
  name: string
  price: number
  quantity: number
}

export type CheckoutCustomer = {
  name: string
  email: string
  phone: string
  address: string | null
}

export type CheckoutShippingConfig = {
  freeShippingThreshold: number
  shippingStandardCost: number
  shippingExpressCost: number
  freeShippingEnabled: boolean
}

type DbProduct = {
  id: string
  name: string
  price: number
  store_id: string
  active: boolean
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

function qualifiesForThresholdFreeShipping(
  orderSubtotal: number,
  config: CheckoutShippingConfig,
): boolean {
  return config.freeShippingEnabled && orderSubtotal >= config.freeShippingThreshold
}

function resolveFreeShippingFromProducts(
  cartItems: CheckoutCartItem[],
  dbProductNames: string[],
): boolean {
  if (cartItems.some((item) => hasFreeShippingByName(item.name))) {
    return true
  }

  return dbProductNames.some((name) => hasFreeShippingByName(name))
}

export function calculateCheckoutShippingCost(
  orderSubtotal: number,
  hasProductFreeShipping: boolean,
  selectedMethod: string,
  config: CheckoutShippingConfig,
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

export function resolveCheckoutShippingMethod(
  orderSubtotal: number,
  hasProductFreeShipping: boolean,
  selectedMethod: string,
  config: CheckoutShippingConfig,
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

export type CreateGuestOrderInput = {
  storeId: string
  items: CheckoutCartItem[]
  customer: CheckoutCustomer
  shippingMethod: string
  paymentMethod: 'mercadopago' | 'bank_transfer' | 'effectivo'
  shippingConfig: CheckoutShippingConfig
  profileId?: string | null
}

export type CreateGuestOrderResult =
  | { orderId: string }
  | { error: string; status?: number }

export async function createGuestOrder(
  input: CreateGuestOrderInput,
): Promise<CreateGuestOrderResult> {
  const admin = createAdminClient()
  const normalizedEmail = input.customer.email.trim().toLowerCase()

  if (!normalizedEmail.includes('@')) {
    return { error: 'El email no es válido.', status: 400 }
  }

  const rateLimitSince = new Date(Date.now() - GUEST_ORDER_RATE_LIMIT_MS).toISOString()

  const { data: recentOrder, error: rateLimitError } = await admin
    .from('orders')
    .select('id')
    .eq('store_id', input.storeId)
    .eq('customer_email', normalizedEmail)
    .gte('created_at', rateLimitSince)
    .limit(1)
    .maybeSingle()

  if (rateLimitError) {
    return { error: 'No se pudo validar el pedido.', status: 500 }
  }

  if (recentOrder) {
    return {
      error:
        'Ya registramos un pedido con este email hace pocos minutos. Esperá un momento antes de volver a intentar.',
      status: 429,
    }
  }

  const productIds = input.items.map((item) => item.id)

  const { data: products, error: productsError } = await admin
    .from('products')
    .select('id, name, price, store_id, active')
    .in('id', productIds)
    .eq('store_id', input.storeId)
    .eq('active', true)

  if (productsError || !products || products.length !== productIds.length) {
    return { error: 'Algunos productos del carrito ya no están disponibles.', status: 400 }
  }

  const productMap = new Map(
    (products as DbProduct[]).map((product) => [product.id, product]),
  )

  for (const item of input.items) {
    const product = productMap.get(item.id)

    if (!product) {
      return { error: 'Algunos productos del carrito ya no están disponibles.', status: 400 }
    }

    if (Number(product.price) !== Number(item.price)) {
      return { error: 'Los precios del carrito cambiaron. Actualizá tu carrito e intentá de nuevo.', status: 409 }
    }
  }

  const orderSubtotal = input.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  const orderHasFreeShipping = resolveFreeShippingFromProducts(
    input.items,
    (products as DbProduct[]).map((product) => product.name),
  )

  const orderShippingCost = calculateCheckoutShippingCost(
    orderSubtotal,
    orderHasFreeShipping,
    input.shippingMethod,
    input.shippingConfig,
  )

  const orderTotal = orderSubtotal + orderShippingCost

  const orderShippingMethod = resolveCheckoutShippingMethod(
    orderSubtotal,
    orderHasFreeShipping,
    input.shippingMethod,
    input.shippingConfig,
  )

  const isGuest = !input.profileId

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      store_id: input.storeId,
      customer_name: input.customer.name.trim(),
      customer_email: normalizedEmail,
      customer_phone: input.customer.phone.trim(),
      customer_address: input.customer.address,
      status: 'pending',
      payment_status: 'pending',
      payment_method: input.paymentMethod,
      shipping_method: orderShippingMethod,
      shipping_cost: orderShippingCost,
      subtotal: orderSubtotal,
      total: orderTotal,
      discount_amount: 0,
      is_guest: isGuest,
      profile_id: input.profileId ?? null,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    return { error: orderError?.message ?? 'No se pudo crear el pedido.', status: 500 }
  }

  const orderItems = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    unit_price: item.price,
    total: item.price * item.quantity,
  }))

  const { error: itemsError } = await admin.from('order_items').insert(orderItems)

  if (itemsError) {
    await admin.from('orders').delete().eq('id', order.id)
    return { error: itemsError.message, status: 500 }
  }

  return { orderId: order.id }
}
