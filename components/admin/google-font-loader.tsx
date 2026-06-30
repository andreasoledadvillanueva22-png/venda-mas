'use client'

import { useEffect } from 'react'
import { buildGoogleFontsHref } from '@/lib/store-design'

type GoogleFontLoaderProps = {
  fonts: string[]
}

export function GoogleFontLoader({ fonts }: GoogleFontLoaderProps) {
  useEffect(() => {
    const href = buildGoogleFontsHref(fonts)
    if (!href) {
      return
    }

    const existing = document.querySelector<HTMLLinkElement>('link[data-design-fonts="true"]')

    if (existing) {
      if (existing.href === href) {
        return
      }
      existing.remove()
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.setAttribute('data-design-fonts', 'true')
    document.head.appendChild(link)
  }, [fonts])

  return null
}
