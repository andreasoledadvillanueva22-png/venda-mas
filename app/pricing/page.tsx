import type { Metadata } from 'next'
import { MarketingHeader } from '@/components/marketing/marketing-header'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { PricingSection } from '@/components/pricing/pricing-section'
import { MpTestModeBanner } from '@/components/mercadopago/mp-test-mode-banner'
import { fetchPublicPlans } from '@/lib/plans-server'

export const metadata: Metadata = {
  title: 'Planes y precios — VendaMás',
  description:
    'Planes simples y transparentes para vender online sin comisiones por venta. Elegí Free, Emprendedor, Negocio o Empresa.',
}

export default async function PricingPage() {
  const plans = await fetchPublicPlans()

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
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Un plan para cada etapa de tu negocio
            </h1>
            <p className="mt-6 text-lg text-white/90 sm:text-xl">
              Sin comisiones por venta. Sin letra chica. Cancelá cuando quieras.
            </p>
            <div className="mx-auto mt-8 max-w-xl">
              <MpTestModeBanner />
            </div>
          </div>

          <PricingSection plans={plans} />
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
