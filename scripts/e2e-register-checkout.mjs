/**
 * E2E: registro (Supabase + onboarding) + checkout guest + preferencia MP.
 *
 * Uso:
 *   node scripts/e2e-register-checkout.mjs
 *
 * Variables opcionales:
 *   E2E_BASE_URL=https://venda-mas.vercel.app   (default: producción)
 *   E2E_STORE_SLUG=hector                        (default: andrea-tienda)
 *   E2E_SKIP_REGISTRATION=1                      (solo checkout + MP)
 *   E2E_SKIP_CLEANUP=1                           (conservar usuario de prueba)
 */
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

function loadEnv() {
  const env = {}
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue
    const index = line.indexOf('=')
    env[line.slice(0, index)] = line.slice(index + 1)
  }
  return env
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'tienda'
}

async function generateUniqueSlug(admin, baseName) {
  const base = slugify(baseName)
  let candidate = base
  let suffix = 1

  while (suffix < 100) {
    const { data } = await admin.from('stores').select('id').eq('slug', candidate).maybeSingle()
    if (!data) return candidate
    suffix += 1
    candidate = `${base}-${suffix}`
  }

  return `${base}-${Date.now()}`
}

const env = loadEnv()
const baseUrl = process.env.E2E_BASE_URL ?? 'https://venda-mas.vercel.app'
const checkoutStoreSlug = process.env.E2E_STORE_SLUG ?? 'andrea-tienda'
const skipRegistration = process.env.E2E_SKIP_REGISTRATION === '1'
const skipCleanup = process.env.E2E_SKIP_CLEANUP === '1'
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const anon = createClient(supabaseUrl, anonKey)

const report = []

function pass(step, detail) {
  report.push({ step, status: 'PASS', detail })
  console.log(`✅ ${step}: ${detail}`)
}

function fail(step, detail) {
  report.push({ step, status: 'FAIL', detail })
  console.error(`❌ ${step}: ${detail}`)
}

async function testRegistration() {
  const timestamp = Date.now()
  const email = `e2e-${timestamp}@vendamas-test.invalid`
  const password = 'E2eTest123!'
  const fullName = 'Usuario E2E Test'
  const storeName = `Tienda E2E ${timestamp}`

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      store_name: storeName,
    },
  })

  if (createError || !created.user) {
    fail('Registro Supabase', createError?.message ?? 'Sin usuario')
    return null
  }

  pass('Registro Supabase', `Usuario creado ${email}`)

  const slug = await generateUniqueSlug(admin, storeName)

  const { error: profileError } = await admin.from('profiles').upsert(
    {
      id: created.user.id,
      email,
      full_name: fullName,
      store_name: storeName,
      store_slug: slug,
      role: 'owner',
    },
    { onConflict: 'id' },
  )

  if (profileError) {
    fail('Profile onboarding', profileError.message)
    return { userId: created.user.id, email, cleanup: true }
  }

  pass('Profile onboarding', `Perfil creado para ${fullName}`)

  const { data: store, error: storeError } = await admin
    .from('stores')
    .insert({
      owner_id: created.user.id,
      name: storeName,
      slug,
      free_shipping_threshold: 50000,
      shipping_standard_cost: 14000,
      shipping_express_cost: 8500,
      free_shipping_enabled: true,
      enable_local_pickup: false,
    })
    .select('id, slug')
    .single()

  if (storeError || !store) {
    fail('Store onboarding', storeError?.message ?? 'Sin tienda')
    return { userId: created.user.id, email, cleanup: true }
  }

  pass('Store onboarding', `Tienda ${store.slug} (${store.id})`)

  const { error: signInError } = await anon.auth.signInWithPassword({ email, password })
  if (signInError) {
    fail('Login post-registro', signInError.message)
  } else {
    pass('Login post-registro', 'Sesión OK con email/contraseña')
  }

  return { userId: created.user.id, email, storeId: store.id, storeSlug: store.slug, cleanup: true }
}

