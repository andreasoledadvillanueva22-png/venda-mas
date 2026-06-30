'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import type { StorefrontProductReview } from '@/lib/storefront'
import { cn } from '@/lib/utils'

const SOURCE_LABELS: Record<StorefrontProductReview['source'], string> = {
  mercadolibre: 'Mercado Libre',
  amazon: 'Amazon',
  aliexpress: 'AliExpress',
  manual: 'Cliente verificado',
}

const AUTOPLAY_MS = 5000

type ProductReviewsCarouselProps = {
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

function formatReviewDate(value: string | null): string | null {
  if (!value) {
    return null
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function CustomerAvatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`Foto de ${name}`}
        className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white"
      />
    )
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600 ring-2 ring-white">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function ReviewCard({ review }: { review: StorefrontProductReview }) {
  const reviewDate = formatReviewDate(review.createdAt)

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <CustomerAvatar name={review.customerName} photoUrl={review.customerPhotoUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-foreground">{review.customerName}</p>
              <p className="text-xs text-muted-foreground">{SOURCE_LABELS[review.source]}</p>
            </div>
            <StarRating rating={review.rating} />
          </div>
          {reviewDate ? (
            <p className="mt-1 text-xs text-muted-foreground">{reviewDate}</p>
          ) : null}
        </div>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
        &ldquo;{review.comment}&rdquo;
      </p>

      {review.reviewPhotoUrl ? (
        <img
          src={review.reviewPhotoUrl}
          alt="Foto de la reseña"
          className="mt-4 h-28 w-full rounded-xl object-cover"
        />
      ) : null}

      {review.sourceUrl ? (
        <a
          href={review.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="sf-text-primary mt-3 inline-block text-xs font-medium hover:underline"
        >
          Ver reseña original
        </a>
      ) : null}
    </article>
  )
}

export function ProductReviewsCarousel({ reviews }: ProductReviewsCarouselProps) {
  const [itemsPerView, setItemsPerView] = useState(1)
  const [currentPage, setCurrentPage] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    function updateItemsPerView() {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3)
      } else if (window.innerWidth >= 640) {
        setItemsPerView(2)
      } else {
        setItemsPerView(1)
      }
    }

    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  const pageCount = Math.max(1, Math.ceil(reviews.length / itemsPerView))

  const pages = useMemo(() => {
    const chunks: StorefrontProductReview[][] = []
    for (let index = 0; index < reviews.length; index += itemsPerView) {
      chunks.push(reviews.slice(index, index + itemsPerView))
    }
    return chunks.length > 0 ? chunks : [[]]
  }, [reviews, itemsPerView])

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, pageCount - 1))
  }, [pageCount])

  const goToPage = useCallback(
    (page: number) => {
      const normalized = ((page % pageCount) + pageCount) % pageCount
      setCurrentPage(normalized)
    },
    [pageCount],
  )

  useEffect(() => {
    if (isPaused || reviews.length <= itemsPerView) {
      return
    }

    const timer = window.setInterval(() => {
      setCurrentPage((page) => (page + 1) % pageCount)
    }, AUTOPLAY_MS)

    return () => window.clearInterval(timer)
  }, [isPaused, pageCount, reviews.length, itemsPerView])

  if (reviews.length === 0) {
    return null
  }

  return (
    <section
      className="mt-12 space-y-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Opiniones de clientes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
          </p>
        </div>

        {pageCount > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-slate-700 transition hover:bg-slate-50"
              aria-label="Reseña anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-slate-700 transition hover:bg-slate-50"
              aria-label="Reseña siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {pages.map((pageReviews, pageIndex) => (
            <div key={pageIndex} className="w-full shrink-0">
              <div
                className={cn(
                  'grid gap-4',
                  itemsPerView === 1 && 'grid-cols-1',
                  itemsPerView === 2 && 'grid-cols-1 sm:grid-cols-2',
                  itemsPerView === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
                )}
              >
                {pageReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {pageCount > 1 ? (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToPage(index)}
              className={cn(
                'h-2.5 rounded-full transition-all',
                currentPage === index ? 'w-8 bg-[var(--store-primary,#dc2626)]' : 'w-2.5 bg-slate-300',
              )}
              aria-label={`Ir a la página ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
