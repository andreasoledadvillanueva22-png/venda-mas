export type {
  MercadoPagoStore,
  MercadoPagoCredentials,
  MercadoPagoPreferenceResponse,
} from '@/lib/payments/mercadopago/credentials'

export {
  isPlatformTestMode,
  isMercadoPagoTestMode,
  mpConfig,
  resolveStoreMercadoPagoCredentials,
  resolvePlatformMercadoPagoCredentials,
  getMercadoPagoInitPoint,
  getPlatformAccessTokensForWebhook,
  getMercadoPagoAccessToken,
  getMercadoPagoPublicKey,
} from '@/lib/payments/mercadopago/credentials'

export type {
  MercadoPagoPreferenceItem,
  MercadoPagoPreferencePayload,
  MercadoPagoPayment,
  MercadoPagoErrorResponse,
} from '@/lib/payments/mercadopago/types'

export { createMercadoPagoPreference } from '@/lib/payments/mercadopago/preferences-api'

export {
  fetchMercadoPagoPayment,
  getMercadoPagoPaymentMetadataValue,
  isSubscriptionPayment,
} from '@/lib/payments/mercadopago/payments'

export { mercadoPagoProvider, createPreference } from '@/lib/payments/mercadopago/preferences'

export { debugMercadoPagoCredentials } from '@/lib/payments/mercadopago/debug'

export type {
  PaymentProvider,
  CreatePreferenceParams,
  CreatePreferenceResult,
  WebhookResult,
} from '@/lib/payments/provider'

export { dispatchWebhook } from '@/lib/payments/dispatcher'
