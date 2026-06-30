'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Palette,
  Megaphone,
  ChevronDown,
  LogOut,
  X,
  Eye,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Logo } from '@/components/ui/logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Marketing', href: '/admin/marketing', icon: Megaphone },
  { name: 'Design', href: '/admin/design', icon: Palette },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

interface AdminSidebarProps {
  storeName: string
  storeSlug: string
  brandInitials: string
  userEmail?: string
  userFullName?: string | null
  userAvatar?: string
  ordersCount?: number
  onClose?: () => void
}

export function AdminSidebar({
  storeName,
  storeSlug,
  brandInitials,
  userEmail = 'admin@VendaMás.com',
  userFullName,
  userAvatar,
  ordersCount = 0,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const userInitial = (userFullName?.trim() || userEmail).charAt(0).toUpperCase()
  const userDisplayName = userFullName?.trim() || userEmail

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-brand-200 bg-white/80 text-brand-900 backdrop-blur-lg">
      <div className="flex h-16 items-center gap-3 border-b border-brand-200 px-5">
        <Link href="/admin" className="shrink-0">
          <Logo size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-brand-900">{storeName}</p>
          <p className="truncate text-xs text-brand-600">{brandInitials}</p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-brand-700 hover:bg-brand-50 lg:hidden"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Cerrar menú</span>
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                    : 'text-brand-700 hover:bg-brand-50',
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.name}</span>
                {item.href === '/admin/orders' && ordersCount > 0 ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-xs font-medium text-white">
                    {ordersCount}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-brand-200 p-3">
        <a
          href={`/storefront?store=${encodeURIComponent(storeSlug)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-2 flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100"
        >
          <Eye className="h-5 w-5 shrink-0" />
          <span>Ver mi tienda</span>
        </a>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm outline-none transition-colors hover:bg-brand-50">
            <Avatar className="h-9 w-9">
              <AvatarImage src={userAvatar} alt="Avatar" />
              <AvatarFallback className="bg-brand-100 text-sm font-medium text-brand-700">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="truncate text-sm font-medium text-brand-900">{userDisplayName}</p>
              <p className="text-xs text-brand-600">Administrator</p>
            </div>
            <ChevronDown className="h-4 w-4 text-brand-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
