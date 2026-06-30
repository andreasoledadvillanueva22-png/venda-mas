import { WaitlistForm } from '@/components/marketing/waitlist-form'

export function FinalCtaSection() {
  return (
    <section className="border-t border-brand-900/30 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
          Una tienda online es lo que le da vida a tu marca en el mundo digital
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/85">
          Entonces hacela con la plataforma que no te saca comisiones.
        </p>

        <div id="waitlist-final" className="mx-auto mt-10 max-w-2xl scroll-mt-24">
          <WaitlistForm
            placeholder="nombre@ejemplo.com"
            submitLabel="Crear tienda gratis"
            helperText="14 días gratis. Sin tarjeta de crédito."
            showIcon={false}
            inputClassName="h-14 bg-white text-brand-900 placeholder:text-brand-400"
            buttonClassName="h-14 px-8 text-base"
          />
        </div>
      </div>
    </section>
  )
}
