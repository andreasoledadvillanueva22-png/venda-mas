import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Archive, Copy, Edit, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type DbProduct = {
  id: string
  name: string
  price: number
  stock: number
  active: boolean
  category: string | null
  images: string[] | null
}

type ProductRow = {
  id: string
  name: string
  status: 'Activo' | 'Inactivo'
  stock: number
  price: number
  category: string
  image: string | null
}

function formatPrice(value: number) {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  })
}

function statusBadgeClasses(status: ProductRow['status']) {
  return status === 'Activo'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-slate-100 text-slate-700'
}

function mapProduct(product: DbProduct): ProductRow {
  return {
    id: product.id,
    name: product.name,
    status: product.active ? 'Activo' : 'Inactivo',
    stock: product.stock,
    price: Number(product.price),
    category: product.category ?? '',
    image: product.images?.[0] ?? null,
  }
}

async function getStoreProducts(): Promise<ProductRow[] | null> {
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

  return (products ?? []).map(mapProduct)
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>
}) {
  const params = await searchParams
  const products = await getStoreProducts()
  const showUpdatedMessage = params.updated === '1'

  if (!products) {
    redirect('/auth/login?redirect=/admin/products')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-border bg-white px-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Módulo 2</p>
            <h1 className="text-3xl font-semibold text-foreground">Productos</h1>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
          >
            <Plus className="h-4 w-4" />
            Agregar producto
          </Link>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {showUpdatedMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Producto actualizado correctamente.
          </div>
        )}
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-semibold text-slate-400">
                                {product.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <p className="font-medium text-foreground">{product.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClasses(product.status)}`}
                        >
                          {product.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={product.stock < 10 ? 'text-red-600' : 'text-foreground'}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell>{product.category || '—'}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/new?edit=${product.id}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-red-500 hover:text-foreground"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground opacity-50">
                            <Copy className="h-4 w-4" />
                          </span>
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground opacity-50">
                            <Archive className="h-4 w-4" />
                          </span>
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground opacity-50">
                            <Trash2 className="h-4 w-4" />
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
