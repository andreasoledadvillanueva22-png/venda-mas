import Image from 'next/image'
import { WaitlistForm } from '@/components/marketing/waitlist-form'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600'

export function LandingHero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative text-left">
          <p className="mb-4 inline-flex rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-sm font-semibold text-brand-800 backdrop-blur-sm">
            Próximo lanzamiento · Acceso anticipado
          </p>

          <div className="relative">
            <h1 className="max-w-xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Vendé online sin comisiones. Para siempre.
            </h1>

            <div
              aria-hidden="true"
              className="absolute -right-2 top-0 hidden animate-pulse rounded-full border-2 border-brand-300 bg-white p-4 text-center shadow-xl shadow-brand-900/20 sm:-right-8 sm:block lg:-right-12"
            >
              <span className="block text-xs font-bold uppercase leading-tight text-brand-700">
                0%
              </span>
              <span className="block text-xs font-bold uppercase leading-tight text-brand-700">
                comisión
              </span>
            </div>
          </div>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl">
            La plataforma de e-commerce más elegida por microemprendedores argentinos. Sin costos
            ocultos, sin letra chica.
          </p>

          <div id="waitlist" className="mt-8 scroll-mt-24">
            <WaitlistForm
              placeholder="nombre@ejemplo.com"
              submitLabel="Crear tienda gratis"
              helperText="14 días gratis. Sin tarjeta de crédito."
              showIcon={false}
              inputClassName="h-14 bg-white text-brand-900 placeholder:text-brand-400"
              buttonClassName="h-14 px-8 text-base"
            />
          </div>

          <div className="mt-6 inline-flex animate-pulse rounded-full border-2 border-brand-300 bg-white px-4 py-3 text-center shadow-lg sm:hidden">
            <span className="text-sm font-bold uppercase text-brand-700">0% comisión</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="overflow-hidden rounded-3xl shadow-2xl shadow-brand-900/30 ring-1 ring-white/20">
            <Image
              src={HERO_IMAGE}
              alt="Emprendedora gestionando su tienda online"
              width={600}
              height={700}
              className="h-auto w-full object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
