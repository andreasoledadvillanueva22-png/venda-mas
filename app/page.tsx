import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingHeader } from '@/components/marketing/marketing-header'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { LandingHero } from '@/components/marketing/landing-hero'
import { ClientLogosCarousel } from '@/components/marketing/client-logos-carousel'
import { LandingFeatureCards } from '@/components/marketing/landing-feature-cards'
import { BlogPreviewSection } from '@/components/marketing/blog-preview-section'
import { FinalCtaSection } from '@/components/marketing/final-cta-section'
import { PricingCard } from '@/components/pricing/pricing-card'
import { fetchPublicPlans } from '@/lib/plans-server'

export const metadata: Metadata = {
  title: 'VendaMás — Vendé online sin comisiones. Para siempre.',
  description:
    'La plataforma de e-commerce más elegida por microemprendedores argentinos. Sin costos ocultos, sin letra chica.',
}

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
        <LandingHero />
        <ClientLogosCarousel />
        <LandingFeatureCards />

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

        <BlogPreviewSection />
        <FinalCtaSection />
      </main>

      <MarketingFooter />
    </div>
  )
}
