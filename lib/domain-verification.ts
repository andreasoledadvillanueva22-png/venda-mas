import { resolveCname, resolveTxt } from 'node:dns/promises'
import { getDomainTxtHost, getDomainTxtValue } from '@/lib/custom-domain'

export type DomainVerificationResult = {
  verified: boolean
  txtVerified: boolean
  routingHint: 'cname' | 'apex' | 'unknown'
  message: string
}

export async function verifyDomainDns(
  domain: string,
  token: string,
): Promise<DomainVerificationResult> {
  const txtHost = getDomainTxtHost(domain)
  const expectedTxt = getDomainTxtValue(token)
  let txtVerified = false

  try {
    const txtRecords = await resolveTxt(txtHost)
    const flatRecords = txtRecords.map((record) => record.join(''))
    txtVerified = flatRecords.some(
      (record) => record === expectedTxt || record.includes(expectedTxt),
    )
  } catch {
    txtVerified = false
  }

  let routingHint: DomainVerificationResult['routingHint'] = 'unknown'

  try {
    await resolveCname(`www.${domain}`)
    routingHint = 'cname'
  } catch {
    routingHint = 'apex'
  }

  if (!txtVerified) {
    return {
      verified: false,
      txtVerified: false,
      routingHint,
      message:
        'No encontramos el registro TXT de verificación. Revisá que hayas creado el registro y esperá unos minutos a que propague el DNS.',
    }
  }

  return {
    verified: true,
    txtVerified: true,
    routingHint,
    message: 'Dominio verificado correctamente. Vercel emitirá el certificado SSL automáticamente.',
  }
}

export type VercelDomainResult =
  | { ok: true }
  | { ok: false; error: string }
  | { skipped: true }

export async function registerDomainWithVercel(domain: string): Promise<VercelDomainResult> {
  const token = process.env.VERCEL_TOKEN?.trim()
  const projectId = process.env.VERCEL_PROJECT_ID?.trim()

  if (!token || !projectId) {
    return { skipped: true }
  }

  const domainsToRegister = [domain, `www.${domain}`]

  for (const domainName of domainsToRegister) {
    const response = await fetch(
      `https://api.vercel.com/v10/projects/${projectId}/domains`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: domainName }),
      },
    )

    if (response.ok) {
      continue
    }

    const payload = (await response.json()) as { error?: { message?: string } }

    if (payload.error?.message?.includes('already exists')) {
      continue
    }

    return {
      ok: false,
      error: payload.error?.message ?? `No se pudo registrar ${domainName} en Vercel.`,
    }
  }

  return { ok: true }
}

export async function removeDomainFromVercel(domain: string): Promise<void> {
  const token = process.env.VERCEL_TOKEN?.trim()
  const projectId = process.env.VERCEL_PROJECT_ID?.trim()

  if (!token || !projectId) {
    return
  }

  for (const domainName of [domain, `www.${domain}`]) {
    await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/domains/${encodeURIComponent(domainName)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
  }
}
