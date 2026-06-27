import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ArrowRight,
  Star,
  CheckCircle2,
  Store,
} from 'lucide-react'
import type { CatalogProduct } from '@/components/storefront/products-catalog'
import { AddToCartButton } from '@/components/storefront/add-to-cart-button'
import { StoreNotFound } from '@/components/storefront/store-not-found'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import {
  getStoreCategories,
  getStoreTestimonials,
  resolveStorefrontStore,
} from '@/lib/storefront-server'
import type { StorefrontTestimonial } from '@/lib/storefront'
import { buildWhatsappUrl, storefrontHref } from '@/lib/storefront'

const BRAND_RED = '#FC0303'

const CATEGORY_COLORS = [
  'from-blue-500 to-blue-700',
  'from-green-500 to-green-700',
  'from-purple-500 to-purple-700',
  'from-pink-500 to-pink-700',
  'from-amber-500 to-amber-700',
  'from-cyan-500 to-cyan-700',
]

const POPUP_PRODUCT_LIMIT = 5
const POPUP_ROTATION_SECONDS = 20
const POPUP_VISIBLE_SECONDS = 5

type RecentPurchaseNotification = {
  productName: string
  minutes: number
}

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

function shuffleProducts<T>(items: T[]): T[] {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }

  return shuffled
}

