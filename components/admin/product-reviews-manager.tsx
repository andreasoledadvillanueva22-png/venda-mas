'use client'

import { useEffect, useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

type ReviewSource = 'mercadolibre' | 'amazon' | 'aliexpress' | 'manual'

type DbProductReview = {
  id: string
  customer_name: string
  rating: number
  comment: string
  source: ReviewSource
  source_url: string | null
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

const initialForm = {
  customerName: '',
  rating: '5',
  comment: '',
  source: 'manual' as ReviewSource,
  sourceUrl: '',
}

export function ProductReviewsManager({ storeId, productId }: ProductReviewsManagerProps) {
  const supabase = createClient()
  const [reviews, setReviews] = useState<DbProductReview[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    async function loadReviews() {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('product_reviews')
        .select('id, customer_name, rating, comment, source, source_url')
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
        })
        .select('id, customer_name, rating, comment, source, source_url')
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
        <CardTitle>Reseñas importadas</CardTitle>
        <CardDescription>
          Agregá opiniones de Mercado Libre, Amazon, AliExpress u otras fuentes para mostrarlas en
          la página del producto.
        </CardDescription>
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
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{review.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {SOURCE_OPTIONS.find((option) => option.value === review.source)?.label ??
                      review.source}{' '}
                    · {review.rating} estrellas
                  </p>
                  <p className="text-sm text-foreground">&ldquo;{review.comment}&rdquo;</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleDeleteReview(review.id)}
                  disabled={saving}
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
          <p className="text-sm font-medium text-foreground">Importar reseña</p>

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
            disabled={saving}
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
    </Card>
  )
}
