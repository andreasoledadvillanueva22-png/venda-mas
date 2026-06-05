-- ============================================================================
-- ESQUEMA DE BASE DE DATOS - VENDAMÁS
-- Plataforma de e-commerce multi-tienda con Supabase
-- ============================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLA: profiles (Perfiles de usuarios)
-- ============================================================================
-- Almacena información de los usuarios propietarios y administradores de tiendas

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  store_name TEXT,
  store_slug TEXT UNIQUE,
  role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'editor')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_store_slug ON profiles(store_slug);
CREATE INDEX idx_profiles_role ON profiles(role);

COMMENT ON TABLE profiles IS 'Perfiles de usuarios - propietarios y administradores de tiendas';
COMMENT ON COLUMN profiles.id IS 'ID único vinculado a auth.users';
COMMENT ON COLUMN profiles.role IS 'Rol del usuario: owner (propietario), admin (administrador), editor (editor)';

-- ============================================================================
-- TABLA: stores (Tiendas)
-- ============================================================================
-- Información de las tiendas en la plataforma

CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT,
  logo_url TEXT,
  description TEXT,
  primary_color TEXT DEFAULT '#DC2626',
  secondary_color TEXT DEFAULT '#16A34A',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_stores_slug ON stores(slug);
CREATE INDEX idx_stores_domain ON stores(domain);

COMMENT ON TABLE stores IS 'Tiendas en la plataforma VendaMás';
COMMENT ON COLUMN stores.slug IS 'URL-friendly identifier único para cada tienda';
COMMENT ON COLUMN stores.settings IS 'Configuración adicional almacenada como JSON';

-- ============================================================================
-- TABLA: products (Productos)
-- ============================================================================
-- Catálogo de productos de cada tienda

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  compare_at_price NUMERIC(12, 2),
  category TEXT,
  stock INTEGER DEFAULT 0,
  sku TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, slug)
);

CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_price ON products(price);

COMMENT ON TABLE products IS 'Catálogo de productos de las tiendas';
COMMENT ON COLUMN products.slug IS 'URL-friendly identifier único por tienda';
COMMENT ON COLUMN products.stock IS 'Stock disponible del producto';
COMMENT ON COLUMN products.featured IS 'Indica si el producto aparece en destacados';

-- ============================================================================
-- TABLA: orders (Pedidos)
-- ============================================================================
-- Registro de pedidos realizados en las tiendas

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  payment_method TEXT CHECK (payment_method IN ('mercadopago', 'transfer', 'effectivo') OR payment_method IS NULL),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  shipping_method TEXT CHECK (shipping_method IN ('standard', 'express', 'free') OR shipping_method IS NULL),
  shipping_cost NUMERIC(12, 2) DEFAULT 0,
  subtotal NUMERIC(12, 2) NOT NULL,
  total NUMERIC(12, 2) NOT NULL,
  discount_code TEXT,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

COMMENT ON TABLE orders IS 'Pedidos realizados en las tiendas';
COMMENT ON COLUMN orders.status IS 'Estado del pedido: pending (pendiente), paid (pagado), shipped (enviado), delivered (entregado), cancelled (cancelado)';
COMMENT ON COLUMN orders.payment_status IS 'Estado del pago: pending, paid, failed, refunded';

-- ============================================================================
-- TABLA: order_items (Items del pedido)
-- ============================================================================
-- Detalles de cada producto incluido en un pedido

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL,
  total NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

COMMENT ON TABLE order_items IS 'Ítems incluidos en cada pedido';
COMMENT ON COLUMN order_items.unit_price IS 'Precio unitario del producto en el momento de la compra';

-- ============================================================================
-- TABLA: customers (Clientes)
-- ============================================================================
-- Información de clientes que han comprado en las tiendas

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  total_spent NUMERIC(12, 2) DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  last_order_at TIMESTAMP WITH TIME ZONE,
  segment TEXT DEFAULT 'new' CHECK (segment IN ('vip', 'regular', 'new', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, email)
);

