import * as Sentry from '@sentry/nextjs'

export function captureError(error: Error, context?: Record<string, unknown>) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return
  }

  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('custom', context)
    }
    Sentry.captureException(error)
  })
}

export function setUser(userId: string, email?: string) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return
  }

  Sentry.setUser({ id: userId, email })
}

export function clearUser() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return
  }

  Sentry.setUser(null)
}
