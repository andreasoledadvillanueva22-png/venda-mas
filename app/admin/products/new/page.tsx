'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ImagePlus, Loader2, Trash2 } from 'lucide-react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { isValidVideoUrl } from '@/lib/video'
import { ProductReviewsManager } from '@/components/admin/product-reviews-manager'

const MAX_IMAGES = 5

type ProductFormState = {
  name: string
  description: string
  price: string
  comparePrice: string
  category: string
  stock: string
  sku: string
  tags: string
  videoUrl: string
  featured: boolean
  active: boolean
}

type SelectedImage = {
  id: string
  file: File
  previewUrl: string
}

type DbProduct = {
  id: string
  store_id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null
  category: string | null
  stock: number
  sku: string | null
  images: string[] | null
  tags: string[] | null
  video_url: string | null
  featured: boolean
  active: boolean
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)

  return slug || 'producto'
}

function sanitizeFilename(filename: string): string {
  const sanitized = filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return sanitized || 'imagen'
}

async function generateUniqueProductSlug(
  supabase: SupabaseClient,
  storeId: string,
  productName: string,
  excludeProductId?: string,
): Promise<string> {
  const base = slugify(productName)
  let slug = base
  let counter = 0

  while (true) {
    const { data } = await supabase
      .from('products')
      .select('id')
      .eq('store_id', storeId)
      .eq('slug', slug)
      .maybeSingle()

    if (!data || data.id === excludeProductId) {
      return slug
    }

    counter += 1
    slug = `${base}-${counter}`
  }
}

async function uploadProductImages(
  supabase: SupabaseClient,
  storeId: string,
  productSlug: string,
  files: File[],
  onProgress: (current: number, total: number) => void,
): Promise<string[]> {
  const urls: string[] = []

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index]
    onProgress(index + 1, files.length)

    const path = `${storeId}/${productSlug}/${Date.now()}-${index}-${sanitizeFilename(file.name)}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Error al subir ${file.name}: ${uploadError.message}`)
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    urls.push(data.publicUrl)
  }

  return urls
}

function fieldErrorClass(error?: string) {
  return error ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40' : ''
}

function parseTagsInput(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export default function NewProductPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
      }
    >
      <NewProductPageContent />
    </Suspense>
  )
}

function NewProductPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const editProductId = searchParams.get('edit')
  const isEditMode = Boolean(editProductId)

  const [storeId, setStoreId] = useState<string | null>(null)
  const [loadingStore, setLoadingStore] = useState(true)
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([])
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
  const [productSlug, setProductSlug] = useState('')

  const [form, setForm] = useState<ProductFormState>({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    category: '',
    stock: '0',
    sku: '',
    tags: '',
    videoUrl: '',
    featured: false,
    active: true,
  })

  const slugPreview = useMemo(() => {
    if (isEditMode && productSlug) {
      return productSlug
    }
    return slugify(form.name)
  }, [form.name, isEditMode, productSlug])

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    }
  }, [selectedImages])

  useEffect(() => {
    async function loadStore() {
      setLoadingStore(true)
      setError('')

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        const redirectPath = editProductId
          ? `/admin/products/new?edit=${editProductId}`
          : '/admin/products/new'
        router.push(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`)
        return
      }

      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle()

      if (storeError || !store) {
        setError('No se encontró tu tienda. Completá el registro antes de crear productos.')
        setLoadingStore(false)
        return
      }

      setStoreId(store.id)
      setLoadingStore(false)
    }

    void loadStore()
  }, [router, supabase, editProductId])

  useEffect(() => {
    if (!storeId || !editProductId) {
      return
    }

    async function loadProduct() {
      setLoadingProduct(true)
      setError('')

      const { data: product, error: productError } = await supabase
        .from('products')
        .select(
          'id, store_id, name, slug, description, price, compare_at_price, category, stock, sku, images, tags, video_url, featured, active',
        )
        .eq('id', editProductId)
        .eq('store_id', storeId)
        .maybeSingle()

      if (productError || !product) {
        setError('El producto no existe o no tenés permiso para editarlo.')
        setLoadingProduct(false)
        setTimeout(() => {
          router.push('/admin/products')
        }, 2000)
        return
      }

      const dbProduct = product as DbProduct

      setProductSlug(dbProduct.slug)

      setForm({
        name: dbProduct.name,
        description: dbProduct.description ?? '',
        price: String(dbProduct.price),
        comparePrice: dbProduct.compare_at_price ? String(dbProduct.compare_at_price) : '',
        category: dbProduct.category ?? '',
        stock: String(dbProduct.stock),
        sku: dbProduct.sku ?? '',
        tags: (dbProduct.tags ?? []).join(', '),
        videoUrl: dbProduct.video_url ?? '',
        featured: dbProduct.featured,
        active: dbProduct.active,
      })
      setExistingImageUrls(dbProduct.images ?? [])
      setLoadingProduct(false)
    }

    void loadProduct()
  }, [storeId, editProductId, supabase, router])

  const totalImageCount = existingImageUrls.length + selectedImages.length

  const handleFieldChange = (field: keyof ProductFormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const addImages = (files: FileList | null) => {
    if (!files) {
      return
    }

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))

    if (imageFiles.length === 0) {
      setError('Seleccioná archivos de imagen válidos (JPG, PNG, WEBP, etc.).')
      return
    }

    const availableSlots = MAX_IMAGES - totalImageCount

    if (availableSlots <= 0) {
      setError(`Podés subir un máximo de ${MAX_IMAGES} imágenes.`)
      return
    }

    const filesToAdd = imageFiles.slice(0, availableSlots)

    if (filesToAdd.length < imageFiles.length) {
      setError(`Solo se agregaron ${filesToAdd.length} imagen(es). El máximo permitido es ${MAX_IMAGES}.`)
    } else {
      setError('')
    }

    const nextImages = filesToAdd.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    setSelectedImages((current) => [...current, ...nextImages])
  }

  const removeNewImage = (id: string) => {
    setSelectedImages((current) => {
      const image = current.find((item) => item.id === id)
      if (image) {
        URL.revokeObjectURL(image.previewUrl)
      }
      return current.filter((item) => item.id !== id)
    })
  }

  const removeExistingImage = (url: string) => {
    setExistingImageUrls((current) => current.filter((item) => item !== url))
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (submitting) {
      return
    }
    addImages(event.dataTransfer.files)
  }

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {}

    if (!form.name.trim()) {
      nextErrors.name = 'El nombre es obligatorio.'
    }

    if (!form.price.trim() || Number.isNaN(Number(form.price)) || Number(form.price) <= 0) {
      nextErrors.price = 'El precio debe ser mayor a 0.'
    }

    if (form.comparePrice.trim()) {
      const comparePrice = Number(form.comparePrice)
      if (Number.isNaN(comparePrice) || comparePrice <= 0) {
        nextErrors.comparePrice = 'El precio comparativo debe ser mayor a 0.'
      }
    }

    if (form.stock.trim()) {
      const stock = Number(form.stock)
      if (Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
        nextErrors.stock = 'El stock debe ser un número entero mayor o igual a 0.'
      }
    }

    if (form.videoUrl.trim() && !isValidVideoUrl(form.videoUrl)) {
      nextErrors.videoUrl = 'Ingresá una URL válida de YouTube, Vimeo o un archivo MP4.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess(false)
    setUploadStatus('')

    if (!storeId) {
      setError('No se pudo identificar tu tienda.')
      return
    }

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      let slug: string

      if (isEditMode && productSlug) {
        slug = productSlug
      } else {
        setUploadStatus('Generando slug del producto...')
        slug = await generateUniqueProductSlug(supabase, storeId, form.name.trim())
      }

      let newImageUrls: string[] = []

      if (selectedImages.length > 0) {
        newImageUrls = await uploadProductImages(
          supabase,
          storeId,
          slug,
          selectedImages.map((image) => image.file),
          (current, total) => {
            setUploadStatus(`Subiendo imágenes (${current}/${total})...`)
          },
        )
      }

      const imageUrls = [...existingImageUrls, ...newImageUrls]

      setUploadStatus(isEditMode ? 'Actualizando producto...' : 'Guardando producto...')
      const tags = parseTagsInput(form.tags)
      const stockValue = form.stock.trim() === '' ? 0 : Number(form.stock)

      const productPayload = {
        name: form.name.trim(),
        slug,
        description: form.description.trim() || null,
        price: Number(form.price),
        compare_at_price: form.comparePrice.trim() ? Number(form.comparePrice) : null,
        category: form.category.trim() || null,
        stock: stockValue,
        sku: form.sku.trim() || null,
        images: imageUrls,
        tags,
        video_url: form.videoUrl.trim() || null,
        featured: form.featured,
        active: form.active,
      }

      if (isEditMode && editProductId) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editProductId)
          .eq('store_id', storeId)

        if (updateError) {
          setError(updateError.message)
          return
        }
      } else {
        const { error: insertError } = await supabase.from('products').insert({
          store_id: storeId,
          ...productPayload,
        })

        if (insertError) {
          setError(insertError.message)
          return
        }
      }

      setSuccess(true)
      setUploadStatus('')
      router.refresh()
      setTimeout(() => {
        router.push(
          isEditMode ? '/admin/products?updated=1' : '/admin/products',
        )
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado')
    } finally {
      setSubmitting(false)
      setUploadStatus('')
    }
  }

  const isLoading = loadingStore || loadingProduct
  const pageTitle = isEditMode ? 'Editar producto' : 'Crear producto'
  const pageDescription = isEditMode
    ? 'Modificá los datos del producto en tu catálogo.'
    : 'Completá los datos del producto para publicarlo en tu catálogo.'
  const submitLabel = submitting
    ? uploadStatus || 'Guardando...'
    : isEditMode
      ? 'Guardar cambios'
      : 'Guardar producto'
  const successMessage = isEditMode
    ? 'Producto actualizado correctamente. Redirigiendo al listado...'
    : 'Producto creado correctamente. Redirigiendo al listado...'

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-border bg-white px-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 text-sm text-red-600 transition hover:text-red-700"
            >
              <ArrowLeft className="h-4 w-4" /> Volver a productos
            </Link>
            <h1 className="mt-3 text-3xl font-semibold text-foreground">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground">{pageDescription}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted"
            >
              Descartar
            </Link>
            <Button
              type="submit"
              form="new-product-form"
              disabled={submitting || isLoading || !storeId}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </div>
        </div>
      </div>

      <form id="new-product-form" onSubmit={handleSubmit} className="space-y-6 p-6">
        {isLoading && (
          <div className="rounded-xl border border-border bg-white p-4 text-sm text-muted-foreground">
            {loadingStore
              ? 'Cargando información de tu tienda...'
              : 'Cargando datos del producto...'}
          </div>
        )}

        {uploadStatus && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
            {uploadStatus}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del producto</CardTitle>
                <CardDescription>Nombre, descripción, imágenes y slug automático.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del producto</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(event) => handleFieldChange('name', event.target.value)}
                    placeholder="Ej. Remera básica"
                    className={fieldErrorClass(errors.name)}
                    disabled={submitting}
                    required
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
                    disabled={submitting}
                    className="min-h-[140px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-ring/50"
                  />
                  <p className="text-sm text-muted-foreground">{form.description.length}/2000 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label>Imágenes del producto</Label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(event) => event.preventDefault()}
                    className="rounded-3xl border-2 border-dashed border-border bg-white px-4 py-10 text-center transition hover:border-red-400"
                  >
                    <ImagePlus className="mx-auto mb-3 h-8 w-8 text-red-600" />
                    <p className="text-sm font-medium">Arrastrá y soltá imágenes</p>
                    <p className="text-sm text-muted-foreground">
                      Hasta {MAX_IMAGES} imágenes. La primera será la principal.
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={submitting || totalImageCount >= MAX_IMAGES}
                      onChange={(event) => addImages(event.target.files)}
                      className="mx-auto mt-4 block max-w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-red-700"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {totalImageCount}/{MAX_IMAGES} imágenes seleccionadas
                    </p>
                  </div>

                  {totalImageCount > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {existingImageUrls.map((url, index) => (
                        <div
                          key={`existing-${url}`}
                          className="group relative overflow-hidden rounded-2xl border border-border bg-slate-50"
                        >
                          <img
                            src={url}
                            alt={`Imagen ${index + 1}`}
                            className="h-40 w-full object-cover"
                          />
                          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-black/40 px-3 py-2 text-white backdrop-blur-sm">
                            <span className="text-xs">
                              {index === 0 ? 'Imagen principal' : `Imagen ${index + 1}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeExistingImage(url)}
                              disabled={submitting}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {selectedImages.map((image, index) => {
                        const displayIndex = existingImageUrls.length + index

                        return (
                          <div
                            key={image.id}
                            className="group relative overflow-hidden rounded-2xl border border-border bg-slate-50"
                          >
                            <img
                              src={image.previewUrl}
                              alt={`Preview ${displayIndex + 1}`}
                              className="h-40 w-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-black/40 px-3 py-2 text-white backdrop-blur-sm">
                              <span className="text-xs">
                                {displayIndex === 0 ? 'Imagen principal' : `Imagen ${displayIndex + 1}`}
                                {' · Nueva'}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeNewImage(image.id)}
                                disabled={submitting}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video del producto (opcional)</Label>
                  <Input
                    id="videoUrl"
                    value={form.videoUrl}
                    onChange={(event) => handleFieldChange('videoUrl', event.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."
                    disabled={submitting}
                    className={fieldErrorClass(errors.videoUrl)}
                  />
                  {errors.videoUrl ? (
                    <p className="text-sm text-destructive">{errors.videoUrl}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      YouTube, Vimeo o enlace directo a MP4/WebM.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug-preview">Slug (automático)</Label>
                  <Input id="slug-preview" value={slugPreview} readOnly disabled className="bg-slate-50" />
                  <p className="text-sm text-muted-foreground">
                    {isEditMode
                      ? 'El slug se mantiene sin cambios al editar el producto.'
                      : 'Se genera desde el nombre y se valida para que sea único en tu tienda.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Precio e inventario</CardTitle>
                <CardDescription>Controlá el precio y la disponibilidad de stock.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={(event) => handleFieldChange('price', event.target.value)}
                      className={fieldErrorClass(errors.price)}
                      placeholder="19900"
                      disabled={submitting}
                      required
                    />
                    {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comparePrice">Precio comparativo</Label>
                    <Input
                      id="comparePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.comparePrice}
                      onChange={(event) => handleFieldChange('comparePrice', event.target.value)}
                      className={fieldErrorClass(errors.comparePrice)}
                      placeholder="22000"
                      disabled={submitting}
                    />
                    {errors.comparePrice && (
                      <p className="text-sm text-destructive">{errors.comparePrice}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      step="1"
                      value={form.stock}
                      onChange={(event) => handleFieldChange('stock', event.target.value)}
                      className={fieldErrorClass(errors.stock)}
                      placeholder="0"
                      disabled={submitting}
                    />
                    {errors.stock && <p className="text-sm text-destructive">{errors.stock}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={form.sku}
                      onChange={(event) => handleFieldChange('sku', event.target.value)}
                      placeholder="SKU12345"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organización</CardTitle>
                <CardDescription>Categoría, tags y visibilidad del producto.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(event) => handleFieldChange('category', event.target.value)}
                    placeholder="Ej. Ropa, Accesorios"
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={form.tags}
                    onChange={(event) => handleFieldChange('tags', event.target.value)}
                    placeholder="nuevo, oferta, verano"
                    disabled={submitting}
                  />
                  <p className="text-sm text-muted-foreground">Separá los tags con comas.</p>
                </div>

                <div className="space-y-3">
                  <Label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(event) => handleFieldChange('featured', event.target.checked)}
                      disabled={submitting}
                      className="h-4 w-4 rounded border border-input text-red-600 focus:ring-red-500"
                    />
                    Producto destacado
                  </Label>

                  <Label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(event) => handleFieldChange('active', event.target.checked)}
                      disabled={submitting}
                      className="h-4 w-4 rounded border border-input text-red-600 focus:ring-red-500"
                    />
                    Producto activo
                  </Label>
                </div>
              </CardContent>
            </Card>

            {isEditMode && storeId && editProductId ? (
              <ProductReviewsManager storeId={storeId} productId={editProductId} />
            ) : null}
          </div>
        </div>
      </form>
    </div>
  )
}
