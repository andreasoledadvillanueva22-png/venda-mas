'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, Filter, X } from 'lucide-react'
import { realProducts, formatPrice } from '@/lib/real-products'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const categories = ['Hogar', 'Suplementos', 'Mascotas', 'Higiene']

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [sortBy, setSortBy] = useState('recent')

  const filteredProducts = useMemo(() => {
    let result = [...realProducts]

    // Filtrar por búsqueda
    if (search) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filtrar por categorías
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category))
    }

    // Filtrar por precio
    if (priceMin) {
      result = result.filter((p) => p.price >= Number(priceMin))
    }
    if (priceMax) {
      result = result.filter((p) => p.price <= Number(priceMax))
    }

    // Ordenar
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
  }, [search, selectedCategories, priceMin, priceMax, sortBy])

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedCategories([])
    setPriceMin('')
    setPriceMax('')
    setSortBy('recent')
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Todos los productos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'resultado' : 'resultados'}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar Filtros */}
          <aside className="space-y-6">
            {/* Búsqueda */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
                Buscar
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Nombre del producto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Categorías */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
                Categorías
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>

            {/* Precio */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
                Precio
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="price-min" className="text-xs">Mínimo</Label>
                  <Input
                    id="price-min"
                    type="number"
                    placeholder="0"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="price-max" className="text-xs">Máximo</Label>
                  <Input
                    id="price-max"
                    type="number"
                    placeholder="150000"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Limpiar filtros */}
            {(search || selectedCategories.length > 0 || priceMin || priceMax) && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" />
                Limpiar filtros
              </Button>
            )}
          </aside>

          {/* Grid de Productos */}
          <div>
            {/* Ordenar */}
            <div className="mb-6 flex justify-end">
              <Select value={sortBy} onValueChange={setSortBy}>
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

            {/* Productos */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Filter className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">
                  No se encontraron productos
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Intentá ajustar los filtros o la búsqueda
                </p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/storefront/product/${product.id}`}
                    className="group"
                  >
                    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                      <CardContent className="p-0">
                        {/* Imagen */}
                        <div className="relative aspect-square overflow-hidden bg-slate-100">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                          {product.tag && (
                            <Badge
                              className={`absolute left-3 top-3 ${product.tagColor} text-white`}
                            >
                              {product.tag}
                            </Badge>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <h3 className="mb-2 font-semibold text-foreground group-hover:text-primary">
                            {product.name}
                          </h3>
                          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-foreground">
                              {formatPrice(product.price)}
                            </span>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                // TODO: Agregar al carrito
                              }}
                            >
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Agregar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}