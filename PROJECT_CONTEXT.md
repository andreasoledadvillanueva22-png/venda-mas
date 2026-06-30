# VendaMás SaaS - Contexto del Proyecto

**Última actualización:** 01/07/2026 - Noche
**Estado:** Producción Activa - MVP completo con rediseño inspirado en Tienda Nube

## 1. Resumen Ejecutivo
VendaMás es una plataforma SaaS multi-tenant para crear tiendas online sin comisiones por venta. Permite a los usuarios gestionar productos, órdenes, envíos y cobros con múltiples medios de pago. Cuenta con landing page de alta conversión (inspirada en Tienda Nube), página de pricing con comparativa, blog de recursos, admin personalizado y storefront dinámico con estética premium unificada.

## 2. Estado Actual
- **URL Producción:** https://venda-mas.vercel.app
- **Base de Datos:** Supabase (syxgovzmpzbymilsmdivi)
- **Repositorio:** GitHub (andreasoledadvillanueva22-png/venda-mas)
- **Tiendas Activas:** 2 (Andrea: `andrea-tienda`, Hector: `hector`)
- **Estética:** 100% unificada (Azul degradado, Glassmorphism, Logo oficial)
- **Slogan:** "Vendé online sin comisiones. Para siempre."

## 3. Funcionalidades Implementadas (Status: ✅)

### Core & Infraestructura
- [x] Multi-tenancy completo con RLS (Supabase)
- [x] Registro y onboarding de usuarios
- [x] Dashboard de Admin (KPIs, navegación)
- [x] Checkout como invitado (Guest Checkout) - 5 pasos visuales premium
- [x] Integración Mercado Pago (Producción + Sandbox listo)
- [x] Efectivo contra entrega (toggle por tienda)
- [x] Webhooks de pago (actualización de estados)
- [x] Dominios personalizados (estructura lista, pendiente DNS)
- [x] Sistema de planes y suscripciones (Free, Emprendedor, Negocio, Empresa)

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
- [x] Footer con "Powered by VendaMás" e íconos de redes sociales (Instagram, Facebook, TikTok, X)
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
- [x] Página de Blog con 6 artículos de ejemplo
- [x] Páginas individuales de artículos
- [x] Slogan: "Vendé online sin comisiones. Para siempre."
- [x] CTA: "Crear tienda gratis"
- [x] Diseño unificado (Azul degradado, tipografía bold)
- [x] Logo oficial integrado en toda la app
- [x] Auth Pages (Login/Register) con estilo glassmorphism

### Componentes UI
- [x] Button (variantes: default, outline, secondary, ghost)
- [x] Card (rounded-2xl, sombra brand, hover)
- [x] Input (rounded-xl, focus ring brand)
- [x] Badge (success, warning, info, destructive)
- [x] Table (header brand-50, hover suave)

## 4. Pendientes (Priorizados)

### PRIORIDAD ALTA
- [ ] **Contenido real del blog:** Reescribir los 6 artículos con contenido útil y SEO-friendly
- [ ] **Prueba Sandbox MP** con credenciales TEST- en Hector
- [ ] **Email transaccional** con Resend (confirmación de compra)
- [ ] **Sistema de cobro de suscripciones** (integrar con MP para cobrar los planes)

### PRIORIDAD MEDIA
- [ ] **Dominio:** Comprar `vendemas.app` y configurar DNS wildcard
- [ ] **Soporte CSV** para importar reseñas masivamente
- [ ] **SEO:** Sitemap.xml, robots.txt, schema.org
- [ ] **Imágenes reales:** Reemplazar placeholders de Unsplash con fotos reales de emprendedores

### PRIORIDAD BAJA
- [ ] Integración logística (Andreani/Correo)
- [ ] App móvil para vendedores
- [ ] Analytics avanzado (gráficos de conversión, LTV)
- [ ] Múltiples billeteras (Modo, Ualá, etc.)

## 5. Arquitectura Técnica
- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS (v4)
- **Backend:** Server Actions, API Routes
- **DB:** Supabase (Postgres)
- **Estilos:** Componentes UI reutilizables con variantes premium
- **Colores:** `brand-50` a `brand-900` (Azul), `accent` (Rojo para CTA)
- **Logo:** https://i.ibb.co/rr2Wc9x/vendamas-logo.png

## 6. Historial Reciente
- **01/07/2026 - Noche:** Rediseño completo inspirado en Tienda Nube (Landing, Pricing, Blog)
- **01/07/2026 - Tarde:** Página de Pricing con 4 planes, toggle mensual/anual, tabla comparativa
- **01/07/2026 - Tarde:** Íconos de redes sociales en footer (Instagram, Facebook, TikTok, X)
- **01/07/2026 - Mañana:** Carrusel de reseñas + importación masiva + slogan sin comisiones + efectivo contra entrega
- **01/07/2026 - Mañana:** Fix estética storefront, Design page, Marketing page, botones de productos
- **30/06/2026:** Unificación estética premium (Admin, Auth, Storefront, Landing)
- **30/06/2026:** Logo oficial integrado en toda la app
- **29/06/2026:** Editor TipTap, compartir en redes, video de producto, reseñas importadas
- **29/06/2026:** Landing Page con Waitlist funcional

## 7. Costos Operativos (estimados)
| Servicio | Plan Free | Plan Pro (escala) |
|----------|-----------|-------------------|
| Vercel | $0 | $20 USD/mes |
| Supabase | $0 | $25 USD/mes |
| Dominio .app | $14/año | $14/año |
| Resend | $0 (3000 emails) | $20 USD/mes |
| **TOTAL** | **~$1.750 ARS/mes** | **~$100.000 ARS/mes** |

## 8. Pricing Implementado
| Plan | Precio ARS/mes | Precio ARS/año | Productos | Órdenes/mes |
|------|----------------|----------------|-----------|-------------|
| Gratis | $0 | $0 | 10 | 20 |
| Emprendedor | $9.900 | $99.000 | 50 | 200 |
| Negocio | $19.900 | $199.000 | 200 | 1000 |
| Empresa | $39.900 | $399.000 | Ilimitado | Ilimitado |

## 9. Reglas de Desarrollo
1. **No romper multi-tenancy:** Siempre filtrar por `store_id`
2. **Seguridad:** No commitear `.env.local`. Usar variables de Vercel
3. **Calidad:** TypeScript estricto. `npm run build` debe pasar antes de deployar
4. **Diseño:** Mantener coherencia con estética "Premium/Glass" (azul degradado)
5. **Performance:** Usar `next/image` para optimización de imágenes
6. **Slogan:** Nunca mencionar "Mercado Pago" en textos de marketing (solo en configuración técnica)