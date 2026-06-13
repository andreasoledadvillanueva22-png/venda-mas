import { createServerClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export type Profile = {
  id: string
  email: string
  full_name: string | null
  store_name: string | null
  store_slug: string | null
  role: 'owner' | 'admin' | 'editor'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

/**
 * Cliente de Supabase para Server Components y Route Handlers.
 * Crear una instancia nueva en cada request (no usar variable global).
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // setAll puede fallar en Server Components; el middleware refresca la sesión.
          }
        },
      },
    },
  )
}

export async function getUser(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(
      'id, email, full_name, store_name, store_slug, role, avatar_url, created_at, updated_at',
    )
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile) {
    return null
  }

  return profile as Profile
}
