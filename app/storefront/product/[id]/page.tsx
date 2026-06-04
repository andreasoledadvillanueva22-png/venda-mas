'use client'

import { useState } from 'react'
import {
  Check,
  ChevronDown,
  RotateCcw,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const productImages = [
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
]

const relatedProducts = [
  { name: 'Bota Chelsea Cuero', price: '$24.800' },
  { name: 'Mochila Minimalista', price: '$11.990' },
  { name: 'Vestido Midi Burdeos', price: '$22.500' },
  { name: 'Campera Oversize Negra', price: '$19.900' },
]

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedPack, setSelectedPack] = useState('30 cápsulas')
  const [quantity, setQuantity] = useState(1)
  const [openSection, setOpenSection] = useState<'descripcion' | 'especificaciones' | 'envio' | null>('descripcion')

  const packs = ['30 cápsulas', '60 cápsulas', '90 cápsulas']

  const handleQuantity = (delta: number) => {
    setQuantity((current) => Math.max(1, current + delta))
  }

  return (
    <div className="bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4 text-sm text-slate-500">
          Inicio <span className="px-2">›</span> Suplementos <span className="px-2">›</span> Pack x3 Citrato de Magnesio Puro
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
              <div className="aspect-square bg-slate-100">
                <img
                  src={productImages[selectedImage]}
                  alt="Pack x3 Citrato de Magnesio Puro"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {productImages.map((src, index) => (
                <button
                  key={src + index}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`overflow-hidden rounded-3xl border transition ${
                    selectedImage === index ? 'border-red-600 ring-2 ring-red-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={src} alt={`Imagen ${index + 1}`} className="h-24 w-full object-cover" />
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-6 rounded-[2rem] bg-white p-6 shadow-sm">
            <Badge className="bg-amber-100 text-amber-800">Suplementos</Badge>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Pack x3 Citrato de Magnesio Puro</h1>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-3xl font-semibold text-red-600">$19.900</p>
                  <p className="text-sm text-slate-500 line-through">$25.000</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${index < 4 ? 'text-amber-500' : 'text-amber-300'}`}
                      />
                    ))}
                  </div>
                  <span>4.8/5 · 142 reseñas</span>
                </div>
              </div>
              <p className="text-base leading-7 text-slate-600">Suplemento premium para fortalecer tu rutina, mantener energía y optimizar bienestar general con una fórmula limpia.</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Presentación</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {packs.map((pack) => (
                    <button
                      key={pack}
                      type="button"
                      onClick={() => setSelectedPack(pack)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        selectedPack === pack
                          ? 'border-red-600 bg-red-600 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-red-500'
                      }`}
                    >
                      {pack}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Stock</p>
                <p className="mt-2 text-base font-medium text-slate-700">142 disponibles</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Cantidad</p>
                  <div className="mt-3 flex items-center gap-3">
                    <Button
                      variant="outline"
                      className="h-11 w-11 rounded-full p-0 text-slate-700"
                      onClick={() => handleQuantity(-1)}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      readOnly
                      className="h-11 w-20 text-center font-semibold"
                    />
                    <Button
                      variant="outline"
                      className="h-11 w-11 rounded-full p-0 text-slate-700"
                      onClick={() => handleQuantity(1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button className="w-full rounded-full bg-red-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-red-600/10 hover:bg-red-700">
                    <ShoppingCart className="mr-2 h-4 w-4" /> Agregar al carrito
                  </Button>
                  <Button variant="outline" className="w-full rounded-full px-6 py-4 text-base font-semibold">
                    Comprar ahora
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <ul className="space-y-4 text-sm text-slate-700">
                <li className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-red-600" />
                  Envío gratis en compras superiores a $50.000
                </li>
                <li className="flex items-center gap-3">
                  <RotateCcw className="h-5 w-5 text-slate-700" />
                  Devolución gratis en 30 días
                </li>
                <li className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  Pago seguro con Mercado Pago
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              {[
                {
                  key: 'descripcion',
                  title: 'Descripción completa',
                  content:
                    'Este paquete de Citrato de Magnesio Puro es ideal para quienes buscan un suplemento confiable y efectivo. Cada cápsula ofrece una dosis precisa y de fácil absorción para acompañar tu rutina diaria.',
                },
                {
                  key: 'especificaciones',
                  title: 'Especificaciones técnicas',
                  content:
                    'Ingredientes 100% naturales, sin gluten, sin conservantes. Formato de 30 cápsulas por unidad. Recomendado para consumo diario durante el desayuno.',
                },
                {
                  key: 'envio',
                  title: 'Política de envío',
                  content:
                    'Envíos en 24-48 horas en CABA y GBA. Envíos nacionales 3-5 días hábiles. Seguimiento en tiempo real y retiro en sucursal disponible.',
                },
              ].map((section) => {
                const isOpen = openSection === section.key
                return (
                  <div key={section.key} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-slate-900"
                      onClick={() => setOpenSection(isOpen ? null : section.key as typeof openSection)}
                    >
                      <span className="text-sm font-semibold">{section.title}</span>
                      <ChevronDown
                        className={`h-5 w-5 transition ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                      />
                    </button>
                    {isOpen ? (
                      <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700">
                        {section.content}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        <Separator className="my-12" />

        <section>
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-red-600">También te puede interesar</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">Productos relacionados</h2>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((product) => (
              <article key={product.name} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-4 h-44 overflow-hidden rounded-[1.75rem] bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80"
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-slate-950">{product.name}</h3>
                    <Badge variant="outline" className="text-slate-600">Oferta</Badge>
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
