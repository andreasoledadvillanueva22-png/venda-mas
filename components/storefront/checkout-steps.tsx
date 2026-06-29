import { cn } from '@/lib/utils'

const steps = [
  { number: 1, label: 'Contacto' },
  { number: 2, label: 'Envío' },
  { number: 3, label: 'Método' },
  { number: 4, label: 'Pago' },
  { number: 5, label: 'Confirmar' },
] as const

type CheckoutStepsProps = {
  className?: string
}

export function CheckoutSteps({ className }: CheckoutStepsProps) {
  return (
    <nav aria-label="Pasos del checkout" className={cn('overflow-x-auto', className)}>
      <ol className="flex min-w-[20rem] items-start justify-between gap-2 sm:min-w-0 sm:items-center">
        {steps.map((step, index) => (
          <li key={step.number} className="flex flex-1 flex-col items-center sm:flex-row">
            <div className="flex flex-col items-center gap-2 px-1 text-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-brand-600 bg-brand-50 text-sm font-bold text-brand-700 shadow-sm">
                {step.number}
              </div>
              <span className="text-xs font-semibold text-brand-800 sm:text-sm">{step.label}</span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className="mx-auto mt-2 h-6 w-0.5 bg-brand-200 sm:mx-2 sm:mt-0 sm:h-0.5 sm:flex-1"
                aria-hidden="true"
              />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}
