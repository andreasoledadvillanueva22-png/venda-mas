import type { BlogPost } from '@/lib/blog/types'

type BlogJsonLdProps = {
  post: BlogPost
}

export function BlogJsonLd({ post }: BlogJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.imageUrl,
    datePublished: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'VendaMás',
    },
    publisher: {
      '@type': 'Organization',
      name: 'VendaMás',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
