import type { Metadata } from 'next'
import {
  getRecentPurchaseNotifications,
  getStoreDesignSettings,
  resolveStorefrontStore,
} from '@/lib/storefront-server'
import { DEFAULT_STOREFRONT_FAVICON } from '@/lib/storefront'
import { DEFAULT_THEME_COLORS } from '@/lib/store-design'
import { StorefrontShell } from '@/components/storefront/storefront-shell'

export async function generateMetadata(): Promise<Metadata> {
  const store = await resolveStorefrontStore()
  const storeName = store?.name ?? 'Tienda Online'
  const faviconUrl = store?.faviconUrl ?? DEFAULT_STOREFRONT_FAVICON

  return {
    title: storeName,
    description:
      store?.description ??
      'Productos de calidad con envío a toda Argentina. Compra segura con múltiples medios de pago.',
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
  const designColors = store ? await getStoreDesignSettings(store.id) : DEFAULT_THEME_COLORS

  return (
    <StorefrontShell store={store} recentPurchases={recentPurchases} designColors={designColors}>
      {children}
    </StorefrontShell>
  )
}
