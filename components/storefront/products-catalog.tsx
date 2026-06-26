'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, Filter, X } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { storefrontHref } from '@/lib/storefront'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type CatalogProduct = {
  id: string
  name: string
  description: string
  price: number
  compareAtPrice: number | null
  images: string[]
  category: string
  featured: boolean
}

type ProductsCatalogProps = {
  products: CatalogProduct[]
  storeSlug?: string | null
  initialCategory?: string
}

function formatPrice(value: number) {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  })
}

function getProductBadge(product: CatalogProduct): { label: string; className: string } | null {
  if (product.featured) {
    return { label: 'Destacado', className: 'bg-red-600' }
  }
  if (product.compareAtPrice && product.compareAtPrice > product.price) {
    return { label: 'Oferta', className: 'bg-emerald-600' }
  }
  return null
}

export function ProductsCatalog({
  products,
  storeSlug = null,
  initialCategory,
}: ProductsCatalogProps) {
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const { addToCart } = useCart()

  useEffect(() => {
    if (initialCategory?.trim()) {
      setSelectedCategories([decodeURIComponent(initialCategory.trim())])
    }
  }, [initialCategory])

  const productHref = (productId: string) =>
    storefrontHref(`/storefront/product/${productId}`, storeSlug)

  const categories = useMemo(() => {
    return [...new Set(products.map((product) => product.category).filter(Boolean))]
  }, [products])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (search) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (selectedCategories.length > 0) {
      result = result.filter((product) => selectedCategories.includes(product.category))
    }

    if (priceMin) {
      result = result.filter((product) => product.price >= Number(priceMin))
    }

    if (priceMax) {
      result = result.filter((product) => product.price <= Number(priceMax))
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }

    return result
  }, [products, search, selectedCategories, priceMin, priceMax, sortBy])

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category],
    )
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedCategories([])
    setPriceMin('')
    setPriceMax('')
    setSortBy('recent')
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Filter className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">No hay productos disponibles</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta tienda aún no publicó productos activos en el catálogo.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Todos los productos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'resultado' : 'resultados'}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Buscar
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Nombre del producto..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
                Categorías
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Precio
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="price-min" className="text-xs">
                  Mínimo
                </Label>
                <Input
                  id="price-min"
                  type="number"
                  placeholder="0"
                  value={priceMin}
                  onChange={(event) => setPriceMin(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="price-max" className="text-xs">
                  Máximo
                </Label>
                <Input
                  id="price-max"
                  type="number"
                  placeholder="150000"
                  value={priceMax}
                  onChange={(event) => setPriceMax(event.target.value)}
                />
              </div>
            </div>
          </div>

          {(search || selectedCategories.length > 0 || priceMin || priceMax) && (
            <Button variant="outline" onClick={clearFilters} className="w-full">
              <X className="mr-2 h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </aside>

        <div>
          <div className="mb-6 flex justify-end">
            <Select
              value={sortBy}
              onValueChange={(value) => {
                if (value) setSortBy(value)
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Más recientes</SelectItem>
                <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
                <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
                <SelectItem value="name">Nombre A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Filter className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">No se encontraron productos</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Intentá ajustar los filtros o la búsqueda
              </p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const badge = getProductBadge(product)
                const imageUrl = product.images[0] ?? null

                return (
                  <Card key={product.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                    <CardContent className="p-0">
                      <Link href={productHref(product.id)} className="group block">
                        <div className="relative aspect-square overflow-hidden bg-slate-100">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-slate-400">
                              {product.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {badge && (
                            <Badge className={`absolute left-3 top-3 ${badge.className} text-white`}>
                              {badge.label}
                            </Badge>
                          )}
                        </div>

                        <div className="p-4 pb-0">
                          <h3 className="mb-2 font-semibold text-foreground group-hover:text-primary">
                            {product.name}
                          </h3>
                          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                            {product.description}
                          </p>
                        </div>
                      </Link>

                      <div className="flex items-center justify-between p-4 pt-0">
                        <span className="text-lg font-bold text-foreground">
                          {formatPrice(product.price)}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          className="touch-manipulation bg-red-600 hover:bg-red-700"
                          onClick={() =>
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: imageUrl ?? '',
                            })
                          }
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Agregar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
