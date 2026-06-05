'use client'

import { useState } from 'react'
import { Check, ChevronDown, RotateCcw, Shield, ShoppingCart, Star, Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { formatPrice, getProductById, realProducts } from '@/lib/real-products'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const productImages = [
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=900&q=80',
]

const variants = ['30 cápsulas', '60 cápsulas', '90 cápsulas']
const colors = ['#f59e0b', '#2563eb', '#22c55e', '#111827']

const relatedProducts = [
  { name: 'Magnesio + Vitamina B6', price: '$17.500' },
  { name: 'Multivitamínico Daily', price: '$21.900' },
  { name: 'Omega 3 Premium', price: '$24.800' },
  { name: 'Energía Natural', price: '$16.300' },
]

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState('60 cápsulas')
  const [selectedColor, setSelectedColor] = useState(colors[0])
  const [quantity, setQuantity] = useState(1)

  const handleQuantity = (delta: number) => setQuantity((current) => Math.max(1, current + delta))

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <span>Inicio</span>
          <span className="px-2">›</span>
          <span>Suplementos</span>
          <span className="px-2">›</span>
          <span className="text-slate-900">Pack x3 Citrato de Magnesio Puro</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="space-y-4">
            <article className="overflow-hidden rounded-[2rem] bg-white p-3 shadow-sm ring-1 ring-slate-200">
              <div className="aspect-square overflow-hidden rounded-[1.5rem] bg-slate-100">
                <img src={productImages[selectedImage]} alt="Pack x3 Citrato de Magnesio Puro" className="h-full w-full object-cover" />
              </div>
            </article>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {productImages.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`overflow-hidden rounded-2xl border transition ${selectedImage === index ? 'border-red-600 ring-2 ring-red-100' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <img src={src} alt={`Miniatura ${index + 1}`} className="h-20 w-full object-cover sm:h-24" />
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <Badge className="bg-amber-100 text-amber-800">Suplementos</Badge>

            <div className="mt-4 space-y-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Pack x3 Citrato de Magnesio Puro</h1>
                <p className="mt-2 text-sm text-slate-500">Producto mock para la storefront de VendaMás.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className={`h-4 w-4 ${index < 5 ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>
                <span className="font-medium text-slate-900">4.8/5</span>
                <span>· 142 reseñas</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <p className="text-3xl font-semibold text-red-600 sm:text-4xl">$19.900</p>
                <p className="text-base text-slate-400 line-through">$25.000</p>
              </div>

              <p className="text-base leading-7 text-slate-600">Suplemento premium con fórmula limpia para acompañar tu rutina diaria, aportar energía y cuidar tu bienestar general.</p>
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Presentación</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {variants.map((variant) => (
                      <Button
                        key={variant}
                        type="button"
                        variant={selectedVariant === variant ? 'default' : 'outline'}
                        className={`rounded-full ${selectedVariant === variant ? 'bg-red-600 hover:bg-red-700' : ''}`}
                        onClick={() => setSelectedVariant(variant)}
                      >
                        {variant}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Color</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`Seleccionar color ${color}`}
                        onClick={() => setSelectedColor(color)}
                        className={`h-8 w-8 rounded-full border-2 transition ${selectedColor === color ? 'scale-110 border-slate-900' : 'border-white hover:border-slate-300'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Stock</p>
                  <p className="mt-2 text-sm font-medium text-slate-700">142 disponibles</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Cantidad</p>
                    <div className="mt-3 flex items-center gap-3">
                      <Button variant="outline" className="h-11 w-11 rounded-full p-0" onClick={() => handleQuantity(-1)}>-</Button>
                      <Input type="number" value={quantity} readOnly className="h-11 w-20 text-center font-semibold" />
                      <Button variant="outline" className="h-11 w-11 rounded-full p-0" onClick={() => handleQuantity(1)}>+</Button>
                    </div>
                  </div>

                  <div className="space-y-3 sm:w-64">
                    <Button className="w-full rounded-full bg-red-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-red-600/10 hover:bg-red-700">
                      <ShoppingCart className="mr-2 h-4 w-4" /> Agregar al carrito
                    </Button>
                    <Button variant="outline" className="w-full rounded-full px-6 py-4 text-base font-semibold">Comprar ahora</Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-3"><Truck className="h-5 w-5 text-red-600" /> Envío gratis en compras +$50.000</li>
                <li className="flex items-center gap-3"><RotateCcw className="h-5 w-5 text-slate-700" /> Devolución gratis en 30 días</li>
                <li className="flex items-center gap-3"><Shield className="h-5 w-5 text-emerald-600" /> Pago seguro con Mercado Pago</li>
              </ul>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: 'Descripción completa',
                  content: 'Formato premium con 100% de ingredientes seleccionados, pensado para acompañar el día a día y potenciar tu rutina de bienestar.',
                },
                {
                  title: 'Especificaciones técnicas',
                  content: 'Presentación: 60 cápsulas. Sin conservantes artificiales, sin gluten y con baja humedad para mejor conservación.',
                },
                {
                  title: 'Política de envío',
                  content: 'Envíos en 24–48 horas en CABA y GBA, y 3–5 días hábiles al resto del país con seguimiento en tiempo real.',
                },
              ].map((item) => (
                <details key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm open:bg-slate-50">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-900">
                    {item.title}
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.content}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <Separator className="my-10" />

        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-red-600">También te puede interesar</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950 sm:text-3xl">Productos relacionados</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((product) => (
              <article key={product.name} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-4 aspect-square overflow-hidden rounded-[1.5rem] bg-slate-100">
                  <img src={productImages[0]} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-slate-950">{product.name}</h3>
                    <Badge variant="outline">Oferta</Badge>
                  </div>
                  <p className="text-base font-semibold text-slate-900">{product.price}</p>
                  <Button variant="outline" className="w-full rounded-full px-4 py-3 text-sm font-semibold">
                    <Check className="mr-2 h-4 w-4" /> Ver producto
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
