import { isPlatformTestMode } from '@/lib/payments/mercadopago/credentials'

function mask(value: string | undefined, visible = 15): string {
  if (!value) {
    return '(missing)'
  }

  return value.length <= visible ? value : `${value.substring(0, visible)}...`
}

export function debugMercadoPagoCredentials() {
  const mpMode = process.env.MP_MODE
  const publicMpMode = process.env.NEXT_PUBLIC_MP_MODE
  const isTest = isPlatformTestMode()

  const testToken = process.env.MP_ACCESS_TOKEN_TEST
  const testKey = process.env.MP_PUBLIC_KEY_TEST
  const prodToken = process.env.MP_ACCESS_TOKEN_PROD ?? process.env.MP_ACCESS_TOKEN
  const prodKey = process.env.MP_PUBLIC_KEY_PROD ?? process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY

  console.log('========================================')
  console.log('MERCADO PAGO CREDENTIALS DEBUG')
  console.log('========================================')
  console.log('MP_MODE:', mpMode)
  console.log('NEXT_PUBLIC_MP_MODE:', publicMpMode)
  console.log('isTestMode:', isTest)
  console.log('')
  console.log('TEST credentials:')
  console.log('  Access Token exists:', !!testToken)
  console.log('  Access Token starts with:', mask(testToken))
  console.log('  Public Key exists:', !!testKey)
  console.log('  Public Key starts with:', mask(testKey))
  console.log('')
  console.log('PRODUCTION credentials:')
  console.log('  Access Token exists:', !!prodToken)
  console.log('  Access Token starts with:', mask(prodToken))
  console.log('  Public Key exists:', !!prodKey)
  console.log('  Public Key starts with:', mask(prodKey))
  console.log('========================================')

  return {
    isTestMode: isTest,
    testCredentialsExist: !!testToken && !!testKey,
    productionCredentialsExist: !!prodToken && !!prodKey,
  }
}
