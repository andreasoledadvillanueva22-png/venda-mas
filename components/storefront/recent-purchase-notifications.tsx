'use client'

import { CheckCircle2 } from 'lucide-react'
import type { StorefrontRecentPurchase } from '@/lib/storefront'

const POPUP_ROTATION_SECONDS = 20
const POPUP_VISIBLE_SECONDS = 5

type RecentPurchaseNotificationsProps = {
  notifications: StorefrontRecentPurchase[]
}

function formatMinutesAgo(minutes: number): string {
  if (minutes <= 0) {
    return 'un momento'
  }
  if (minutes === 1) {
    return '1 minuto'
  }
  return `${minutes} minutos`
}

export function RecentPurchaseNotifications({ notifications }: RecentPurchaseNotificationsProps) {
  if (notifications.length === 0) {
    return null
  }

  const cycleDurationSeconds = notifications.length * POPUP_ROTATION_SECONDS
  const visibleKeyframePercent = (POPUP_VISIBLE_SECONDS / cycleDurationSeconds) * 100

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes recentPurchasePopup {
              0%, ${visibleKeyframePercent}% {
                opacity: 1;
                transform: translateY(0);
                visibility: visible;
              }
              ${visibleKeyframePercent + 0.01}%, 100% {
                opacity: 0;
                transform: translateY(16px);
                visibility: hidden;
              }
            }
            .recent-purchase-notification {
              animation: recentPurchasePopup ${cycleDurationSeconds}s infinite;
            }
          `,
        }}
      />
      <div className="pointer-events-none fixed bottom-6 left-4 z-40 h-28 w-[min(calc(100vw-2rem),20rem)] sm:left-6">
        {notifications.map((purchase, index) => (
          <div
            key={purchase.id}
            className="recent-purchase-notification pointer-events-none absolute inset-x-0 bottom-0 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
            style={{ animationDelay: `${index * POPUP_ROTATION_SECONDS}s` }}
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              <p className="text-sm leading-snug text-slate-700">
                <span className="font-semibold text-slate-900">{purchase.customerFirstName}</span> de{' '}
                <span className="font-semibold text-slate-900">{purchase.customerCity}</span> compró{' '}
                <span className="font-semibold text-slate-900">{purchase.productName}</span> hace{' '}
                {formatMinutesAgo(purchase.minutesAgo)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
