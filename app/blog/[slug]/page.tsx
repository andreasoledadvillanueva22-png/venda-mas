import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BlogArticleBody } from '@/components/blog/blog-article-body'
import { BlogJsonLd } from '@/components/blog/blog-json-ld'
import { MarketingHeader } from '@/components/marketing/marketing-header'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { formatBlogDate, getAllBlogPosts, getBlogPostBySlug } from '@/lib/blog-posts'

type BlogPostPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    return { title: 'Artículo no encontrado | Blog VendaMás' }
  }

  return {
    title: `${post.title} | Blog VendaMás`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      images: [{ url: post.imageUrl, alt: post.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.imageUrl],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-800 via-brand-600 to-brand-400 text-white">
      <BlogJsonLd post={post} />
      <MarketingHeader />

      <main className="relative z-10 pb-16">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <Link
            href="/blog"
            className="inline-flex text-sm font-semibold text-white/80 transition hover:text-white"
          >
            ← Volver al blog
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
              {post.category}
            </span>
            <time className="text-sm text-white/70" dateTime={post.publishedAt}>
              {formatBlogDate(post.publishedAt)}
            </time>
            <span className="text-sm text-white/70">{post.readTime}</span>
          </div>

          <h1 className="mt-6 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            {post.title}
          </h1>

          <p className="mt-4 text-lg leading-relaxed text-white/85">{post.excerpt}</p>

          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl shadow-2xl shadow-brand-900/30 ring-1 ring-white/20">
            <Image
              src={post.imageUrl}
              alt={post.imageAlt}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>

          <BlogArticleBody post={post} />

          <div className="mt-10 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Volver al blog
            </Link>
          </div>
        </article>
      </main>

      <MarketingFooter />
    </div>
  )
}
