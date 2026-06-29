import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/admin/admin-shell'
import { getAdminLayoutData } from '@/lib/admin-store'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const layoutData = await getAdminLayoutData()

  if (!layoutData) {
    redirect('/auth/login?redirect=/admin')
  }

  return <AdminShell {...layoutData}>{children}</AdminShell>
}
