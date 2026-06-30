'use client'

import { useState } from 'react'
import { PricingToggle } from '@/components/pricing/pricing-toggle'
import { PricingCard } from '@/components/pricing/pricing-card'
import { FeatureTable } from '@/components/pricing/feature-table'
import { PricingFaq } from '@/components/pricing/faq'
import type { Plan } from '@/lib/plans'

type PricingSectionProps = {
  plans: Plan[]
  showComparison?: boolean
  showFaq?: boolean
  showFinalCta?: boolean
}

export function PricingSection({
  plans,
  showComparison = true,
  showFaq = true,
  showFinalCta = true,
}: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <>
      <div className="mt-10 flex justify-center">
        <PricingToggle isYearly={isYearly} onChange={setIsYearly} />
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} isYearly={isYearly} />
        ))}
      </div>

      {showComparison ? (
        <section className="mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Compará los planes</h2>
            <p className="mt-3 text-white/75">
              Todas las funcionalidades en un solo lugar para elegir con confianza.
            </p>
          </div>
          <div className="mt-10">
            <FeatureTable plans={plans} />
          </div>
        </section>
      ) : null}

      {showFaq ? (
        <section className="mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Preguntas frecuentes</h2>
          </div>
          <div className="mx-auto mt-10 max-w-3xl">
            <PricingFaq />
          </div>
        </section>
      ) : null}

      {showFinalCta ? (
        <section className="mt-20 rounded-2xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-lg sm:p-10">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">¿Tenés dudas? Chateá con nosotros</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">
            Nuestro equipo te ayuda a elegir el plan ideal para tu negocio.
          </p>
          <a
            href="https://wa.me/5491123456789?text=Hola%2C%20tengo%20consultas%20sobre%20los%20planes%20de%20VendaM%C3%A1s"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-800 transition hover:bg-white/90"
          >
            Escribinos por WhatsApp
          </a>
        </section>
      ) : null}
    </>
  )
}
