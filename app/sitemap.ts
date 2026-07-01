import type { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/lib/blog-posts'

function getBaseUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ??
    process.env.NEXT_PUBLIC_APP_URL?.trim() ??
    `https://${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? 'venda-mas.vercel.app'}`

  return configured.replace(/\/$/, '')
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl()

  const staticPages: MetadataRoute.Sitemap = [
    '',
    '/pricing',
    '/blog',
    '/auth/login',
    '/auth/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))

  const blogPages: MetadataRoute.Sitemap = getAllBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticPages, ...blogPages]
}
