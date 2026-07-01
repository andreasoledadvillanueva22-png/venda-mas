# Monitoreo — VendaMás

Guía de configuración de herramientas de observabilidad para el MVP en producción.

## Sentry (errores y performance)

1. Crear proyecto en [sentry.io](https://sentry.io) → plataforma **Next.js**
2. Copiar el **DSN** al entorno:

```env
NEXT_PUBLIC_SENTRY_DSN=https://...@....ingest.sentry.io/...
SENTRY_AUTH_TOKEN=...        # Solo si subís source maps
SENTRY_ORG=tu-org
SENTRY_PROJECT=nombre-exacto-en-sentry
SENTRY_UPLOAD_SOURCE_MAPS=true  # Opcional: omitir si el proyecto aún no existe
```

El build **no falla** si `SENTRY_UPLOAD_SOURCE_MAPS` no está en `true`: Sentry sigue capturando errores en runtime vía DSN, pero no intenta subir source maps durante el deploy.

3. Archivos de configuración:
   - `sentry.client.config.ts` / `sentry.server.config.ts` / `sentry.edge.config.ts`
   - `instrumentation.ts` + `instrumentation-client.ts`
   - `lib/sentry.ts` — helpers `captureError`, `setUser`

Sentry solo se activa en **producción** si el DSN está definido.

## PostHog (analytics de producto)

1. Crear proyecto en [posthog.com](https://posthog.com)
2. Variables:

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com
```

3. Provider en `components/providers/posthog-provider.tsx`
4. Helpers en `lib/posthog.ts` y `lib/posthog-server.ts`

### Eventos trackeados

| Evento | Ubicación |
|--------|-----------|
| `user_registered` | Registro |
| `store_created` | Onboarding post-registro |
| `product_created` | Admin → nuevo producto |
| `checkout_started` | Checkout (al cargar con carrito) |
| `order_completed` | Confirmación de pedido |
| `waitlist_joined` | Formulario waitlist |
| `plan_selected` | Pricing cards |

En desarrollo, PostHog hace **opt-out** automático para no contaminar datos.

## Health check (UptimeRobot)

Endpoint: `GET /api/health`

Respuesta OK:

```json
{ "status": "ok", "timestamp": "...", "database": "connected" }
```

### Configuración manual en UptimeRobot

1. Crear cuenta en [uptimerobot.com](https://uptimerobot.com)
2. **Monitor 1:** `https://venda-mas.vercel.app` — HTTP(s), intervalo 5 min
3. **Monitor 2:** `https://venda-mas.vercel.app/api/health` — HTTP(s), intervalo 5 min
4. Alertas por email

## Snyk (seguridad de dependencias)

```bash
npx snyk auth
npm run snyk:test
npm run snyk:monitor
```

## Variables en Vercel

En **Settings → Environment Variables**, agregar para Production y Preview:

- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
