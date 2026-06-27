# VendaMás SaaS - Contexto del Proyecto

**Última actualización:** 13/06/2026

## Estado Actual
✅ **Deploy en producción:** https://venda-mas.vercel.app  
✅ **Base de datos:** Supabase (`syxgovzmpzbymilsmdvi`)  
✅ **Repositorio:** GitHub (`andreasoledadvillanueva22-png/venda-mas`)  
✅ **E2E automatizado:** `scripts/e2e-register-checkout.mjs` — **12/12 OK** (13/06/2026)

## Tiendas de Referencia

| Tienda | Slug | Storefront | MP configurado |
|--------|------|------------|----------------|
| Andrea | `andrea-tienda` | ✅ `?store=andrea-tienda` | ✅ `APP_USR-` (OAuth producción) |
| Hector (HRF) | `hector` | ✅ `?store=hector` | ❌ Pendiente (TEST- manual mañana) |

**Nota:** `?store=andrea` devuelve "Tienda no encontrada" — el slug correcto es `andrea-tienda` (no cambiar).

## Funcionalidades Implementadas

### ✅ Completas y Funcionando
- [x] Registro de usuarios con onboarding automático (`POST /api/auth/onboarding`)
- [x] Creación automática de tiendas (slug único, editable desde admin)
- [x] Admin dashboard con datos reales (no mock)
- [x] CRUD de productos (con imágenes, precios, stock)
- [x] Gestión de órdenes (listado, filtros, detalle, `is_guest`)
- [x] Gestión de clientes
- [x] Settings: configuración de envíos (umbral gratis, costo estándar, express)
- [x] Settings: credenciales de Mercado Pago (por tienda, acepta `APP_USR-` y `TEST-`)
- [x] Settings: footer dinámico (email, teléfono, WhatsApp, redes)
- [x] Settings: testimonios por tienda (tabla `testimonials` + RLS)
- [x] Settings: retiro en local, transferencia bancaria
- [x] Storefront multi-tenant (`?store=SLUG`, cookie `storefront_slug`, middleware)
- [x] Storefront: header/footer/testimonials por tienda (sin hardcode)
- [x] Storefront: catálogo, carrito, checkout invitado
- [x] Checkout: Mercado Pago (Checkout Pro), transferencia, efectivo
- [x] Webhooks: Mercado Pago multi-tenant por token de tienda
- [x] Multi-tenancy: aislamiento completo por tienda (RLS en Supabase)

### 🟡 Implementadas pero Pendientes de Activar / Validar
- [ ] Dominio personalizado `andreatiendaonline.com` (DNS en Cloudflare, pendiente verificar en Vercel)
- [ ] Subdominios wildcard `*.vendemas.app` (pendiente comprar dominio)
- [ ] Sandbox MP completo en Hector (credenciales `TEST-` — configuración manual pendiente)
- [ ] Validación manual: pago sandbox → webhook → `status=paid` → admin orders

### ❌ Pendientes de Implementar
- [ ] Landing page de marketing en `vendemas.app`
- [ ] Email transaccional (confirmación de compra, recuperación de contraseña)
- [ ] SEO y meta tags dinámicos por tienda (parcial: layout storefront ya usa nombre de tienda)
- [ ] Términos y condiciones / política de privacidad
- [ ] Selector multi-tienda en admin
- [ ] Sistema de planes/precios
- [ ] Analytics avanzado
- [ ] Notificaciones push para nuevas órdenes

## Validación E2E — 13/06/2026

### Script automatizado
```bash
node scripts/e2e-register-checkout.mjs
```

Variables opcionales:
- `E2E_BASE_URL` — default `https://venda-mas.vercel.app`
- `E2E_STORE_SLUG` — default `andrea-tienda` (mañana: `hector`)
- `E2E_SKIP_REGISTRATION=1` — solo checkout + MP
- `E2E_SKIP_CLEANUP=1` — conservar usuario de prueba

### Resultado (12/12 ✅)
| Paso | Resultado |
|------|-----------|
| Registro Supabase + profile + store | ✅ |
| Login post-registro | ✅ |
| Checkout guest (`is_guest=true`) | ✅ |
| Preferencia MP + `pending_payment` | ✅ |
| Storefront `?store=hector` | ✅ multi-tenant OK |
| Storefront `?store=andrea-tienda` | ✅ |
| Storefront slug inválido | ✅ "Tienda no encontrada" |

### Orden de prueba en producción (conservar)
- **Tienda:** Andrea (`andrea-tienda`)
- **Orden ID:** `f2b26ab8-c5cb-4ade-a417-dd9a2ad75c0e`
- **Cliente:** Comprador Invitado E2E
- **Estado:** `pending_payment` (preferencia MP creada, pago no completado)

### Fixes desplegados (commit `5729630`)
- WhatsApp del hero usa `store.footerWhatsapp` (no hardcode)
- Hero image: filtra URLs no directas (`ibb.co/...` → placeholder)
- Pop-ups de compra: texto genérico (sin nombres fake)
- Metadata root: "VendaMás" + metadata por tenant en storefront layout

## Loop de Validación — Mañana (Hector + TEST-)

