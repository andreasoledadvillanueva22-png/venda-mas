import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import {
  createMercadoPagoPreference,
  getMercadoPagoInitPoint,
  resolvePlatformMercadoPagoCredentials,
} from '../lib/mercadopago'

function loadEnvFile(filename: string) {
  const filePath = resolve(process.cwd(), filename)

  if (!existsSync(filePath)) {
    return
  }

  const content = readFileSync(filePath, 'utf8')

  for (const line of content.split('\n')) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmed.indexOf('=')

    if (separatorIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env')

async function testCredentials() {
  console.log('Testing Mercado Pago credentials...\n')

  const credentials = resolvePlatformMercadoPagoCredentials()

  if (!credentials) {
    console.error('❌ No credentials found')
    process.exit(1)
  }

  console.log('\n✅ Credentials found:')
  console.log('  isTestMode:', credentials.isTestMode)
  console.log('  accessToken:', `${credentials.accessToken.substring(0, 20)}...`)
  console.log('  publicKey:', `${credentials.publicKey.substring(0, 20)}...`)

  console.log('\nCreating test preference...')

  const result = await createMercadoPagoPreference(credentials.accessToken, {
    items: [
      {
        title: 'Test Product',
        quantity: 1,
        unit_price: 100,
        currency_id: 'ARS',
      },
    ],
    back_urls: {
      success: 'https://vendemas.app/admin/settings?subscription=success',
      failure: 'https://vendemas.app/admin/settings?subscription=failure',
      pending: 'https://vendemas.app/admin/settings?subscription=pending',
    },
  })

  if (result.error || !result.data) {
    console.error('❌ Error creating preference:', result.error)
    process.exit(1)
  }

  const initPoint = getMercadoPagoInitPoint(result.data, credentials.isTestMode)

  console.log('\n✅ Preference created:')
  console.log('  ID:', result.data.id)
  console.log('  init_point:', result.data.init_point)
  console.log('  sandbox_init_point:', result.data.sandbox_init_point)
  console.log('  selected initPoint:', initPoint)
  console.log('  is sandbox URL:', initPoint?.includes('sandbox') ?? false)

  if (!initPoint) {
    console.error('❌ No init point selected for current mode')
    process.exit(1)
  }

  if (credentials.isTestMode && !initPoint.includes('sandbox')) {
    console.error('❌ Test mode but initPoint is not sandbox — this causes the MP mismatch error')
    process.exit(1)
  }

  console.log('\n✅ All tests passed!')
}

testCredentials().catch((error) => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
