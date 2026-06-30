import type { Metadata } from 'next'
import Link from 'next/link'
import { Rocket, Smartphone, CreditCard } from 'lucide-react'
import { WaitlistForm } from '@/components/marketing/waitlist-form'
import { MarketingHeader } from '@/components/marketing/marketing-header'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { PricingCard } from '@/components/pricing/pricing-card'
import { fetchPublicPlans } from '@/lib/plans-server'

export const metadata: Metadata = {
  title: 'VendaMás — Vendé online en minutos y sin comisiones por venta',
  description:
    'Creá tu tienda online, configurá tus medios de cobro y gestioná tus envíos sin regalar tu ganancia.',
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
    description: 'Configurá múltiples medios de pago para recibir cobros reales desde el primer día.',
  },
  {
    icon: Smartphone,
    title: '100% Mobile',
    description: 'Tus clientes compran desde el celular con una experiencia optimizada.',
  },
] as const

export default async function LandingPage() {
  const plans = await fetchPublicPlans()
  const highlightedPlans = plans.filter((plan) =>
    ['emprendedor', 'negocio', 'empresa'].includes(plan.slug),
  )

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-800 via-brand-600 to-brand-400 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-brand-400 opacity-30 blur-3xl sm:h-96 sm:w-96"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 top-1/3 h-80 w-80 rounded-full bg-brand-600 opacity-30 blur-3xl sm:h-[28rem] sm:w-[28rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-brand-400 opacity-20 blur-3xl sm:h-80 sm:w-80"
      />

      <MarketingHeader />

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-6 inline-flex rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-sm font-semibold text-brand-800 backdrop-blur-sm">
              Próximo lanzamiento · Acceso anticipado
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-7xl">
              Vendé online en minutos y sin comisiones por venta
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 sm:text-xl">
              Creá tu tienda online, configurá tus medios de cobro y gestioná tus envíos sin regalar tu
              ganancia.
            </p>
          </div>

          <div
            id="waitlist"
            className="mx-auto mt-12 max-w-2xl scroll-mt-24 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg sm:p-8"
          >
            <p className="mb-5 text-center text-sm font-semibold uppercase tracking-wide text-white/80">
              Unite a la lista de acceso anticipado
            </p>
            <WaitlistForm buttonClassName="w-full sm:w-auto" />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Todo lo que necesitás para vender
            </h2>
            <p className="mt-4 text-white/80">
              Diseñado para emprendedores que quieren lanzar rápido y escalar sin fricción.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg transition hover:border-white/30 hover:bg-white/15"
              >
                <div className="mb-4 inline-flex rounded-xl border border-white/20 bg-white/10 p-3 text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/80">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-white/10 bg-white/5 py-16 backdrop-blur-sm sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Planes simples y transparentes
              </h2>
              <p className="mt-4 text-white/80">
                Elegí el plan que mejor se adapte a tu etapa. Sin comisiones por venta.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {highlightedPlans.map((plan) => (
                <PricingCard key={plan.id} plan={plan} isYearly={false} compact />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Ver todos los planes
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-white/5 py-16 backdrop-blur-sm sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <p className="text-lg font-medium text-white sm:text-xl">
              Unite a los primeros emprendedores que están revolucionando sus ventas.
            </p>
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg sm:p-8">
              <WaitlistForm buttonClassName="w-full sm:w-auto" />
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
