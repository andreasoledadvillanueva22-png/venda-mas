export type VideoEmbed =
  | { type: 'youtube'; embedUrl: string }
  | { type: 'vimeo'; embedUrl: string }
  | { type: 'direct'; embedUrl: string }

function extractYoutubeId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, '')

  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0]
    return id ?? null
  }

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const watchId = url.searchParams.get('v')
    if (watchId) {
      return watchId
    }

    const pathParts = url.pathname.split('/').filter(Boolean)
    const embedIndex = pathParts.indexOf('embed')
    if (embedIndex !== -1 && pathParts[embedIndex + 1]) {
      return pathParts[embedIndex + 1]
    }

    const shortsIndex = pathParts.indexOf('shorts')
    if (shortsIndex !== -1 && pathParts[shortsIndex + 1]) {
      return pathParts[shortsIndex + 1]
    }
  }

  return null
}

function extractVimeoId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, '')

  if (host !== 'vimeo.com' && host !== 'player.vimeo.com') {
    return null
  }

  const pathParts = url.pathname.split('/').filter(Boolean)
  const numericId = pathParts.find((part) => /^\d+$/.test(part))
  return numericId ?? null
}

export function parseVideoUrl(rawUrl: string): VideoEmbed | null {
  const trimmed = rawUrl.trim()

  if (!trimmed) {
    return null
  }

  try {
    const url = new URL(trimmed)
    const youtubeId = extractYoutubeId(url)

    if (youtubeId) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      }
    }

    const vimeoId = extractVimeoId(url)

    if (vimeoId) {
      return {
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      }
    }

    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url.pathname)) {
      return {
        type: 'direct',
        embedUrl: url.toString(),
      }
    }

    return null
  } catch {
    return null
  }
}

export function isValidVideoUrl(rawUrl: string): boolean {
  return parseVideoUrl(rawUrl) !== null
}
