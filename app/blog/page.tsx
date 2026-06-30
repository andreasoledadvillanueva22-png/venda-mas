import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MarketingHeader } from '@/components/marketing/marketing-header'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { formatBlogDate, getAllBlogPosts } from '@/lib/blog-posts'

export const metadata: Metadata = {
  title: 'Blog — VendaMás',
  description: 'Recursos gratuitos para hacer crecer tu negocio online.',
}

export default function BlogPage() {
  const posts = getAllBlogPosts()

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-800 via-brand-600 to-brand-400 text-white">
      <MarketingHeader />

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Blog de VendaMás</h1>
            <p className="mt-4 text-lg text-white/85">
              Recursos gratuitos para hacer crecer tu negocio online
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group overflow-hidden rounded-2xl bg-white shadow-lg shadow-brand-900/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                      {post.category}
                    </span>
                    <time className="text-xs text-brand-500" dateTime={post.publishedAt}>
                      {formatBlogDate(post.publishedAt)}
                    </time>
                  </div>
                  <h2 className="mt-3 text-lg font-bold leading-snug text-brand-900">{post.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brand-700/80">
                    {post.excerpt}
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-4 inline-flex text-sm font-semibold text-brand-600 transition hover:text-brand-700"
                  >
                    Leer más →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
