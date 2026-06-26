export type OnboardingResponse =
  | { success: true; storeId: string; slug: string }
  | { success?: false; error?: string }

export async function completeOnboardingRequest(
  payload: { fullName?: string; storeName?: string } = {},
): Promise<OnboardingResponse> {
  const response = await fetch('/api/auth/onboarding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return (await response.json()) as OnboardingResponse
}