CREATE INDEX idx_customers_store_id ON customers(store_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_segment ON customers(segment);

COMMENT ON TABLE customers IS 'Clientes que han comprado en las tiendas';
COMMENT ON COLUMN customers.segment IS 'Segmentación del cliente: vip, regular, new, inactive';

-- ============================================================================
-- TABLA: discounts (Descuentos y códigos promocionales)
-- ============================================================================
-- Códigos de descuento disponibles en las tiendas

CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed', 'free_shipping')),
  value NUMERIC(12, 2) NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  min_purchase NUMERIC(12, 2),
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_discount CHECK (value > 0),
  CONSTRAINT valid_usage CHECK (used_count >= 0 AND (max_uses IS NULL OR used_count <= max_uses))
);

CREATE INDEX idx_discounts_store_id ON discounts(store_id);
CREATE INDEX idx_discounts_code ON discounts(code);
CREATE INDEX idx_discounts_active ON discounts(active);
CREATE INDEX idx_discounts_expires_at ON discounts(expires_at);

COMMENT ON TABLE discounts IS 'Códigos de descuento y promociones';
COMMENT ON COLUMN discounts.type IS 'Tipo de descuento: percentage (porcentaje), fixed (monto fijo), free_shipping (envío gratis)';
COMMENT ON COLUMN discounts.value IS 'Valor del descuento (porcentaje o monto según tipo)';

-- ============================================================================
-- FUNCIÓN: update_updated_at
-- ============================================================================
-- Función que actualiza automáticamente el timestamp de updated_at

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER profiles_updated_at_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER stores_updated_at_trigger
  BEFORE UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER products_updated_at_trigger
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER customers_updated_at_trigger
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Políticas de seguridad para acceso a datos

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para stores (lectura pública)
CREATE POLICY "Stores públicas son visibles"
  ON stores FOR SELECT
  USING (TRUE);

CREATE POLICY "Solo propietarios pueden actualizar su tienda"
  ON stores FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Solo propietarios pueden insertar tiendas"
  ON stores FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Políticas para products (lectura pública de activos)
CREATE POLICY "Productos activos son públicos"
  ON products FOR SELECT
  USING (active = TRUE OR store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Propietarios pueden insertar productos"
  ON products FOR INSERT
  WITH CHECK (store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Propietarios pueden actualizar sus productos"
  ON products FOR UPDATE
  USING (store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  ));

-- Políticas para orders
CREATE POLICY "Propietarios pueden ver pedidos de su tienda"
  ON orders FOR SELECT
  USING (store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Cualquiera puede crear pedidos"
  ON orders FOR INSERT
  WITH CHECK (TRUE);

-- Políticas para order_items
CREATE POLICY "Ver items de pedidos de su tienda"
  ON order_items FOR SELECT
  USING (order_id IN (
    SELECT id FROM orders WHERE store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  ));

-- Políticas para customers
CREATE POLICY "Propietarios pueden ver clientes de su tienda"
  ON customers FOR SELECT
  USING (store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  ));

-- Políticas para discounts
CREATE POLICY "Ver descuentos de tienda pública"
  ON discounts FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Propietarios pueden ver todos sus descuentos"
  ON discounts FOR SELECT
  USING (store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Propietarios pueden crear descuentos"
  ON discounts FOR INSERT
  WITH CHECK (store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Propietarios pueden actualizar sus descuentos"
  ON discounts FOR UPDATE
  USING (store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  ));

-- ============================================================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ============================================================================

-- Índice para búsquedas de productos por tags
CREATE INDEX idx_products_tags ON products USING GIN (tags);

-- Índice para búsquedas de descuentos activos por tienda
CREATE INDEX idx_discounts_active_store ON discounts(store_id, active);

-- Índice para búsquedas de órdenes por rango de fechas
CREATE INDEX idx_orders_date_range ON orders(store_id, created_at DESC);

COMMENT ON SCHEMA public IS 'Esquema principal de VendaMás - Plataforma de e-commerce multi-tienda';
