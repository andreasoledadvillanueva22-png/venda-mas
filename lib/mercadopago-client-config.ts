/**
 * Configuración pública de Mercado Pago (segura para componentes cliente).
 * Mantener sincronizado con MP_MODE en el servidor.
 */
export const mpClientConfig = {
  isTestMode: process.env.NEXT_PUBLIC_MP_MODE?.trim().toLowerCase() === 'test',
}
