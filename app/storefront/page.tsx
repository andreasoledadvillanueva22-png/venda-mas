import Link from 'next/link'
import { headers } from 'next/headers'
import { ArrowRight, Home, Heart, PawPrint, Shield } from 'lucide-react'
import { createClient, getUser } from '@/lib/supabase/server'
import { getStoreBySlug } from '@/lib/tenant'
import type { CatalogProduct } from '@/components/storefront/products-catalog'
import { AddToCartButton } from '@/components/storefront/add-to-cart-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const categories = [
  { name: 'Hogar', icon: Home, color: 'from-blue-500 to-blue-700', description: 'Productos para tu hogar' },
  { name: 'Suplementos', icon: Heart, color: 'from-green-500 to-green-700', description: 'Bienestar y salud' },
  { name: 'Mascotas', icon: PawPrint, color: 'from-purple-500 to-purple-700', description: 'Cuidá a tu mascota' },
  { name: 'Higiene', icon: Shield, color: 'from-pink-500 to-pink-700', description: 'Cuidado personal' },
]

type StorefrontPageProps = {
  searchParams: Promise<{ store?: string }>
}

type DbProduct = {
  id: string
  name: string
  description: string | null
  price: number
  compare_at_price: number | null
  category: string | null
  images: string[] | null
  featured: boolean
}

function formatPrice(value: number) {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  })
}

function getProductBadge(product: CatalogProduct): { label: string; className: string } | null {
  if (product.featured) {
    return { label: 'Destacado', className: 'bg-red-600' }
  }
  if (product.compareAtPrice && product.compareAtPrice > product.price) {
    return { label: 'Oferta', className: 'bg-emerald-600' }
  }
  return null
}

function mapProduct(product: DbProduct): CatalogProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? '',
    price: Number(product.price),
    compareAtPrice: product.compare_at_price ? Number(product.compare_at_price) : null,
    images: product.images ?? [],
    category: product.category ?? '',
    featured: product.featured,
  }
}

async function resolveStoreId(storeSlug?: string): Promise<string | null> {
  const headersList = await headers()
  const storeIdFromHeader = headersList.get('x-store-id')

  if (storeIdFromHeader) {
    return storeIdFromHeader
  }

  if (storeSlug) {
    const store = await getStoreBySlug(storeSlug)
    return store?.id ?? null
  }

  const user = await getUser()

  if (!user) {
    return null
  }

  const supabase = await createClient()

  const { data: store, error } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (error || !store) {
    return null
  }

  return store.id
}

async function getHomepageProducts(storeId: string): Promise<CatalogProduct[]> {
  const supabase = await createClient()
  const selectFields =
    'id, name, description, price, compare_at_price, category, images, featured'

  const { data: featuredProducts, error: featuredError } = await supabase
    .from('products')
    .select(selectFields)
    .eq('store_id', storeId)
    .eq('active', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(4)

  if (!featuredError && featuredProducts && featuredProducts.length > 0) {
    return featuredProducts.map((product) => mapProduct(product as DbProduct))
  }

  const { data: recentProducts, error: recentError } = await supabase
    .from('products')
    .select(selectFields)
    .eq('store_id', storeId)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(4)

  if (recentError || !recentProducts) {
    return []
  }

  return recentProducts.map((product) => mapProduct(product as DbProduct))
}

export default async function StorefrontPage({ searchParams }: StorefrontPageProps) {
  const params = await searchParams
  const storeId = await resolveStoreId(params.store)
  const featuredProducts = storeId ? await getHomepageProducts(storeId) : []

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

          {featuredProducts.length === 0 ? (
            <div className="mt-12 flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-lg font-semibold text-slate-900">Próximamente</h3>
              <p className="mt-2 text-sm text-slate-500">
                Estamos preparando nuestro catálogo. Volvé pronto para descubrir nuestros productos.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => {
                const badge = getProductBadge(product)
                const imageUrl = product.images[0] ?? ''

                return (
                  <Card key={product.id} className="group overflow-hidden transition-shadow hover:shadow-xl">
                    <CardContent className="p-0">
                      <Link href={`/storefront/product/${product.id}`} className="block">
                        <div className="relative aspect-square overflow-hidden bg-slate-100">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-slate-400">
                              {product.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {badge && (
                            <Badge className={`absolute left-3 top-3 ${badge.className} text-white`}>
                              {badge.label}
                            </Badge>
                          )}
                        </div>
                        <div className="p-4 pb-0">
                          <h3 className="mb-2 line-clamp-2 font-semibold text-slate-900 group-hover:text-red-600">
                            {product.name}
                          </h3>
                          <p className="mb-3 line-clamp-2 text-sm text-slate-500">
                            {product.description}
                          </p>
                        </div>
                      </Link>
                      <div className="flex items-center justify-between p-4 pt-0">
                        <span className="text-lg font-bold text-slate-900">
                          {formatPrice(product.price)}
                        </span>
                        <AddToCartButton
                          productId={product.id}
                          productName={product.name}
                          productPrice={product.price}
                          productImage={imageUrl}
                          className="!h-8 !w-auto shrink-0 px-3 py-0 text-sm [&_svg]:h-4 [&_svg]:w-4"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

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
