'use client'

import { useState } from 'react'
import { Minus, Plus, Tag, Trash2, Truck, ShoppingBag, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/real-products'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal, clearCart } = useCart()
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)

  const shippingCost = subtotal > 50000 ? 0 : 5000
  const total = subtotal + shippingCost

  const handleApplyDiscount = () => {
    if (discountCode.trim().toUpperCase() === 'DESCUENTO10') {
      setDiscountApplied(true)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="mb-4 h-20 w-20 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Tu carrito está vacío</h1>
        <p className="mt-2 text-muted-foreground">
          Agregá productos para comenzar tu compra
        </p>
        <Link href="/storefront/products">
          <Button className="mt-6 bg-red-600 hover:bg-red-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Seguir comprando
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="border-b border-slate-200 bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link href="/storefront/products" className="text-sm text-red-600 hover:text-red-700">
            ← Seguir comprando
          </Link>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">Tu carrito</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-950">
                  Productos ({items.length})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Vaciar carrito
                </Button>
              </div>

              <div className="space-y-6">
                {items.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex gap-6">
                      <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-[1.5rem] bg-slate-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-950">
                            {item.name}
                          </h3>
                          <p className="text-sm text-slate-500">SKU: {item.id}</p>
                        </div>
                        <p className="text-lg font-semibold text-slate-950">
                          {formatPrice(item.price)}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="inline-flex h-9 w-16 items-center justify-center rounded-lg border border-slate-300 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto inline-flex h-9 w-9 items-center justify-center text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-lg font-semibold text-slate-950">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                    {index < items.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="sticky top-6 rounded-[2rem] bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-semibold text-slate-950">
                Resumen del pedido
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>Envío</span>
                  </div>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="font-semibold text-emerald-600">Gratis</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>

                {shippingCost > 0 && (
                  <p className="text-xs text-slate-500">
                    Envío gratis en compras superiores a $50.000
                  </p>
                )}

                <Separator />

                <div className="flex items-center justify-between text-lg font-semibold text-slate-950">
                  <span>Total</span>
                  <span className="text-red-600">{formatPrice(total)}</span>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Código de descuento
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ingresá el código"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApplyDiscount}
                      className="text-slate-700"
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                  {discountApplied && (
                    <p className="mt-2 text-xs font-semibold text-emerald-600">
                      ✓ Descuento aplicado
                    </p>
                  )}
                </div>

                <Link href="/storefront/checkout">
                  <Button className="w-full rounded-full bg-red-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-red-600/10 hover:bg-red-700" size="lg">
                    Finalizar compra
                  </Button>
                </Link>

                <Link href="/storefront/products">
                  <Button variant="outline" className="w-full rounded-full py-3 text-slate-700">
                    Continuar comprando
                  </Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}