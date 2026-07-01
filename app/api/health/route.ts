import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const timestamp = new Date().toISOString()

  try {
    const admin = createAdminClient()
    const { error } = await admin.from('stores').select('id').limit(1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      status: 'ok',
      timestamp,
      database: 'connected',
    })
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        timestamp,
        message: 'Database connection failed',
      },
      { status: 503 },
    )
  }
}
