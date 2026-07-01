import Image from 'next/image'
import Link from 'next/link'
import { formatBlogDate, getFeaturedBlogPosts } from '@/lib/blog-posts'

export function BlogPreviewSection() {
  const posts = getFeaturedBlogPosts(3)

  return (
    <section className="border-t border-white/10 bg-white/5 py-16 backdrop-blur-sm sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Te acompañamos para que crezcas
          </h2>
          <p className="mt-4 text-white/80">
            Blog, herramientas y recursos gratuitos para tu negocio
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group overflow-hidden rounded-2xl bg-white shadow-lg shadow-brand-900/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-900/20"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={post.imageUrl}
                  alt={post.imageAlt}
                  fill
                  loading="lazy"
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                    {post.category}
                  </p>
                  <span className="text-xs text-brand-500">{post.readTime}</span>
                </div>
                <time className="mt-1 block text-xs text-brand-500" dateTime={post.publishedAt}>
                  {formatBlogDate(post.publishedAt)}
                </time>
                <h3 className="mt-2 text-lg font-bold leading-snug text-brand-900">{post.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brand-700/80">
                  {post.excerpt}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-4 inline-flex text-sm font-semibold text-brand-600 transition hover:text-brand-700"
                >
                  Ver más →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Ver todos los recursos
          </Link>
        </div>
      </div>
    </section>
  )
}
