import { use } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  RotateCcw,
  Shield,
  Truck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { resolveStorefrontStore, getProductReviews } from '@/lib/storefront-server'
import { AddToCartButton } from '@/components/storefront/add-to-cart-button'
import { BuyNowButton } from '@/components/storefront/buy-now-button'
import { ProductVideo } from '@/components/storefront/product-video'
import { ProductReviewsList } from '@/components/storefront/product-reviews-list'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type ProductPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ store?: string; image?: string }>
}

type DbProduct = {
  id: string
  store_id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null
  category: string | null
  stock: number
  sku: string | null
  images: string[] | null
  tags: string[] | null
  video_url: string | null
  featured: boolean
  active: boolean
}

type RelatedProduct = {
  id: string
  name: string
  price: number
  image: string | null
}

type ProductDetail = {
  product: DbProduct
  relatedProducts: RelatedProduct[]
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}

function calculateDiscountPercent(price: number, compareAtPrice: number | null): number | null {
  if (!compareAtPrice || compareAtPrice <= price) {
    return null
  }

  return Math.round((1 - price / compareAtPrice) * 100)
}

async function resolveStoreId(storeSlug?: string): Promise<string | null> {
  const store = await resolveStorefrontStore(storeSlug)
  return store?.id ?? null
}

async function getProductDetail(
  productId: string,
  tenantStoreId: string | null,
): Promise<ProductDetail | null> {
  const supabase = await createClient()

  let productQuery = supabase
    .from('products')
    .select(
      'id, store_id, name, slug, description, price, compare_at_price, category, stock, sku, images, tags, video_url, featured, active',
    )
    .eq('id', productId)
    .eq('active', true)

  if (tenantStoreId) {
    productQuery = productQuery.eq('store_id', tenantStoreId)
  }

  const { data: product, error: productError } = await productQuery.maybeSingle()

  if (productError || !product) {
    return null
  }

  const dbProduct = product as DbProduct

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id')
    .eq('id', dbProduct.store_id)
    .maybeSingle()

  if (storeError || !store) {
    return null
  }

  let relatedProducts: RelatedProduct[] = []

  if (dbProduct.category) {
    const { data: related, error: relatedError } = await supabase
      .from('products')
      .select('id, name, price, images')
      .eq('store_id', dbProduct.store_id)
      .eq('active', true)
      .eq('category', dbProduct.category)
      .neq('id', dbProduct.id)
      .order('created_at', { ascending: false })
      .limit(4)

    if (!relatedError && related) {
      relatedProducts = related.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        image: item.images?.[0] ?? null,
      }))
    }
  }

  return {
    product: dbProduct,
    relatedProducts,
  }
}

function buildProductPath(productId: string, storeSlug?: string, imageIndex?: number) {
  const params = new URLSearchParams()

  if (storeSlug) {
    params.set('store', storeSlug)
  }

  if (imageIndex !== undefined && imageIndex > 0) {
    params.set('image', String(imageIndex))
  }

  const query = params.toString()
  return query
    ? `/storefront/product/${productId}?${query}`
    : `/storefront/product/${productId}`
}

