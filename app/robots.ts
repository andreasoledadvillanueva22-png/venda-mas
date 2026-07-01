import type { MetadataRoute } from 'next'

function getBaseUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ??
    process.env.NEXT_PUBLIC_APP_URL?.trim() ??
    `https://${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? 'venda-mas.vercel.app'}`

  return configured.replace(/\/$/, '')
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  }
}
