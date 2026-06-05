'use client'

import { useState } from 'react'
import { Minus, Plus, Tag, Trash2, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart()
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)

  const shippingCost = subtotal > 50000 ? 0 : 5000
  const total = subtotal + shippingCost

  const handleApplyDiscount = () => {
    if (discountCode.trim() === 'DESCUENTO10') {
      setDiscountApplied(true)
    }
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

      {items.length === 0 ? (
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex flex-col items-center justify-center gap-6 rounded-[2rem] border-2 border-dashed border-slate-300 bg-slate-100 py-24">
            <div className="text-center">
              <p className="text-2xl font-semibold text-slate-700">Tu carrito está vacío</p>
              <p className="mt-2 text-slate-500">No hay productos agregados. ¡Comienza a comprar!</p>
            </div>
            <Link href="/storefront/products">
              <Button className="bg-red-600 text-white hover:bg-red-700">
                Explorar productos
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <section className="space-y-6">
              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-lg font-semibold text-slate-950">Productos ({items.length})</h2>
                <div className="space-y-6">
                  {items.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex gap-6">
                        <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-[1.5rem] bg-slate-100">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-950">{item.name}</h3>
                            <p className="text-sm text-slate-500">SKU: {item.id}</p>
                          </div>
                          <p className="text-lg font-semibold text-slate-950">${item.price.toLocaleString('es-AR')}</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <Input
                                type="number"
                                value={item.quantity}
                                readOnly
                                className="h-9 w-16 text-center font-semibold"
                              />
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
                            ${(item.price * item.quantity).toLocaleString('es-AR')}
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
                <h3 className="mb-6 text-lg font-semibold text-slate-950">Resumen del pedido</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString('es-AR')}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span>Envío</span>
                    </div>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-emerald-600 font-semibold">Gratis</span>
                      ) : (
                        `$${shippingCost.toLocaleString('es-AR')}`
                      )}
                    </span>
                  </div>

                  {shippingCost > 0 && (
                    <p className="text-xs text-slate-500">Envío gratis en compras superiores a $50.000</p>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between text-lg font-semibold text-slate-950">
                    <span>Total</span>
                    <span>${total.toLocaleString('es-AR')}</span>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <label className="block text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold mb-2">
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
                      <p className="mt-2 text-xs text-emerald-600 font-semibold">✓ Descuento aplicado</p>
                    )}
                  </div>

                  <Button className="w-full rounded-full bg-red-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-red-600/10 hover:bg-red-700">
                    Finalizar compra
                  </Button>

                  <Button variant="outline" className="w-full rounded-full text-slate-700 py-3">
                    Continuar comprando
                  </Button>
                </div>
              </aside>
            </aside>
          </div>
        </div>
      )}
    </div>
  )
}
