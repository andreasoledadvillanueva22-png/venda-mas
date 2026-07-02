# VendaMás SaaS - Contexto del Proyecto

**Última actualización:** 03/07/2026 - Noche
**Estado:** Producción Activa - Arquitectura de pagos implementada, debug de checkout sandbox en curso

## 1. Resumen Ejecutivo
VendaMás es una plataforma SaaS multi-tenant para crear tiendas online sin comisiones por venta. Permite a los usuarios gestionar productos, órdenes, envíos y cobros con múltiples medios de pago. Cuenta con dominio propio (vendemas.app), landing page de alta conversión, blog SEO con 6 artículos, pricing con comparativa vs competencia, admin personalizado, storefront dinámico, sistema completo de monitoreo, emails transaccionales con Resend y arquitectura de pagos profesional con capa de abstracción PaymentProvider.

## 2. Estado Actual
- **URL Producción:** https://vendemas.app (dominio propio)
- **URL Fallback:** https://venda-mas.vercel.app (sigue funcionando)
- **Base de Datos:** Supabase (syxgovzmpzbymilsmdivi)
- **Repositorio:** GitHub (andreasoledadvillanueva22-png/venda-mas)
- **Tiendas Activas:** 2 (Andrea: `andrea-tienda`, Hector: `hector`)
- **Estética:** 100% unificada (Azul degradado, Glassmorphism, Logo oficial)
- **Slogan:** "Vendé online sin comisiones. Para siempre."
- **Dominio:** vendemas.app (comprado en Cloudflare, conectado a Vercel)
- **Emails:** Resend verificado con vendamas.app (noreply@vendamas.app) - API key placeholder pendiente
- **Monitoreo:** PostHog ✅, Sentry ✅, UptimeRobot ✅
- **Pagos:** Arquitectura profesional implementada (4 fases), checkout sandbox en debug

## 3. Funcionalidades Implementadas (Status: ✅)

### Core & Infraestructura
- [x] Multi-tenancy completo con RLS (Supabase)
- [x] Registro y onboarding de usuarios
- [x] Dashboard de Admin (KPIs, navegación)
- [x] Checkout como invitado (Guest Checkout) - 5 pasos visuales premium
- [x] Integración Mercado Pago con arquitectura profesional (PaymentProvider)
- [x] Sistema de credenciales TEST/PRODUCCIÓN con variable MP_MODE
- [x] Capa de abstracción de pagos (PaymentProvider interface)
- [x] Dispatcher de webhooks unificado con logging
- [x] Tabla payments (historial de pagos)
- [x] Tabla webhook_logs (debug de webhooks)
- [x] Estados de suscripción expandidos (trial, active, past_due, grace_period, cancelled, expired)
- [x] Cron jobs para renovación diaria
- [x] Badge visual de modo prueba en UI
- [x] Efectivo contra entrega (toggle por tienda)
- [x] Webhooks de pago (estructura lista, pendiente validación E2E)
- [x] Dominios personalizados (estructura lista, pendiente DNS wildcard)
- [x] Sistema de planes y suscripciones (Free, Emprendedor, Negocio, Empresa)
- [x] Endpoint `/api/health` para monitoreo
- [x] Dominio propio vendemas.app configurado en Cloudflare + Vercel
- [x] Emails transaccionales con Resend (dominio verificado)

### Storefront (Tienda)
- [x] Diseño Premium: Header glassmorphism, cards redondeadas, footer elegante
- [x] Colores dinámicos por tienda (temas predefinidos + personalización)
- [x] Catálogo de productos con filtros y categorías
- [x] Página de producto detallada (Video, Reseñas en carrusel, Compartir)
- [x] Botón flotante de WhatsApp por tienda
- [x] Pop-ups de urgencia ficticios (configurables, máximo 10 por tienda)
- [x] Favicon y Logo dinámicos por tienda
- [x] Botón "Compartir" en redes con Open Graph tags
- [x] Carrusel automático de reseñas (5 seg, fotos, origen)
- [x] Footer con "Powered by VendaMás" e íconos de redes sociales
- [x] Newsletter integrado en footer

