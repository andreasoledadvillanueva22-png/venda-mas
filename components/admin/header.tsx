'use client'

import { Bell, HelpCircle, ChevronDown, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

interface Store {
  id: string
  name: string
  domain: string
}

const stores: Store[] = [
  { id: '1', name: 'Fashion Store', domain: 'fashion.VendaMás.com' },
  { id: '2', name: 'Tech Shop', domain: 'tech.VendaMás.com' },
  { id: '3', name: 'Home Decor', domain: 'decor.VendaMás.com' },
]

interface AdminHeaderProps {
  currentStore?: Store
}

export function AdminHeader({ 
  currentStore = stores[0] 
}: AdminHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Store Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors outline-none">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
            <Store className="h-4 w-4 text-success" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">{currentStore.name}</p>
            <p className="text-xs text-muted-foreground">{currentStore.domain}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Switch Store</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {stores.map((store) => (
            <DropdownMenuItem key={store.id} className="flex items-center gap-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Store className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{store.name}</p>
                <p className="text-xs text-muted-foreground">{store.domain}</p>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-primary justify-center font-medium">
            + Create New Store
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-2">
        {/* Help Button */}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Help</span>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -right-0.5 -top-0.5 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              5
            </Badge>
            <span className="sr-only">Notifications</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">New order #2847</span>
              <span className="text-xs text-muted-foreground">2 minutes ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Payment received</span>
              <span className="text-xs text-muted-foreground">15 minutes ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Low stock: Blue T-Shirt</span>
              <span className="text-xs text-muted-foreground">1 hour ago</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center text-primary font-medium">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
