export type { BlogBlock, BlogPost } from './blog/types'
export { blogImage } from './blog/types'
export { BLOG_POSTS } from './blog/posts/all-posts'

import { BLOG_POSTS } from './blog/posts/all-posts'

export function getAllBlogPosts() {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export function getFeaturedBlogPosts(limit = 3) {
  return getAllBlogPosts().slice(0, limit)
}

export function getBlogPostBySlug(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug)
}

export function formatBlogDate(date: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}