### Admin Panel
- [x] Diseño Premium: Sidebar glass, fondo azul suave, tablas estilizadas
- [x] CRUD de Productos (Editor TipTap, Video, Imágenes)
- [x] Botones de acciones: Duplicar, Activar/Desactivar, Eliminar (con confirmación)
- [x] Gestión de Órdenes (Estados, Filtros)
- [x] Configuración de Tienda (Envíos, Pagos, Footer, Testimonios, Pop-ups, Redes sociales)
- [x] Gestión de Reseñas (Importación masiva por texto, fotos opcionales)
- [x] Design Page: 4 temas predefinidos + personalización de colores + tipografía
- [x] Marketing Page: Gestión de descuentos/cupones
- [x] Páginas Analytics, Design, Marketing unificadas
- [x] Botón "Ver mi tienda" en header y sidebar
- [x] Sección "Mi plan" en Settings
- [x] Toggle "Modo prueba" para credenciales TEST de Mercado Pago

### Marketing & Landing
- [x] Landing Page con waitlist funcional (rediseñada inspirada en Tienda Nube)
- [x] Hero con badge "0% comisión", imagen de emprendedor, CTA input+botón
- [x] Carrusel de logos de clientes (scroll infinito)
- [x] 3 feature cards grandes
- [x] Sección de blog preview
- [x] CTA final emocional
- [x] Página de Pricing con 4 planes y toggle mensual/anual
- [x] Checkmarks grandes y visibles en pricing
- [x] Badge "50% más barato que Tienda Nube" en plan Emprendedor
- [x] Tabla comparativa con competencia (Tienda Nube, Empretienda)
- [x] Página de Blog con 6 artículos SEO-friendly (800-1200 palabras c/u)
- [x] Meta tags dinámicos + Schema.org JSON-LD en artículos
- [x] CTAs internos hacia waitlist en cada artículo
- [x] Newsletter signup en página principal del blog
- [x] Imágenes relevantes de Unsplash con alt descriptivo
- [x] Sitemap.xml dinámico generado automáticamente
- [x] Robots.txt configurado
- [x] Slogan: "Vendé online sin comisiones. Para siempre."
- [x] CTA: "Crear tienda gratis"
- [x] Diseño unificado (Azul degradado, tipografía bold)
- [x] Logo oficial integrado en toda la app
- [x] Auth Pages (Login/Register) con estilo glassmorphism

### Monitoreo & Seguridad
- [x] PostHog: Analytics de producto, funnels, grabación de sesiones (región US Cloud)
- [x] Sentry: Errores en tiempo real, performance (proyecto: venda-mas)
- [x] UptimeRobot: 2 monitores (main + health check) cada 5 min
- [x] Snyk: Scripts de seguridad de dependencias

### Emails Transaccionales
- [x] Resend integrado con dominio vendamas.app verificado
- [x] FROM_EMAIL configurado: noreply@vendamas.app
- [x] Template de confirmación de compra implementado
- [x] Template de bienvenida para waitlist implementado
- [ ] RESEND_API_KEY es placeholder - necesita key real de Resend

### Arquitectura de Pagos (NUEVO)
- [x] Interfaz PaymentProvider (lib/payments/provider.ts)
- [x] Dispatcher de webhooks (lib/payments/dispatcher.ts)
- [x] Registro de pagos (lib/payments/payment-records.ts)
- [x] Cliente MP refactorizado (lib/payments/mercadopago/client.ts)
- [x] Preferencias MP (lib/payments/mercadopago/preferences.ts)
- [x] Webhooks MP (lib/payments/mercadopago/webhooks.ts)
- [x] OAuth MP (lib/payments/mercadopago/oauth.ts)
- [x] Debug helper (lib/payments/mercadopago/debug.ts)
- [x] Guía de pruebas (docs/TESTING_PAYMENTS.md)
- [x] Cron de billing (app/api/cron/billing/route.ts)
- [x] vercel.json con cron configurado
- [ ] Checkout sandbox NO funciona aún - login de MP detecta sesión real

