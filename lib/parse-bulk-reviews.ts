export type BulkReviewDraft = {
  customerName: string
  rating: number
  comment: string
  source: 'mercadolibre' | 'amazon' | 'aliexpress' | 'manual'
  customerPhotoUrl: string | null
  reviewPhotoUrl: string | null
}

export type ParseBulkReviewsResult = {
  reviews: BulkReviewDraft[]
  errors: string[]
}

const FIELD_ALIASES: Record<string, keyof BulkReviewDraft | 'rating' | 'comment' | 'source'> = {
  nombre: 'customerName',
  name: 'customerName',
  rating: 'rating',
  calificacion: 'rating',
  calificación: 'rating',
  estrellas: 'rating',
  comentario: 'comment',
  comment: 'comment',
  texto: 'comment',
  origen: 'source',
  source: 'source',
  'url foto cliente': 'customerPhotoUrl',
  'foto cliente': 'customerPhotoUrl',
  customer_photo: 'customerPhotoUrl',
  'url foto reseña': 'reviewPhotoUrl',
  'foto reseña': 'reviewPhotoUrl',
  review_photo: 'reviewPhotoUrl',
}

function normalizeFieldKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function parseSource(value: string): BulkReviewDraft['source'] {
  const normalized = value.trim().toLowerCase()

  if (normalized.includes('mercado') || normalized === 'ml') {
    return 'mercadolibre'
  }

  if (normalized.includes('amazon')) {
    return 'amazon'
  }

  if (normalized.includes('ali')) {
    return 'aliexpress'
  }

  return 'manual'
}

function parseBlock(block: string, blockIndex: number): { review: BulkReviewDraft | null; error: string | null } {
  const draft: Partial<BulkReviewDraft> = {
    source: 'manual',
    customerPhotoUrl: null,
    reviewPhotoUrl: null,
  }

  for (const line of block.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || !trimmed.includes(':')) {
      continue
    }

    const separatorIndex = trimmed.indexOf(':')
    const rawKey = trimmed.slice(0, separatorIndex)
    const value = trimmed.slice(separatorIndex + 1).trim()
    const field = FIELD_ALIASES[normalizeFieldKey(rawKey)]

    if (!field || !value) {
      continue
    }

    if (field === 'rating') {
      const rating = Number(value)
      if (Number.isNaN(rating) || rating < 1 || rating > 5) {
        return {
          review: null,
          error: `Bloque ${blockIndex + 1}: la calificación debe ser un número entre 1 y 5.`,
        }
      }
      draft.rating = rating
      continue
    }

    if (field === 'source') {
      draft.source = parseSource(value)
      continue
    }

    if (field === 'customerPhotoUrl' || field === 'reviewPhotoUrl') {
      draft[field] = value
      continue
    }

    draft[field] = value
  }

  if (!draft.customerName?.trim() || !draft.comment?.trim()) {
    return {
      review: null,
      error: `Bloque ${blockIndex + 1}: faltan Nombre y/o Comentario.`,
    }
  }

  const rating = draft.rating ?? 5

  return {
    review: {
      customerName: draft.customerName.trim(),
      rating,
      comment: draft.comment.trim(),
      source: draft.source ?? 'manual',
      customerPhotoUrl: draft.customerPhotoUrl?.trim() || null,
      reviewPhotoUrl: draft.reviewPhotoUrl?.trim() || null,
    },
    error: null,
  }
}

export function parseBulkReviews(text: string): ParseBulkReviewsResult {
  const normalized = text.trim()

  if (!normalized) {
    return { reviews: [], errors: ['Pegá al menos una reseña para importar.'] }
  }

  const blocks = normalized
    .split(/\n-{3,}\n|\n(?=Nombre:)/i)
    .map((block) => block.trim())
    .filter(Boolean)

  const reviews: BulkReviewDraft[] = []
  const errors: string[] = []

  blocks.forEach((block, index) => {
    const { review, error } = parseBlock(block, index)
    if (error) {
      errors.push(error)
      return
    }
    if (review) {
      reviews.push(review)
    }
  })

  if (reviews.length === 0 && errors.length === 0) {
    errors.push('No se encontraron reseñas válidas en el texto pegado.')
  }

  return { reviews, errors }
}
