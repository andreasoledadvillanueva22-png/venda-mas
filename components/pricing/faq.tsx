'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const FAQ_ITEMS = [
  {
    question: '¿Puedo cambiar de plan en cualquier momento?',
    answer:
      'Sí. Podés subir o bajar de plan cuando lo necesites. Los cambios se aplican en tu próximo ciclo de facturación.',
  },
  {
    question: '¿Hay período de prueba?',
    answer:
      'Todos los planes pagos incluyen 14 días de prueba gratis. No necesitás tarjeta para empezar con el plan Gratis.',
  },
  {
    question: '¿Cómo pago mi suscripción?',
    answer:
      'Aceptamos tarjetas de crédito y débito, transferencia bancaria y otros medios locales. Te enviamos la factura por email.',
  },
  {
    question: '¿Hay comisiones por cada venta?',
    answer:
      'No. VendaMás no cobra comisiones por venta. Solo pagás tu plan mensual o anual y te quedás con el 100% de tus ingresos.',
  },
  {
    question: '¿Qué pasa si supero los límites de mi plan?',
    answer:
      'Te avisamos cuando te acerques al límite. Podés actualizar tu plan en un clic o contactarnos para una solución a medida.',
  },
  {
    question: '¿Puedo cancelar cuando quiera?',
    answer:
      'Sí, sin permanencia. Cancelás desde tu panel de admin y seguís usando el plan hasta el final del período pagado.',
  },
] as const

export function PricingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index

        return (
          <div
            key={item.question}
            className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-white">{item.question}</span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 shrink-0 text-white/70 transition-transform duration-300',
                  isOpen && 'rotate-180',
                )}
              />
            </button>
            <div
              className={cn(
                'grid transition-all duration-300 ease-in-out',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm leading-relaxed text-white/75">{item.answer}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
