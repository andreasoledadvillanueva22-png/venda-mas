'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FileUp, Loader2, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { parseBulkReviews } from '@/lib/parse-bulk-reviews'

type ReviewSource = 'mercadolibre' | 'amazon' | 'aliexpress' | 'manual'

type DbProductReview = {
  id: string
  customer_name: string
  rating: number
  comment: string
  source: ReviewSource
  source_url: string | null
  customer_photo_url: string | null
  review_photo_url: string | null
}

type ProductReviewsManagerProps = {
  storeId: string
  productId: string
}

const SOURCE_OPTIONS: Array<{ value: ReviewSource; label: string }> = [
  { value: 'mercadolibre', label: 'Mercado Libre' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'aliexpress', label: 'AliExpress' },
  { value: 'manual', label: 'Manual / otro' },
]

const REVIEW_SELECT =
  'id, customer_name, rating, comment, source, source_url, customer_photo_url, review_photo_url'

const BULK_IMPORT_PLACEHOLDER = `Nombre: Juan Pérez
Rating: 5
Comentario: Excelente producto
---
Nombre: María López
Rating: 4
Comentario: Muy bueno, llegó rápido`

const initialForm = {
  customerName: '',
  rating: '5',
  comment: '',
  source: 'manual' as ReviewSource,
  sourceUrl: '',
  customerPhotoUrl: '',
  reviewPhotoUrl: '',
}

