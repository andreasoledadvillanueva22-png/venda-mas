const CLIENT_LOGOS = [
  'HRF Repuestos',
  'Andrea Tienda',
  'Moda Urbana',
  'Eco Home',
  'Pet Lovers',
  'Arte Local',
  'Fit Shop',
  'Deli Fresh',
] as const

export function ClientLogosCarousel() {
  const logos = [...CLIENT_LOGOS, ...CLIENT_LOGOS]

  return (
    <section className="border-y border-white/10 bg-white/5 py-12 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center text-lg font-semibold text-white sm:text-xl">
          Más de 500 emprendedores ya venden con VendaMás
        </p>

        <div className="relative mt-8 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-brand-700/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-brand-500/80 to-transparent" />

          <div className="animate-logo-scroll flex w-max gap-10 sm:gap-14">
            {logos.map((name, index) => (
              <div
                key={`${name}-${index}`}
                className="flex h-14 min-w-[9rem] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 grayscale opacity-60 transition hover:opacity-80"
              >
                <span className="whitespace-nowrap text-sm font-bold tracking-wide text-white/90">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
