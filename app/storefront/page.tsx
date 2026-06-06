'use client'

import Link from 'next/link'
import { ArrowRight, Home, Heart, PawPrint, Shield, ShoppingCart } from 'lucide-react'
import { realProducts, formatPrice } from '@/lib/real-products'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const categories = [
  { name: 'Hogar', icon: Home, color: 'from-blue-500 to-blue-700', description: 'Productos para tu hogar' },
  { name: 'Suplementos', icon: Heart, color: 'from-green-500 to-green-700', description: 'Bienestar y salud' },
  { name: 'Mascotas', icon: PawPrint, color: 'from-purple-500 to-purple-700', description: 'Cuidá a tu mascota' },
  { name: 'Higiene', icon: Shield, color: 'from-pink-500 to-pink-700', description: 'Cuidado personal' },
]

export default function StorefrontPage() {
  const { addToCart } = useCart()
  const featuredProducts = realProducts.slice(0, 4)

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 opacity-90" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <Badge variant="outline" className="border-white/30 text-white">
                PRODUCTOS DESTACADOS
              </Badge>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Bienvenidos a<br />
                <span className="text-red-500">Andrea Tienda Online</span>
              </h1>
              <p className="max-w-xl text-lg text-slate-300">
                Productos de calidad con envío a toda Argentina. Compra segura con Mercado Pago o WhatsApp.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/storefront/products"
                  className="inline-flex items-center rounded-md bg-red-600 px-8 py-3 text-lg font-medium text-white hover:bg-red-700"
                >
                  Ver productos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <a
                  href="https://wa.me/5493743417659"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md border border-white bg-transparent px-8 py-3 text-lg font-medium text-white hover:bg-white hover:text-slate-900"
                >
                  Contactar por WhatsApp
                </a>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 backdrop-blur-sm" />
              <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20" />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-red-600">
              COMPRAR POR CATEGORÍA
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              Explorá nuestras categorías
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.name}
                  href={`/storefront/products?category=${cat.name}`}
                  className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${cat.color} p-8 text-white transition-transform hover:scale-105`}
                >
                  <div className="relative z-10">
                    <Icon className="mb-4 h-10 w-10" />
                    <h3 className="text-2xl font-bold">{cat.name}</h3>
                    <p className="mt-2 text-sm text-white/80">{cat.description}</p>
                    <ArrowRight className="mt-4 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-red-600">
              LO MÁS VENDIDO
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              Productos favoritos
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group overflow-hidden transition-shadow hover:shadow-xl">
                <Link href={`/storefront/product/${product.id}`}>
                  <CardContent className="p-0">
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      {product.tag && (
                        <Badge className={`absolute left-3 top-3 ${product.tagColor} text-white`}>
                          {product.tag}
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="mb-2 font-semibold text-slate-900 line-clamp-2 group-hover:text-red-600">
                        {product.name}
                      </h3>
                      <p className="mb-3 text-sm text-slate-500 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-slate-900">
                          {formatPrice(product.price)}
                        </span>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.images[0],
                            })
                          }}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/storefront/products"
              className="inline-flex items-center rounded-md bg-red-600 px-8 py-3 text-lg font-medium text-white hover:bg-red-700"
            >
              Ver todos los productos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-slate-900 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
              NEWSLETTER
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Suscribite y obtené 10% OFF en tu primera compra
            </h2>
            <p className="mt-4 text-slate-300">
              Recibí ofertas exclusivas, lanzamientos y tendencias directo en tu inbox.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Ingresá tu email"
                className="flex-1 rounded-full bg-white/10 px-6 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Button className="rounded-full bg-red-600 px-8 py-3 hover:bg-red-700">
                Suscribirme
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}