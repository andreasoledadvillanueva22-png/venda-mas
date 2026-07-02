import { createAdminClient } from '@/lib/supabase/admin'

type RecordPaymentEventParams = {
  storeId: string
  subscriptionId?: string | null
  providerPaymentId: string
  amount: number
  currency: string
  status: string
  rawResponse: unknown
  paidAt?: string | null
}

export async function recordPaymentEvent(params: RecordPaymentEventParams): Promise<void> {
  try {
    const admin = createAdminClient()

    const { error } = await admin.from('payments').upsert(
      {
        store_id: params.storeId,
        subscription_id: params.subscriptionId ?? null,
        provider: 'mercadopago',
        provider_payment_id: params.providerPaymentId,
        amount: params.amount,
        currency: params.currency,
        status: params.status,
        paid_at: params.paidAt ?? null,
        raw_response: params.rawResponse,
      },
      { onConflict: 'provider_payment_id' },
    )

    if (error) {
      console.warn('[Payments] No se pudo registrar pago (¿tabla payments creada?):', error.message)
    }
  } catch (error) {
    console.warn('[Payments] Error al registrar pago:', error)
  }
}
