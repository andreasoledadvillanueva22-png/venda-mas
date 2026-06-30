export type ThemeColors = {
  primary: string
  secondary: string
  background: string
  text: string
}

export type HomepageConfig = {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  layout: string
}

export type StoreDesignSettings = {
  storeId: string
  themeId: string
  colors: ThemeColors
  homepage: HomepageConfig
  pagesConfig: Record<string, unknown>
  fontHeading: string
  fontBody: string
  baseFontSize: number
}

export const DEFAULT_THEME_COLORS: ThemeColors = {
  primary: '#DC2626',
  secondary: '#16A34A',
  background: '#FFFFFF',
  text: '#1E293B',
}

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  title: 'Bienvenido a la temporada de verano',
  subtitle: 'Descubrí las novedades y ofertas exclusivas para tu tienda.',
  ctaText: 'Comprar ahora',
  ctaLink: '/productos',
  layout: 'grid',
}

export const FONT_OPTIONS = ['Inter', 'Poppins', 'Montserrat', 'Roboto'] as const

export function googleFontFamily(fontName: string): string {
  return `"${fontName}", sans-serif`
}

export function buildGoogleFontsHref(fonts: string[]): string {
  const uniqueFonts = [...new Set(fonts.filter(Boolean))]
  if (uniqueFonts.length === 0) {
    return ''
  }

  const families = uniqueFonts
    .map((font) => `family=${font.replace(/\s+/g, '+')}:wght@400;600;700`)
    .join('&')

  return `https://fonts.googleapis.com/css2?${families}&display=swap`
}
