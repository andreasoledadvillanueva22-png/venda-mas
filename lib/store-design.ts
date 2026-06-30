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

export type PredefinedTheme = {
  id: string
  name: string
  description: string
  colors: ThemeColors
  previewColors: [string, string, string]
}

export const PREDEFINED_THEMES: PredefinedTheme[] = [
  {
    id: 'moderno',
    name: 'Moderno',
    description: 'Rojo y blanco',
    colors: {
      primary: '#DC2626',
      secondary: '#1E293B',
      background: '#FFFFFF',
      text: '#111827',
    },
    previewColors: ['#DC2626', '#ffffff', '#111827'],
  },
  {
    id: 'elegante',
    name: 'Elegante',
    description: 'Negro y dorado',
    colors: {
      primary: '#1E293B',
      secondary: '#F59E0B',
      background: '#F8F1E5',
      text: '#111827',
    },
    previewColors: ['#111827', '#F59E0B', '#F8F1E5'],
  },
  {
    id: 'natural',
    name: 'Natural',
    description: 'Verde y beige',
    colors: {
      primary: '#16A34A',
      secondary: '#FEF3C7',
      background: '#FFFFFF',
      text: '#2D5C45',
    },
    previewColors: ['#16A34A', '#F5F5DC', '#2D5C45'],
  },
  {
    id: 'minimalista',
    name: 'Minimalista',
    description: 'Gris y blanco',
    colors: {
      primary: '#64748B',
      secondary: '#F8FAFC',
      background: '#FFFFFF',
      text: '#020617',
    },
    previewColors: ['#475569', '#F8FAFC', '#020617'],
  },
]

export function parseThemeColors(value: unknown): ThemeColors {
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
