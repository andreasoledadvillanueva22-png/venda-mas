'use client'

import Link from 'next/link'
import { Bell, HelpCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AdminHeaderProps {
  storeName: string
  storeDomain: string
  storeSlug: string
  initials: string
}

export function AdminHeader({ storeName, storeDomain, storeSlug, initials }: AdminHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="shrink-0">
          <Logo size="sm" />
        </Link>
        <div className="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-xs font-bold text-primary-foreground">{initials}</span>
        </div>
        <div className="text-left">
          <p className="font-semibold text-foreground">{storeName}</p>
          <p className="text-xs text-muted-foreground">{storeDomain}</p>
        </div>
        <Link
          href={`/storefront?store=${encodeURIComponent(storeSlug)}`}
          target="_blank"
          className="ml-2 hidden sm:inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          <ExternalLink className="mr-2 h-3.5 w-3.5" />
          Ver tienda
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Ayuda</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notificaciones</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-sm text-muted-foreground">
              Sin notificaciones nuevas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
