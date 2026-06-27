import type { Metadata } from 'next'
import { resolveStorefrontStore } from '@/lib/storefront-server'
import { StorefrontShell } from '@/components/storefront/storefront-shell'

export async function generateMetadata(): Promise<Metadata> {
  const store = await resolveStorefrontStore()
  const storeName = store?.name ?? 'Tienda Online'

  return {
    title: storeName,
    description:
      store?.description ??
      'Productos de calidad con envío a toda Argentina. Compra segura con Mercado Pago.',
  }
}

export default async function StorefrontLayout({  children,
}: {
  children: React.ReactNode
}) {
  const store = await resolveStorefrontStore()

  return <StorefrontShell store={store}>{children}</StorefrontShell>
}
