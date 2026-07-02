export { getMercadoPagoOAuthConfig } from '@/lib/payments/mercadopago/client'

/**
 * OAuth de tiendas: el flujo HTTP vive en app/api/mercadopago/auth/route.ts.
 * Usá getMercadoPagoOAuthConfig() para leer clientId, clientSecret y redirectUri.
 */