async function testGuestCheckout(storeId, product) {
  const payload = {
    storeId,
    items: [
      {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
      },
    ],
    customer: {
      name: 'Comprador Invitado E2E',
      email: `guest-e2e-${Date.now()}@test.invalid`,
      phone: '5491123456789',
      address: 'Av. Corrientes 1234, CABA, Buenos Aires',
    },
    shippingMethod: 'standard',
    paymentMethod: 'mercadopago',
    shippingConfig: {
      freeShippingThreshold: 50000,
      shippingStandardCost: 14000,
      shippingExpressCost: 8500,
      freeShippingEnabled: true,
    },
  }

  const response = await fetch(`${baseUrl}/api/storefront/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok || !body.orderId) {
    fail('Checkout guest API', `${response.status} — ${body.error ?? JSON.stringify(body)}`)
    return null
  }

  pass('Checkout guest API', `Orden ${body.orderId}`)

  const { data: order, error } = await admin
    .from('orders')
    .select('id, is_guest, status, payment_method, store_id, customer_name')
    .eq('id', body.orderId)
    .single()

  if (error || !order) {
    fail('Orden en DB', error?.message ?? 'No encontrada')
    return body.orderId
  }

  if (order.is_guest !== true) {
    fail('Orden is_guest', `is_guest=${order.is_guest}`)
  } else {
    pass('Orden is_guest', 'is_guest=true')
  }

  pass('Orden status inicial', `status=${order.status}, payment=${order.payment_method}`)

  return body.orderId
}

async function testMercadoPagoPreference(orderId) {
  const response = await fetch(`${baseUrl}/api/mercadopago/create-preference`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok || !body.initPoint) {
    fail('Preferencia MP', `${response.status} — ${body.error ?? JSON.stringify(body)}`)
    return null
  }

  const isSandbox = body.initPoint.includes('sandbox') || body.initPoint.includes('mpago.la')
  pass(
    'Preferencia MP',
    `initPoint OK (${isSandbox ? 'sandbox/prod URL' : 'URL de pago'}) — ${body.initPoint.slice(0, 60)}...`,
  )

  const { data: order } = await admin
    .from('orders')
    .select('status, mp_preference_id')
    .eq('id', orderId)
    .single()

  if (order?.status === 'pending_payment' && order.mp_preference_id) {
    pass('Orden pending_payment', `mp_preference_id=${order.mp_preference_id}`)
  } else {
    fail(
      'Orden pending_payment',
      `status=${order?.status}, preference=${order?.mp_preference_id ?? 'null'}`,
    )
  }

  return body.initPoint
}

async function cleanupRegistration(ctx) {
  if (!ctx?.cleanup || !ctx.userId) return

  await admin.from('stores').delete().eq('owner_id', ctx.userId)
  await admin.from('profiles').delete().eq('id', ctx.userId)
  await admin.auth.admin.deleteUser(ctx.userId)
  pass('Cleanup registro E2E', `Usuario ${ctx.email} eliminado`)
}

async function main() {
  console.log(`\n=== E2E VendaMás — base: ${baseUrl} ===\n`)

  const { data: checkoutStore } = await admin
    .from('stores')
    .select('id, slug, name, mp_access_token, mp_public_key')
    .eq('slug', checkoutStoreSlug)
    .single()

  if (!checkoutStore) {
    fail('Tienda checkout', `No existe slug "${checkoutStoreSlug}"`)
  } else if (!checkoutStore.mp_access_token || !checkoutStore.mp_public_key) {
    fail(
      'MP en tienda checkout',
      `${checkoutStoreSlug} no tiene mp_access_token/mp_public_key. Configurá MP en admin.`,
    )
  } else {
    const tokenType = checkoutStore.mp_access_token.includes('TEST')
      ? 'TEST- (sandbox)'
      : 'APP_USR- (producción OAuth)'
    pass('MP en tienda checkout', `${checkoutStoreSlug} — ${tokenType}`)
  }

  const regCtx = skipRegistration ? null : await testRegistration()

  if (!checkoutStore) {
    fail('Producto checkout', 'Tienda no disponible')
  } else {
    const { data: product } = await admin
      .from('products')
      .select('id, name, price')
      .eq('store_id', checkoutStore.id)
      .eq('active', true)
      .limit(1)
      .maybeSingle()

    if (!product) {
      fail('Producto checkout', `Sin productos activos en ${checkoutStoreSlug}`)
    } else {
      pass('Producto checkout', `${product.name.slice(0, 50)}... ($${product.price})`)
      const orderId = await testGuestCheckout(checkoutStore.id, product)
      if (orderId) {
        await testMercadoPagoPreference(orderId)
      }
    }
  }

  if (regCtx && !skipCleanup) {
    await cleanupRegistration(regCtx)
  }

  console.log('\n=== RESUMEN ===')
  const passed = report.filter((r) => r.status === 'PASS').length
  const failed = report.filter((r) => r.status === 'FAIL').length
  console.log(`✅ ${passed} pasaron | ❌ ${failed} fallaron\n`)

  if (failed > 0) process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
