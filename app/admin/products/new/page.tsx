'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
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

const categoryOptions = ['Suplementos', 'Hogar', 'Mascotas', 'Manualidades', 'Tecnología', 'Otro']
const collectionOptions = ['Tendencias', 'Más vendidos', 'Nuevos lanzamientos', 'Ofertas']
const statusOptions = ['Borrador', 'Activo', 'Archivado']

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function fieldErrorClass(error?: string) {
  return error ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40' : ''
}

export default function ProductFormPage({ searchParams }: { searchParams?: { [key: string]: string | string[] } }) {
  const defaultProduct = useMemo(
    () => ({
      name: '',
      description: '',
      price: '',
      comparePrice: '',
      cost: '',
      sku: '',
      barcode: '',
      stock: '',
      trackInventory: true,
      allowOutOfStock: false,
      weight: '',
      requiresShipping: true,
      status: 'Borrador',
      category: 'Suplementos',
      collections: [] as string[],
      tags: [] as string[],
      supplier: '',
      seoTitle: '',
      seoDescription: '',
      handle: '',
    }),
    []
  )

  const [form, setForm] = useState(defaultProduct)
  const [manualHandle, setManualHandle] = useState(false)
  const [images, setImages] = useState<Array<{ id: number; url: string }>>([])
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!manualHandle) {
      setForm((current) => ({ ...current, handle: slugify(current.name) }))
    }
  }, [form.name, manualHandle])

  const seoPreviewTitle = form.seoTitle || form.name || 'Título de la página'
  const seoPreviewDescription = form.seoDescription || 'Descripción meta que aparece en los resultados de búsqueda de Google.'
  const seoPreviewUrl = `venda-mas.com/productos/${form.handle || 'nombre-del-producto'}`

  const descriptionLength = form.description.length
  const seoDescriptionLength = form.seoDescription.length

  const handleFieldChange = (field: string, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const fileArray = Array.from(files)
    const nextImages = fileArray.map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
    }))
    setImages((current) => [...current, ...nextImages])
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    handleFiles(event.dataTransfer.files)
  }

  const moveImage = (id: number, direction: 'up' | 'down') => {
    setImages((current) => {
      const index = current.findIndex((image) => image.id === id)
      if (index === -1) return current
      const nextIndex = direction === 'up' ? index - 1 : index + 1
      if (nextIndex < 0 || nextIndex >= current.length) return current
      const nextImages = [...current]
      const [moved] = nextImages.splice(index, 1)
      nextImages.splice(nextIndex, 0, moved)
      return nextImages
    })
  }

  const removeImage = (id: number) => {
    setImages((current) => current.filter((image) => image.id !== id))
  }

  const addTag = () => {
    const value = tagInput.trim()
    if (!value || form.tags.includes(value)) return
    setForm((current) => ({ ...current, tags: [...current.tags, value] }))
    setTagInput('')
  }

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addTag()
    }
  }

  const removeTag = (tag: string) => {
    setForm((current) => ({ ...current, tags: current.tags.filter((item) => item !== tag) }))
  }

  const toggleCollection = (value: string) => {
    setForm((current) => {
      const active = current.collections.includes(value)
      return {
        ...current,
        collections: active
          ? current.collections.filter((item) => item !== value)
          : [...current.collections, value],
      }
    })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!form.name.trim()) nextErrors.name = 'El nombre es obligatorio.'
    if (!form.price || Number(form.price) <= 0) nextErrors.price = 'El precio debe ser mayor a 0.'
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setSaved(false)
      return
    }

    setSaved(true)
  }

  const priceValue = Number(form.price)
  const comparePriceValue = Number(form.comparePrice)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-border bg-white px-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/products" className="inline-flex items-center gap-2 text-sm text-red-600 transition hover:text-red-700">
              <ArrowLeft className="h-4 w-4" /> Volver a productos
            </Link>
            <h1 className="mt-3 text-3xl font-semibold text-foreground">Agregar / editar producto</h1>
            <p className="text-sm text-muted-foreground">Completa los datos del producto para publicar en el catálogo.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-foreground">Descartar</Button>
            <Button className="bg-red-600 text-white hover:bg-red-700">Guardar producto</Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {saved && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Producto guardado correctamente. Puedes seguir editando o volver a la lista.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del producto</CardTitle>
                <CardDescription>Nombre, descripción y multimedia principal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del producto</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(event) => handleFieldChange('name', event.target.value)}
                    placeholder="Ej. Pack x3 Citrato de Magnesio"
                    className={fieldErrorClass(errors.name)}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <textarea
                    id="description"
                    value={form.description}
                    onChange={(event) => handleFieldChange('description', event.target.value)}
                    placeholder="Describe el producto con sus beneficios y usos"
                    maxLength={2000}
                    className="min-h-[140px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-ring/50"
                  />
                  <p className="text-sm text-muted-foreground">{descriptionLength}/2000 caracteres</p>
                </div>
                <div>
                  <Label className="mb-2 block">Multimedia</Label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(event) => event.preventDefault()}
                    className="rounded-3xl border-2 border-dashed border-border bg-white px-4 py-10 text-center transition hover:border-red-400"
                  >
                    <ImagePlus className="mx-auto mb-3 h-8 w-8 text-red-600" />
                    <p className="text-sm font-medium">Arrastrar y soltar imágenes</p>
                    <p className="text-sm text-muted-foreground">Añade hasta 6 imágenes. La primera será la principal.</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) => handleFiles(event.target.files)}
                      className="mx-auto mt-4 block text-sm text-muted-foreground"
                    />
                  </div>
                  {images.length > 0 && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {images.map((image, index) => (
                        <div key={image.id} className="group relative overflow-hidden rounded-2xl border border-border bg-slate-50">
                          <img src={image.url} alt={`Imagen ${index + 1}`} className="h-40 w-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 bg-black/40 px-3 py-2 text-white backdrop-blur-sm">
                            <span className="text-xs">{index === 0 ? 'Imagen principal' : `Imagen ${index + 1}`}</span>
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => moveImage(image.id, 'up')} disabled={index === 0} className="rounded-full bg-white/10 p-1 transition hover:bg-white/20 disabled:opacity-40">
                                <ChevronUp className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => moveImage(image.id, 'down')} disabled={index === images.length - 1} className="rounded-full bg-white/10 p-1 transition hover:bg-white/20 disabled:opacity-40">
                                <ChevronDown className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => removeImage(image.id)} className="rounded-full bg-white/10 p-1 transition hover:bg-white/20">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Precio e inventario</CardTitle>
                <CardDescription>Controla el precio, costo y la disponibilidad de stock.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(event) => handleFieldChange('price', event.target.value)}
                      className={fieldErrorClass(errors.price)}
                      placeholder="19900"
                    />
                    {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comparePrice">Precio comparativo</Label>
                    <Input
                      id="comparePrice"
                      type="number"
                      step="0.01"
                      value={form.comparePrice}
                      onChange={(event) => handleFieldChange('comparePrice', event.target.value)}
                      placeholder="22000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost">Costo por item</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={form.cost}
                      onChange={(event) => handleFieldChange('cost', event.target.value)}
                      placeholder="12000"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={form.sku}
                      onChange={(event) => handleFieldChange('sku', event.target.value)}
                      placeholder="SKU12345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Código de barras</Label>
                    <Input
                      id="barcode"
                      value={form.barcode}
                      onChange={(event) => handleFieldChange('barcode', event.target.value)}
                      placeholder="123456789012"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Cantidad en stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={form.stock}
                      onChange={(event) => handleFieldChange('stock', event.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <Label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.trackInventory}
                        onChange={(event) => handleFieldChange('trackInventory', event.target.checked)}
                        className="h-4 w-4 rounded border border-input text-red-600 focus:ring-red-500"
                      />
                      Seguimiento de inventario
                    </Label>
                    <p className="text-sm text-muted-foreground">Activa para calcular stock automáticamente.</p>
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <Label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.allowOutOfStock}
                        onChange={(event) => handleFieldChange('allowOutOfStock', event.target.checked)}
                        className="h-4 w-4 rounded border border-input text-red-600 focus:ring-red-500"
                      />
                      Permitir compras sin stock
                    </Label>
                    <p className="text-sm text-muted-foreground">El cliente puede comprar aunque el stock esté en cero.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Envío</CardTitle>
                <CardDescription>Define peso y condiciones de envío.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    value={form.weight}
                    onChange={(event) => handleFieldChange('weight', event.target.value)}
                    placeholder="0.25"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.requiresShipping}
                      onChange={(event) => handleFieldChange('requiresShipping', event.target.checked)}
                      className="h-4 w-4 rounded border border-input text-red-600 focus:ring-red-500"
                    />
                    Requiere envío
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organización</CardTitle>
                <CardDescription>Clasifica el producto en categorías y colecciones.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={form.status} onValueChange={(value) => handleFieldChange('status', value)}>
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={form.category} onValueChange={(value) => handleFieldChange('category', value)}>
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Colecciones</Label>
                  <div className="grid gap-2">
                    {collectionOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleCollection(option)}
                        className={`rounded-full px-3 py-2 text-sm transition ${form.collections.includes(option) ? 'bg-red-600 text-white' : 'border border-border bg-background text-foreground hover:bg-muted'}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Etiquetas</Label>
                  <div className="flex flex-wrap gap-2">
                    {form.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-600 hover:bg-slate-200">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(event) => setTagInput(event.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Agregar etiqueta"
                    />
                    <Button type="button" onClick={addTag} className="inline-flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Agregar
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Proveedor</Label>
                  <Input
                    id="supplier"
                    value={form.supplier}
                    onChange={(event) => handleFieldChange('supplier', event.target.value)}
                    placeholder="Nombre del proveedor"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
                <CardDescription>Optimiza la página para búsquedas en Google.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">Título de la página</Label>
                  <Input
                    id="seoTitle"
                    value={form.seoTitle}
                    onChange={(event) => handleFieldChange('seoTitle', event.target.value)}
                    placeholder="Título SEO para Google"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">Descripción meta</Label>
                  <textarea
                    id="seoDescription"
                    value={form.seoDescription}
                    onChange={(event) => handleFieldChange('seoDescription', event.target.value)}
                    maxLength={160}
                    className="min-h-[100px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-ring/50"
                    placeholder="Descripción meta para motores de búsqueda"
                  />
                  <p className="text-sm text-muted-foreground">{seoDescriptionLength}/160 caracteres</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="handle">URL handle</Label>
                  <Input
                    id="handle"
                    value={form.handle}
                    onChange={(event) => {
                      setManualHandle(true)
                      handleFieldChange('handle', event.target.value)
                    }}
                    placeholder="pack-x3-citrato-de-magnesio"
                  />
                </div>

                <div className="rounded-3xl border border-border bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Vista previa en Google</p>
                  <h2 className="mt-2 text-base font-semibold text-blue-600">{seoPreviewTitle}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{seoPreviewDescription}</p>
                  <p className="mt-3 text-sm text-slate-500">{seoPreviewUrl}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
