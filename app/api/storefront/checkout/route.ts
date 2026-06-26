import { createClient } from '@/lib/supabase/server'
import {
  createGuestOrder,
  type CheckoutCartItem,
  type CheckoutShippingConfig,
} from '@/lib/checkout-order'
import { NextRequest, NextResponse } from 'next/server'

type CheckoutRequestBody = {
  storeId?: string
  items?: CheckoutCartItem[]
  customer?: {
    name?: string
    email?: string
    phone?: string
    address?: string | null
  }
  shippingMethod?: string
  paymentMethod?: string
  shippingConfig?: CheckoutShippingConfig
}

const VALID_PAYMENT_METHODS = new Set(['mercadopago', 'bank_transfer', 'effectivo'])

function parseShippingConfig(value: CheckoutShippingConfig | undefined): CheckoutShippingConfig {
  return {
    freeShippingThreshold: Number(value?.freeShippingThreshold ?? 50000),
    shippingStandardCost: Number(value?.shippingStandardCost ?? 5000),
    shippingExpressCost: Number(value?.shippingExpressCost ?? 8500),
    freeShippingEnabled: value?.freeShippingEnabled ?? true,
  }
}

export async function POST(request: NextRequest) {
  let body: CheckoutRequestBody

  try {
    body = (await request.json()) as CheckoutRequestBody
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
  }

  const storeId = body.storeId?.trim()
  const items = body.items ?? []
  const customer = body.customer
  const shippingMethod = body.shippingMethod?.trim() ?? 'standard'
  const paymentMethod = body.paymentMethod?.trim()
  const shippingConfig = parseShippingConfig(body.shippingConfig)

  if (!storeId) {
    return NextResponse.json({ error: 'storeId es obligatorio' }, { status: 400 })
  }

  if (items.length === 0) {
    return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })
  }

  if (
    !customer?.name?.trim() ||
    !customer.email?.trim() ||
    !customer.phone?.trim()
  ) {
    return NextResponse.json(
      { error: 'Nombre, email y teléfono son obligatorios' },
      { status: 400 },
    )
  }

  if (!paymentMethod || !VALID_PAYMENT_METHODS.has(paymentMethod)) {
    return NextResponse.json({ error: 'Método de pago inválido' }, { status: 400 })
  }

  if (shippingMethod !== 'local_pickup' && !customer.address?.trim()) {
    return NextResponse.json(
      { error: 'La dirección de envío es obligatoria' },
      { status: 400 },
    )
  }

  let profileId: string | null = null

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    profileId = user?.id ?? null
  } catch {
    profileId = null
  }

  const result = await createGuestOrder({
    storeId,
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
    })),
    customer: {
      name: customer.name.trim(),
      email: customer.email.trim(),
      phone: customer.phone.trim(),
      address: customer.address?.trim() ? customer.address.trim() : null,
    },
    shippingMethod,
    paymentMethod: paymentMethod as 'mercadopago' | 'bank_transfer' | 'effectivo',
    shippingConfig,
    profileId,
  })

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 500 })
  }

  return NextResponse.json({ orderId: result.orderId })
}
