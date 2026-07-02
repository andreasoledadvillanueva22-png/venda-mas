export type MercadoPagoPreferenceItem = {
  title: string
  quantity: number
  unit_price: number
  currency_id: string
}

export type MercadoPagoPreferencePayload = {
  items: MercadoPagoPreferenceItem[]
  payer?: {
    name?: string
    email?: string
    phone?: { number: string }
  }
  back_urls?: {
    success: string
    failure: string
    pending: string
  }
  auto_return?: 'approved'
  external_reference?: string
  metadata?: Record<string, string>
  notification_url?: string
}

export type MercadoPagoPayment = {
  id: number
  status: string
  external_reference?: string | null
  metadata?: Record<string, unknown> | null
  transaction_amount?: number
  currency_id?: string
}

export type MercadoPagoErrorResponse = {
  message?: string
  error?: string
  cause?: Array<{ description?: string }>
}
