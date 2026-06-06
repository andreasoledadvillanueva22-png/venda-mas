'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ShoppingCart, Truck, RotateCcw, Shield, ChevronRight, Minus, Plus } from 'lucide-react'
import { realProducts, getProductById, formatPrice } from '@/lib/real-products'
import { useCart } from '@/lib/cart-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const product = getProductById(id)
  const { addToCart } = useCart()

  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  if (!product) {
    notFound()
  }

  const relatedProducts = realProducts.filter(
    (p) => p.category === product.category && p.id !== product.id
  )

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/storefront" className="hover:text-foreground">
            Inicio
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/storefront/products?category=${product.category}`} className="hover:text-foreground">
            {product.category}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {product.tag && (
                <Badge className={`absolute left-4 top-4 ${product.tagColor} text-white`}>
                  {product.tag}
                </Badge>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition ${
                      selectedImage === idx ? 'border-red-600' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info del producto */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-3">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
            </div>

            {/* Precio */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-red-600">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Descripción */}
            <p className="text-muted-foreground">{product.description}</p>

            <Separator />

            {/* Stock */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Stock
              </p>
              <p className="mt-1 text-foreground">
                {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
              </p>
            </div>

            {/* Cantidad */}
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Cantidad
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Botones */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={() => {
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images[0],
                  })
                }}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Agregar al carrito
              </Button>
              <Button variant="outline" size="lg" className="w-full">
                Comprar ahora
              </Button>
            </div>

            {/* Beneficios */}
            <div className="space-y-3 rounded-xl border border-border p-4">
              {product.freeShipping && (
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-600">Envío gratis</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <RotateCcw className="h-5 w-5" />
                <span>Devolución gratis en 30 días</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="h-5 w-5" />
                <span>Pago seguro con Mercado Pago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              También te puede interesar
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/storefront/product/${p.id}`}>
                  <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden bg-slate-100">
                        <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                        {p.tag && (
                          <Badge className={`absolute left-3 top-3 ${p.tagColor} text-white`}>
                            {p.tag}
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="mb-2 font-semibold text-foreground">{p.name}</h3>
                        <p className="text-lg font-bold text-foreground">{formatPrice(p.price)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}