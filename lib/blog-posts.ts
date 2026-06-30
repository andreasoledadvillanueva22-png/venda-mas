export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  imageUrl: string
  publishedAt: string
  content: string[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'vender-mas-instagram-2026',
    title: 'Cómo vender más en Instagram en 2026',
    excerpt:
      'Estrategias prácticas para convertir seguidores en clientes reales con contenido, historias y catálogo integrado.',
    category: 'Desarrollá canales de venta',
    imageUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7bea2?w=800',
    publishedAt: '2026-05-10',
    content: [
      'Instagram sigue siendo el canal número uno para microemprendedores en Argentina. La clave no es publicar más, sino publicar con intención.',
      'Empezá definiendo tu propuesta de valor en una sola frase. Cada post, historia o reel debe reforzar ese mensaje.',
      'Usá historias para mostrar el detrás de escena: empaquetado, preparación de pedidos y testimonios reales. Eso genera confianza.',
      'Incluí un link directo a tu tienda en la bio y mencionalo en cada publicación de producto. Menos fricción = más ventas.',
    ],
  },
  {
    slug: 'guia-crear-tienda-online',
    title: 'Guía completa: Cómo crear tu tienda online',
    excerpt:
      'Del registro al primer producto publicado. Todo lo que necesitás saber para lanzar tu negocio digital en un solo día.',
    category: 'Generá ingresos extra',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    publishedAt: '2026-04-22',
    content: [
      'Crear una tienda online ya no requiere conocimientos técnicos. Con VendaMás podés tener tu catálogo listo en minutos.',
      'Paso 1: elegí un nombre claro para tu marca. Paso 2: cargá tus productos con fotos reales y descripciones honestas.',
      'Paso 3: configurá tus medios de cobro y envíos. Paso 4: compartí el link en redes y empezá a vender.',
      'Recordá: una tienda simple y clara convierte mejor que un catálogo recargado.',
    ],
  },
  {
    slug: 'configurar-cobros-online',
    title: 'Paso a paso: Configurá tus cobros online en 10 minutos',
    excerpt:
      'Conectá tus medios de pago y empezá a recibir cobros reales desde el primer día, sin complicaciones.',
    category: 'Tutoriales',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
    publishedAt: '2026-04-08',
    content: [
      'Configurar cobros online es más simple de lo que parece. Entrá a la sección de pagos de tu panel de admin.',
      'Activá tarjeta, transferencia y efectivo contra entrega según lo que prefiera tu audiencia.',
      'Probá un pedido de prueba para verificar que todo funcione antes de compartir tu tienda.',
      'Con los cobros listos, podés enfocarte en lo que importa: vender y fidelizar clientes.',
    ],
  },
  {
    slug: 'errores-emprendedores-online',
    title: '5 errores que cometen los emprendedores al vender online',
    excerpt:
      'Evitá estos tropiezos comunes y acelerá tus ventas desde el primer mes de operación.',
    category: 'Desarrollá canales de venta',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    publishedAt: '2026-03-18',
    content: [
      'Error 1: no tener fotos de calidad. Error 2: no responder consultas rápido. Error 3: complicar el checkout.',
      'Error 4: no mostrar costos de envío claros. Error 5: depender de un solo canal de venta.',
      'Corregir estos puntos puede duplicar tu tasa de conversión en pocas semanas.',
    ],
  },
  {
    slug: 'calcular-precio-productos',
    title: 'Cómo calcular el precio de tus productos',
    excerpt:
      'Una fórmula simple para fijar precios rentables sin perder competitividad en el mercado.',
    category: 'Generá ingresos extra',
    imageUrl: 'https://images.unsplash.com/photo-1554224311-beee415c847f?w=800',
    publishedAt: '2026-03-02',
    content: [
      'Sumá costo de producto + packaging + envío + margen deseado. Ese es tu precio base.',
      'Investigá la competencia, pero no copies precios sin entender sus costos.',
      'Revisá tus márgenes cada trimestre. Un precio bien calculado te da sostenibilidad.',
    ],
  },
  {
    slug: 'guia-envios-andreani-correo',
    title: 'Guía de envíos: Andreani vs Correo Argentino',
    excerpt:
      'Comparativa práctica para elegir la mejor opción logística según tu volumen y zona de venta.',
    category: 'Tutoriales',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
    publishedAt: '2026-02-14',
    content: [
      'Andreani suele ser más ágil en CABA y GBA. Correo Argentino puede ser conveniente para interior.',
      'Evaluá tiempos, seguro incluido y facilidad de retiro según dónde estén tus clientes.',
      'Pronto vas a poder gestionar envíos integrados directamente desde VendaMás.',
    ],
  },
]

export function getAllBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export function getFeaturedBlogPosts(limit = 3): BlogPost[] {
  return getAllBlogPosts().slice(0, limit)
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}

export function formatBlogDate(date: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}
