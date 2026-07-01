# Prueba Sandbox — Mercado Pago

Guía para validar el checkout de punta a punta con credenciales **TEST** en VendaMás.

## 1. Configuración

### Variables de entorno (`.env.local` y Vercel)

```env
MP_ACCESS_TOKEN_TEST=TEST-xxxxxxxxxxxxx
MP_PUBLIC_KEY_TEST=TEST-xxxxxxxxxxxxx
```

Opcional para producción de la plataforma:

```env
MP_ACCESS_TOKEN_PROD=APP_USR-xxxxxxxxxxxxx
MP_PUBLIC_KEY_PROD=APP_USR-xxxxxxxxxxxxx
```

### SQL en Supabase

Ejecutá `supabase/add_store_test_mode.sql`:

```sql
ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_test_mode BOOLEAN DEFAULT FALSE;
```

### Activar modo prueba (tienda de Hector)

1. Entrá a **Admin → Settings**
2. Activá el toggle **Modo prueba**
3. Guardá los cambios

Con modo prueba activo, el checkout usa `MP_ACCESS_TOKEN_TEST` / `MP_PUBLIC_KEY_TEST` si están configuradas.

Alternativa: cargá credenciales TEST manualmente en **Medios de Pago** (Public Key y Access Token que empiecen con `TEST-`).

## 2. Flujo E2E de prueba

1. Activá **Modo prueba** en Settings de la tienda de Hector
2. Abrí el storefront: `/storefront?store=hrf-repuestos` (o el slug correspondiente)
3. Agregá un producto al carrito
4. Completá el checkout con datos de prueba
5. Elegí pago con tarjeta (checkout integrado)
6. Verificá que la orden quede en estado `pending_payment`
7. Completá el pago con tarjeta de prueba
8. El webhook debe actualizar la orden a `paid`
9. El cliente recibe email de confirmación (si `RESEND_API_KEY` está configurada)

## 3. Tarjetas de prueba

| Resultado   | Número              | CVV | Vencimiento |
|------------|---------------------|-----|-------------|
| Aprobada   | 5031 7557 3453 0604 | 123 | 11/30       |
| Rechazada  | 4000 0000 0000 0002 | 123 | 11/30       |
| Pendiente  | 4000 0000 0000 0051 | 123 | 11/30       |

Nombre del titular: `APRO` (aprobada), `OTHE` (rechazada), `CONT` (pendiente).

Documento: cualquier DNI de prueba (ej. `12345678`).

## 4. Webhook

Configurá en el panel de Mercado Pago la URL:

```
https://venda-mas.vercel.app/api/webhooks/mercadopago
```

En local podés usar ngrok o similar para recibir notificaciones.

## 5. Verificación

- [ ] Toggle **Modo prueba** visible en Settings
- [ ] Checkout redirige a sandbox cuando hay credenciales TEST
- [ ] Orden creada con `pending_payment`
- [ ] Pago aprobado → orden `paid`
- [ ] Email de confirmación enviado (Resend)

## 6. Suscripciones de plan (VendaMás)

Los pagos de plan usan credenciales de **plataforma** (`MP_ACCESS_TOKEN_*`), no las de la tienda.

Desde `/pricing`, botón **Elegir plan** → preferencia MP → webhook activa `stores.plan_id` y crea registro en `subscriptions`.
