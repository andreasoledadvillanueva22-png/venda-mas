import { PostHog } from 'posthog-node'

let posthogClient: PostHog | null = null

function getPostHogServerClient(): PostHog | null {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com'

  if (!apiKey) {
    return null
  }

  if (!posthogClient) {
    posthogClient = new PostHog(apiKey, {
      host,
      flushAt: 1,
      flushInterval: 0,
    })
  }

  return posthogClient
}

export async function trackServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
) {
  const client = getPostHogServerClient()

  if (!client) {
    return
  }

  client.capture({
    distinctId,
    event,
    properties,
  })

  await client.flush()
}