export default function ProductPage({ params, searchParams }: ProductPageProps) {
  const { id } = use(params)
  const query = use(searchParams)
  const tenantStoreId = use(resolveStoreId(query.store))
  const detail = use(getProductDetail(id, tenantStoreId))
  const reviews = use(
    detail
      ? getProductReviews(detail.product.id, detail.product.store_id)
      : Promise.resolve([]),
  )

  const selectedImageIndex = Math.max(0, Number(query.image ?? 0) || 0)

  if (!detail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground">Producto no disponible</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            El producto que buscás no existe, no está activo o no pertenece a esta tienda.
          </p>
          <Link
            href={
              query.store
                ? `/storefront/products?store=${encodeURIComponent(query.store)}`
                : '/storefront/products'
            }
            className={cn(buttonVariants(), 'mt-6 bg-red-600 text-white hover:bg-red-700')}
          >
            Volver al catálogo
          </Link>
        </div>
      </div>
    )
  }

  const { product, relatedProducts } = detail
  const images = product.images ?? []
  const safeImageIndex =
    images.length > 0 ? Math.min(selectedImageIndex, images.length - 1) : 0
  const mainImage = images[safeImageIndex] ?? null
  const compareAtPrice = product.compare_at_price ? Number(product.compare_at_price) : null
  const price = Number(product.price)
  const discountPercent = calculateDiscountPercent(price, compareAtPrice)
  const tags = product.tags ?? []
  const catalogHref = query.store
    ? `/storefront/products?store=${encodeURIComponent(query.store)}`
    : '/storefront/products'
  const categoryHref = product.category
    ? `${catalogHref}${catalogHref.includes('?') ? '&' : '?'}category=${encodeURIComponent(product.category)}`
    : catalogHref

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/storefront" className="hover:text-foreground">
            Inicio
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={categoryHref} className="hover:text-foreground">
            {product.category || 'Productos'}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-5xl font-semibold text-slate-400">
                  {product.name.charAt(0).toUpperCase()}
                </div>
              )}
              {product.featured && (
                <Badge className="absolute left-4 top-4 bg-red-600 text-white">Destacado</Badge>
              )}
              {discountPercent !== null && (
                <Badge className="absolute right-4 top-4 bg-emerald-600 text-white">
                  -{discountPercent}%
                </Badge>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <Link
                    key={`${product.id}-${index}`}
                    href={buildProductPath(product.id, query.store, index)}
                    className={cn(
                      'aspect-square overflow-hidden rounded-lg border-2 transition',
                      safeImageIndex === index ? 'border-red-600' : 'border-transparent',
                    )}
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </Link>
                ))}
              </div>
            )}

            {product.video_url ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Video del producto
                </p>
                <ProductVideo videoUrl={product.video_url} title={product.name} />
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div>
              {product.category && (
                <Badge variant="outline" className="mb-3">
                  {product.category}
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-bold text-red-600">{formatPrice(price)}</span>
              {compareAtPrice !== null && compareAtPrice > price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(compareAtPrice)}
                  </span>
                  {discountPercent !== null && (
                    <span className="text-sm font-semibold text-emerald-600">
                      {discountPercent}% OFF
                    </span>
                  )}
                </>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground">{product.description}</p>
            )}

            <Separator />

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Stock
              </p>
              <p className="mt-1 text-foreground">
                {product.stock > 0 ? 'En stock' : 'Agotado'}
              </p>
            </div>

            {(product.sku || product.category) && (
              <div className="grid gap-4 sm:grid-cols-2">
                {product.category && (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Categoría
                    </p>
                    <p className="mt-1 text-foreground">{product.category}</p>
                  </div>
                )}
                {product.sku && (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      SKU
                    </p>
                    <p className="mt-1 text-foreground">{product.sku}</p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <AddToCartButton
                productId={product.id}
                productName={product.name}
                productPrice={price}
                productImage={mainImage ?? ''}
                stock={product.stock}
              />
              <BuyNowButton
                productId={product.id}
                productName={product.name}
                productPrice={price}
                productImage={mainImage ?? ''}
                stock={product.stock}
                storeSlug={query.store ?? null}
              />
            </div>

            <div className="space-y-3 rounded-xl border border-border p-4">
              {price > 50000 && (
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

        <ProductReviewsList reviews={reviews} />

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold text-foreground">También te puede interesar</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  href={buildProductPath(related.id, query.store)}
                >
                  <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden bg-slate-100">
                        {related.image ? (
                          <img
                            src={related.image}
                            alt={related.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-slate-400">
                            {related.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="mb-2 line-clamp-2 font-semibold text-foreground">
                          {related.name}
                        </h3>
                        <p className="text-lg font-bold text-foreground">
                          {formatPrice(related.price)}
                        </p>
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
