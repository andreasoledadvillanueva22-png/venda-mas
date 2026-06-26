import { createClient } from '@/lib/supabase/server'
import {
  ProductsCatalog,
  type CatalogProduct,
} from '@/components/storefront/products-catalog'
import { StoreNotFound } from '@/components/storefront/store-not-found'
import { resolveStorefrontStore } from '@/lib/storefront-server'

type ProductsPageProps = {
  searchParams: Promise<{ store?: string; category?: string }>
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

async function getActiveProducts(storeId: string): Promise<CatalogProduct[]> {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, description, price, compare_at_price, category, images, featured')
    .eq('store_id', storeId)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error || !products) {
    return []
  }

  return products.map(mapProduct)
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
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

  const products = await getActiveProducts(store.id)

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ProductsCatalog
          products={products}
          storeSlug={store.slug}
          initialCategory={params.category}
        />
      </div>
    </div>
  )
}
