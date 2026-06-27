# VendaMás SaaS - Contexto del Proyecto

**Última actualización:** 27/06/2026 - Tarde

## Estado Actual
✅ **Deploy en producción:** https://venda-mas.vercel.app
✅ **Base de datos:** Supabase (syxgovzmpzbymilsmdivi)
✅ **Repositorio:** GitHub (andreasoledadvillanueva22-png/venda-mas)
✅ **Tiendas activas:** 2 (Andrea: `andrea-tienda`, Hector: `hector`)

## Funcionalidades Implementadas

### ✅ Completas y Funcionando
- [x] Registro de usuarios con onboarding automático
- [x] Creación automática de tiendas (slug único, editable)
- [x] Admin dashboard con datos reales (no mock)
- [x] CRUD de productos (con imágenes, precios, stock, descuentos)
- [x] Gestión de órdenes (listado, filtros, detalle, estados)
- [x] Gestión de clientes
- [x] Settings: configuración de envíos (umbral gratis, costo estándar, express)
- [x] Settings: credenciales de Mercado Pago (por tienda, acepta TEST- y APP_USR-)
- [x] Settings: retiro en local (habilitar, dirección, horarios, instrucciones)
- [x] Settings: transferencia bancaria (banco, CBU, alias, titular, CUIT)
- [x] Settings: footer del storefront (email, teléfono, WhatsApp, dirección, redes)
- [x] Settings: testimonios de clientes (CRUD por tienda)
- [x] Settings: favicon configurable por tienda
- [x] Storefront: página principal con hero, productos destacados, categorías
- [x] Storefront: catálogo de productos con filtros
- [x] Storefront: página de producto individual (con breadcrumbs, descuento, descripción)
- [x] Storefront: carrito de compras (funciona en móvil)
- [x] Storefront: botón "Comprar ahora" (agrega al carrito y va al checkout)
- [x] Storefront: checkout como invitado (sin login)
- [x] Storefront: botón flotante de WhatsApp (por tienda, configurable)
- [x] Checkout: envío a domicilio (estándar, express, gratis por umbral)
- [x] Checkout: retiro en local (costo $0)
- [x] Checkout: pago por Mercado Pago (Checkout Pro)
- [x] Checkout: pago por transferencia bancaria (muestra datos bancarios)
- [x] Webhooks: Mercado Pago actualiza estado de órdenes
- [x] Multi-tenancy: aislamiento completo por tienda (RLS en Supabase)
- [x] Middleware: detección de subdominios y dominios personalizados
- [x] Pop-up de urgencia con datos reales de compradores (pendiente cambiar a ficticio)
- [x] Header/footer dinámicos por tienda
- [x] Metadata SEO dinámica por tienda (title, description)
- [x] Prueba E2E automática: 12/12 pasos OK

### 🟡 Implementadas pero Pendientes de Activar
- [ ] Pop-up de urgencia con datos ficticios configurables (10 mensajes por tienda)
- [ ] Video del producto en página de producto
- [ ] Reseñas importadas de Mercado Libre / Amazon / AliExpress
- [ ] Dominio personalizado `andreatiendaonline.com` (DNS configurado en Cloudflare)
- [ ] Subdominios wildcard `*.vendemas.app` (pendiente comprar dominio)
- [ ] Email transaccional con Resend

### ❌ Pendientes de Implementar
- [ ] Estructura mejorada de descripción de producto (bullets, specs, video, reseñas)
- [ ] Landing page de marketing en `vendemas.app` (dominio raíz)
- [ ] Página de pricing (Free, Pro, Enterprise)
- [ ] Sistema de planes y cobro de suscripciones
- [ ] SEO avanzado (sitemap.xml, robots.txt, schema.org)
- [ ] Términos y condiciones / política de privacidad
- [ ] Selector multi-tienda en admin (si usuario tiene más de una tienda)
- [ ] Analytics avanzado (gráficos de ventas, conversión, LTV)
- [ ] Cupones y descuentos
- [ ] Integración con envíos (Andreani, Correo Argentino, Mercado Envíos)
- [ ] App móvil para vendedores
- [ ] API pública para desarrolladores
- [ ] Multi-idioma y multi-moneda

## Problemas Conocidos y Soluciones

### 1. URLs de imgbb incorrectas
**Causa:** Usuarios pegan URL de página (`ibb.co/xxx`) en lugar de URL directa (`i.ibb.co/xxx/imagen.jpg`)
**Solución:** Agregar validación en admin que detecte y corrija automáticamente, o mostrar instrucción clara

### 2. Descripción de productos sin estructura
**Causa:** Campo de texto libre sin secciones
**Solución pendiente:** Implementar estructura con bullets, specs, video, reseñas

### 3. Pop-up de urgencia con datos reales
**Causa:** Implementación inicial usaba órdenes reales
**Solución pendiente:** Cambiar a datos ficticios configurables por tienda (10 mensajes)

