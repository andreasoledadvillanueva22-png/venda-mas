'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/sidebar'
import type { AdminLayoutData } from '@/lib/admin-store'

type AdminShellProps = AdminLayoutData & {
  children: React.ReactNode
}

export function AdminShell({
  children,
  storeName,
  brandInitials,
  userEmail,
  userFullName,
  ordersCount,
}: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
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
          brandInitials={brandInitials}
          userEmail={userEmail}
          userFullName={userFullName}
          ordersCount={ordersCount}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menú</span>
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary">
              <span className="text-xs font-bold text-primary-foreground">{brandInitials}</span>
            </div>
            <span className="truncate font-semibold text-foreground">{storeName}</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