### Componentes UI
- [x] Button (variantes: default, outline, secondary, ghost)
- [x] Card (rounded-2xl, sombra brand, hover)
- [x] Input (rounded-xl, focus ring brand)
- [x] Badge (success, warning, info, destructive)
- [x] Table (header brand-50, hover suave)
- [x] Banner de modo prueba (mp-test-mode-banner.tsx)

## 4. Pendientes (Priorizados)

### PRIORIDAD ALTA (Críticos para lanzar)
- [ ] **Debug checkout sandbox:** El login de Mercado Pago detecta la sesión real del usuario y redirige a mercadopago.com.ar en vez de sandbox.mercadopago.com.ar. El email del comprador TEST no es aceptado. Posibles soluciones: (1) usar "Tarjeta" sin loguearse, (2) verificar que la preferencia use sandbox_init_point correctamente, (3) revisar si el problema es del lado de MP.
- [ ] **RESEND_API_KEY real:** La key actual es placeholder. Generar nueva en resend.com/api-keys.
- [ ] **Validar flujo completo E2E:** Pago → Webhook → Tabla payments → Activación de plan → Email
- [ ] **Pagos fallidos de Andrea Tienda Online:** Hay pagos pendientes fallidos que necesitan revisión.

### PRIORIDAD MEDIA
- [ ] **Wildcard DNS:** Configurar registro `*.vendemas.app` en Cloudflare para subdominios de tiendas
- [ ] **Sign out de Mercado Pago no funciona:** El botón de cerrar sesión en el checkout no funciona correctamente
- [ ] **Soporte CSV** para importar reseñas masivamente
- [ ] **Imágenes reales:** Reemplazar placeholders de Unsplash con fotos reales de emprendedores
- [ ] **Redirects** para slugs viejos del blog
- [ ] **Verificar sitemap.xml** en producción

### PRIORIDAD BAJA (Roadmap futuro)
- [ ] OAuth para que cada tienda conecte su propio Mercado Pago
- [ ] Integración logística (Andreani/Correo)
- [ ] App móvil para vendedores
- [ ] Analytics avanzado (gráficos de conversión, LTV)
- [ ] Login con Google (OAuth)
- [ ] Estrategia de marketing para waitlist
- [ ] Expansión a otros países (Chile, Uruguay, Paraguay)

## 5. Arquitectura Técnica
- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS (v4)
- **Backend:** Server Actions, API Routes
- **DB:** Supabase (Postgres)
- **Estilos:** Componentes UI reutilizables con variantes premium
- **Colores:** `brand-50` a `brand-900` (Azul), `accent` (Rojo para CTA)
- **Logo:** https://i.ibb.co/rr2Wc9x/vendamas-logo.png
- **Dominio:** vendemas.app (Cloudflare → Vercel)
- **Emails:** Resend (noreply@vendamas.app)
- **Pagos:** Mercado Pago con capa de abstracción PaymentProvider

## 6. Historial Reciente
- **03/07/2026 - Noche:** Arquitectura de pagos profesional implementada (4 fases completas)
- **03/07/2026 - Noche:** Tablas payments, webhook_logs creadas en Supabase
- **03/07/2026 - Noche:** Cron de billing configurado en vercel.json
- **03/07/2026 - Noche:** Debug checkout sandbox - login MP detecta sesión real
- **02/07/2026 - Tarde:** ChatGPT analizó el problema de MP y recomendó arquitectura profesional
- **02/07/2026 - Tarde:** Loop completo de arquitectura de pagos implementado en Cursor
- **02/07/2026 - Mediodía:** Sistema TEST/PRODUCCIÓN de MP implementado con badge visual
- **02/07/2026 - Mañana:** Dominio vendemas.app comprado en Cloudflare y conectado a Vercel
- **02/07/2026 - Mañana:** Resend verificado con vendamas.app
- **02/07/2026 - Madrugada:** Blog SEO completo (6 artículos)
- **01/07/2026 - Noche:** Monitoreo completo (PostHog, Sentry, UptimeRobot)
- **01/07/2026 - Noche:** Rediseño inspirado en Tienda Nube

