import posthog from 'posthog-js'

function isPostHogEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY)
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!isPostHogEnabled() || typeof window === 'undefined') {
    return
  }

  posthog.capture(event, properties)
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!isPostHogEnabled() || typeof window === 'undefined') {
    return
  }

  posthog.identify(userId, properties)
}

export function resetUser() {
  if (!isPostHogEnabled() || typeof window === 'undefined') {
    return
  }

  posthog.reset()
}
