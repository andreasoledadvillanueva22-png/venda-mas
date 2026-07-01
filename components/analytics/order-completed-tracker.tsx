'use client'

import { useEffect, useRef } from 'react'
import { trackEvent } from '@/lib/posthog'

type OrderCompletedTrackerProps = {
  orderId: string
  storeId?: string
  total?: number
  paymentMethod?: string | null
  source?: string
}

export function OrderCompletedTracker({
  orderId,
  storeId,
  total,
  paymentMethod,
  source = 'order_confirmation',
}: OrderCompletedTrackerProps) {
  const tracked = useRef(false)

  useEffect(() => {
    if (!orderId || tracked.current) {
      return
    }

    tracked.current = true
    trackEvent('order_completed', {
      order_id: orderId,
      store_id: storeId,
      total,
      payment_method: paymentMethod,
      source,
    })
  }, [orderId, storeId, total, paymentMethod, source])

  return null
}
