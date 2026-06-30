import Link from 'next/link'

export function MarketingFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-white/70 sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} VendaMás. Todos los derechos reservados.</p>
        <div className="flex flex-wrap items-center justify-center gap-5">
          <Link href="/blog" className="transition hover:text-white">
            Blog
          </Link>
          <span className="text-white/30">|</span>
          <Link href="/pricing" className="transition hover:text-white">
            Planes
          </Link>
          <span className="text-white/30">|</span>
          <Link href="/auth/login" className="transition hover:text-white">
            Ya soy usuario
          </Link>
          <span className="text-white/30">|</span>
          <Link href="#" className="transition hover:text-white">
            Términos
          </Link>
        </div>
      </div>
    </footer>
  )
}
