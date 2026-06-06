import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'
import { CartDrawer } from '@/components/storefront/cart-drawer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Andrea Tienda Online',
  description: 'Productos de calidad con envío a toda Argentina',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}