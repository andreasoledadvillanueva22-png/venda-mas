// Productos reales de andreatiendaonline.com
// Este archivo seed se usa para poblar la base de datos de Supabase

export interface Product {
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  category: string
  stock: number
  sku: string
  images?: string[]
  tags?: string[]
  featured?: boolean
  active: boolean
}

const realProducts: Product[] = [
  {
    name: "Pack x3 Citrato de Magnesio Puro",
    slug: "pack-citrato-magnesio",
    description: "Pack de 3 frascos de Citrato de Magnesio puro, ideal para mejorar la calidad de sueño, reducir calambres y fortalecer huesos.",
    price: 19900,
    compareAtPrice: 25000,
    category: "Suplementos",
    stock: 142,
    sku: "MAG-001",
    images: ["/products/magnesio-1.jpg", "/products/magnesio-2.jpg"],
    tags: ["salud", "bienestar", "magnesio"],
    featured: true,
    active: true
  },
  {
    name: "Kit Limpieza Inalámbrico",
    slug: "kit-limpieza-inalambrico",
    description: "Kit completo de limpieza inalámbrico, ideal para hogar y oficina. Incluye múltiples cabezales intercambiables.",
    price: 20000,
    compareAtPrice: 28000,
    category: "Hogar",
    stock: 89,
    sku: "HOG-001",
    images: ["/products/kit-limpieza-1.jpg"],
    tags: ["limpieza", "inalámbrico", "hogar"],
    featured: true,
    active: true
  },
  {
    name: "Cepillo Vapor Mascotas",
    slug: "cepillo-vapor-mascotas",
    description: "Cepillo a vapor para mascotas, elimina pelo suelto y limpia mientras peina. Seguro y suave con tu mascota.",
    price: 15000,
    compareAtPrice: 18000,
    category: "Mascotas",
    stock: 76,
    sku: "MAS-001",
    images: ["/products/cepillo-mascotas-1.jpg"],
    tags: ["mascotas", "cepillo", "cuidado"],
    featured: true,
    active: true
  },
  {
    name: "Porta Esponjas Silicona",
    slug: "porta-esponjas-silicona",
    description: "Porta esponjas de silicona con diseño moderno, fácil de limpiar y resistente.",
    price: 5000,
    category: "Hogar",
    stock: 0,
    sku: "HOG-002",
    images: ["/products/porta-esponjas-1.jpg"],
    tags: ["cocina", "organización", "silicona"],
    featured: false,
    active: false
  },
  {
    name: "Moldes Silicona Premium",
    slug: "moldes-silicona-premium",
    description: "Set de moldes de silicona premium para repostería y manualidades. Reutilizables y duraderos.",
    price: 15000,
    compareAtPrice: 19000,
    category: "Manualidades",
    stock: 54,
    sku: "MAN-001",
    images: ["/products/moldes-silicona-1.jpg", "/products/moldes-silicona-2.jpg"],
    tags: ["moldes", "repostería", "manualidades"],
    featured: true,
    active: true
  },

  // AGREGAR TODOS LOS PRODUCTOS REALES DE andreatiendaonline.com aquí
  // Estructura de cada producto:
  // {
  //   name: "Nombre del producto",
  //   slug: "nombre-del-producto-en-slug",
  //   description: "Descripción detallada del producto",
  //   price: 10000, // Precio en pesos argentinos
  //   compareAtPrice: 15000, // Precio original (opcional)
  //   category: "Categoría",
  //   stock: 100,
  //   sku: "CAT-001",
  //   images: ["/products/imagen-1.jpg"],
  //   tags: ["tag1", "tag2"],
  //   featured: true, // Si aparece en destacados (opcional)
  //   active: true // Si está disponible (opcional)
  // }
]

export default realProducts
