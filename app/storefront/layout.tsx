'use client'

import Link from 'next/link'
import { Search, User, ShoppingCart, Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { totalItems, setIsCartOpen } = useCart()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Barra superior */}
      <div className="bg-slate-900 py-2 text-center text-sm text-white">
        Envío gratis en compras superiores a $50.000
      </div>

      {/* Header principal */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/storefront" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-bold">
                A
              </div>
              <span className="text-xl font-bold tracking-wider text-slate-900 hidden sm:inline">
                ANDREA TIENDA ONLINE
              </span>
            </Link>

            {/* Menú de navegación */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/storefront" className="text-sm font-semibold text-slate-900 hover:text-red-600 transition">
                INICIO
              </Link>
              <Link href="/storefront/products" className="text-sm font-semibold text-slate-900 hover:text-red-600 transition">
                PRODUCTOS
              </Link>
              <Link href="/storefront/products" className="text-sm font-semibold text-slate-900 hover:text-red-600 transition">
                CATEGORÍAS
              </Link>
              <Link href="/storefront" className="text-sm font-semibold text-slate-900 hover:text-red-600 transition">
                CONTACTO
              </Link>
            </nav>

            {/* Íconos */}
            <div className="flex items-center gap-3">
              <button className="rounded-full bg-slate-100 p-3 text-slate-900 transition hover:bg-slate-200">
                <Search className="h-5 w-5" />
              </button>
              <button className="rounded-full bg-slate-100 p-3 text-slate-900 transition hover:bg-slate-200 hidden sm:block">
                <User className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative rounded-full bg-slate-100 p-3 text-slate-900 transition hover:bg-slate-200"
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

      {/* Contenido de las páginas */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-white mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold">Andrea Tienda Online</h3>
              <p className="text-sm text-slate-400">
                Productos de calidad con envío a toda Argentina. Compra segura con Mercado Pago o WhatsApp.
              </p>
              <div className="flex gap-3 mt-4">
                <a href="#" className="text-slate-400 hover:text-white transition">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Enlaces rápidos</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/storefront" className="hover:text-white">Inicio</Link></li>
                <li><Link href="/storefront/products" className="hover:text-white">Productos</Link></li>
                <li><Link href="/storefront" className="hover:text-white">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Atención al cliente</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/storefront" className="hover:text-white">Envíos</Link></li>
                <li><Link href="/storefront" className="hover:text-white">Devoluciones</Link></li>
                <li><Link href="/storefront" className="hover:text-white">Términos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Contacto</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> contacto@andreastienda.com.ar</li>
                <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +54 9 11 1234 5678</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Puerto Rico, Misiones, Argentina</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            © 2026 Andrea Tienda Online. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}