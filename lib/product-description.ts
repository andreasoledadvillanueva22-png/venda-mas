export const MAX_PRODUCT_DESCRIPTION_HTML_LENGTH = 15000

export function stripHtmlToPlainText(html: string): string {
  return html
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getProductDescriptionExcerpt(
  html: string | null | undefined,
  maxLength = 160,
): string {
  if (!html?.trim()) {
    return ''
  }

  const plain = stripHtmlToPlainText(html)
  if (plain.length <= maxLength) {
    return plain
  }

  return `${plain.slice(0, maxLength - 3).trim()}...`
}

export function isEmptyProductDescription(html: string | null | undefined): boolean {
  if (!html?.trim()) {
    return true
  }

  return stripHtmlToPlainText(html).length === 0
}
