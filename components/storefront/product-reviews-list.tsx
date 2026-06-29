import { Star } from 'lucide-react'
import type { StorefrontProductReview } from '@/lib/storefront'

const SOURCE_LABELS: Record<StorefrontProductReview['source'], string> = {
  mercadolibre: 'Mercado Libre',
  amazon: 'Amazon',
  aliexpress: 'AliExpress',
  manual: 'Cliente verificado',
}

type ProductReviewsListProps = {
  reviews: StorefrontProductReview[]
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      ))}
    </div>
  )
}

export function ProductReviewsList({ reviews }: ProductReviewsListProps) {
  if (reviews.length === 0) {
    return null
  }

  return (
    <section className="mt-12 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Opiniones de clientes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-2xl border border-border bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{review.customerName}</p>
                <p className="text-xs text-muted-foreground">{SOURCE_LABELS[review.source]}</p>
              </div>
              <StarRating rating={review.rating} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground">&ldquo;{review.comment}&rdquo;</p>
            {review.sourceUrl ? (
              <a
                href={review.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs font-medium text-red-600 hover:underline"
              >
                Ver reseña original
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
