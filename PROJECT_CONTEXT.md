# VendaMás SaaS - Contexto del Proyecto

**Última actualización:** 02/07/2026 - Mediodía
**Estado:** Producción Activa - Dominio propio + Sistema TEST/PRODUCCIÓN MP implementado + Debug de pago en curso

## 1. Resumen Ejecutivo
VendaMás es una plataforma SaaS multi-tenant para crear tiendas online sin comisiones por venta. Permite a los usuarios gestionar productos, órdenes, envíos y cobros con múltiples medios de pago. Cuenta con dominio propio (vendemas.app), landing page de alta conversión, blog SEO con 6 artículos, pricing con comparativa vs competencia, admin personalizado, storefront dinámico, sistema completo de monitoreo, emails transaccionales con Resend y sistema de credenciales TEST/PRODUCCIÓN para Mercado Pago.

## 2. Estado Actual
- **URL Producción:** https://vendemas.app (dominio propio)
- **URL Fallback:** https://venda-mas.vercel.app (sigue funcionando)
- **Base de Datos:** Supabase (syxgovzmpzbymilsmdivi)
- **Repositorio:** GitHub (andreasoledadvillanueva22-png/venda-mas)
- **Tiendas Activas:** 2 (Andrea: `andrea-tienda`, Hector: `hector`)
- **Estética:** 100% unificada (Azul degradado, Glassmorphism, Logo oficial)
- **Slogan:** "Vendé online sin comisiones. Para siempre."
- **Dominio:** vendemas.app (comprado en Cloudflare, conectado a Vercel)
- **Emails:** Resend verificado con vendamas.app (noreply@vendamas.app)
- **Monitoreo:** PostHog ✅, Sentry ✅, UptimeRobot ✅
- **Mercado Pago:** Sistema TEST/PRODUCCIÓN implementado, debug de pago en curso

## 3. Funcionalidades Implementadas (Status: ✅)

### Core & Infraestructura
- [x] Multi-tenancy completo con RLS (Supabase)
- [x] Registro y onboarding de usuarios
- [x] Dashboard de Admin (KPIs, navegación)
- [x] Checkout como invitado (Guest Checkout) - 5 pasos visuales premium
- [x] Integración Mercado Pago (Producción + Sandbox)
- [x] Sistema de credenciales TEST/PRODUCCIÓN con variable MP_MODE
- [x] Badge visual de modo prueba en UI
- [x] Efectivo contra entrega (toggle por tienda)
- [x] Webhooks de pago (estructura lista, pendiente validación)
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
- [ ]  Email de prueba NO llegó (pendiente debuggear)

### Componentes UI
- [x] Button (variantes: default, outline, secondary, ghost)
- [x] Card (rounded-2xl, sombra brand, hover)
- [x] Input (rounded-xl, focus ring brand)
- [x] Badge (success, warning, info, destructive)
- [x] Table (header brand-50, hover suave)
- [x] Banner de modo prueba (mp-test-mode-banner.tsx)

## 4. Pendientes (Priorizados)

### PRIORIDAD ALTA (Críticos para lanzar)
- [ ] **Debuggear error de pago en Sandbox:** Error "Una de las partes es de prueba" al intentar pagar. Posibles causas: variables de entorno no aplicadas, sesión de MP en navegador, o código no usando credenciales TEST
- [ ] **Debuggear emails de Resend:** El email de prueba no llegó. Revisar logs de Resend, verificar API key, revisar código de envío
- [ ] **Validar flujo completo de suscripción:** Pago → Webhook → Activación de plan → Email de confirmación
- [ ] **Variables de entorno en Vercel:** Verificar que MP_MODE=test y NEXT_PUBLIC_MP_MODE=test estén configuradas

### PRIORIDAD MEDIA
- [ ] **Wildcard DNS:** Configurar registro `*.vendemas.app` en Cloudflare para subdominios de tiendas
- [ ] **Soporte CSV** para importar reseñas masivamente
- [ ] **Imágenes reales:** Reemplazar placeholders de Unsplash con fotos reales de emprendedores
- [ ] **Redirects** para slugs viejos del blog (si se compartieron links)
- [ ] **Verificar sitemap.xml** en producción (accesible y con todas las URLs)

