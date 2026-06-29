'use client'

import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import { cn } from '@/lib/utils'

type ProductDescriptionProps = {
  html: string
  className?: string
}

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'h1',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'a',
  'img',
  'blockquote',
  'span',
  'div',
]

const ALLOWED_ATTR = ['href', 'target', 'rel', 'src', 'alt', 'title', 'style', 'class']

export function ProductDescription({ html, className }: ProductDescriptionProps) {
  const sanitizedHtml = useMemo(
    () =>
      DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
      }),
    [html],
  )

  if (!sanitizedHtml) {
    return null
  }

  return (
    <div
      className={cn(
        'product-description text-muted-foreground',
        '[&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-foreground',
        '[&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground',
        '[&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground',
        '[&_p]:mb-3 [&_p:last-child]:mb-0',
        '[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5',
        '[&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5',
        '[&_a]:text-red-600 [&_a]:underline',
        '[&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-lg',
        '[&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}
