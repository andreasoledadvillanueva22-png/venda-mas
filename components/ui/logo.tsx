import Image from 'next/image'
import { cn } from '@/lib/utils'

const LOGO_URL = 'https://i.ibb.co/rr2Wc9x/vendamas-logo.png'

const sizeMap = {
  xs: 'h-6 w-auto',
  sm: 'h-8 w-auto',
  md: 'h-10 w-auto',
  lg: 'h-12 w-auto',
} as const

const dimensionMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
} as const

type LogoProps = {
  size?: keyof typeof sizeMap
  className?: string
  priority?: boolean
}

export function Logo({ size = 'md', className, priority = false }: LogoProps) {
  const dimension = dimensionMap[size]

  return (
    <Image
      src={LOGO_URL}
      alt="VendaMás"
      width={dimension}
      height={dimension}
      className={cn(sizeMap[size], className)}
      priority={priority}
    />
  )
}