**Prerequisitos manuales (Hector, admin → Settings):**
1. Cargar **Public Key** y **Access Token** que empiecen con `TEST-`
2. (Opcional) Configurar `footer_whatsapp` para botón WhatsApp en hero
3. Corregir `hero_image_url` si sigue siendo link de página (`ibb.co/...` → URL directa `i.ibb.co/...` o Supabase Storage)

**Checklist sandbox completo:**
1. `E2E_STORE_SLUG=hector E2E_SKIP_REGISTRATION=1 node scripts/e2e-register-checkout.mjs`
   - Esperar: `TEST- (sandbox)` + `sandbox_init_point` en initPoint
2. Abrir `initPoint` en browser → pagar con [tarjetas de prueba MP](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards)
3. Verificar redirect a `/storefront/order-confirmation?order_id=...&status=approved`
4. Verificar webhook: orden pasa a `paid` en admin → Orders
5. Confirmar `is_guest=true` y datos del comprador invitado

**URLs a verificar:**
- https://venda-mas.vercel.app/storefront?store=hector
- https://venda-mas.vercel.app/storefront/checkout?store=hector

## Problemas Conocidos y Soluciones

### 1. Mercado Pago: Error "credenciales de prueba" / autopago
**Causa:** Pagar con la misma cuenta que creó la app o credenciales mezcladas prod/test.  
**Solución:** Usar cuenta compradora distinta; en sandbox usar solo tokens `TEST-`.

### 2. `.env.local` vs credenciales por tienda
**Causa:** `NEXT_MP_CLIENT_SECRET` es OAuth de la **app**, no el token de cobro de cada tienda.  
**Solución:** MP se configura en `stores.mp_access_token` / `stores.mp_public_key` vía admin o OAuth connect.

### 3. Slug incorrecto en URLs
**Causa:** `?store=andrea` no existe; slug real es `andrea-tienda`.  
**Solución:** Usar slug exacto de la tabla `stores`.

### 4. Carrito congelado en móvil
**Solución:** ✅ Corregido (drawer con portal, z-index)

### 5. Admin mostraba datos mock
**Solución:** ✅ Corregido (`lib/admin-dashboard.ts`)

## Migraciones SQL

Ejecutar en Supabase SQL Editor (orden recomendado):

1. `supabase/add_guest_checkout_support.sql`
2. `supabase/add_custom_domain_to_stores.sql`
3. `supabase/fix_multitenant_rls.sql`
4. `supabase/add_local_pickup_to_stores.sql`
5. `supabase/add_bank_details_to_stores.sql`
6. `supabase/add_storefront_content.sql` — footer columns + tabla `testimonials` + RLS

**Verificación rápida:**
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'stores' AND column_name LIKE 'footer_%';
SELECT COUNT(*) FROM testimonials;
```

## Próximos Pasos (Priorizados)

### Prioridad 1: Sandbox Hector (MAÑANA)
1. Configurar credenciales `TEST-` en admin de Hector
2. Ejecutar loop sandbox (script + pago manual + webhook)
3. Confirmar orden `paid` en admin

### Prioridad 2: Dominio y Branding
1. Comprar `vendemas.app` o similar
2. DNS wildcard + Vercel
3. Landing page SaaS

### Prioridad 3: Profesionalización
1. Email transaccional (Resend/SendGrid)
2. Términos y condiciones
3. SEO completo por tienda

## Credenciales y Accesos

### Supabase
- **Dashboard:** https://supabase.com/dashboard/project/syxgovzmpzbymilsmdvi
- **Project ID:** `syxgovzmpzbymilsmdvi`

### Vercel
- **Proyecto:** venda-mas
- **URL:** https://venda-mas.vercel.app
- **Webhook MP:** `https://venda-mas.vercel.app/api/webhooks/mercadopago`

### Mercado Pago
- **App OAuth Client ID:** `7658886029761092`
- **Tokens de cobro:** por tienda en `stores` (no en `.env.local`)

### Dominios
- **andreatiendaonline.com:** Cloudflare, pendiente verificación Vercel
- **vendemas.app:** pendiente de comprar

## Notas Importantes

1. **NUNCA** commitear `.env.local` (está en `.gitignore`)
2. Variables de entorno en Vercel: Production, Preview, Development
3. Configurar `NEXT_PUBLIC_APP_URL=https://venda-mas.vercel.app` en Vercel para `back_urls` de MP en producción
4. Checkout invitado: `is_guest = true`, `profile_id = null`
5. Slug Andrea: **`andrea-tienda`** (definitivo, no renombrar a `andrea`)

## Historial de Cambios Recientes

- **13/06/2026:** E2E 12/12 — script `scripts/e2e-register-checkout.mjs`, fixes storefront (WhatsApp, hero, metadata, pop-ups)
- **13/06/2026:** Deploy producción (`5729630` — chore: E2E validation + minor fixes)
- **13/06/2026:** Slug editable, testimonios/footer dinámicos, fix multi-tenancy storefront
- 26/06/2026: Checkout como invitado
- 26/06/2026: Dashboard admin con datos reales
- 26/06/2026: Webhook MP multi-tenant
- 25/06/2026: Retiro en local, transferencia bancaria
