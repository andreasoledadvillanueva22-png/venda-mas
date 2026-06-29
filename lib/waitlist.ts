const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeWaitlistEmail(value: string): string {
  return value.trim().toLowerCase()
}

export function isValidWaitlistEmail(value: string): boolean {
  const email = normalizeWaitlistEmail(value)
  return email.length <= 320 && EMAIL_REGEX.test(email)
}

export function isDuplicateWaitlistError(message: string): boolean {
  const normalized = message.toLowerCase()
  return (
    normalized.includes('duplicate key') ||
    normalized.includes('unique constraint') ||
    normalized.includes('waitlist_email_key')
  )
}
