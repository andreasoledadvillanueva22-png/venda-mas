import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { ProductsTable, type ProductTableRow } from '@/components/admin/products-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type DbProduct = {
  id: string
  name: string
  price: number
  stock: number
  active: boolean
  category: string | null
  images: string[] | null
}


function mapProduct(product: DbProduct): ProductTableRow {
  return {
    id: product.id,
    name: product.name,
    active: product.active,
    stock: product.stock,
    price: Number(product.price),
    category: product.category ?? '',
    image: product.images?.[0] ?? null,
  }
}

async function getStoreProducts(): Promise<{ storeId: string; products: ProductTableRow[] } | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (storeError || !store) {
    return null
  }

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, price, stock, active, category, images')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  if (productsError) {
    return null
  }

  return {
    storeId: store.id,
    products: (products ?? []).map((product) => mapProduct(product as DbProduct)),
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>
}) {
  const params = await searchParams
  const result = await getStoreProducts()
  const showUpdatedMessage = params.updated === '1'

  if (!result) {
    redirect('/auth/login?redirect=/admin/products')
  }

  const { storeId, products } = result

  return (
    <div className="min-h-full">
      <div className="border-b border-brand-200 bg-white/60 px-6 py-6 backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-600">Módulo 2</p>
            <h1 className="text-3xl font-bold text-brand-900">Productos</h1>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Agregar producto
          </Link>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {showUpdatedMessage ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Producto actualizado correctamente.
          </div>
        ) : null}

        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <p className="text-lg font-medium text-foreground">No tenés productos aún</p>
              <p className="text-sm text-muted-foreground">
                Creá tu primer producto para empezar a vender en tu tienda.
              </p>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                <Plus className="h-4 w-4" />
                Crear producto
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-1">
                <CardTitle>Lista de productos</CardTitle>
                <CardDescription>
                  Administra tus productos y realiza cambios rápidos en el catálogo.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ProductsTable products={products} storeId={storeId} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
