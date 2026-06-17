import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

type CreatePreferenceBody = {
  orderId?: string
}

type DbOrder = {
  id: string
  store_id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  total: number
  subtotal: number
  shipping_cost: number
}

type DbOrderItem = {
  quantity: number
  unit_price: number
  total: number
  products: { name: string } | { name: string }[] | null
}

type MercadoPagoPreferenceItem = {
  title: string
  quantity: number
  unit_price: number
  currency_id: string
}

type MercadoPagoPreferenceResponse = {
  id: string
  init_point: string
  sandbox_init_point?: string
}

type MercadoPagoErrorResponse = {
  message?: string
  error?: string
  cause?: Array<{ description?: string }>
}

function getProductName(
  products: DbOrderItem['products'],
): string {
  if (!products) {
    return 'Producto'
  }

  if (Array.isArray(products)) {
    return products[0]?.name ?? 'Producto'
  }

  return products.name
}

function getRequestOrigin(request: NextRequest): string {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, '')
  }

  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'http'

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }

  return new URL(request.url).origin
}

function isTestCredential(value: string): boolean {
  return value.includes('TEST')
}

function buildConfirmationUrl(origin: string, orderId: string, status: string): string {
  const params = new URLSearchParams({
    order_id: orderId,
    status,
  })

  return `${origin}/storefront/order-confirmation?${params.toString()}`
}

function isDevelopment(origin: string): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  try {
    const { hostname } = new URL(origin)
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  let body: CreatePreferenceBody

  try {
    body = (await request.json()) as CreatePreferenceBody
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
  }

  const orderId = body.orderId?.trim()

  if (!orderId) {
    return NextResponse.json({ error: 'orderId es obligatorio' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: order, error: orderError } = await admin
    .from('orders')
    .select(
      'id, store_id, customer_name, customer_email, customer_phone, total, subtotal, shipping_cost',
    )
    .eq('id', orderId)
    .maybeSingle()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  const typedOrder = order as DbOrder

  const { data: store, error: storeError } = await admin
    .from('stores')
    .select('id, mp_access_token, mp_public_key')
    .eq('id', typedOrder.store_id)
    .maybeSingle()

  if (storeError || !store) {
    return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
  }

  if (!store.mp_access_token?.trim() || !store.mp_public_key?.trim()) {
    return NextResponse.json(
      { error: 'La tienda no tiene configurado Mercado Pago' },
      { status: 400 },
    )
  }

  const { data: orderItems, error: itemsError } = await admin
    .from('order_items')
    .select('quantity, unit_price, total, products(name)')
    .eq('order_id', orderId)

  if (itemsError || !orderItems || orderItems.length === 0) {
    return NextResponse.json({ error: 'El pedido no tiene productos' }, { status: 400 })
  }

  const mpItems: MercadoPagoPreferenceItem[] = (orderItems as DbOrderItem[]).map((item) => ({
    title: getProductName(item.products),
    quantity: item.quantity,
    unit_price: Number(item.unit_price),
    currency_id: 'ARS',
  }))

  const shippingCost = Number(typedOrder.shipping_cost)

  if (shippingCost > 0) {
    mpItems.push({
      title: 'Envío',
      quantity: 1,
      unit_price: shippingCost,
      currency_id: 'ARS',
    })
  }

  const origin = getRequestOrigin(request)

  const preferencePayload = {
    items: mpItems,
    payer: {
      name: typedOrder.customer_name,
      email: typedOrder.customer_email,
      phone: typedOrder.customer_phone
        ? { number: typedOrder.customer_phone }
        : undefined,
    },
    ...(isDevelopment(origin)
      ? {}
      : {
          back_urls: {
            success: buildConfirmationUrl(origin, orderId, 'approved'),
            failure: buildConfirmationUrl(origin, orderId, 'failed'),
            pending: buildConfirmationUrl(origin, orderId, 'cancelled'),
          },
          auto_return: 'approved' as const,
        }),
    external_reference: orderId,
  }

  const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${store.mp_access_token.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preferencePayload),
  })

  const preferenceData = (await mpResponse.json()) as MercadoPagoPreferenceResponse &
    MercadoPagoErrorResponse

  if (!mpResponse.ok) {
    const errorMessage =
      preferenceData.message ??
      preferenceData.cause?.[0]?.description ??
      preferenceData.error ??
      'No se pudo crear la preferencia de pago'

    return NextResponse.json({ error: errorMessage }, { status: 502 })
  }

  const { error: updateError } = await admin
    .from('orders')
    .update({
      status: 'pending_payment',
      mp_preference_id: preferenceData.id,
    })
    .eq('id', orderId)
    .eq('store_id', typedOrder.store_id)

  if (updateError) {
    return NextResponse.json(
      { error: 'No se pudo actualizar el pedido con la preferencia de pago' },
      { status: 500 },
    )
  }

  const useSandbox =
    isTestCredential(store.mp_access_token) || isTestCredential(store.mp_public_key)

  const initPoint =
    useSandbox && preferenceData.sandbox_init_point
      ? preferenceData.sandbox_init_point
      : preferenceData.init_point

  if (!initPoint) {
    return NextResponse.json(
      { error: 'Mercado Pago no devolvió URL de pago' },
      { status: 502 },
    )
  }

  return NextResponse.json({ initPoint })
}
