import { createClient } from '@/lib/supabase/server'
import {
  isDuplicateWaitlistError,
  isValidWaitlistEmail,
  normalizeWaitlistEmail,
} from '@/lib/waitlist'
import { NextRequest, NextResponse } from 'next/server'

type WaitlistRequestBody = {
  email?: string
}

export async function POST(request: NextRequest) {
  let body: WaitlistRequestBody

  try {
    body = (await request.json()) as WaitlistRequestBody
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
  }

  const rawEmail = body.email?.trim() ?? ''

  if (!rawEmail) {
    return NextResponse.json({ error: 'El email es obligatorio' }, { status: 400 })
  }

  if (!isValidWaitlistEmail(rawEmail)) {
    return NextResponse.json({ error: 'Ingresá un email válido' }, { status: 400 })
  }

  const email = normalizeWaitlistEmail(rawEmail)
  const supabase = await createClient()

  const { error: insertError } = await supabase.from('waitlist').insert({ email })

  if (insertError) {
    if (insertError.code === '23505' || isDuplicateWaitlistError(insertError.message)) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 },
      )
    }

    return NextResponse.json(
      { error: 'No se pudo registrar el email. Intentá de nuevo.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}
