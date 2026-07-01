import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'
import { CartDrawer } from '@/components/storefront/cart-drawer'
import { PostHogProvider } from '@/components/providers/posthog-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'VendaMás — Vendé online sin comisiones',
    template: '%s | VendaMás',
  },
  description:
    'La plataforma de e-commerce para microemprendedores argentinos. Creá tu tienda online sin comisiones por venta desde $9.900/mes.',
  keywords: [
    'tienda online',
    'ecommerce argentina',
    'vender online',
    'microemprendedores',
    'sin comisiones',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'VendaMás',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <PostHogProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}