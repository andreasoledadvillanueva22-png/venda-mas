'use client'

import Link from 'next/link'
import { Search, User, ShoppingCart, Store, Mail, Phone, MapPin } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { resolveStorefrontStore } from '@/lib/storefront-server'
import type { StorefrontStore } from '@/lib/storefront'
import { storefrontHref } from '@/lib/storefront'

type StorefrontShellProps = {
  store: StorefrontStore | null
  children: React.ReactNode
}

function StoreLogo({
  store,
}: {
  store: StorefrontStore
}) {
  if (store.logoUrl) {
    return (
      <img
        src={store.logoUrl}
        alt={`Logo de ${store.name}`}
        className="h-10 w-10 rounded-full object-cover"
      />
    )
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
      {store.name.charAt(0).toUpperCase()}
    </div>
  )
}

export function StorefrontShell({ store, children }: StorefrontShellProps) {
  const { totalItems, setIsCartOpen } = useCart()
  const storeSlug = store?.slug ?? null
  const storeName = store?.name ?? 'Tienda Online'
  const freeShippingThreshold = store?.freeShippingThreshold ?? 50000
  const formattedThreshold = freeShippingThreshold.toLocaleString('es-AR')

  const homeHref = storefrontHref('/storefront', storeSlug)
  const productsHref = storefrontHref('/storefront/products', storeSlug)

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="bg-slate-900 py-2 text-center text-sm text-white">
        Envío gratis en compras superiores a ${formattedThreshold}
      </div>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href={homeHref} className="flex items-center gap-2">
              {store ? (
                <StoreLogo store={store} />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                  <Store className="h-5 w-5" />
                </div>
              )}
              <span className="hidden max-w-[14rem] truncate text-xl font-bold tracking-wider text-slate-900 sm:inline lg:max-w-xs">
                {storeName}
              </span>
            </Link>

            <nav className="hidden items-center gap-8 md:flex">
              <Link href={homeHref} className="text-sm font-semibold text-slate-900 transition hover:text-red-600">
                INICIO
              </Link>
              <Link
                href={productsHref}
                className="text-sm font-semibold text-slate-900 transition hover:text-red-600"
              >
                PRODUCTOS
              </Link>
              <Link
                href={productsHref}
                className="text-sm font-semibold text-slate-900 transition hover:text-red-600"
              >
                CATEGORÍAS
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-full bg-slate-100 p-3 text-slate-900 transition hover:bg-slate-200"
                aria-label="Buscar"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="hidden rounded-full bg-slate-100 p-3 text-slate-900 transition hover:bg-slate-200 sm:block"
                aria-label="Mi cuenta"
              >
                <User className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Abrir carrito"
                onClick={() => setIsCartOpen(true)}
                className="relative touch-manipulation rounded-full bg-slate-100 p-3 text-slate-900 transition hover:bg-slate-200"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-auto bg-slate-900 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold">{storeName}</h3>
              <p className="text-sm text-slate-400">
                {store?.description ??
                  'Productos de calidad con envío a toda Argentina. Compra segura con Mercado Pago.'}
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Enlaces rápidos</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href={homeHref} className="hover:text-white">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href={productsHref} className="hover:text-white">
                    Productos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Atención al cliente</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href={homeHref} className="hover:text-white">
                    Envíos
                  </Link>
                </li>
                <li>
                  <Link href={homeHref} className="hover:text-white">
                    Devoluciones
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Contacto</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> contacto@{storeSlug ?? 'tienda'}.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> WhatsApp
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Argentina
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} {storeName}. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
