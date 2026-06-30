import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export function MarketingHeader() {
  return (
    <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="inline-flex rounded-lg bg-white/95 px-2 py-1 shadow-sm">
          <Logo size="md" priority />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/pricing"
            className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
          >
            Planes
          </Link>
          <Link
            href="/auth/login"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/#waitlist"
            className="rounded-lg border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            Unirse a la waitlist
          </Link>
        </nav>
      </div>
    </header>
  )
}
