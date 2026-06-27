import type { Metadata } from 'next'
import {
  getRecentPurchaseNotifications,
  resolveStorefrontStore,
} from '@/lib/storefront-server'
import { DEFAULT_STOREFRONT_FAVICON } from '@/lib/storefront'
import { StorefrontShell } from '@/components/storefront/storefront-shell'

export async function generateMetadata(): Promise<Metadata> {
  const store = await resolveStorefrontStore()
  const storeName = store?.name ?? 'Tienda Online'
  const faviconUrl = store?.faviconUrl ?? DEFAULT_STOREFRONT_FAVICON

  return {
    title: storeName,
    description:
      store?.description ??
      'Productos de calidad con envío a toda Argentina. Compra segura con Mercado Pago.',
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
    },
  }
}

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const store = await resolveStorefrontStore()
  const recentPurchases = store ? await getRecentPurchaseNotifications(store.id) : []

  return (
    <StorefrontShell store={store} recentPurchases={recentPurchases}>
      {children}
    </StorefrontShell>
  )
}
