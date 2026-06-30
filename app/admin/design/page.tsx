import { redirect } from 'next/navigation'
import { DesignEditor } from '@/components/admin/design-editor'
import { getOwnerStore } from '@/lib/admin-store'
import { loadStoreDesignSettings } from '@/app/admin/design/actions'
import {
  DEFAULT_HOMEPAGE_CONFIG,
  DEFAULT_THEME_COLORS,
  type HomepageConfig,
  type StoreDesignSettings,
  type ThemeColors,
} from '@/lib/store-design'

function parseThemeColors(value: unknown): ThemeColors {
  if (!value || typeof value !== 'object') {
    return DEFAULT_THEME_COLORS
  }

  const colors = value as Partial<ThemeColors>
  return {
    primary: colors.primary ?? DEFAULT_THEME_COLORS.primary,
    secondary: colors.secondary ?? DEFAULT_THEME_COLORS.secondary,
    background: colors.background ?? DEFAULT_THEME_COLORS.background,
    text: colors.text ?? DEFAULT_THEME_COLORS.text,
  }
}

function parseHomepageConfig(value: unknown): HomepageConfig {
  if (!value || typeof value !== 'object') {
    return DEFAULT_HOMEPAGE_CONFIG
  }

  const homepage = value as Partial<HomepageConfig>
  return {
    title: homepage.title ?? DEFAULT_HOMEPAGE_CONFIG.title,
    subtitle: homepage.subtitle ?? DEFAULT_HOMEPAGE_CONFIG.subtitle,
    ctaText: homepage.ctaText ?? DEFAULT_HOMEPAGE_CONFIG.ctaText,
    ctaLink: homepage.ctaLink ?? DEFAULT_HOMEPAGE_CONFIG.ctaLink,
    layout: homepage.layout ?? DEFAULT_HOMEPAGE_CONFIG.layout,
  }
}

export default async function AdminDesignPage() {
  const store = await getOwnerStore()

  if (!store) {
    redirect('/auth/login?redirect=/admin/design')
  }

  const row = await loadStoreDesignSettings(store.id)

  const initial: StoreDesignSettings = {
    storeId: store.id,
    themeId: row?.theme_id ?? 'moderno',
    colors: parseThemeColors(row?.theme_colors),
    homepage: parseHomepageConfig(row?.homepage_config),
    pagesConfig:
      row?.pages_config && typeof row.pages_config === 'object'
        ? (row.pages_config as Record<string, unknown>)
        : {},
    fontHeading: row?.font_heading ?? 'Inter',
    fontBody: row?.font_body ?? 'Inter',
    baseFontSize: row?.base_font_size ?? 16,
  }

  return <DesignEditor initial={initial} />
}
