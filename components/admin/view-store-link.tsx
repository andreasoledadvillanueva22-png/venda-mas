import { Eye } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ViewStoreLinkProps = {
  storeSlug: string
  className?: string
  showLabel?: boolean
  label?: string
  hideLabelOnMobile?: boolean
  size?: 'default' | 'sm' | 'icon' | 'icon-sm'
}

export function ViewStoreLink({
  storeSlug,
  className,
  showLabel = true,
  label = 'Ver mi tienda',
  hideLabelOnMobile = true,
  size = 'sm',
}: ViewStoreLinkProps) {
  const href = `/storefront?store=${encodeURIComponent(storeSlug)}`
  const buttonSize = size === 'icon' ? 'icon-sm' : size

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: 'secondary', size: buttonSize }), className)}
    >
      <Eye className="h-4 w-4" />
      {showLabel ? (
        <span className={hideLabelOnMobile ? 'hidden sm:inline' : undefined}>{label}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </a>
  )
}
