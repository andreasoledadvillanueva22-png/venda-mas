# VendaMás SaaS - Contexto del Proyecto

**Última actualización:** 29/06/2026 - Mediodía

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
- [x] CRUD de productos (con imágenes, precios, stock, descuentos, video)
- [x] Gestión de órdenes (listado, filtros, detalle, estados) - aislamiento verificado
- [x] Gestión de clientes
- [x] Settings: configuración de envíos (umbral gratis, costo estándar, express)
- [x] Settings: credenciales de Mercado Pago (por tienda, acepta TEST- y APP_USR-)
- [x] Settings: retiro en local (habilitar, dirección, horarios, instrucciones)
- [x] Settings: transferencia bancaria (banco, CBU, alias, titular, CUIT)
- [x] Settings: footer del storefront (email, teléfono, WhatsApp, dirección, redes)
- [x] Settings: testimonios de clientes (CRUD por tienda)
- [x] Settings: favicon configurable por tienda
- [x] Settings: pop-ups de urgencia ficticios (CRUD, máximo 10 mensajes por tienda)
- [x] Storefront: página principal con hero, productos destacados, categorías
- [x] Storefront: catálogo de productos con filtros
- [x] Storefront: página de producto individual (con video, reseñas, breadcrumbs)
- [x] Storefront: carrito de compras (funciona en móvil)
- [x] Storefront: botón "Comprar ahora" (agrega al carrito y va al checkout)
- [x] Storefront: checkout como invitado (sin login)
- [x] Storefront: botón flotante de WhatsApp (por tienda, configurable)
- [x] Storefront: pop-up de urgencia ficticio (rotación cada 5-8 segundos)
- [x] Checkout: envío a domicilio (estándar, express, gratis por umbral)
- [x] Checkout: retiro en local (costo $0)
- [x] Checkout: pago por Mercado Pago (Checkout Pro)
- [x] Checkout: pago por transferencia bancaria (muestra datos bancarios)
- [x] Webhooks: Mercado Pago actualiza estado de órdenes
- [x] Multi-tenancy: aislamiento completo por tienda (RLS en Supabase)
- [x] Middleware: detección de subdominios y dominios personalizados
- [x] Header/footer dinámicos por tienda
- [x] Metadata SEO dinámica por tienda (title, description)
- [x] Logo dinámico en admin (iniciales del nombre de tienda)
- [x] Reseñas importadas de productos (Mercado Libre, Amazon, AliExpress, manual)
- [x] Video de producto (YouTube, Vimeo, MP4 directo)
- [x] Prueba E2E automática: 12/12 pasos OK

###  Implementadas pero Pendientes de Configurar
- [ ] Pop-ups ficticios: configurar 10 mensajes en admin de Hector
- [ ] Video de producto: probar con URL de YouTube en un producto de Hector
- [ ] Reseñas importadas: probar agregando 2-3 reseñas a un producto de Hector
- [ ] Dominio personalizado `andreatiendaonline.com` (DNS configurado en Cloudflare)
- [ ] Subdominios wildcard `*.vendemas.app` (pendiente comprar dominio)
- [ ] Email transaccional con Resend

### ❌ Pendientes de Implementar
- [ ] Estructura mejorada de descripción de producto (bullets, specs técnicas)
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
**Solución:** Agregar validación en admin que detecte y corrija automáticamente

### 2. Cursor se cierra por OOM (Out Of Memory)
**Causa:** PC de oficina con RAM limitada
**Solución:** Cerrar Chrome y otras apps antes de usar Cursor. Usar prompts más cortos.

### 3. Permisos RLS en tablas nuevas
**Causa:** Supabase no otorga GRANT automáticamente en tablas nuevas
**Solución:** Siempre agregar GRANT para `authenticated` y `anon` en migraciones SQL

## Migraciones SQL Ejecutadas
- [x] `add_guest_checkout_support.sql`
- [x] `add_custom_domain_to_stores.sql`
- [x] `fix_multitenant_rls.sql`
- [x] `add_storefront_content.sql` (testimonios, footer)
- [x] `add_favicon_to_stores.sql`
- [x] `add_fake_purchase_notifications.sql` (pop-ups ficticios)
- [x] `add_product_video_and_reviews.sql` (video y reseñas)
- [x] `fix_fake_purchase_notifications_rls.sql` (permisos RLS)

## Próximos Pasos (Priorizados)

### PRIORIDAD ALTA (esta tarde)
1. **Verificar logo dinámico** en admin de Andrea y Hector
2. **Configurar 10 mensajes ficticios** en admin de Hector
3. **Probar video de producto** (agregar URL de YouTube a un producto)
4. **Probar reseñas importadas** (agregar 2-3 reseñas a un producto)
5. **Prueba sandbox MP completa** con credenciales TEST- en Hector

### PRIORIDAD MEDIA (esta semana)
6. **Email transaccional** con Resend (confirmación de compra, nueva orden)
7. **Dominio vendemas.app** (comprar en Cloudflare ~$20/año)
8. **DNS wildcard** `*.vendemas.app` en Cloudflare
9. **Agregar dominios en Vercel** (vendemas.app, www.vendemas.app, *.vendemas.app)
10. **Landing page de marketing** en dominio raíz
11. **Página de pricing** (Free, Pro, Enterprise)
12. **SEO básico** (meta tags dinámicos, sitemap.xml, robots.txt)
13. **Estructura mejorada de descripción de producto** (bullets, specs)

### PRIORIDAD BAJA (mes 2)
14. **Sistema de planes y cobro de suscripciones**
15. **Analytics avanzado** (gráficos, conversión, LTV)
16. **Cupones y descuentos**
17. **Integración con envíos** (Andreani, Correo Argentino)
18. **App móvil para vendedores**
19. **API pública**
20. **Multi-idioma y multi-moneda**

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
7. Los pop-ups de urgencia usan datos ficticios configurables (10 mensajes por tienda)
8. Los productos pueden tener video (YouTube embed, Vimeo o URL directa de mp4)
9. Las reseñas pueden importarse de Mercado Libre, Amazon o AliExpress (manual o automático)
10. El logo del admin muestra las iniciales del nombre de la tienda (dinámico)

## Historial de Cambios Recientes

- 29/06/2026: Logo dinámico en admin header (iniciales de tienda)
- 29/06/2026: Pop-ups de urgencia ficticios (CRUD, 10 mensajes por tienda)
- 29/06/2026: Video de producto (YouTube, Vimeo, MP4)
- 29/06/2026: Reseñas importadas (Mercado Libre, Amazon, AliExpress, manual)
- 29/06/2026: Fix permisos RLS para tabla fake_purchase_notifications
- 29/06/2026: Verificación de aislamiento de Orders (8 órdenes reales de Hector)
- 27/06/2026: Favicon configurable por tienda
- 27/06/2026: Botón flotante de WhatsApp por tienda
- 27/06/2026: Pop-up de urgencia con datos reales de compradores
- 27/06/2026: Prueba E2E automática 12/12 pasos OK
- 26/06/2026: Implementado checkout como invitado (sin login)
- 26/06/2026: Corregido bug del carrito en móvil
- 26/06/2026: Corregido botón "Comprar ahora"
- 26/06/2026: Dashboard admin con datos reales
- 26/06/2026: Webhook de MP multi-tenant
- 26/06/2026: Testimonios y footer dinámicos por tienda
- 26/06/2026: Slug de tienda editable desde admin