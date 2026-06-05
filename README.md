# VendaMás - Plataforma de E-commerce Multi-tienda

Plataforma moderna de e-commerce construida con **Next.js 14**, **TypeScript**, **Tailwind CSS** y **Supabase**, optimizada para vendedores independientes en Argentina.

## 🚀 Características

- ✅ **Multi-tienda**: Cada vendedor tiene su tienda independiente
- ✅ **Autenticación**: Sistema de registro y login con Supabase Auth
- ✅ **Catálogo de productos**: Gestión completa de inventario
- ✅ **Carrito de compras**: Persistencia con localStorage
- ✅ **Sistema de órdenes**: Gestión completa del ciclo de vida
- ✅ **Métodos de pago**: Integración con Mercado Pago, transferencia bancaria, efectivo
- ✅ **Descuentos**: Códigos promocionales y gestión de promociones
- ✅ **Panel de administración**: Analytics, productos, órdenes, clientes
- ✅ **Responsive**: Diseño mobile-first y adaptable
- ✅ **Performance**: Optimizaciones de imagen, caching, code splitting
- ✅ **Seguridad**: Row Level Security (RLS) en Supabase

## 📋 Requisitos Previos

- **Node.js**: v18.17 o superior
- **npm/pnpm**: v9 o superior (se recomienda pnpm)
- **Cuenta Supabase**: https://app.supabase.com
- **Cuenta Vercel** (para deploy): https://vercel.com

## 🛠 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/venda-mas.git
cd venda-mas
```

### 2. Instalar dependencias

```bash
pnpm install
# o
npm install
```

### 3. Configurar variables de entorno

Copiar `.env.example` a `.env.local` y completar con tus credenciales:

```bash
cp .env.example .env.local
```

Editar `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Cómo obtener las credenciales:**
1. Ir a https://app.supabase.com
2. Seleccionar tu proyecto
3. Settings → API → Copiar `Project URL` y `anon key`
4. Copiar también `service_role` key (para operaciones del servidor)

### 4. Configurar base de datos Supabase

1. En Supabase, ir a SQL Editor
2. Copiar todo el contenido de `supabase/schema.sql`
3. Ejecutar el SQL en Supabase
4. Esto creará todas las tablas, índices, triggers y políticas de seguridad

### 5. Ejecutar en desarrollo

```bash
pnpm dev
# o
npm run dev
```

Abrir http://localhost:3000 en el navegador.

## 📁 Estructura del Proyecto

```
venda-mas/
├── app/
│   ├── auth/
│   │   ├── login/          # Página de login
│   │   ├── register/       # Página de registro
│   │   └── layout.tsx      # Layout específico para auth
│   ├── admin/
│   │   ├── analytics/      # Dashboard con KPIs y gráficos
│   │   ├── products/       # Gestión de productos
│   │   ├── orders/         # Gestión de pedidos
│   │   ├── customers/      # Gestión de clientes
│   │   └── layout.tsx      # Layout del admin con sidebar
│   ├── storefront/
│   │   ├── page.tsx        # Homepage de la tienda
│   │   ├── product/[id]/   # Detalle de producto
│   │   ├── products/       # Catálogo con filtros
│   │   ├── cart/           # Página del carrito
│   │   └── checkout/       # Página de checkout
│   ├── layout.tsx          # Layout raíz
│   ├── page.tsx            # Landing page
│   └── globals.css         # Estilos globales
├── components/
│   ├── admin/              # Componentes del admin
│   ├── storefront/         # Componentes de la tienda
│   └── ui/                 # Componentes shadcn/ui
├── lib/
│   ├── supabase/           # Clientes de Supabase
│   ├── cart-context.tsx    # Context API para carrito
│   ├── seed-products.ts    # Seed de productos
│   └── utils.ts            # Utilidades generales
├── supabase/
│   └── schema.sql          # Esquema de base de datos
├── public/                 # Archivos estáticos
├── .env.example            # Template de variables de entorno
├── vercel.json             # Configuración de Vercel
├── next.config.mjs         # Configuración de Next.js
├── tsconfig.json           # Configuración de TypeScript
└── package.json            # Dependencias del proyecto
```

## 🔄 Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Inicia servidor de desarrollo en http://localhost:3000

# Build
pnpm build            # Compila para producción
pnpm start            # Inicia servidor de producción

# Calidad de código
pnpm lint             # Ejecuta ESLint
pnpm type-check       # Verifica tipos de TypeScript

# Base de datos
pnpm seed             # Carga productos de seed en Supabase (si está implementado)
```

## 🔐 Variables de Entorno

### Necesarias (OBLIGATORIO)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de Supabase | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima | `eyJhbGciOiJIUzI1NiI...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio | `eyJhbGciOiJIUzI1NiI...` |

