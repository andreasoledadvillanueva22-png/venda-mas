'use client'

import { useState } from 'react'
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'
import Link from 'next/link'

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const { items, removeFromCart, updateQuantity, subtotal, totalItems } = useCart()

  const handleClose = () => setIsOpen(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/80 text-slate-100 ring-1 ring-white/10 transition hover:bg-slate-800"
      >
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1.5 text-[0.65rem] font-semibold text-white">
            {totalItems}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={handleClose} />
      )}

      <div
        className={`fixed right-0 top-0 z-50 h-screen w-full max-w-md transform bg-white transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-6">
            <h2 className="text-lg font-semibold text-slate-950">Tu carrito ({totalItems})</h2>
            <button
              onClick={handleClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12">
              <ShoppingCart className="h-12 w-12 text-slate-300" />
              <div className="text-center">
                <p className="font-semibold text-slate-900">Tu carrito está vacío</p>
                <p className="mt-1 text-sm text-slate-500">Comenzá a comprar para agregar productos</p>
              </div>
              <Link href="/storefront/products" onClick={handleClose}>
                <Button className="mt-4 bg-red-600 text-white hover:bg-red-700">
                  Seguir comprando
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{item.name}</h3>
                        <p className="text-sm text-slate-600">${item.price.toLocaleString('es-AR')}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <Input
                              type="number"
                              value={item.quantity}
                              readOnly
                              className="h-7 w-12 text-center text-xs"
                            />
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="inline-flex h-7 w-7 items-center justify-center text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 bg-slate-50 px-6 py-6">
                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString('es-AR')}</span>
                  </div>
                  <p className="text-xs text-slate-500">Envío calculado en el checkout</p>
                </div>
                <div className="space-y-3">
                  <Link href="/storefront/cart" onClick={handleClose} className="block">
                    <Button variant="outline" className="w-full text-slate-700">
                      Ver carrito
                    </Button>
                  </Link>
                  <Link href="/storefront/checkout" onClick={handleClose} className="block">
                    <Button className="w-full bg-red-600 text-white hover:bg-red-700">
                      Finalizar compra
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
