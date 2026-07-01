import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'
import { CartDrawer } from '@/components/storefront/cart-drawer'
import { PostHogProvider } from '@/components/providers/posthog-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VendaMás',
  description: 'Plataforma de tiendas online con envío a toda Argentina',
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