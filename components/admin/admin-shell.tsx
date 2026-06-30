'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'
import { ViewStoreLink } from '@/components/admin/view-store-link'
import { Logo } from '@/components/ui/logo'
import { PLATFORM_DOMAIN } from '@/lib/custom-domain'
import type { AdminLayoutData } from '@/lib/admin-store'

type AdminShellProps = AdminLayoutData & {
  children: React.ReactNode
}

export function AdminShell({
  children,
  storeName,
  storeSlug,
  brandInitials,
  userEmail,
  userFullName,
  ordersCount,
}: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const storeDomain = `${storeSlug}.${PLATFORM_DOMAIN}`

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100">
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-brand-900/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <AdminSidebar
          storeName={storeName}
          storeSlug={storeSlug}
          brandInitials={brandInitials}
          userEmail={userEmail}
          userFullName={userFullName}
          ordersCount={ordersCount}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-14 items-center gap-4 border-b border-brand-200 bg-white/60 px-4 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-brand-700 hover:bg-brand-50"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menú</span>
          </button>
          <Logo size="sm" />
          <span className="min-w-0 flex-1 truncate font-semibold text-brand-900">{storeName}</span>
          <ViewStoreLink storeSlug={storeSlug} showLabel={false} size="icon" />
        </div>

        <div className="hidden lg:block">
          <AdminHeader
            storeName={storeName}
            storeDomain={storeDomain}
            storeSlug={storeSlug}
            initials={brandInitials}
          />
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
