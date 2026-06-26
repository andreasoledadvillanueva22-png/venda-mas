'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { cn } from '@/lib/utils'

interface BuyNowButtonProps {
  productId: string
  productName: string
  productPrice: number
  productImage: string
  stock?: number
  storeSlug?: string | null
  className?: string
}

export function BuyNowButton({
  productId,
  productName,
  productPrice,
  productImage,
  stock = 1,
  storeSlug = null,
  className = '',
}: BuyNowButtonProps) {
  const router = useRouter()
  const { addToCart } = useCart()

  const handleBuyNow = () => {
    if (stock <= 0) {
      return
    }

    addToCart(
      {
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
      },
      { openDrawer: false },
    )

    const checkoutPath = storeSlug
      ? `/storefront/checkout?store=${encodeURIComponent(storeSlug)}`
      : '/storefront/checkout'

    router.push(checkoutPath)
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={handleBuyNow}
      disabled={stock === 0}
      className={cn(
        'w-full touch-manipulation disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      {stock > 0 ? 'Comprar ahora' : 'Agotado'}
    </Button>
  )
}
