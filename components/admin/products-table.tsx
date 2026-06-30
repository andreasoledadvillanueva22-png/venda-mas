'use client'

import { useEffect, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, Edit, Eye, EyeOff, Loader2, Trash2 } from 'lucide-react'
import {
  deleteProduct,
  duplicateProduct,
  toggleProductStatus,
} from '@/app/admin/products/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export type ProductTableRow = {
  id: string
  name: string
  active: boolean
  stock: number
  price: number
  category: string
  image: string | null
}

type ProductsTableProps = {
  products: ProductTableRow[]
  storeId: string
}

function formatPrice(value: number) {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  })
}

function statusBadgeClasses(active: boolean) {
  return active ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-brand-700'
}

export function ProductsTable({ products, storeId }: ProductsTableProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [pending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductTableRow | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timer = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!deleteTarget) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [deleteTarget])

  function runAction(action: () => Promise<{ error?: string; message?: string; success?: boolean }>) {
    startTransition(async () => {
      const result = await action()

      if (result.error) {
        setToast({ type: 'error', message: result.error })
        return
      }

      if (result.message) {
        setToast({ type: 'success', message: result.message })
      }

      router.refresh()
    })
  }

  const deleteDialog =
    deleteTarget && mounted ? (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-product-title"
        onClick={() => !pending && setDeleteTarget(null)}
      >
        <Card
          className="relative z-[101] w-full max-w-md shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <h2 id="delete-product-title" className="text-lg font-semibold text-foreground">
                ¿Eliminar producto?
              </h2>
              <p className="text-sm text-muted-foreground">
                Esta acción no se puede deshacer. ¿Estás seguro de eliminar{' '}
                <span className="font-medium text-foreground">{deleteTarget.name}</span>?
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={pending}
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() =>
                  runAction(async () => {
                    const result = await deleteProduct(deleteTarget.id, storeId)
                    if (result.success) {
                      setDeleteTarget(null)
                    }
                    return result
                  })
                }
              >
                {pending ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    ) : null

  return (
    <>
      {toast ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
          role="status"
        >
          {toast.message}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b border-brand-100 transition-colors">
              <th className="h-11 bg-brand-50 px-3 text-left align-middle text-sm font-semibold text-brand-900">
                Producto
              </th>
              <th className="h-11 bg-brand-50 px-3 text-left align-middle text-sm font-semibold text-brand-900">
                Estado
              </th>
              <th className="h-11 bg-brand-50 px-3 text-left align-middle text-sm font-semibold text-brand-900">
                Stock
              </th>
              <th className="h-11 bg-brand-50 px-3 text-left align-middle text-sm font-semibold text-brand-900">
                Precio
              </th>
              <th className="h-11 bg-brand-50 px-3 text-left align-middle text-sm font-semibold text-brand-900">
                Categoría
              </th>
              <th className="h-11 bg-brand-50 px-3 text-right align-middle text-sm font-semibold text-brand-900">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-brand-100 transition-colors hover:bg-brand-50/50"
              >
                <td className="p-3 align-middle">
                  <div className="flex min-w-[12rem] items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
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
                </td>
                <td className="p-3 align-middle">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClasses(product.active)}`}
                  >
                    {product.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-3 align-middle">
                  <span className={product.stock < 10 ? 'text-red-600' : 'text-foreground'}>
                    {product.stock}
                  </span>
                </td>
                <td className="p-3 align-middle">{formatPrice(product.price)}</td>
                <td className="p-3 align-middle">{product.category || '—'}</td>
                <td className="p-3 align-middle">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/products/new?edit=${product.id}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
                      title="Editar producto"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        runAction(() => duplicateProduct(product.id, storeId))
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-brand-600 transition hover:bg-brand-50 disabled:opacity-50"
                      title="Duplicar producto"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        runAction(() => toggleProductStatus(product.id, storeId))
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border transition hover:bg-brand-50 disabled:opacity-50"
                      title={product.active ? 'Desactivar producto' : 'Activar producto'}
                    >
                      {product.active ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => setDeleteTarget(product)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      title="Eliminar producto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pending ? (
        <div className="pointer-events-none fixed bottom-6 right-6 z-[90] flex items-center gap-2 rounded-full bg-brand-900 px-4 py-2 text-sm text-white shadow-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          Procesando...
        </div>
      ) : null}

      {deleteDialog && mounted ? createPortal(deleteDialog, document.body) : null}
    </>
  )
}
