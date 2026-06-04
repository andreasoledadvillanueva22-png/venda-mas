import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  image: string
  unitsSold: number
  revenue: number
}

const topProducts: Product[] = [
  {
    id: '1',
    name: 'Classic White T-Shirt',
    image: '/placeholder.svg?height=48&width=48',
    unitsSold: 234,
    revenue: 5850,
  },
  {
    id: '2',
    name: 'Denim Jacket',
    image: '/placeholder.svg?height=48&width=48',
    unitsSold: 156,
    revenue: 12480,
  },
  {
    id: '3',
    name: 'Running Sneakers',
    image: '/placeholder.svg?height=48&width=48',
    unitsSold: 142,
    revenue: 14200,
  },
  {
    id: '4',
    name: 'Cotton Hoodie',
    image: '/placeholder.svg?height=48&width=48',
    unitsSold: 128,
    revenue: 6400,
  },
  {
    id: '5',
    name: 'Leather Belt',
    image: '/placeholder.svg?height=48&width=48',
    unitsSold: 98,
    revenue: 2940,
  },
]

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value)
}

interface TopProductsProps {
  className?: string
}

export function TopProducts({ className }: TopProductsProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Top Products</CardTitle>
            <p className="text-sm text-muted-foreground">Best sellers this month</p>
          </div>
          <a href="/admin/products" className="text-sm font-medium text-primary hover:underline">
            View all
          </a>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {topProducts.map((product, index) => (
          <div key={product.id} className="flex items-center gap-4">
            <span className="w-5 text-sm font-medium text-muted-foreground">
              #{index + 1}
            </span>
            <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(product.unitsSold)} units sold
              </p>
            </div>
            <p className="text-sm font-semibold text-foreground">
              ${formatNumber(product.revenue)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
