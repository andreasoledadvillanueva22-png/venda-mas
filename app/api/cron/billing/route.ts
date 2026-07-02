import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET?.trim()

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = new Date()
  const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const { data: expiringSubscriptions, error: expiringError } = await admin
    .from('subscriptions')
    .select('id, store_id, current_period_end, detailed_status')
    .eq('detailed_status', 'active')
    .lte('current_period_end', inSevenDays.toISOString())
    .gt('current_period_end', now.toISOString())

  if (expiringError) {
    console.error('[Cron Billing] Error fetching expiring subscriptions:', expiringError.message)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  console.log(`[Cron Billing] Found ${expiringSubscriptions?.length ?? 0} expiring subscriptions`)

  const { data: expiredSubscriptions, error: expiredError } = await admin
    .from('subscriptions')
    .select('id, store_id')
    .eq('detailed_status', 'active')
    .lt('current_period_end', now.toISOString())

  if (expiredError) {
    console.error('[Cron Billing] Error fetching expired subscriptions:', expiredError.message)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  let expiredCount = 0

  for (const subscription of expiredSubscriptions ?? []) {
    const { error: updateError } = await admin
      .from('subscriptions')
      .update({ detailed_status: 'past_due' })
      .eq('id', subscription.id)
      .eq('store_id', subscription.store_id)

    if (updateError) {
      console.error('[Cron Billing] Error marking past_due:', updateError.message)
      continue
    }

    expiredCount += 1
    console.log(`[Cron Billing] Subscription ${subscription.id} marked as past_due`)
  }

  return NextResponse.json({
    success: true,
    expiringCount: expiringSubscriptions?.length ?? 0,
    expiredCount,
  })
}
