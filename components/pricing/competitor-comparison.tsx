import { Check, X } from 'lucide-react'

type ComparisonRow = {
  feature: string
  vendemas: string
  tiendaNube: string
  empretienda: string
  highlight?: boolean
}

const ROWS: ComparisonRow[] = [
  {
    feature: 'Precio básico',
    vendemas: '$9.900/mes',
    tiendaNube: '$26.999/mes',
    empretienda: '$10.000/mes',
    highlight: true,
  },
  {
    feature: 'Comisión por venta',
    vendemas: '0%',
    tiendaNube: '0% (con Pago Nube)',
    empretienda: '0%',
  },
  {
    feature: 'Productos (plan básico)',
    vendemas: '50',
    tiendaNube: 'Ilimitados',
    empretienda: '50',
  },
  {
    feature: 'Dominio personalizado',
    vendemas: 'yes',
    tiendaNube: 'yes',
    empretienda: 'yes',
  },
  {
    feature: 'Soporte',
    vendemas: 'Email',
    tiendaNube: 'Email + Messenger',
    empretienda: 'Email',
  },
  {
    feature: 'Medios de pago',
    vendemas: 'Tarjeta + Efectivo + Transferencia',
    tiendaNube: '+30 opciones',
    empretienda: 'Tarjeta + Efectivo',
  },
]

function renderCell(value: string) {
  if (value === 'yes') {
    return <Check className="mx-auto h-5 w-5 text-emerald-400" aria-label="Incluido" />
  }

  if (value === 'no') {
    return <X className="mx-auto h-5 w-5 text-red-400" aria-label="No incluido" />
  }

  return <span className="text-sm text-white/85">{value}</span>
}

export function CompetitorComparison() {
  return (
    <section className="mt-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">¿Por qué elegir VendaMás?</h2>
        <p className="mt-3 text-white/75">
          Comparación directa con las plataformas más usadas en Argentina.
        </p>
      </div>

      <div className="mt-10 overflow-x-auto rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/15">
              <th className="px-4 py-4 font-semibold text-white sm:px-6">Feature</th>
              <th className="bg-brand-500/20 px-4 py-4 text-center font-semibold text-white sm:px-6">
                VendaMás
              </th>
              <th className="px-4 py-4 text-center font-semibold text-white/80 sm:px-6">
                Tienda Nube
              </th>
              <th className="px-4 py-4 text-center font-semibold text-white/80 sm:px-6">
                Empretienda
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, index) => (
              <tr key={row.feature} className={index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}>
                <td className="px-4 py-3 font-medium text-white sm:px-6">{row.feature}</td>
                <td
                  className={`px-4 py-3 text-center sm:px-6 ${
                    row.highlight ? 'bg-brand-500/15 font-semibold text-white' : 'bg-brand-500/10'
                  }`}
                >
                  {renderCell(row.vendemas)}
                </td>
                <td className="px-4 py-3 text-center sm:px-6">{renderCell(row.tiendaNube)}</td>
                <td className="px-4 py-3 text-center sm:px-6">{renderCell(row.empretienda)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
