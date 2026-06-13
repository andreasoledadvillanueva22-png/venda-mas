import { completeUserOnboarding } from '@/lib/onboarding'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type OnboardingBody = {
  fullName?: string
  storeName?: string
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  let body: OnboardingBody = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
  }

  const result = await completeUserOnboarding(user, {
    fullName: body.fullName,
    storeName: body.storeName,
  })

  if (!result.success) {
    const status = result.error === 'Datos de onboarding incompletos' ? 400 : 500
    return NextResponse.json({ error: result.error }, { status })
  }

  return NextResponse.json({
    success: true,
    storeId: result.storeId,
    slug: result.slug,
  })
}