export function ProductReviewsManager({ storeId, productId }: ProductReviewsManagerProps) {
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [reviews, setReviews] = useState<DbProductReview[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(initialForm)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importText, setImportText] = useState('')
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function loadReviews() {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('product_reviews')
        .select(REVIEW_SELECT)
        .eq('store_id', storeId)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError('No se pudieron cargar las reseñas.')
      } else {
        setReviews((data ?? []) as DbProductReview[])
      }
      setLoading(false)
    }

    void loadReviews()
  }, [supabase, storeId, productId])

  useEffect(() => {
    if (!showImportModal) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [showImportModal])

  const handleAddReview = async () => {
    setError('')
    setSuccess('')

    if (!storeId.trim() || !productId.trim()) {
      setError('No se pudo identificar la tienda o el producto.')
      return
    }

    if (!form.customerName.trim() || !form.comment.trim()) {
      setError('El nombre y el comentario son obligatorios.')
      return
    }

    const rating = Number(form.rating)
    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      setError('La calificación debe estar entre 1 y 5.')
      return
    }

    setSaving(true)

    try {
      const { data, error: insertError } = await supabase
        .from('product_reviews')
        .insert({
          store_id: storeId,
          product_id: productId,
          customer_name: form.customerName.trim(),
          rating,
          comment: form.comment.trim(),
          source: form.source,
          source_url: form.sourceUrl.trim() || null,
          customer_photo_url: form.customerPhotoUrl.trim() || null,
          review_photo_url: form.reviewPhotoUrl.trim() || null,
        })
        .select(REVIEW_SELECT)
        .single()

      if (insertError || !data) {
        setError(insertError?.message ?? 'No se pudo guardar la reseña.')
        return
      }

      setReviews((current) => [data as DbProductReview, ...current])
      setForm(initialForm)
      setSuccess('Reseña guardada correctamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleBulkImport = async () => {
    setError('')
    setSuccess('')

    const { reviews: parsedReviews, errors } = parseBulkReviews(importText)

    if (errors.length > 0) {
      setError(errors.join(' '))
      return
    }

    if (parsedReviews.length === 0) {
      setError('No se encontraron reseñas válidas para importar.')
      return
    }

    setImporting(true)

    try {
      const payload = parsedReviews.map((review) => ({
        store_id: storeId,
        product_id: productId,
        customer_name: review.customerName,
        rating: review.rating,
        comment: review.comment,
        source: review.source,
        source_url: null,
        customer_photo_url: review.customerPhotoUrl,
        review_photo_url: review.reviewPhotoUrl,
      }))

      const { data, error: insertError } = await supabase
        .from('product_reviews')
        .insert(payload)
        .select(REVIEW_SELECT)

      if (insertError || !data) {
        setError(insertError?.message ?? 'No se pudieron importar las reseñas.')
        return
      }

      setReviews((current) => [...(data as DbProductReview[]), ...current])
      setImportText('')
      setShowImportModal(false)
      setSuccess(`${data.length} reseñas importadas correctamente.`)
    } finally {
      setImporting(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    setError('')
    setSuccess('')
    const { error: deleteError } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('store_id', storeId)
      .eq('product_id', productId)

    if (deleteError) {
      setError('No se pudo eliminar la reseña.')
      return
    }

    setReviews((current) => current.filter((review) => review.id !== reviewId))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Reseñas importadas</CardTitle>
            <CardDescription>
              Agregá opiniones de Mercado Libre, Amazon, AliExpress u otras fuentes para mostrarlas en
              la página del producto.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setError('')
              setSuccess('')
              setShowImportModal(true)
            }}
          >
            <FileUp className="mr-2 h-4 w-4" />
            Importar reseñas
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando reseñas...
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex gap-3">
                  {review.customer_photo_url ? (
                    <img
                      src={review.customer_photo_url}
                      alt={review.customer_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : null}
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{review.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {SOURCE_OPTIONS.find((option) => option.value === review.source)?.label ??
                        review.source}{' '}
                      · {review.rating} estrellas
                    </p>
                    <p className="text-sm text-foreground">&ldquo;{review.comment}&rdquo;</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleDeleteReview(review.id)}
                  disabled={saving || importing}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Todavía no agregaste reseñas para este producto.
          </p>
        )}

        <div
          className="space-y-4 border-t border-border pt-6"
          onKeyDown={(event) => {
            if (event.key !== 'Enter' || (event.target as HTMLElement).tagName === 'TEXTAREA') {
              return
            }

            event.preventDefault()
            event.stopPropagation()
          }}
        >
          <p className="text-sm font-medium text-foreground">Agregar reseña</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reviewCustomerName">Nombre del cliente</Label>
              <Input
                id="reviewCustomerName"
                value={form.customerName}
                onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
                placeholder="Ej. María G."
                disabled={saving}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewRating">Calificación (1-5)</Label>
              <Input
                id="reviewRating"
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))}
                disabled={saving}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reviewSource">Origen</Label>
              <select
                id="reviewSource"
                value={form.source}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    source: event.target.value as ReviewSource,
                  }))
                }
                disabled={saving}
                className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-ring/50"
              >
                {SOURCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewSourceUrl">URL de la reseña (opcional)</Label>
              <Input
                id="reviewSourceUrl"
                type="url"
                value={form.sourceUrl}
                onChange={(event) => setForm((current) => ({ ...current, sourceUrl: event.target.value }))}
                placeholder="https://..."
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reviewCustomerPhotoUrl">URL de foto del cliente (opcional)</Label>
              <Input
                id="reviewCustomerPhotoUrl"
                type="url"
                value={form.customerPhotoUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, customerPhotoUrl: event.target.value }))
                }
                placeholder="https://..."
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewPhotoUrl">URL de foto de la reseña (opcional)</Label>
              <Input
                id="reviewPhotoUrl"
                type="url"
                value={form.reviewPhotoUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, reviewPhotoUrl: event.target.value }))
                }
                placeholder="https://..."
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewComment">Comentario</Label>
            <textarea
              id="reviewComment"
              value={form.comment}
              onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
              placeholder="Pegá el texto de la reseña importada"
              maxLength={2000}
              disabled={saving}
              required
              className="min-h-[100px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-ring/50"
            />
          </div>

          <Button
            type="button"
            disabled={saving || importing}
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void handleAddReview()
            }}
          >
            {saving ? 'Guardando...' : 'Guardar reseña'}
          </Button>
        </div>
      </CardContent>

      {mounted && showImportModal
        ? createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
              <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>Importar reseñas</CardTitle>
                      <CardDescription>
                        Pegá varias reseñas separadas por líneas con <code>---</code>. Cada bloque debe
                        incluir Nombre, Rating y Comentario.
                      </CardDescription>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowImportModal(false)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"
                      aria-label="Cerrar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    value={importText}
                    onChange={(event) => setImportText(event.target.value)}
                    placeholder={BULK_IMPORT_PLACEHOLDER}
                    rows={12}
                    disabled={importing}
                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2 font-mono text-sm outline-none transition focus-visible:border-ring focus-visible:ring-ring/50"
                  />
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowImportModal(false)}
                      disabled={importing}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      className="bg-red-600 text-white hover:bg-red-700"
                      disabled={importing}
                      onClick={() => void handleBulkImport()}
                    >
                      {importing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importando...
                        </>
                      ) : (
                        'Importar reseñas'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>,
            document.body,
          )
        : null}
    </Card>
  )
}
