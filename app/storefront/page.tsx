'use client'

import { realProducts, formatPrice } from '@/lib/real-products'
import {
  Menu,
  Search,
  User,
  ArrowRight,
  ShoppingCart,
  Home,
  Heart,
  PawPrint,
  Shield,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CartDrawer } from '@/components/storefront/cart-drawer'
import Link from 'next/link'

const categories = [
  { name: 'Hogar', description: 'Productos para tu hogar', color: 'from-blue-500 to-blue-700', icon: Home },
  { name: 'Suplementos', description: 'Bienestar y salud', color: 'from-green-500 to-green-700', icon: Heart },
  { name: 'Mascotas', description: 'Cuidá a tu mascota', color: 'from-purple-500 to-purple-700', icon: PawPrint },
  { name: 'Higiene', description: 'Cuidado personal', color: 'from-pink-500 to-pink-700', icon: Shield },
]

const featuredProducts = realProducts.slice(0, 4)

export default function StorefrontPage() {
  return (
    <div className="bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-2 text-xs sm:px-6">
          <p>Envío gratis en compras superiores a $50.000</p>
        </div>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div className="flex items-center gap-2 text-lg font-semibold uppercase tracking-[0.3em]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-950">A</span>
            Andrea Tienda Online
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium uppercase tracking-[0.2em] text-slate-100 md:flex">
            <a href="#inicio" className="transition hover:text-white">Inicio</a>
            <a href="#productos" className="transition hover:text-white">Productos</a>
            <a href="#categorias" className="transition hover:text-white">Categorías</a>
            <a href="#contacto" className="transition hover:text-white">Contacto</a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/80 text-slate-100 ring-1 ring-white/10 transition hover:bg-slate-800">
              <Search className="h-5 w-5" />
            </button>
            <button className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/80 text-slate-100 ring-1 ring-white/10 transition hover:bg-slate-800">
              <User className="h-5 w-5" />
            </button>
            <CartDrawer />
            <button className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/80 text-slate-100 ring-1 ring-white/10 transition hover:bg-slate-800 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.2),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,0.92),_rgba(15,23,42,0.72))]" />
          <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-24 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-6">
              <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm uppercase tracking-[0.3em] text-white/80">Productos destacados</p>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">Bienvenidos a Andrea Tienda Online</h1>
              <p className="max-w-xl text-base text-slate-200 sm:text-lg">Productos de calidad con envío a toda Argentina. Compra segura con Mercado Pago o WhatsApp.</p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-wrap gap-4">
  <Button className="bg-white text-black hover:bg-slate-200 font-semibold px-6 py-3">
    <Link href="/storefront/products" className="text-inherit">Ver productos</Link>
  </Button>
  <Button variant="outline" className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-black font-semibold px-6 py-3">
    <Link href="https://wa.me/5491112345678" target="_blank" rel="noreferrer" className="text-inherit">Contactar por WhatsApp</Link>
  </Button>
</div>
              </div>
            </div>
            <div className="relative h-[420px] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-800 shadow-2xl shadow-slate-950/20 lg:h-[580px]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.18),rgba(168,85,247,0.25),rgba(244,114,182,0.2)),linear-gradient(180deg,rgba(15,23,42,0.88),rgba(15,23,42,0.65))]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.25),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(192,132,252,0.20),transparent_20%)]" />
              <div className="absolute bottom-8 left-8 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-sm uppercase tracking-[0.3em] text-white/70">Envíos a todo el país</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Productos seleccionados con envío rápido y seguro</h2>
                <p className="mt-1 text-sm text-slate-200">Compra online con confianza y pagos protegidos.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="categorias" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-red-600">Comprar por categoría</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">Explorá nuestras categorías</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={`/storefront/products?category=${encodeURIComponent(item.name)}`}
                  className={`group overflow-hidden rounded-[2rem] bg-gradient-to-br ${item.color} p-6 text-white transition-shadow hover:shadow-2xl hover:shadow-slate-300/20`}
                >
                  <div className="flex h-32 items-end justify-between rounded-[1.75rem] bg-white/10 p-5 text-left backdrop-blur-sm">
                    <div>
                      <p className="text-xl font-semibold">{item.name}</p>
                      <p className="mt-2 text-sm text-white/80">{item.description}</p>
                    </div>
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-white/20 text-white">
                      {Icon ? <Icon className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        </section>

        <section id="productos" className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-red-600">Lo más vendido</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">Productos favoritos</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <article key={product.id} className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative mb-5 h-52 overflow-hidden rounded-[1.75rem] bg-slate-100">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                    <Badge className="absolute left-4 top-4 bg-white/90 text-slate-950">{product.tag ?? 'Destacado'}</Badge>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-slate-950">{product.name}</h3>
                    <p className="text-sm text-slate-500">{product.description}</p>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xl font-semibold text-slate-950">{formatPrice(product.price)}</p>
                      <Button variant="outline" className="rounded-full px-4 py-2 text-sm font-semibold">
                        <ShoppingCart className="mr-2 h-4 w-4" /> Agregar
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="overflow-hidden rounded-[3rem] bg-slate-950 px-8 py-16 text-white sm:px-14 lg:px-20">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-red-500">Newsletter</p>
                <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Suscribite y obtené 10% OFF en tu primera compra</h2>
                <p className="mt-4 max-w-xl text-base text-slate-300">Recibí ofertas exclusivas, lanzamientos y tendencias directo en tu inbox.</p>
              </div>
              <div className="rounded-[2rem] bg-white/10 p-6 backdrop-blur-xl sm:p-8">
                <div className="space-y-4">
                  <Input type="email" placeholder="Ingresá tu email" className="bg-white/10 text-white placeholder:text-slate-300" />
                  <Button className="w-full rounded-full bg-red-600 px-6 py-4 text-base font-semibold text-white hover:bg-red-700">
                    Suscribirme
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Fashion Store</h3>
            <p className="max-w-sm text-sm leading-6 text-slate-400">La vidriera de moda argentina con diseños exclusivos, envíos rápidos y atención premium para cada compra.</p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Enlaces rápidos</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>Inicio</li>
              <li>Tienda</li>
              <li>Contacto</li>
              <li>FAQ</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Atención al cliente</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>Envíos</li>
              <li>Devoluciones</li>
              <li>Términos</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Contacto</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>Email: contacto@fashionstore.com.ar</li>
              <li>Tel: +54 9 11 1234 5678</li>
              <li>Dirección: Palermo Soho, Buenos Aires</li>
            </ul>
            <div className="mt-6 flex items-center gap-3 text-white">
              <a href="#" aria-label="Facebook" className="text-slate-400 hover:text-red-600 transition-colors">
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
  </svg>
</a>
              <a href="#" aria-label="Instagram" className="text-slate-400 hover:text-red-600 transition-colors">
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
</a>
{/* Twitter/X */}
<a href="#" aria-label="Twitter" className="text-slate-400 hover:text-red-600 transition-colors">
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
</a>

{/* WhatsApp */}
<a href="#" aria-label="WhatsApp" className="text-slate-400 hover:text-red-600 transition-colors">
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
</a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 bg-slate-950/80 px-4 py-6 text-center text-sm text-slate-500 sm:px-6">
          © 2026 Fashion Store. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}
