'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants, Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/real-products'
import { cn } from '@/lib/utils'

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, totalItems } =
    useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isCartOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCartOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isCartOpen, setIsCartOpen])

  if (!isCartOpen || !mounted) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-[200]" role="presentation">
      <button
        type="button"
        aria-label="Cerrar carrito"
        className="absolute inset-0 touch-manipulation bg-black/50"
        onClick={() => setIsCartOpen(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Carrito (${totalItems})`}
        className="absolute right-0 top-0 flex h-dvh w-full max-w-md touch-manipulation flex-col overflow-hidden bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b bg-white p-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Carrito ({totalItems})</h2>
          </div>
          <button
            type="button"
            aria-label="Cerrar carrito"
            onClick={() => setIsCartOpen(false)}
            className="rounded-md p-2 touch-manipulation hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
            <ShoppingBag className="h-12 w-12 text-slate-300" />
            <p className="text-slate-600">Tu carrito está vacío</p>
            <Link
              href="/storefront/products"
              onClick={() => setIsCartOpen(false)}
              className={cn(buttonVariants({ variant: 'outline' }), 'touch-manipulation')}
            >
              Seguir comprando
            </Link>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b pb-4 last:border-b-0">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
                        <p className="text-sm font-bold text-red-600">{formatPrice(item.price)}</p>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 touch-manipulation"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 touch-manipulation"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label={`Eliminar ${item.name}`}
                      onClick={() => removeFromCart(item.id)}
                      className="shrink-0 touch-manipulation p-1 text-slate-400 transition hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 space-y-4 border-t bg-slate-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
              </div>

              <p className="text-xs text-slate-500">El envío se calculará en el checkout</p>

              <div className="space-y-2">
                <Link
                  href="/storefront/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'w-full touch-manipulation bg-red-600 hover:bg-red-700',
                  )}
                >
                  Ir al checkout
                </Link>
                <Link
                  href="/storefront/products"
                  onClick={() => setIsCartOpen(false)}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'w-full touch-manipulation',
                  )}
                >
                  Seguir comprando
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