## 7. Costos Operativos (estimados)
| Servicio | Plan Free | Plan Pro (escala) |
|----------|-----------|-------------------|
| Vercel | $0 | $20 USD/mes |
| Supabase | $0 | $25 USD/mes |
| Dominio .app | $14.20/año | $14.20/año |
| Resend | $0 (3000 emails) | $20 USD/mes |
| PostHog | $0 (1M eventos) | $20 USD/mes |
| Sentry | $0 (5K errores) | $26 USD/mes |
| UptimeRobot | $0 (50 monitores) | $7 USD/mes |
| **TOTAL** | **~$14.20 USD/año** | **~$130.000 ARS/mes** |

## 8. Pricing Implementado
| Plan | Precio ARS/mes | Precio ARS/año | Productos | Órdenes/mes |
|------|----------------|----------------|-----------|-------------|
| Gratis | $0 | $0 | 10 | 20 |
| Emprendedor | $9.900 | $99.000 | 50 | 200 |
| Negocio | $19.900 | $199.000 | 200 | 1000 |
| Empresa | $39.900 | $399.000 | Ilimitado | Ilimitado |

## 9. Variables de Entorno (Vercel)
| Variable | Valor | Estado |
|----------|-------|--------|
| NEXT_PUBLIC_SENTRY_DSN | https://789ea43d... | ✅ Configurada |
| SENTRY_AUTH_TOKEN | sntrys_eyJ... | ✅ Configurada |
| SENTRY_ORG | vendamas | ✅ Configurada |
| SENTRY_PROJECT | venda-mas | ✅ Configurada |
| NEXT_PUBLIC_POSTHOG_KEY | phc_A2yRan... | ✅ Configurada |
| NEXT_PUBLIC_POSTHOG_HOST | https://us.posthog.com | ✅ Configurada |
| RESEND_API_KEY | re_placeholder | ❌ Placeholder, necesita key real |
| FROM_EMAIL | noreply@vendamas.app | ✅ Configurada |
| NEXT_MP_CLIENT_ID | 7658886029761092 | ✅ Configurada (producción) |
| NEXT_MP_CLIENT_SECRET | APP_USR-... | ✅ Configurada (producción) |
| NEXT_MP_REDIRECT_URI | https://vendemas.app/api/mercadopago/auth | ✅ Configurada |
| MP_ACCESS_TOKEN_TEST | APP_USR-c05... (pestaña Prueba) | ✅ Configurada |
| MP_PUBLIC_KEY_TEST | APP_USR-c05... (pestaña Prueba) | ✅ Configurada |
| MP_MODE | test | ✅ Configurada |
| NEXT_PUBLIC_MP_MODE | test | ✅ Configurada |
| CRON_SECRET | vendas_cron_2026_xK9mP3nQ7wR2tY5uI8oA1sD4fG6hJ0 | ✅ Configurada |

## 10. Reglas de Desarrollo
1. **No romper multi-tenancy:** Siempre filtrar por `store_id`
2. **Seguridad:** No commitear `.env.local`. Usar variables de Vercel
3. **Calidad:** TypeScript estricto. `npm run build` debe pasar antes de deployar
4. **Diseño:** Mantener coherencia con estética "Premium/Glass" (azul degradado)
5. **Performance:** Usar `next/image` para optimización de imágenes
6. **Slogan:** Nunca mencionar "Mercado Pago" en textos de marketing
7. **Contenido:** Español rioplatense, tono cercano y práctico
8. **Modo prueba:** Usar MP_MODE=test para pruebas, production para producción
9. **Arquitectura de pagos:** Usar capa PaymentProvider, no acoplar a MP directamente