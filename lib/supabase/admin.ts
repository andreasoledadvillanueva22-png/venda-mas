import { createClient } from '@supabase/supabase-js'

/**
 * Cliente con service role — solo usar en Route Handlers / Server Actions.
 * Bypass RLS para operaciones de onboarding (profile + store).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Faltan variables de entorno de Supabase (URL o SERVICE_ROLE_KEY)')
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
