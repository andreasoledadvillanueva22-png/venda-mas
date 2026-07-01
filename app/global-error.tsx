'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error)
    }
  }, [error])

  return (
    <html lang="es">
      <body className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Algo salió mal</h1>
          <p className="text-sm text-slate-600">
            Ocurrió un error inesperado. Nuestro equipo fue notificado.
          </p>
          <Button onClick={() => reset()}>Reintentar</Button>
        </div>
      </body>
    </html>
  )
}