### Opcionales

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | URL pública de la app (para OAuth) |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Clave pública de Mercado Pago |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de acceso de Mercado Pago |

## 📊 Stack Tecnológico

### Frontend
- **Next.js 14**: Framework React con SSR/SSG
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Utility-first CSS
- **shadcn/ui**: Componentes prediseñados
- **lucide-react**: Iconografía
- **recharts**: Gráficos y visualizaciones

### Backend & Auth
- **Supabase**: PostgreSQL, Auth, Storage
- **Supabase Auth**: Autenticación OAuth + email/password
- **PostgreSQL**: Base de datos relacional

### Herramientas
- **pnpm**: Gestor de paquetes rápido
- **ESLint**: Linting de código
- **Prettier**: Formateo de código

## 🚀 Deploy en Vercel

### 1. Preparación

```bash
# Asegurar que el build sea exitoso localmente
pnpm build

# Verificar que no haya errores
pnpm lint
```

### 2. Conectar a Vercel

1. Ir a https://vercel.com/new
2. Importar repositorio de GitHub
3. Vercel detectará Next.js automáticamente
4. Configurar variables de entorno:
   - Settings → Environment Variables
   - Agregar todas las variables de `.env.local`

### 3. Deploy

```bash
# Hacer push a GitHub (Vercel se triggerea automáticamente)
git push origin main
```

O desde dashboard de Vercel:
- Click en "Deploy"
- Vercel compilará y desplegará automáticamente

### 4. Configuración Post-Deploy

1. **Supabase**: Actualizar `NEXT_PUBLIC_SITE_URL` a tu dominio en Vercel
2. **OAuth**: Agregar URL de Vercel a proveedores (Google, etc.)
3. **DNS**: Configurar dominio personalizado en Vercel (opcional)

## 🔗 Flujos de Usuario

### Flujo Cliente (Público)

```
Inicio → Catálogo → Producto → Carrito → Checkout → Confirmación
```

1. **Homepage** (`/`): Landing page con descripción
2. **Catálogo** (`/storefront/products`): Productos con filtros y búsqueda
3. **Detalle** (`/storefront/product/[id]`): Información completa del producto
4. **Carrito** (`/storefront/cart`): Revisión de items
5. **Checkout** (`/storefront/checkout`): Datos de envío y pago

### Flujo Vendedor

```
Registrarse → Login → Dashboard → Gestionar Productos/Órdenes → Analytics
```

1. **Registro** (`/auth/register`): Crear cuenta y tienda
2. **Login** (`/auth/login`): Autenticarse
3. **Dashboard** (`/admin/analytics`): Vista general de ventas
4. **Productos** (`/admin/products`): Crear, editar, eliminar productos
5. **Órdenes** (`/admin/orders`): Ver y gestionar pedidos
6. **Clientes** (`/admin/customers`): Datos de compradores

## 🔒 Seguridad

- ✅ **Row Level Security (RLS)**: Acceso a datos basado en roles
- ✅ **Auth Supabase**: Tokens JWT seguros
- ✅ **HTTPS**: Tráfico encriptado en Vercel
- ✅ **Validación**: Validación en cliente y servidor
- ✅ **CORS**: Configurado para seguridad cross-origin
- ✅ **Headers de seguridad**: X-Frame-Options, X-Content-Type-Options, etc.

## 📝 Variables de Base de Datos

### Usuarios (profiles)
- email, full_name, store_name, role

### Tiendas (stores)
- name, slug, logo_url, description, colores personalizables

### Productos (products)
- name, slug, description, price, stock, category, tags

### Órdenes (orders)
- customer_name, customer_email, total, payment_status, shipping_method

### Clientes (customers)
- name, email, total_spent, segment (vip/regular/new)

Ver `supabase/schema.sql` para detalles completos.

## 🐛 Debugging

### Errores comunes

**Error: "NEXT_PUBLIC_SUPABASE_URL no está definida"**
```bash
# Solución: Verificar .env.local y reiniciar servidor
cat .env.local
pnpm dev
```

**Error: "Row-level security violation"**
```
# Solución: Verificar políticas RLS en Supabase
# Settings → Authentication → Policies
```

**Error: "Build fail en Vercel"**
```bash
# Solución: Verificar logs en Vercel dashboard
# Asegurar que pnpm install funcione localmente
pnpm install
pnpm build
```

## 📚 Documentación

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT - ver archivo LICENSE para detalles.

## 👨‍💼 Soporte

Para preguntas o problemas:
- Abrir issue en GitHub
- Contactar: [tu-email@ejemplo.com](mailto:tu-email@ejemplo.com)

---

**Construido con ❤️ para vendedores argentinos**
