'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Copy,
  Edit,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const mockProducts = [
  {
    id: '1',
    name: 'Pack x3 Citrato de Magnesio',
    status: 'Activo',
    stock: 142,
    price: 19900,
    category: 'Suplementos',
    image: '/products/magnesium.jpg',
  },
  {
    id: '2',
    name: 'Kit Limpieza Inalámbrico',
    status: 'Activo',
    stock: 89,
    price: 20000,
    category: 'Hogar',
    image: '/products/cleaning-kit.jpg',
  },
  {
    id: '3',
    name: 'Cepillo Vapor Mascotas',
    status: 'Activo',
    stock: 76,
    price: 15000,
    category: 'Mascotas',
    image: '/products/pet-steam-brush.jpg',
  },
  {
    id: '4',
    name: 'Porta Esponjas Silicona',
    status: 'Borrador',
    stock: 0,
    price: 5000,
    category: 'Hogar',
    image: '/products/silicone-holder.jpg',
  },
  {
    id: '5',
    name: 'Moldes Silicona Premium',
    status: 'Archivado',
    stock: 5,
    price: 15000,
    category: 'Manualidades',
    image: '/products/silicone-molds.jpg',
  },
]

const categories = ['Todos', 'Suplementos', 'Hogar', 'Mascotas', 'Manualidades']
const statuses = ['Todos', 'Activos', 'Borradores', 'Archivados']
const stockFilters = ['Todos', 'Bajo stock', 'Sin stock']
const pageSizes = [10, 25, 50]

function formatPrice(value: number) {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  })
}

function statusBadgeClasses(status: string) {
  switch (status) {
    case 'Activo':
      return 'bg-emerald-100 text-emerald-700'
    case 'Borrador':
      return 'bg-amber-100 text-amber-700'
    case 'Archivado':
      return 'bg-slate-100 text-slate-700'
    default:
      return 'bg-muted text-foreground'
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState(mockProducts)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [categoryFilter, setCategoryFilter] = useState('Todos')
  const [stockFilter, setStockFilter] = useState('Todos')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [massStatus, setMassStatus] = useState('Activo')

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchSearch = product.name.toLowerCase().includes(search.toLowerCase())
      const matchStatus =
        statusFilter === 'Todos' ||
        (statusFilter === 'Activos' && product.status === 'Activo') ||
        (statusFilter === 'Borradores' && product.status === 'Borrador') ||
        (statusFilter === 'Archivados' && product.status === 'Archivado')
      const matchCategory = categoryFilter === 'Todos' || product.category === categoryFilter
      const matchStock =
        stockFilter === 'Todos' ||
        (stockFilter === 'Bajo stock' && product.stock > 0 && product.stock < 10) ||
        (stockFilter === 'Sin stock' && product.stock === 0)
      return matchSearch && matchStatus && matchCategory && matchStock
    })
  }, [products, search, statusFilter, categoryFilter, stockFilter])

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const pagedProducts = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredProducts.slice(start, start + pageSize)
  }, [filteredProducts, page, pageSize])

  const allSelected = pagedProducts.length > 0 && pagedProducts.every((product) => selectedIds.includes(product.id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((current) => current.filter((id) => !pagedProducts.some((product) => product.id === id)))
      return
    }
    setSelectedIds((current) => [
      ...new Set([...current, ...pagedProducts.map((product) => product.id)]),
    ])
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  const handleArchiveSelected = () => {
    setProducts((current) =>
      current.map((product) =>
        selectedIds.includes(product.id) ? { ...product, status: 'Archivado' } : product
      )
    )
    setSelectedIds([])
  }

  const handleDeleteSelected = () => {
    setProducts((current) => current.filter((product) => !selectedIds.includes(product.id)))
    setSelectedIds([])
  }

  const handleChangeStatusSelected = () => {
    setProducts((current) =>
      current.map((product) =>
        selectedIds.includes(product.id) ? { ...product, status: massStatus } : product
      )
    )
    setSelectedIds([])
  }

  const handleDuplicate = (productId: string) => {
    const product = products.find((item) => item.id === productId)
    if (!product) return
    const duplicate = {
      ...product,
      id: String(Date.now()),
      name: `${product.name} (copia)`,
      status: 'Borrador',
    }
    setProducts((current) => [duplicate, ...current])
  }

  const setArchiveStatus = (productId: string) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, status: 'Archivado' } : product
      )
    )
  }

  const handlePageSize = (value: string) => {
    setPageSize(Number(value))
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-border bg-white px-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Módulo 2</p>
            <h1 className="text-3xl font-semibold text-foreground">Productos</h1>
          </div>
          <Link href="/products/new" className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700">
            <Plus className="h-4 w-4" />
            Agregar producto
          </Link>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Filtrar catálogo</CardTitle>
            <CardDescription>Busca y segmenta los productos por estado, categoría o stock.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-[280px_280px_280px]">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar producto</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Nombre, categoría o SKU"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-filter">Estado</Label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                  <SelectTrigger id="status-filter" className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-filter">Categoría</Label>
                <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
                  <SelectTrigger id="category-filter" className="w-full">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock-filter">Stock</Label>
                <Select value={stockFilter} onValueChange={(value) => setStockFilter(value)}>
                  <SelectTrigger id="stock-filter" className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {stockFilters.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedIds.length > 0 && (
          <Card className="border-l-4 border-red-600 bg-white p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold">{selectedIds.length} producto(s) seleccionado(s)</p>
                <p className="text-sm text-muted-foreground">Actúa sobre los productos seleccionados.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <Select value={massStatus} onValueChange={(value) => setMassStatus(value)}>
                    <SelectTrigger className="min-w-[180px]">
                      <SelectValue placeholder="Cambiar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Activo', 'Borrador', 'Archivado'].map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleChangeStatusSelected}>Aplicar</Button>
                </div>
                <Button variant="outline" onClick={handleArchiveSelected}>
                  Archivar
                </Button>
                <Button variant="destructive" onClick={handleDeleteSelected}>
                  Eliminar
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-1">
              <CardTitle>Lista de productos</CardTitle>
              <CardDescription>Administra tus productos y realiza cambios rápidos en el catálogo.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[48px] px-2">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border border-input text-red-600 focus:ring-red-500"
                    />
                  </TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="px-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelection(product.id)}
                        className="h-4 w-4 rounded border border-input text-red-600 focus:ring-red-500"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-xl bg-slate-100">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClasses(product.status)}`}>
                        {product.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`${product.stock < 10 ? 'text-red-600' : 'text-foreground'}`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Link href="/products/new" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-red-500 hover:text-foreground">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(product.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-red-500 hover:text-foreground"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setArchiveStatus(product.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-red-500 hover:text-foreground"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setProducts((current) => current.filter((item) => item.id !== product.id))}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-red-500 hover:text-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredProducts.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">No hay productos que coincidan con los filtros.</div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {pagedProducts.length} de {filteredProducts.length} productos
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Mostrar</span>
              <select
                value={pageSize}
                onChange={(event) => handlePageSize(event.target.value)}
                className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none"
              >
                {pageSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="h-9 px-3"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-foreground">
                Página {page} de {pageCount}
              </span>
              <Button
                className="h-9 px-3"
                disabled={page >= pageCount}
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
