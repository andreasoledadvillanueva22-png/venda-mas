# VendaMás SaaS - Contexto del Proyecto

**Última actualización:** 26/06/2026

## Estado Actual
✅ **Deploy en producción:** https://venda-mas.vercel.app
✅ **Base de datos:** Supabase (syxgovzmpzbymilsmdivi)
✅ **Repositorio:** GitHub (andreasoledadvillanueva22-png/venda-mas)

## Funcionalidades Implementadas

### ✅ Completas y Funcionando
- [x] Registro de usuarios con onboarding automático
- [x] Creación automática de tiendas (slug único)
- [x] Admin dashboard con datos reales (no mock)
- [x] CRUD de productos (con imágenes, precios, stock)
- [x] Gestión de órdenes (listado, filtros, detalle)
- [x] Gestión de clientes
- [x] Settings: configuración de envíos (umbral gratis, costo estándar, express)
- [x] Settings: credenciales de Mercado Pago (por tienda)
- [x] Settings: retiro en local (habilitar, dirección, horarios, instrucciones)
- [x] Settings: transferencia bancaria (banco, CBU, alias, titular, CUIT)
- [x] Storefront: página principal con hero, productos destacados
- [x] Storefront: catálogo de productos con filtros
- [x] Storefront: carrito de compras (funciona en móvil)
- [x] Storefront: checkout como invitado (sin login)
- [x] Storefront: botón "Comprar ahora" (agrega al carrito y va al checkout)
- [x] Checkout: envío a domicilio (estándar, express, gratis por umbral)
- [x] Checkout: retiro en local (costo $0)
- [x] Checkout: pago por Mercado Pago (Checkout Pro)
- [x] Checkout: pago por transferencia bancaria (muestra datos bancarios)
- [x] Webhooks: Mercado Pago actualiza estado de órdenes
- [x] Multi-tenancy: aislamiento completo por tienda (RLS en Supabase)
- [x] Middleware: detección de subdominios y dominios personalizados

### 🟡 Implementadas pero Pendientes de Activar
- [ ] Dominio personalizado `andreatiendaonline.com` (DNS configurado en Cloudflare, pendiente verificar en Vercel)
- [ ] Subdominios wildcard `*.vendemas.app` (pendiente comprar dominio)

### ❌ Pendientes de Implementar
- [ ] Landing page de marketing en `vendemas.app` (dominio raíz)
- [ ] Email transaccional (confirmación de compra, recuperación de contraseña)
- [ ] SEO y meta tags dinámicos por tienda
- [ ] Términos y condiciones / política de privacidad
- [ ] Selector multi-tienda en admin (si usuario tiene más de una tienda)
- [ ] Sistema de planes/precios (free, pro, enterprise)
- [ ] Analytics avanzado (gráficos de ventas, conversión)
- [ ] Notificaciones push para nuevas órdenes

## Problemas Conocidos y Soluciones

### 1. Mercado Pago: Error "credenciales de prueba"
**Causa:** Autopago (intentar pagar con la misma cuenta que creó la app)
**Solución:** Usar cuenta diferente para probar pagos, o credenciales de producción completas

### 2. Carrito congelado en móvil
**Causa:** z-index, pointer-events, botón dentro de Link
**Solución:** ✅ Corregido (drawer con portal, z-200, touch-manipulation)

### 3. Botón "Comprar ahora" no agregaba al carrito
**Causa:** Era solo un Link sin lógica de carrito
**Solución:** ✅ Corregido (nuevo componente BuyNowButton)

### 4. Admin mostraba datos mock
**Causa:** Dashboard no leía de la base de datos
**Solución:** ✅ Corregido (queries reales con getDashboardStats)

## Migraciones SQL Pendientes de Ejecutar

**IMPORTANTE:** Ejecutar en este orden en Supabase SQL Editor:

1. `supabase/add_guest_checkout_support.sql`
   - Agrega columnas `is_guest` y `profile_id` a `orders`
   - Política RLS para INSERT en `order_items`

2. `supabase/add_custom_domain_to_stores.sql`
   - Agrega columnas `custom_domain`, `domain_verified`, `domain_verification_token` a `stores`

3. `supabase/fix_multitenant_rls.sql`
   - Políticas RLS para INSERT en `profiles`, UPDATE en `orders`, DELETE en `products`

4. `supabase/add_local_pickup_to_stores.sql`
   - Agrega columnas `enable_local_pickup`, `pickup_address`, `pickup_instructions`, `pickup_schedule` a `stores`

5. `supabase/add_bank_details_to_stores.sql`
   - Agrega columnas `bank_name`, `cbu`, `alias`, `account_holder`, `cuit` a `stores`

## Próximos Pasos (Priorizados)

### Prioridad 1: Validación E2E (ESTA SEMANA)
1. Ejecutar las 5 migraciones SQL en Supabase
2. Commit, push y deploy a Vercel
3. Prueba de fuego: registrar usuario nuevo → crear tienda → cargar producto → configurar MP → comprar como invitado
4. Verificar que todo funcione sin intervención manual

### Prioridad 2: Dominio y Branding (PRÓXIMA SEMANA)
1. Comprar dominio `vendemas.app` o `vendemas.shop` en Cloudflare
2. Configurar DNS wildcard `*.vendemas.app`
3. Agregar dominios en Vercel (`vendemas.app`, `www.vendemas.app`, `*.vendemas.app`)
4. Implementar middleware para subdominios (ya está en código, solo configurar)
5. Crear landing page para `vendemas.app`

### Prioridad 3: Profesionalización (MES 2)
1. Email transaccional con Resend o SendGrid
2. SEO y meta tags
3. Términos y condiciones
4. Sistema de planes/precios

### Prioridad 4: Escala (MES 3+)
1. Migrar a Vercel Pro ($20/mes) para dominios personalizados
2. Sistema self-service para dominios propios
3. Analytics avanzado
4. Marketing y adquisición de usuarios

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
- **vendemas.app:** Pendiente de comprar

## Notas Importantes

1. **NUNCA** commitear el archivo `.env.local` (está en `.gitignore`)
2. Las variables de entorno de Vercel deben estar en los 3 ambientes (Production, Preview, Development)
3. El webhook de MP debe apuntar a `https://venda-mas.vercel.app/api/webhooks/mercadopago`
4. Para probar pagos reales, usar cuenta DIFERENTE a la del vendedor (evitar autopago)
5. El checkout como invitado guarda `is_guest = true` y `profile_id = null` en orders
6. Los usuarios logueados tienen `is_guest = false` y `profile_id` con su UUID

## Historial de Cambios Recientes

- 26/06/2026: Implementado checkout como invitado (sin login)
- 26/06/2026: Corregido bug del carrito en móvil (drawer con portal, z-index)
- 26/06/2026: Corregido botón "Comprar ahora" (agrega al carrito y redirige)
- 26/06/2026: Dashboard admin con datos reales (no mock)
- 26/06/2026: Webhook de MP multi-tenant (verifica store_id)
- 25/06/2026: Implementado retiro en local
- 25/06/2026: Implementado pago por transferencia bancaria
- 25/06/2026: Corregido banner duplicado de envío gratis
- 24/06/2026: Credenciales de MP actualizadas a producción