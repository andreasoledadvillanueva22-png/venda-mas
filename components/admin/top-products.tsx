import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardTopProduct } from '@/lib/admin-dashboard'
import Image from 'next/image'

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('es-AR').format(value)
}

interface TopProductsProps {
  className?: string
  products: DashboardTopProduct[]
}

export function TopProducts({ className, products }: TopProductsProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Productos top</CardTitle>
            <p className="text-sm text-muted-foreground">Más vendidos este mes</p>
          </div>
          <a href="/admin/products" className="text-sm font-medium text-primary hover:underline">
            Ver todos
          </a>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin ventas este mes.</p>
        ) : (
          products.map((product, index) => (
            <div key={product.id} className="flex items-center gap-4">
              <span className="w-5 text-sm font-medium text-muted-foreground">#{index + 1}</span>
              <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
                <Image src={product.image} alt={product.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(product.unitsSold)} unidades vendidas
                </p>
              </div>
              <p className="text-sm font-semibold text-foreground">
                ${formatNumber(product.revenue)}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
