import { resolveStorefrontStore } from '@/lib/storefront-server'
import { StorefrontShell } from '@/components/storefront/storefront-shell'

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const store = await resolveStorefrontStore()

  return <StorefrontShell store={store}>{children}</StorefrontShell>
}
