import { headers } from 'next/headers'

export async function getStorefrontOrigin(): Promise<string> {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, '')
  }

  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') ?? 'https'

  if (host) {
    return `${protocol}://${host}`
  }

  return 'http://localhost:3000'
}
