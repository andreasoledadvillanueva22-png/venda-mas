'use client'

import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'

interface AddToCartButtonProps {
  productId: string
  productName: string
  productPrice: number
  productImage: string
  stock?: number
  className?: string
}

export function AddToCartButton({
  productId,
  productName,
  productPrice,
  productImage,
  stock = 1,
  className = '',
}: AddToCartButtonProps) {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    if (stock > 0) {
      addToCart({
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
      })
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={stock === 0}
      size="lg"
      className={`w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      {stock > 0 ? 'Agregar al carrito' : 'Agotado'}
    </Button>
  )
}