function getRandomPurchaseMinutes(): number {
  return Math.floor(Math.random() * (30 - 5 + 1)) + 5
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

function isPromoProduct(product: CatalogProduct): boolean {
  return Boolean(product.compareAtPrice && product.compareAtPrice > product.price)
}

async function getPopupProducts(storeId: string): Promise<CatalogProduct[]> {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, description, price, compare_at_price, category, images, featured')
    .eq('store_id', storeId)
    .eq('active', true)

  if (error || !products || products.length === 0) {
    return []
  }

  const catalogProducts = products.map((product) => mapProduct(product as DbProduct))

  return shuffleProducts(catalogProducts).slice(0, POPUP_PRODUCT_LIMIT)
}

function buildRecentPurchaseNotifications(
  products: CatalogProduct[],
): RecentPurchaseNotification[] {
  if (products.length === 0) {
    return []
  }

  return products.map((product) => ({
    productName: product.name,
    minutes: getRandomPurchaseMinutes(),
  }))
}

async function getPromoProducts(storeId: string): Promise<CatalogProduct[]> {
  const supabase = await createClient()
  const selectFields =
    'id, name, description, price, compare_at_price, category, images, featured'

  const { data: products, error } = await supabase
    .from('products')
    .select(selectFields)
    .eq('store_id', storeId)
    .eq('active', true)
    .not('compare_at_price', 'is', null)
    .order('created_at', { ascending: false })
    .limit(12)

  if (error || !products) {
    return []
  }

  return products
    .map((product) => mapProduct(product as DbProduct))
    .filter(isPromoProduct)
    .slice(0, 3)
}

function buildKeywords(storeName: string, categories: string[]): string {
  const categoryKeywords = categories.join(', ')
  return `tienda online, compra online, envío gratis, Argentina, ${categoryKeywords}, ${storeName}`
}

export async function generateMetadata({ searchParams }: StorefrontPageProps): Promise<Metadata> {
  const params = await searchParams
  const store = await resolveStorefrontStore(params.store)
  const storeName = store?.name ?? 'Tienda Online'
  const categories = store ? await getStoreCategories(store.id) : []

  return {
    title: `${storeName} - Tienda Online con Envío a Toda Argentina`,
    description:
      store?.description ??
      'Productos de calidad con envío a toda Argentina. Compra segura con Mercado Pago.',
    keywords: buildKeywords(storeName, categories),
  }
}

function HeroVisual({
  storeName,
  heroImageUrl,
}: {
  storeName: string
  heroImageUrl: string | null
}) {
  if (heroImageUrl) {
    return (
      <img
        src={heroImageUrl}
        alt={`Imagen principal de ${storeName}`}
        className="aspect-[4/3] w-full rounded-2xl object-cover shadow-md lg:aspect-square"
      />
    )
  }

  return (
    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8 text-center shadow-md lg:aspect-square">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: `${BRAND_RED}15` }}
      >
        <Store className="h-10 w-10" style={{ color: BRAND_RED }} />
      </div>
      <p className="mt-5 text-2xl font-bold text-slate-900">{storeName}</p>
      <p className="mt-2 text-sm text-slate-500">Tu tienda online de confianza</p>
    </div>
  )
}

function StarRating({ rating = 5 }: { rating?: number }) {
  const safeRating = Math.min(5, Math.max(1, rating))

  return (
    <div className="flex gap-0.5" aria-label={`${safeRating} estrellas`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < safeRating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-slate-200 text-slate-200'
          }`}
        />
      ))}
    </div>
  )
}

function RecentPurchaseNotifications({
  notifications,
}: {
  notifications: RecentPurchaseNotification[]
}) {
  if (notifications.length === 0) {
    return null
  }

  const cycleDurationSeconds = notifications.length * POPUP_ROTATION_SECONDS
  const visibleKeyframePercent = (POPUP_VISIBLE_SECONDS / cycleDurationSeconds) * 100

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes recentPurchasePopup {
              0%, ${visibleKeyframePercent}% {
                opacity: 1;
                transform: translateY(0);
                visibility: visible;
              }
              ${visibleKeyframePercent + 0.01}%, 100% {
                opacity: 0;
                transform: translateY(16px);
                visibility: hidden;
              }
            }
            .recent-purchase-notification {
              animation: recentPurchasePopup ${cycleDurationSeconds}s infinite;
            }
          `,
        }}
      />
      <div className="pointer-events-none fixed bottom-6 left-4 z-50 h-28 w-[min(calc(100vw-2rem),20rem)] sm:left-6">
        {notifications.map((purchase, index) => (
          <div
            key={`${purchase.productName}-${index}`}
            className="recent-purchase-notification pointer-events-none absolute inset-x-0 bottom-0 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
            style={{ animationDelay: `${index * POPUP_ROTATION_SECONDS}s` }}
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              <p className="text-sm leading-snug text-slate-700">
                Alguien compró{' '}
                <span className="font-semibold text-slate-900">{purchase.productName}</span> hace{' '}
                {purchase.minutes} minutos
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default async function StorefrontPage({ searchParams }: StorefrontPageProps) {
  const params = await searchParams
  const requestedSlug = params.store?.trim()

  if (requestedSlug) {
    const storeBySlug = await resolveStorefrontStore(requestedSlug)
    if (!storeBySlug) {
      return <StoreNotFound />
    }
  }

  const store = await resolveStorefrontStore(params.store)

  if (!store) {
    return <StoreNotFound />
  }

  const storeName = store.name
  const heroImageUrl = store.heroImageUrl
  const storeCategories = await getStoreCategories(store.id)
  const testimonials = await getStoreTestimonials(store.id)
  const featuredProducts = await getHomepageProducts(store.id)
  const promoProducts = await getPromoProducts(store.id)
  const popupProducts = await getPopupProducts(store.id)
  const recentPurchaseNotifications = buildRecentPurchaseNotifications(popupProducts)
  const promoSectionProducts =
    promoProducts.length > 0 ? promoProducts : featuredProducts.slice(0, 3)

  const productsHref = storefrontHref('/storefront/products', store.slug)
  const productHref = (productId: string) =>
    storefrontHref(`/storefront/product/${productId}`, store.slug)
  const categoryHref = (category: string) =>
    storefrontHref(
      `/storefront/products?category=${encodeURIComponent(category)}`,
      store.slug,
    )

  return (
    <div>
      <RecentPurchaseNotifications notifications={recentPurchaseNotifications} />

      {/* HERO */}
      <section className="overflow-hidden bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <Badge
                variant="outline"
                className="border-slate-300 bg-white text-slate-700"
              >
                PRODUCTOS DESTACADOS
              </Badge>
              <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Bienvenidos a
                <br />
                <span style={{ color: BRAND_RED }}>{storeName}</span>
              </h1>
              <p className="max-w-xl text-lg text-slate-600">
                Productos de calidad con envío a toda Argentina. Compra segura con Mercado Pago
                o WhatsApp.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={productsHref}
                  className="inline-flex items-center rounded-md px-8 py-3 text-lg font-medium text-white transition hover:opacity-90"
                  style={{ backgroundColor: BRAND_RED }}
                >
                  Ver productos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                {store.footerWhatsapp ? (
                  <a
                    href={buildWhatsappUrl(store.footerWhatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-md border border-slate-300 bg-white px-8 py-3 text-lg font-medium text-slate-900 transition hover:bg-slate-50"
                  >
                    Contactar por WhatsApp
                  </a>
                ) : null}
              </div>
            </div>
            <HeroVisual storeName={storeName} heroImageUrl={heroImageUrl} />
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      {storeCategories.length > 0 ? (
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: BRAND_RED }}>
                COMPRAR POR CATEGORÍA
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
                Explorá nuestras categorías
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {storeCategories.map((category, index) => (
                <Link
                  key={category}
                  href={categoryHref(category)}
                  className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${CATEGORY_COLORS[index % CATEGORY_COLORS.length]} p-8 text-white transition-transform hover:scale-105`}
                >
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold">{category}</h3>
                    <p className="mt-2 text-sm text-white/80">Ver productos de {category}</p>
                    <ArrowRight className="mt-4 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* PRODUCTOS DESTACADOS */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: BRAND_RED }}>
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
                      <Link href={productHref(product.id)} className="block">
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
              href={productsHref}
              className="inline-flex items-center rounded-md px-8 py-3 text-lg font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: BRAND_RED }}
            >
              Ver todos los productos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* OFERTAS ESPECIALES */}
      {promoSectionProducts.length > 0 ? (
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: BRAND_RED }}>
                PROMOCIONES
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
                Ofertas Especiales
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {promoSectionProducts.map((product) => {
                const imageUrl = product.images[0] ?? ''
                const hasDiscount =
                  product.compareAtPrice !== null && product.compareAtPrice > product.price

                return (
                  <Card
                    key={product.id}
                    className="group overflow-hidden rounded-2xl border border-slate-100 shadow-md transition-shadow hover:shadow-xl"
                  >
                    <CardContent className="p-0">
                      <Link href={productHref(product.id)} className="block">
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
                          <Badge
                            className="absolute left-3 top-3 text-white"
                            style={{ backgroundColor: BRAND_RED }}
                          >
                            {hasDiscount ? 'OFERTA' : 'PROMO'}
                          </Badge>
                        </div>
                        <div className="p-5">
                          <h3 className="mb-3 line-clamp-2 text-lg font-semibold text-slate-900 group-hover:text-red-600">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-3">
                            {hasDiscount ? (
                              <>
                                <span className="text-sm text-slate-400 line-through">
                                  {formatPrice(product.compareAtPrice ?? product.price)}
                                </span>
                                <span className="text-xl font-bold" style={{ color: BRAND_RED }}>
                                  {formatPrice(product.price)}
                                </span>
                              </>
                            ) : (
                              <span className="text-xl font-bold" style={{ color: BRAND_RED }}>
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                      <div className="px-5 pb-5">
                        <AddToCartButton
                          productId={product.id}
                          productName={product.name}
                          productPrice={product.price}
                          productImage={imageUrl}
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* TESTIMONIOS */}
      {testimonials.length > 0 ? (
        <section className="bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: BRAND_RED }}>
                OPINIONES
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
                Lo que dicen nuestros clientes
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial: StorefrontTestimonial) => (
                <Card
                  key={testimonial.id}
                  className="rounded-2xl border border-slate-100 bg-white shadow-md"
                >
                  <CardContent className="space-y-4 p-6">
                    <StarRating rating={testimonial.rating} />
                    <p className="text-sm leading-relaxed text-slate-600">
                      &ldquo;{testimonial.comment}&rdquo;
                    </p>
                    <div>
                      <p className="font-semibold text-slate-900">{testimonial.customerName}</p>
                      {testimonial.customerLocation ? (
                        <p className="text-sm text-slate-500">{testimonial.customerLocation}</p>
                      ) : null}
                      {testimonial.productName ? (
                        <p className="text-xs text-slate-400">Compró: {testimonial.productName}</p>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* NEWSLETTER */}
      <section className="bg-slate-900 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: BRAND_RED }}>
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
              <Button
                className="rounded-full px-8 py-3 text-white hover:opacity-90"
                style={{ backgroundColor: BRAND_RED }}
              >
                Suscribirme
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
