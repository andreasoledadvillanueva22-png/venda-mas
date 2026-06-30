const FEATURES = [
  {
    emoji: '⚡',
    title: 'Tu tienda lista en 5 minutos',
    description:
      'Sin saber programar. Sin configuraciones complicadas. Solo registrate y empezá a vender.',
  },
  {
    emoji: '💰',
    title: 'Sin comisiones por venta',
    description:
      'A diferencia de otras plataformas, no te sacamos porcentaje. Vendé $100.000 y quedate con $100.000.',
  },
  {
    emoji: '💳',
    title: 'Múltiples medios de pago',
    description:
      'Tarjeta, efectivo contra entrega y transferencia. Vos elegís cómo cobrar.',
  },
] as const

export function LandingFeatureCards() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Todo lo que necesitás para vender
        </h2>
        <p className="mt-4 text-white/80">
          Diseñado para microemprendedores que quieren lanzar rápido y escalar sin fricción.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-lg transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/15 hover:shadow-xl hover:shadow-brand-900/20"
          >
            <div className="mb-5 text-6xl" aria-hidden="true">
              {feature.emoji}
            </div>
            <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/80">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
