import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY?.trim()
const fromEmail = process.env.FROM_EMAIL?.trim() ?? 'noreply@vendemas.app'

function getResendClient() {
  if (!resendApiKey) {
    return null
  }

  return new Resend(resendApiKey)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}

function emailShell(title: string, body: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); border-radius: 16px 16px 0 0; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${title}</h1>
      </div>
      <div style="background: #ffffff; border-radius: 0 0 16px 16px; padding: 24px; color: #1e293b;">
        ${body}
      </div>
    </div>
  `
}

export async function sendOrderConfirmationEmail({
  to,
  orderNumber,
  total,
  items,
  storeName,
}: {
  to: string
  orderNumber: string
  total: number
  items: Array<{ name: string; quantity: number; price: number }>
  storeName: string
}) {
  const resend = getResendClient()

  if (!resend) {
    console.warn('[Email] RESEND_API_KEY no configurada, omitiendo confirmación de compra')
    return null
  }

  const itemsHtml = items
    .map(
      (item) =>
        `<li style="margin-bottom: 8px;">${item.name} x${item.quantity} — ${formatCurrency(item.price)}</li>`,
    )
    .join('')

  const html = emailShell(
    '¡Gracias por tu compra!',
    `
      <p>Tu orden <strong>#${orderNumber.slice(0, 8).toUpperCase()}</strong> fue confirmada en <strong>${storeName}</strong>.</p>
      <h2 style="color: #1e40af; font-size: 18px;">Resumen</h2>
      <ul style="padding-left: 20px;">${itemsHtml}</ul>
      <p style="font-size: 18px; font-weight: bold; color: #1e40af;">Total: ${formatCurrency(total)}</p>
      <p style="color: #64748b;">Te avisaremos cuando tu pedido sea enviado.</p>
    `,
  )

  const { data, error } = await resend.emails.send({
    from: `${storeName} <${fromEmail}>`,
    to: [to],
    subject: `Confirmación de tu compra #${orderNumber.slice(0, 8).toUpperCase()}`,
    html,
  })

  if (error) {
    throw error
  }

  return data
}

export async function sendWaitlistConfirmationEmail(to: string) {
  const resend = getResendClient()

  if (!resend) {
    console.warn('[Email] RESEND_API_KEY no configurada, omitiendo confirmación de waitlist')
    return null
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '') ??
    'https://venda-mas.vercel.app'

  const html = emailShell(
    '¡Gracias por unirte!',
    `
      <p>Registramos tu email en la lista de acceso anticipado de VendaMás.</p>
      <p>Te avisaremos cuando lancemos oficialmente para que puedas crear tu tienda online sin comisiones por venta.</p>
      <p>Mientras tanto, visitá nuestro blog con tips para vender más:</p>
      <p><a href="${siteUrl}/blog" style="color: #2563eb; font-weight: bold;">${siteUrl}/blog</a></p>
    `,
  )

  const { data, error } = await resend.emails.send({
    from: `VendaMás <${fromEmail}>`,
    to: [to],
    subject: '¡Bienvenido/a a VendaMás!',
    html,
  })

  if (error) {
    throw error
  }

  return data
}
