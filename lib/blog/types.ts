export type BlogBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'inline-cta'; message: string; href: string; linkText: string }

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  imageUrl: string
  imageAlt: string
  publishedAt: string
  readTime: string
  blocks: BlogBlock[]
  cta: {
    title: string
    description: string
    buttonText: string
    href: string
  }
}

export function blogImage(url: string): string {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}w=800&q=80`
}
