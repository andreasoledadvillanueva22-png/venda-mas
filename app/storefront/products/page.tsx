'use client'

import { useState, useMemo } from 'react'
import { Search, ShoppingCart, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { realProducts, formatPrice } from '@/lib/real-products'
import Link from 'next/link'

const allProducts = [
  { id: 1, name: 'Pack x3 Citrato de Magnesio', price: 19900, originalPrice: 25000, category: 'Suplementos', rating: 4.8 },
  { id: 2, name: 'Kit Limpieza Inalámbrico', price: 20000, originalPrice: 28000, category: 'Hogar', rating: 4.5 },
  { id: 3, name: 'Cepillo Vapor Mascotas', price: 15000, originalPrice: 18000, category: 'Mascotas', rating: 4.7 },
  { id: 4, name: 'Porta Esponjas Silicona', price: 5000, originalPrice: 7000, category: 'Hogar', rating: 4.2 },
  { id: 5, name: 'Moldes Silicona Premium', price: 15000, originalPrice: 19000, category: 'Manualidades', rating: 4.6 },
  { id: 6, name: 'Smartwatch Pro', price: 89900, originalPrice: 120000, category: 'Tecnología', rating: 4.9 },
  { id: 7, name: 'Auriculares Bluetooth', price: 35000, originalPrice: 45000, category: 'Tecnología', rating: 4.4 },
  { id: 8, name: 'Lámpara LED Escritorio', price: 22000, originalPrice: 30000, category: 'Hogar', rating: 4.3 },
  { id: 9, name: 'Correa Mascota Ajustable', price: 8500, originalPrice: 11000, category: 'Mascotas', rating: 4.1 },
  { id: 10, name: 'Set Pinceles Arte', price: 12000, originalPrice: 16000, category: 'Manualidades', rating: 4.5 },
  { id: 11, name: 'Proteína Whey 1kg', price: 28000, originalPrice: 35000, category: 'Suplementos', rating: 4.7 },
  { id: 12, name: 'Organizador Cajones', price: 18500, originalPrice: 24000, category: 'Hogar', rating: 4.0 },
]

const categories = ['Suplementos', 'Hogar', 'Mascotas', 'Tecnología', 'Manualidades']
const sortOptions = [
  { value: 'vendidos', label: 'Más vendidos' },
  { value: 'precio-asc', label: 'Precio menor a mayor' },
  { value: 'precio-desc', label: 'Precio mayor a menor' },
  { value: 'recientes', label: 'Más recientes' },
]

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5 text-amber-500">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className={`h-3.5 w-3.5 ${index < Math.floor(rating) ? 'fill-amber-500' : 'fill-slate-300'}`} />
        ))}
      </div>
      <span className="text-xs text-slate-500">{rating}</span>
    </div>
  )
}

export default function ProductsCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 150000 })
  const [sortBy, setSortBy] = useState('vendidos')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  const filteredAndSorted = useMemo(() => {
    let filtered = allProducts
      .filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category)
        const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max
        return matchesSearch && matchesCategory && matchesPrice
      })

    filtered.sort((a, b) => {
      if (sortBy === 'precio-asc') return a.price - b.price
      if (sortBy === 'precio-desc') return b.price - a.price
      if (sortBy === 'recientes') return b.id - a.id
      return b.rating - a.rating
    })

    return filtered
  }, [searchQuery, selectedCategories, priceRange, sortBy])

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const displayedProducts = filteredAndSorted.slice(startIdx, startIdx + itemsPerPage)

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((c) => c !== category) : [...current, category]
    )
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">Todos los productos</h1>
          <p className="mt-2 text-sm text-slate-500">{filteredAndSorted.length} resultado{filteredAndSorted.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-8">
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900">Buscar</h3>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Nombre del producto..."
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900">Categorías</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <label key={category} className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="h-4 w-4 rounded border-slate-300 text-red-600 accent-red-600"
                    />
                    <span className="text-sm text-slate-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900">Precio</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500">Mínimo</label>
                  <Input
                    type="number"
                    value={priceRange.min}
                    onChange={(event) => {
                      setPriceRange((current) => ({ ...current, min: Number(event.target.value) }))
                      setCurrentPage(1)
                    }}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Máximo</label>
                  <Input
                    type="number"
                    value={priceRange.max}
                    onChange={(event) => {
                      setPriceRange((current) => ({ ...current, max: Number(event.target.value) }))
                      setCurrentPage(1)
                    }}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <Button
              variant="outline"
              className="w-full text-slate-700"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategories([])
                setPriceRange({ min: 0, max: 150000 })
                setCurrentPage(1)
              }}
            >
              Limpiar filtros
            </Button>
          </aside>

          <section className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full sm:w-48">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {displayedProducts.length === 0 ? (
              <div className="flex min-h-96 flex-col items-center justify-center gap-4 rounded-[2rem] border-2 border-dashed border-slate-300 bg-slate-100">
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-700">No hay productos que coincidan</p>
                  <p className="mt-2 text-sm text-slate-500">Intenta ajustar los filtros o la búsqueda</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {displayedProducts.map((product) => (
                    <Card key={product.id} className="flex flex-col overflow-hidden rounded-[2rem] shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                      <CardContent className="p-5">
                        <div className="relative mb-4 aspect-square overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-slate-200 to-slate-300">
                          <div className="absolute inset-0 opacity-0 transition" />
                          <Badge className="absolute left-3 top-3 bg-white/90 text-slate-900">{product.category}</Badge>
                        </div>
                        <div className="space-y-3">
                          <h3 className="line-clamp-2 text-base font-semibold text-slate-950">{product.name}</h3>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-slate-500 line-through">${product.originalPrice.toLocaleString('es-AR')}</p>
                              <p className="text-lg font-semibold text-slate-950">${product.price.toLocaleString('es-AR')}</p>
                            </div>
                            <RatingStars rating={product.rating} />
                          </div>
                          <Button variant="outline" className="w-full gap-2 rounded-full text-slate-700">
                            <ShoppingCart className="h-4 w-4" />
                            <span>Agregar</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex flex-col gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span>Mostrar</span>
                    <Select value={String(itemsPerPage)} onValueChange={(value) => {
                      setItemsPerPage(Number(value))
                      setCurrentPage(1)
                    }}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12</SelectItem>
                        <SelectItem value="24">24</SelectItem>
                        <SelectItem value="48">48</SelectItem>
                      </SelectContent>
                    </Select>
                    <span>por página</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const page = index + 1
                      const isActive = page === currentPage
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition ${
                            isActive
                              ? 'bg-red-600 text-white'
                              : 'border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
