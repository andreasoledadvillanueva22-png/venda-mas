import Link from 'next/link'
import type { BlogBlock, BlogPost } from '@/lib/blog/types'

function renderBlock(block: BlogBlock, index: number) {
  switch (block.type) {
    case 'h2':
      return (
        <h2
          key={`h2-${index}`}
          className="mt-10 scroll-mt-24 text-2xl font-bold tracking-tight text-white first:mt-0"
        >
          {block.text}
        </h2>
      )
    case 'h3':
      return (
        <h3 key={`h3-${index}`} className="mt-6 text-lg font-semibold text-white/95">
          {block.text}
        </h3>
      )
    case 'p':
      return (
        <p key={`p-${index}`} className="mt-4 text-base leading-relaxed text-white/90">
          {block.text}
        </p>
      )
    case 'inline-cta':
      return (
        <aside
          key={`cta-${index}`}
          className="mt-6 rounded-xl border border-brand-300/30 bg-brand-500/15 px-5 py-4"
        >
          <p className="text-sm leading-relaxed text-white/90">
            {block.message}{' '}
            <Link href={block.href} className="font-semibold text-white underline underline-offset-2">
              {block.linkText}
            </Link>
          </p>
        </aside>
      )
    default:
      return null
  }
}

type BlogArticleBodyProps = {
  post: BlogPost
}

export function BlogArticleBody({ post }: BlogArticleBodyProps) {
  return (
    <div className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg sm:p-8">
      {post.blocks.map((block, index) => renderBlock(block, index))}

      <div className="mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 p-8 text-center shadow-xl">
        <h2 className="text-xl font-bold text-white sm:text-2xl">{post.cta.title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
          {post.cta.description}
        </p>
        <Link
          href={post.cta.href}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 text-sm font-bold text-brand-800 transition hover:bg-white/90"
        >
          {post.cta.buttonText}
        </Link>
      </div>
    </div>
  )
}