## Migraciones SQL Ejecutadas
- [x] `add_guest_checkout_support.sql`
- [x] `add_custom_domain_to_stores.sql`
- [x] `fix_multitenant_rls.sql`
- [x] `add_storefront_content.sql` (testimonios, footer)
- [x] `add_favicon_to_stores.sql`

## Próximos Pasos (Priorizados)

### PRIORIDAD ALTA (esta semana)
1. **Pop-up de urgencia ficticio** (10 mensajes por tienda, configurables desde admin)
2. **Video del producto** en página de producto (YouTube, Vimeo o URL directa)
3. **Reseñas importadas** de Mercado Libre / Amazon / AliExpress
4. **Prueba sandbox MP completa** con credenciales TEST- en Hector
5. **Email transaccional** con Resend (confirmación de compra, nueva orden)

### PRIORIDAD MEDIA (próxima semana)
6. **Dominio vendemas.app** (comprar en Cloudflare ~$20/año)
7. **DNS wildcard** `*.vendemas.app` en Cloudflare
8. **Agregar dominios en Vercel** (vendemas.app, www.vendemas.app, *.vendemas.app)
9. **Landing page de marketing** en dominio raíz
10. **Página de pricing** (Free, Pro, Enterprise)
11. **SEO básico** (meta tags dinámicos, sitemap.xml, robots.txt)
12. **Estructura mejorada de descripción de producto**

### PRIORIDAD BAJA (mes 2)
13. **Sistema de planes y cobro de suscripciones**
14. **Analytics avanzado** (gráficos, conversión, LTV)
15. **Cupones y descuentos**
16. **Integración con envíos** (Andreani, Correo Argentino)
17. **App móvil para vendedores**
18. **API pública**
19. **Multi-idioma y multi-moneda**

## Credenciales y Accesos

### Supabase
- **URL:** https://supabase.com/dashboard/project/syxgovzmpzbymilsmdivi
- **Project ID:** syxgovzmpzbymilsmdivi

### Vercel
- **Proyecto:** venda-mas
- **URL:** https://venda-mas.vercel.app
- **Account:** andreasoledadvillanueva22-png

### Mercado Pago
- **App:** Plataforma SaaS de e-commerce para tiendas online
- **Client ID (producción):** 7658886029761092
- **Public Key (producción):** APP_USR-cda5d23d-9f82-48b0-b2c2-faaa100d0091
- **Access Token:** (ver Vercel Environment Variables)

### Dominios
- **andreatiendaonline.com:** Comprado en Cloudflare, DNS configurado
- **vendemas.app:** Pendiente de comprar (~$20/año en Cloudflare)

### Tiendas de prueba
- **Andrea:** slug `andrea-tienda`, URL `?store=andrea-tienda`, MP producción configurado
- **Hector:** slug `hector`, URL `?store=hector`, MP sin configurar (pendiente TEST-)

## Notas Importantes

1. **NUNCA** commitear el archivo `.env.local` (está en `.gitignore`)
2. Las variables de entorno de Vercel deben estar en los 3 ambientes (Production, Preview, Development)
3. El webhook de MP debe apuntar a `https://venda-mas.vercel.app/api/webhooks/mercadopago`
4. Para probar pagos reales, usar cuenta DIFERENTE a la del vendedor (evitar autopago)
5. El checkout como invitado guarda `is_guest = true` y `profile_id = null` en orders
6. Los usuarios logueados tienen `is_guest = false` y `profile_id` con su UUID
7. Los pop-ups de urgencia deben usar datos ficticios realistas (no datos fake genéricos)
8. Cada tienda puede tener hasta 10 mensajes de urgencia configurables
9. Los productos pueden tener video (YouTube embed, Vimeo o URL directa de mp4)
10. Las reseñas pueden importarse de Mercado Libre, Amazon o AliExpress (manual o automático)

## Historial de Cambios Recientes

- 27/06/2026: Favicon configurable por tienda
- 27/06/2026: Botón flotante de WhatsApp por tienda
- 27/06/2026: Pop-up de urgencia con datos reales de compradores
- 27/06/2026: Prueba E2E automática 12/12 pasos OK
- 27/06/2026: Fixes de WhatsApp hardcodeado, hero roto, pop-ups fake, metadata global
- 26/06/2026: Implementado checkout como invitado (sin login)
- 26/06/2026: Corregido bug del carrito en móvil (drawer con portal, z-index)
- 26/06/2026: Corregido botón "Comprar ahora" (agrega al carrito y redirige)
- 26/06/2026: Dashboard admin con datos reales (no mock)
- 26/06/2026: Webhook de MP multi-tenant (verifica store_id)
- 26/06/2026: Testimonios y footer dinámicos por tienda
- 26/06/2026: Slug de tienda editable desde admin con validación
- 25/06/2026: Implementado retiro en local
- 25/06/2026: Implementado pago por transferencia bancaria
- 25/06/2026: Credenciales de MP actualizadas a producción