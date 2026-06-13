import { headers } from 'next/headers'
import { createClient, getUser } from '@/lib/supabase/server'
import { getStoreBySlug } from '@/lib/tenant'
import {
  ProductsCatalog,
  type CatalogProduct,
} from '@/components/storefront/products-catalog'

type ProductsPageProps = {
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
  const storeId = await resolveStoreId(params.store)

  if (!storeId) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h3 className="text-lg font-semibold text-foreground">Tienda no encontrada</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Accedé con el subdominio de la tienda o usá el parámetro{' '}
              <code className="rounded bg-slate-100 px-1">?store=slug-de-tu-tienda</code>.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const products = await getActiveProducts(storeId)

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ProductsCatalog products={products} />
      </div>
    </div>
  )
}
