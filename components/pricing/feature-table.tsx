import { Check, X } from 'lucide-react'
import { getAllComparisonFeatures, planIncludesFeature, type Plan } from '@/lib/plans'

type FeatureTableProps = {
  plans: Plan[]
}

export function FeatureTable({ plans }: FeatureTableProps) {
  const features = getAllComparisonFeatures(plans)

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/15">
            <th className="px-4 py-4 font-semibold text-white sm:px-6">Funcionalidad</th>
            {plans.map((plan) => (
              <th key={plan.id} className="px-4 py-4 text-center font-semibold text-white sm:px-6">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr
              key={feature}
              className={index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}
            >
              <td className="px-4 py-3 text-white/85 sm:px-6">{feature}</td>
              {plans.map((plan) => {
                const included = planIncludesFeature(plan, feature)

                return (
                  <td key={`${plan.id}-${feature}`} className="px-4 py-3 text-center sm:px-6">
                    {included ? (
                      <Check className="mx-auto h-5 w-5 text-emerald-400" aria-label="Incluido" />
                    ) : (
                      <X className="mx-auto h-5 w-5 text-white/25" aria-label="No incluido" />
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
