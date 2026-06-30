'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, User, ShoppingCart, Store, Mail, Phone, MapPin } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import type { StorefrontRecentPurchase, StorefrontStore } from '@/lib/storefront'
import { buildWhatsappUrl, normalizeSocialUrl, storefrontHref } from '@/lib/storefront'
import { cn } from '@/lib/utils'
import { FloatingWhatsappButton } from '@/components/storefront/floating-whatsapp-button'
import { RecentPurchaseNotifications } from '@/components/storefront/recent-purchase-notifications'
import { Logo } from '@/components/ui/logo'

type StorefrontShellProps = {
  store: StorefrontStore | null
  recentPurchases?: StorefrontRecentPurchase[]
  children: React.ReactNode
}

function StoreLogo({ store }: { store: StorefrontStore }) {
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

export function StorefrontShell({ store, recentPurchases = [], children }: StorefrontShellProps) {
  const { totalItems, setIsCartOpen } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const storeSlug = store?.slug ?? null
  const storeName = store?.name ?? 'Tienda Online'
  const freeShippingThreshold = store?.freeShippingThreshold ?? 50000
  const formattedThreshold = freeShippingThreshold.toLocaleString('es-AR')

  const homeHref = storefrontHref('/storefront', storeSlug)
  const productsHref = storefrontHref('/storefront/products', storeSlug)

  const hasContactInfo = Boolean(
    store?.footerEmail ||
      store?.footerPhone ||
      store?.footerAddress ||
      store?.footerWhatsapp,
  )

  const hasSocialLinks = Boolean(store?.footerInstagram || store?.footerFacebook)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-brand-50/30">
      <div className="bg-gray-900 py-2 text-center text-sm text-white">
        Envío gratis en compras superiores a ${formattedThreshold}
      </div>

      <header
        className={cn(
          'sticky top-0 z-30 border-b transition-all duration-300',
          scrolled
            ? 'border-brand-100 bg-white/80 shadow-sm backdrop-blur-lg'
            : 'border-transparent bg-white/60 backdrop-blur-sm',
        )}
      >
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
              <span className="hidden max-w-[14rem] truncate text-xl font-bold tracking-wider text-brand-900 sm:inline lg:max-w-xs">
                {storeName}
              </span>
            </Link>

            <nav className="hidden items-center gap-8 md:flex">
              <Link href={homeHref} className="text-sm font-semibold text-brand-900 transition hover:text-red-600">
                INICIO
              </Link>
              <Link
                href={productsHref}
                className="text-sm font-semibold text-brand-900 transition hover:text-red-600"
              >
                PRODUCTOS
              </Link>
              <Link
                href={productsHref}
                className="text-sm font-semibold text-brand-900 transition hover:text-red-600"
              >
                CATEGORÍAS
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-full bg-brand-50 p-3 text-brand-900 transition hover:bg-brand-100"
                aria-label="Buscar"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="hidden rounded-full bg-brand-50 p-3 text-brand-900 transition hover:bg-brand-100 sm:block"
                aria-label="Mi cuenta"
              >
                <User className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Abrir carrito"
                onClick={() => setIsCartOpen(true)}
                className="relative touch-manipulation rounded-full bg-brand-50 p-3 text-brand-900 transition hover:bg-brand-100"
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

      <footer className="mt-auto bg-gray-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            <div className="space-y-4">
              <h3 className="text-lg font-bold">{storeName}</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                {store?.description ??
                  'Productos de calidad con envío a toda Argentina. Compra segura con Mercado Pago.'}
              </p>
              {hasSocialLinks ? (
                <div className="flex flex-wrap gap-3">
                  {store?.footerInstagram ? (
                    <a
                      href={normalizeSocialUrl(store.footerInstagram, 'https://instagram.com/')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 transition hover:text-white"
                      aria-label="Instagram"
                    >
                      Instagram
                    </a>
                  ) : null}
                  {store?.footerFacebook ? (
                    <a
                      href={normalizeSocialUrl(store.footerFacebook, 'https://facebook.com/')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 transition hover:text-white"
                      aria-label="Facebook"
                    >
                      Facebook
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider">Enlaces rápidos</h4>
              <ul className="space-y-3 text-sm text-slate-400">
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
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider">Atención al cliente</h4>
              <ul className="space-y-3 text-sm text-slate-400">
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
            {hasContactInfo ? (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider">Contacto</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  {store?.footerEmail ? (
                    <li className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0" />
                      <a href={`mailto:${store.footerEmail}`} className="hover:text-white">
                        {store.footerEmail}
                      </a>
                    </li>
                  ) : null}
                  {store?.footerPhone ? (
                    <li className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{store.footerPhone}</span>
                    </li>
                  ) : null}
                  {store?.footerWhatsapp ? (
                    <li className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      <a
                        href={buildWhatsappUrl(store.footerWhatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                      >
                        WhatsApp
                      </a>
                    </li>
                  ) : null}
                  {store?.footerAddress ? (
                    <li className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{store.footerAddress}</span>
                    </li>
                  ) : null}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <div className="flex items-center justify-center gap-1">
              Powered by <Logo size="xs" className="inline" />
            </div>
            <p className="mt-4">
              © {new Date().getFullYear()} {storeName}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      <RecentPurchaseNotifications notifications={recentPurchases} />

      {store?.footerWhatsapp ? (
        <FloatingWhatsappButton phone={store.footerWhatsapp} storeName={store.name} />
      ) : null}
    </div>
  )
}
