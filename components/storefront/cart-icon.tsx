'use client'

import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

export function CartIcon() {
  const { totalItems } = useCart()

  return (
    <div className="relative">
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-[0.65rem] font-semibold text-white">
          {totalItems}
        </span>
      )}
    </div>
  )
}
