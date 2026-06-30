export type PlanLimits = {
  products: number
  orders_per_month: number
  users: number
}

export type Plan = {
  id: string
  name: string
  slug: string
  priceMonthly: number
  priceYearly: number | null
  description: string | null
  features: string[]
  limits: PlanLimits
  isActive: boolean
  isPopular: boolean
  sortOrder: number
}

export type StoreSubscription = {
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  trialEndsAt: string | null
  currentPeriodEnd: string | null
}

export const DEFAULT_PLANS: Plan[] = [
  {
    id: 'default-free',
    name: 'Gratis',
    slug: 'free',
    priceMonthly: 0,
    priceYearly: 0,
    description: 'Perfecto para probar la plataforma',
    features: [
      'Hasta 10 productos',
      '20 órdenes por mes',
      '1 usuario',
      'Soporte por email',
      'Dominio vendemas.app',
    ],
    limits: { products: 10, orders_per_month: 20, users: 1 },
    isActive: true,
    isPopular: false,
    sortOrder: 1,
  },
  {
    id: 'default-emprendedor',
    name: 'Emprendedor',
    slug: 'emprendedor',
    priceMonthly: 9900,
    priceYearly: 99000,
    description: 'Ideal para quienes están empezando a vender online',
    features: [
      'Hasta 50 productos',
      '200 órdenes por mes',
      '1 usuario',
      'Dominio personalizado',
      'Soporte por email',
      'Sin comisiones por venta',
      'Tarjeta + Efectivo + Transferencia',
      'Envíos con Andreani y Correo Argentino (próximamente)',
    ],
    limits: { products: 50, orders_per_month: 200, users: 1 },
    isActive: true,
    isPopular: false,
    sortOrder: 2,
  },
  {
    id: 'default-negocio',
    name: 'Negocio',
    slug: 'negocio',
    priceMonthly: 19900,
    priceYearly: 199000,
    description: 'Para negocios en crecimiento que necesitan más',
    features: [
      'Hasta 200 productos',
      '1000 órdenes por mes',
      '3 usuarios',
      'Dominio personalizado',
      'Soporte prioritario',
      'Sin comisiones por venta',
      'Tarjeta + Efectivo + Transferencia',
      'Analytics avanzado',
      'Email marketing',
      'Cupones y descuentos',
    ],
    limits: { products: 200, orders_per_month: 1000, users: 3 },
    isActive: true,
    isPopular: true,
    sortOrder: 3,
  },
  {
    id: 'default-empresa',
    name: 'Empresa',
    slug: 'empresa',
    priceMonthly: 39900,
    priceYearly: 399000,
    description: 'Para empresas con alto volumen de ventas',
    features: [
      'Productos ilimitados',
      'Órdenes ilimitadas',
      'Usuarios ilimitados',
      'Dominio personalizado',
      'Soporte 24/7',
      'Sin comisiones por venta',
      'Múltiples medios de pago',
      'Analytics avanzado',
      'Email marketing',
      'API access',
      'Manager de cuenta dedicado',
    ],
    limits: { products: -1, orders_per_month: -1, users: -1 },
    isActive: true,
    isPopular: false,
    sortOrder: 4,
  },
]

export function formatPlanPrice(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getPlanDisplayPrice(plan: Plan, isYearly: boolean): number {
  if (isYearly && plan.priceYearly !== null) {
    return plan.priceYearly
  }

  return plan.priceMonthly
}

export function getPlanCta(plan: Plan): { label: string; href: string } {
  if (plan.slug === 'free') {
    return { label: 'Empezar gratis', href: '/auth/register' }
  }

  if (plan.slug === 'empresa') {
    return {
      label: 'Contactar ventas',
      href: 'https://wa.me/5491123456789?text=Hola%2C%20quiero%20conocer%20el%20plan%20Empresa%20de%20VendaM%C3%A1s',
    }
  }

  return { label: 'Elegir plan', href: '/auth/register' }
}

export function getTrialDaysRemaining(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) {
    return null
  }

  const end = new Date(trialEndsAt)
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()

  if (diffMs <= 0) {
    return 0
  }

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function getAllComparisonFeatures(plans: Plan[]): string[] {
  const featureSet = new Set<string>()

  for (const plan of plans) {
    for (const feature of plan.features) {
      featureSet.add(feature)
    }
  }

  return Array.from(featureSet)
}

export function planIncludesFeature(plan: Plan, feature: string): boolean {
  return plan.features.includes(feature)
}
