import { WaitlistForm } from '@/components/marketing/waitlist-form'

export function BlogNewsletterBanner() {
  return (
    <div className="mx-auto mb-12 max-w-3xl rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg sm:p-8">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white sm:text-2xl">
          Suscribite y recibí tips para vender más
        </h2>
        <p className="mt-2 text-sm text-white/80 sm:text-base">
          Guías, estrategias y recursos gratuitos para microemprendedores argentinos. Sin spam.
        </p>
      </div>
      <div className="mt-6">
        <WaitlistForm
          placeholder="nombre@ejemplo.com"
          submitLabel="Quiero recibir tips"
          showIcon={false}
          inputClassName="h-12 bg-white text-brand-900 placeholder:text-brand-400"
          buttonClassName="h-12 px-6"
        />
      </div>
    </div>
  )
}