### PRIORIDAD BAJA
- [ ] Integración logística (Andreani/Correo)
- [ ] App móvil para vendedores
- [ ] Analytics avanzado (gráficos de conversión, LTV)
- [ ] Múltiples billeteras (Modo, Ualá, etc.)
- [ ] Investigación de competencia (Tienda Nube, Pistacho, Empretienda)
- [ ] Estrategia de marketing para waitlist (copys, imágenes, calendario editorial)
- [ ] Login con Google (OAuth)

## 5. Arquitectura Técnica
- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS (v4)
- **Backend:** Server Actions, API Routes
- **DB:** Supabase (Postgres)
- **Estilos:** Componentes UI reutilizables con variantes premium
- **Colores:** `brand-50` a `brand-900` (Azul), `accent` (Rojo para CTA)
- **Logo:** https://i.ibb.co/rr2Wc9x/vendamas-logo.png
- **Dominio:** vendemas.app (Cloudflare → Vercel)
- **Emails:** Resend (noreply@vendamas.app)
- **Pagos:** Mercado Pago (Sistema TEST/PRODUCCIÓN con MP_MODE)

## 6. Historial Reciente
- **02/07/2026 - Mediodía:** Sistema TEST/PRODUCCIÓN de MP implementado con badge visual
- **02/07/2026 - Mediodía:** Debug de error "Una de las partes es de prueba" en Sandbox
- **02/07/2026 - Mañana:** Dominio vendemas.app comprado en Cloudflare y conectado a Vercel
- **02/07/2026 - Mañana:** Resend verificado con vendamas.app, FROM_EMAIL actualizado
- **02/07/2026 - Madrugada:** Blog SEO completo (6 artículos, meta tags, JSON-LD, CTAs, imágenes corregidas)
- **02/07/2026 - Madrugada:** Loop completo implementado (Sandbox MP, emails Resend, sitemap/robots, suscripciones)
- **01/07/2026 - Noche:** Monitoreo completo (PostHog, Sentry, UptimeRobot)
- **01/07/2026 - Noche:** Rediseño inspirado en Tienda Nube (Landing, Pricing, Blog)
- **01/07/2026 - Tarde:** Página de Pricing con 4 planes + tabla comparativa
- **01/07/2026 - Tarde:** Íconos de redes sociales en footer
- **01/07/2026 - Mañana:** Carrusel de reseñas + importación masiva + efectivo contra entrega

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
| RESEND_API_KEY | re_xxxxx | ⚠️ Verificar |
| FROM_EMAIL | noreply@vendamas.app | ✅ Configurada |
| NEXT_MP_CLIENT_ID | 7658886029761092 | ✅ Configurada (producción) |
| NEXT_MP_CLIENT_SECRET | APP_USR-... | ✅ Configurada (producción) |
| NEXT_MP_REDIRECT_URI | https://vendemas.app/api/mercadopago/auth | ✅ Configurada |
| MP_ACCESS_TOKEN_TEST | TEST-... | ✅ Configurada |
| MP_PUBLIC_KEY_TEST | TEST-... | ✅ Configurada |
| MP_MODE | test | ⚠️ Verificar |
| NEXT_PUBLIC_MP_MODE | test | ⚠️ Verificar |

## 10. Reglas de Desarrollo
1. **No romper multi-tenancy:** Siempre filtrar por `store_id`
2. **Seguridad:** No commitear `.env.local`. Usar variables de Vercel
3. **Calidad:** TypeScript estricto. `npm run build` debe pasar antes de deployar
4. **Diseño:** Mantener coherencia con estética "Premium/Glass" (azul degradado)
5. **Performance:** Usar `next/image` para optimización de imágenes
6. **Slogan:** Nunca mencionar "Mercado Pago" en textos de marketing (solo en configuración técnica)
7. **Contenido:** Español rioplatense, tono cercano y práctico
8. **Modo prueba:** Usar MP_MODE=test para pruebas, production para producción