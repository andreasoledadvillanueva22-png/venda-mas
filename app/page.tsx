import type { Metadata } from 'next'
import Link from 'next/link'
import { Rocket, Smartphone, CreditCard } from 'lucide-react'
import { WaitlistForm } from '@/components/marketing/waitlist-form'

export const metadata: Metadata = {
  title: 'VendaMás — Vendé online en minutos',
  description:
    'La plataforma todo-en-uno para crear tu tienda online, cobrar con Mercado Pago y gestionar tus envíos.',
}

const features = [
  {
    icon: Rocket,
    title: 'Setup en 5 minutos',
    description: 'Registrate y tu tienda se crea automáticamente, sin configuraciones técnicas.',
  },
  {
    icon: CreditCard,
    title: 'Cobros integrados',
    description: 'Mercado Pago nativo para recibir pagos reales desde el primer día.',
  },
  {
    icon: Smartphone,
    title: '100% Mobile',
    description: 'Tus clientes compran desde el celular con una experiencia optimizada.',
  },
] as const

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
            Venda<span className="text-red-600">Más</span>
          </Link>
          <Link
            href="/auth/login"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-red-300 hover:text-red-600"
          >
            Ingresar
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-red-50 via-white to-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.12),transparent_45%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-4 inline-flex rounded-full border border-red-200 bg-red-50 px-4 py-1 text-sm font-medium text-red-700">
                Próximo lanzamiento · Acceso anticipado
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Vendé online en minutos,{' '}
                <span className="text-red-600">sin saber programar.</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
                La plataforma todo-en-uno para crear tu tienda online, cobrar con Mercado Pago y
                gestionar tus envíos.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-red-100/40 sm:p-8">
              <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-slate-500">
                Unite a la lista de espera
              </p>
              <WaitlistForm />
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Todo lo que necesitás para vender
              </h2>
              <p className="mt-4 text-slate-600">
                Diseñado para emprendedores que quieren lanzar rápido y escalar sin fricción.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-red-200 hover:shadow-md"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-red-100 p-3 text-red-600">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-900 py-16 text-white sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <p className="text-lg font-medium text-slate-200 sm:text-xl">
              Unite a los primeros emprendedores que están revolucionando sus ventas.
            </p>
            <div className="mx-auto mt-8 max-w-xl">
              <WaitlistForm
                inputClassName="border-slate-600 bg-slate-800 text-white placeholder:text-slate-400"
                buttonClassName="w-full sm:w-auto"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} VendaMás. Todos los derechos reservados.</p>
          <div className="flex items-center gap-5">
            <Link href="/auth/login" className="transition hover:text-red-600">
              Ingresar
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="#" className="transition hover:text-red-600">
              Términos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
