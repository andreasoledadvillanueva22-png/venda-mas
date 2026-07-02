# Guía de pruebas de pagos en VendaMás

## Requisitos previos

1. Tener cuenta en Mercado Pago Developers
2. Tener la aplicación **VendaMas SaaS** creada
3. Tener credenciales TEST configuradas en Vercel:
   - `MP_MODE=test`
   - `NEXT_PUBLIC_MP_MODE=test`
   - `MP_ACCESS_TOKEN_TEST` = Access Token de la pestaña **Prueba**
   - `MP_PUBLIC_KEY_TEST` = Public Key de la pestaña **Prueba**

## Paso 0: Crear cuentas de prueba en MP Developers

1. Ir a [developers.mercadopago.com.ar](https://developers.mercadopago.com.ar/panel/app)
2. Entrar a la aplicación **VendaMas SaaS**
3. Menú izquierdo → **PRUEBAS** → **Cuentas de prueba**
4. Crear un usuario **Vendedor** (si no existe)
5. Crear un usuario **Comprador** (si no existe)
6. Las credenciales `APP_USR-` de la pestaña **Prueba** pertenecen al vendedor TEST

## Paso 1: Preparar el navegador

1. Cerrar **todas** las sesiones de Mercado Libre y Mercado Pago:
   - [mercadopago.com.ar](https://www.mercadopago.com.ar) → Cerrar sesión
   - [mercadolibre.com.ar](https://www.mercadolibre.com.ar) → Cerrar sesión
2. Abrir una ventana de incógnito (`Ctrl+Shift+N`)
3. **No** entrar a Mercado Libre ni Mercado Pago con tu cuenta real en esa ventana

## Paso 2: Loguearse en VendaMás

1. Ir a [https://vendemas.app/auth/login](https://vendemas.app/auth/login)
2. Loguearse con cuenta de prueba (Andrea o Hector)
3. Ir a [/pricing](https://vendemas.app/pricing)
4. Verificar que aparezca el banner amarillo **"Modo prueba activo"**

## Paso 3: Iniciar el pago

1. Elegir un plan (ej: Emprendedor)
2. Ser redirigido a Mercado Pago Sandbox
3. Verificar la etiqueta amarilla **"Sandbox"** arriba a la izquierda
4. La URL debe contener `sandbox.mercadopago.com`

## Paso 4: Loguearse con comprador TEST

1. **No** usar cuenta real de Mercado Pago
2. Usar las credenciales del comprador TEST de MP Developers → Cuentas de prueba
3. Si pide código de verificación, usar el que aparece en el panel de Developers

## Paso 5: Pagar con tarjeta TEST

| Campo | Valor |
|-------|-------|
| Número | 5031 7557 3453 0604 |
| Nombre | APRO |
| Vencimiento | 11/2030 |
| CVV | 123 |
| DNI | 12345678 |

## Tarjetas de prueba disponibles

| Resultado | Número | Titular |
|-----------|--------|---------|
| Aprobada | 5031 7557 3453 0604 | APRO |
| Contingencia | 4000 0000 0000 0002 | CONT |
| Rechazada (fondos) | 4000 0000 0000 0006 | OTHE |

## Verificación técnica (local)

```bash
npm run test:mp
```

Debe mostrar `selected initPoint` con URL `sandbox.mercadopago.com`.

## Logs en Vercel

Después de intentar un pago, revisar logs de la función `/api/subscriptions/create-preference`:

- `MERCADO PAGO CREDENTIALS DEBUG`
- `isTestMode: true`
- `Redirecting to: https://sandbox.mercadopago.com...`

## Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Una de las partes... es de prueba" | Mezcla test/prod o sesión MP real abierta | Incógnito + comprador TEST + `MP_MODE=test` |
| No aparece banner amarillo | `NEXT_PUBLIC_MP_MODE` no es `test` | Configurar en Vercel y redeploy |
| No hay sandbox_init_point | Credenciales TEST inválidas | Regenerar en pestaña Prueba de MP |
