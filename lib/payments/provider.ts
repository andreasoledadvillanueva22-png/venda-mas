export interface CreatePreferenceParams {
  items: Array<{
    title: string
    quantity: number
    unit_price: number
    currency_id: string
  }>
  payer?: {
    name?: string
    email?: string
  }
  back_urls: {
    success: string
    failure: string
    pending: string
  }
  external_reference?: string
  metadata?: Record<string, string>
  notification_url?: string
}

export interface CreatePreferenceResult {
  preferenceId: string
  initPoint: string
  sandboxInitPoint?: string
  isTestMode: boolean
}

export interface PaymentInfo {
  id: string
  status: string
  amount: number
  currency: string
  metadata?: Record<string, unknown>
}

export interface WebhookPayload {
  type: string
  data: {
    id: string
  }
}

export interface WebhookResult {
  success: boolean
  action?: 'activate_plan' | 'cancel_plan' | 'update_payment' | 'ignore'
  errorMessage?: string
}

export interface RefundResult {
  success: boolean
  refundId?: string
}

export interface PaymentProvider {
  createPreference(params: CreatePreferenceParams): Promise<CreatePreferenceResult>
  getPayment(paymentId: string): Promise<PaymentInfo | null>
  processWebhook(payload: WebhookPayload): Promise<WebhookResult>
  refund(paymentId: string, amount?: number): Promise<RefundResult>
}
