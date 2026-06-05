export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  tag?: string;
  tagColor?: string;
  freeShipping: boolean;
  stock: number;
  rating: number;
  reviews: number;
}

export const realProducts: Product[] = [
  {
    id: "1",
    name: "PROMO 2X1 Kit de Limpieza Pro 3 en 1",
    slug: "kit-limpieza-pro-3-en-1",
    description: "Kit de limpieza inalámbrico 3 en 1 para azulejos, cocina y sillones. Incluye accesorios intercambiables y cargador. Ideal para hogares. Envíos a Puerto Rico, Misiones y toda Argentina. Compra segura en Andrea Tienda Online.",
    price: 35900,
    compareAtPrice: 45000,
    images: [
      "https://i.ibb.co/XrZ8x1ML/imagesproducto1main.webp",
      "https://i.ibb.co/mV08N4pv/foto2.webp",
      "https://i.ibb.co/zV63nyvm/foto3.webp",
    ],
    category: "Hogar",
    tag: "ENVÍO GRATIS",
    tagColor: "bg-primary",
    freeShipping: true,
    stock: 45,
    rating: 4.9,
    reviews: 87,
  },
  {
    id: "2",
    name: "Pack x3 Citrato de Magnesio en Polvo 100g",
    slug: "pack-citrato-magnesio-polvo",
    description: "Citrato de magnesio en polvo de alta calidad. Presentación práctica para uso diario. Pack ahorro x3 bolsas. Ideal para complementar tu rutina de bienestar. Envíos a Puerto Rico, Misiones y toda Argentina. Comprá online con envío rápido y seguro en Andrea Tienda Online.",
    price: 19900,
    compareAtPrice: 25000,
    images: [
      "https://i.ibb.co/Y7F6GWxK/main.webp",
      "https://i.ibb.co/5ddFwH0/foto2.webp",
      "https://i.ibb.co/qvnmqMG/foto3.webp",
    ],
    category: "Suplementos",
    tag: "NOVEDAD",
    tagColor: "bg-secondary",
    freeShipping: false,
    stock: 142,
    rating: 4.8,
    reviews: 142,
  },
  {
    id: "3",
    name: "Cepillo a Vapor Pro para Mascotas",
    slug: "cepillo-vapor-mascotas",
    description: "Cepillo a vapor para eliminar pelo suelto de mascotas. Sin tirones, apto para perros y gatos. Incluye guía de uso. Envíos a Puerto Rico, Misiones y toda Argentina. Compra segura con Mercado Pago o WhatsApp en Andrea Tienda Online.",
    price: 29599,
    compareAtPrice: 35000,
    images: [
      "https://i.ibb.co/bgQJwtc1/main.webp",
      "https://i.ibb.co/tpS5VQrS/foto2.png",
      "https://i.ibb.co/zWq0kV3V/foto3.png",
    ],
    category: "Mascotas",
    tag: "ENVÍO GRATIS",
    tagColor: "bg-purple-600",
    freeShipping: true,
    stock: 76,
    rating: 4.7,
    reviews: 98,
  },
  {
    id: "4",
    name: "Pañales Para Adultos Nonisec - Clásico L x50",
    slug: "panales-adultos-nonisec-clasico",
    description: "Pañales descartables para adultos marca Nonisec, modelo Clásico en talle Grande (L). Paquete x50 unidades con sistema de absorción avanzada y cintura elástica para mayor comodidad. Presentación práctica para uso diario. Envíos a Puerto Rico, Misiones y toda Argentina. Compra segura con Mercado Pago o WhatsApp en Andrea Tienda Online.",
    price: 33520,
    images: [
      "https://i.ibb.co/8nGGr4rP/main.webp",
    ],
    category: "Higiene",
    tag: "PACK AHORRO",
    tagColor: "bg-blue-600",
    freeShipping: false,
    stock: 60,
    rating: 4.6,
    reviews: 54,
  },
  {
    id: "5",
    name: "Pañales Adultos Nonisec Básico - Talle G x50",
    slug: "panales-adultos-nonisec-basico",
    description: "Pañales descartables para adultos marca Nonisec, modelo Básico en talle Grande (L). Paquete x50 unidades. Diseñado para máxima absorción, cuenta con gel superabsorbente y sistema de contención. Talle indicado para pesos de 45 a 85 kg. Presentación práctica y segura para uso diario. Envíos a Puerto Rico, Misiones y toda Argentina. Compra segura con Mercado Pago o WhatsApp en Andrea Tienda Online.",
    price: 29999,
    images: [
      "https://i.ibb.co/k6XG00Q9/pa-ales-para-adultos-nonisec.webp",
    ],
    category: "Higiene",
    tag: "PACK AHORRO",
    tagColor: "bg-blue-600",
    freeShipping: false,
    stock: 85,
    rating: 4.5,
    reviews: 41,
  },
];

// Helper para buscar producto por ID
export function getProductById(id: string): Product | undefined {
  return realProducts.find((p) => p.id === id);
}

// Helper para buscar producto por slug
export function getProductBySlug(slug: string): Product | undefined {
  return realProducts.find((p) => p.slug === slug);
}

// Helper para obtener productos por categoría
export function getProductsByCategory(category: string): Product[] {
  return realProducts.filter((p) => p.category === category);
}

// Helper para obtener productos destacados (con tag)
export function getFeaturedProducts(): Product[] {
  return realProducts.filter((p) => p.tag);
}

// Helper para obtener productos con envío gratis
export function getFreeShippingProducts(): Product[] {
  return realProducts.filter((p) => p.freeShipping);
}

// Formatear precio en ARS
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price);
}