import { createAdminClient } from '@/lib/supabase/admin'
import { mercadoPagoProvider } from '@/lib/payments/mercadopago/preferences'
import type { WebhookResult } from '@/lib/payments/provider'

export async function logWebhookEvent(
  provider: string,
  eventType: string,
  payload: unknown,
): Promise<string | null> {
  try {
    const admin = createAdminClient()

    const { data, error } = await admin
      .from('webhook_logs')
      .insert({
        provider,
        event_type: eventType,
        payload,
        processed: false,
      })
      .select('id')
      .maybeSingle()

    if (error) {
      console.error('[Webhook] Error logging webhook:', error.message)
      return null
    }

    return data?.id ?? null
  } catch (error) {
    console.error('[Webhook] Error logging webhook:', error)
    return null
  }
}

export async function markWebhookProcessed(
  logId: string | null,
  processed: boolean,
  errorMessage?: string,
): Promise<void> {
  if (!logId) {
    return
  }

  try {
    const admin = createAdminClient()

    await admin
      .from('webhook_logs')
      .update({
        processed,
        error_message: errorMessage ?? null,
      })
      .eq('id', logId)
  } catch (error) {
    console.error('[Webhook] Error updating webhook log:', error)
  }
}

export async function dispatchWebhook(
  provider: string,
  eventType: string,
  payload: { type?: string; data?: { id?: string | number } },
): Promise<WebhookResult> {
  const logId = await logWebhookEvent(provider, eventType, payload)

  console.log('Webhook received:', {
    provider,
    type: eventType,
    data: payload.data,
  })

  if (provider !== 'mercadopago') {
    await markWebhookProcessed(logId, true)
    return { success: true, action: 'ignore' }
  }

  try {
    const result = await mercadoPagoProvider.processWebhook({
      type: eventType,
      data: {
        id: String(payload.data?.id ?? ''),
      },
    })

    await markWebhookProcessed(logId, result.success, result.errorMessage)
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado'
    await markWebhookProcessed(logId, false, message)
    return { success: false, errorMessage: message }
  }
}
