'use client'

import { useState } from 'react'
import {
  Check,
  Edit,
  Eye,
  GripVertical,
  Image,
  Layout,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const themes = [
  {
    id: 'moderno',
    name: 'Moderno',
    description: 'Rojo y blanco',
    colors: ['#DC2626', '#ffffff', '#111827'],
  },
  {
    id: 'elegante',
    name: 'Elegante',
    description: 'Negro y dorado',
    colors: ['#111827', '#F59E0B', '#F8F1E5'],
  },
  {
    id: 'natural',
    name: 'Natural',
    description: 'Verde y beige',
    colors: ['#16A34A', '#F5F5DC', '#2D5C45'],
  },
  {
    id: 'minimalista',
    name: 'Minimalista',
    description: 'Gris y blanco',
    colors: ['#475569', '#F8FAFC', '#020617'],
  },
]

const fontOptions = ['Inter', 'Poppins', 'Montserrat', 'Roboto']

export default function AdminDesignPage() {
  const [activeTab, setActiveTab] = useState('tema')
  const [selectedTheme, setSelectedTheme] = useState('moderno')
  const [showPreview, setShowPreview] = useState(false)
  const [showHeroModal, setShowHeroModal] = useState(false)

  const [colors, setColors] = useState({
    primary: '#DC2626',
    secondary: '#16A34A',
    background: '#FFFFFF',
    text: '#1E293B',
  })

  const [heroConfig, setHeroConfig] = useState({
    title: 'Bienvenido a la temporada de verano',
    subtitle: 'Descubrí las novedades y ofertas exclusivas para tu tienda.',
    ctaText: 'Comprar ahora',
    ctaLink: '/productos',
  })

  const [themeLayout, setThemeLayout] = useState('grid')
  const [fontTitle, setFontTitle] = useState('Inter')
  const [fontBody, setFontBody] = useState('Inter')
  const [baseFontSize, setBaseFontSize] = useState(16)

  const currentTheme = themes.find((theme) => theme.id === selectedTheme)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-border bg-white px-6 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Diseño de la tienda</h1>
            <p className="text-sm text-muted-foreground">Personaliza el aspecto de tu tienda y su tipografía.</p>
          </div>
          <Button className="bg-red-600 text-white hover:bg-red-700" onClick={() => setShowPreview(true)}>
            <Eye className="mr-2 h-4 w-4" /> Vista previa
          </Button>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="tema" value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto">
            <TabsList className="inline-flex min-w-[400px] gap-2 rounded-lg bg-white p-2">
              <TabsTrigger value="tema">Tema</TabsTrigger>
              <TabsTrigger value="homepage">Homepage</TabsTrigger>
              <TabsTrigger value="paginas">Páginas</TabsTrigger>
              <TabsTrigger value="tipografia">Tipografía</TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-6 space-y-6">
            <TabsContent value="tema">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tema predefinido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {themes.map((theme) => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setSelectedTheme(theme.id)}
                          className={`group overflow-hidden rounded-3xl border p-4 text-left transition ${
                            selectedTheme === theme.id
                              ? 'border-red-500 bg-red-50'
                              : 'border-border bg-white hover:border-red-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <h2 className="text-lg font-semibold text-foreground">{theme.name}</h2>
                              <p className="text-sm text-muted-foreground">{theme.description}</p>
                            </div>
                            {selectedTheme === theme.id ? (
                              <Check className="h-5 w-5 text-red-600" />
                            ) : null}
                          </div>
                          <div className="mt-4 flex h-24 items-center gap-3 rounded-3xl border border-slate-200 p-3">
                            {theme.colors.map((color) => (
                              <div key={color} className="h-10 w-10 rounded-full" style={{ backgroundColor: color }} />
                            ))}
                          </div>
                          <div className="mt-4">
                            <Button
                              variant={selectedTheme === theme.id ? undefined : 'outline'}
                              className={`w-full ${selectedTheme === theme.id ? 'bg-red-600 text-white hover:bg-red-700' : ''}`}
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedTheme(theme.id)
                              }}
                            >
                              Aplicar
                            </Button>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Personalización de colores</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6 lg:grid-cols-2">
                    {[
                      { label: 'Color primario', field: 'primary' },
                      { label: 'Color secundario', field: 'secondary' },
                      { label: 'Color de fondo', field: 'background' },
                      { label: 'Color de texto', field: 'text' },
                    ].map((item) => (
                      <div key={item.field} className="rounded-3xl border border-border bg-white p-4">
                        <Label>{item.label}</Label>
                        <div className="mt-3 flex items-center gap-4">
                          <input
                            type="color"
                            value={colors[item.field as keyof typeof colors]}
                            onChange={(event) =>
                              setColors((current) => ({
                                ...current,
                                [item.field]: event.target.value,
                              }))
                            }
                            className="h-14 w-14 rounded-xl border border-border p-1"
                          />
                          <Input
                            value={colors[item.field as keyof typeof colors]}
                            onChange={(event) =>
                              setColors((current) => ({
                                ...current,
                                [item.field]: event.target.value,
                              }))
                            }
                            className="w-full"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <CardContent className="flex justify-end border-t border-border bg-slate-50 p-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setColors({
                          primary: '#DC2626',
                          secondary: '#16A34A',
                          background: '#FFFFFF',
                          text: '#1E293B',
                        })
                      }
                    >
                      Restablecer colores
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="homepage">
              <Card>
                <CardHeader>
                  <CardTitle>Homepage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 xl:grid-cols-2">
                    {[
                      { id: 'hero', title: 'Hero banner', active: true },
                      { id: 'productos', title: 'Productos destacados', active: true },
                      { id: 'categorias', title: 'Categorías', active: true },
                      { id: 'testimonios', title: 'Testimonios', active: false },
                      { id: 'newsletter', title: 'Newsletter', active: true },
                      { id: 'banner', title: 'Banner promocional', active: false },
                    ].map((section) => (
                      <div
                        key={section.id}
                        className="group rounded-3xl border border-border bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                              <GripVertical className="h-5 w-5" />
                            </span>
                            <div>
                              <p className="font-semibold text-foreground">{section.title}</p>
                              <p className="text-sm text-muted-foreground">Arrastra para reordenar</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={section.active}
                                readOnly
                                className="h-4 w-4 rounded border border-input text-red-600"
                              />
                              <span>{section.active ? 'Activo' : 'Desactivado'}</span>
                            </label>
                            <Button variant="outline" size="icon" onClick={() => setShowHeroModal(true)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-4 xl:grid-cols-3">
                    {[
                      { id: 'grid', title: 'Rejilla', description: 'Organiza productos en columnas limpias' },
                      { id: 'hero', title: 'Banner hero', description: 'Destaca tu producto principal en grande' },
                      { id: 'cards', title: 'Tarjetas', description: 'Estilo de tarjetas para contenido dinámico' },
                    ].map((layout) => (
                      <button
                        key={layout.id}
                        type="button"
                        onClick={() => setThemeLayout(layout.id)}
                        className={`group rounded-3xl border p-5 text-left transition ${
                          themeLayout === layout.id ? 'border-red-500 bg-red-50' : 'border-border bg-white hover:border-red-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                            <Layout className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="font-semibold text-foreground">{layout.title}</p>
                            <p className="text-sm text-muted-foreground">{layout.description}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-300" />
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-300" />
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="paginas">
              <Card>
                <CardHeader>
                  <CardTitle>Páginas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-3xl border border-border bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">Página de producto</p>
                        <p className="text-sm text-muted-foreground">Configuración de ficha de producto</p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-slate-50 px-3 py-2 text-sm">
                          <input type="checkbox" className="h-4 w-4 rounded border border-input text-red-600" />
                          Mostrar productos relacionados
                        </label>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-slate-50 px-3 py-2 text-sm">
                          <input type="checkbox" className="h-4 w-4 rounded border border-input text-red-600" />
                          Mostrar reseñas de clientes
                        </label>
                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Layout de galería" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grid">Grid</SelectItem>
                            <SelectItem value="carousel">Carousel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-border bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">Página de carrito</p>
                        <p className="text-sm text-muted-foreground">Opciones de carrito</p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-slate-50 px-3 py-2 text-sm">
                          <input type="checkbox" className="h-4 w-4 rounded border border-input text-red-600" />
                          Mostrar productos recomendados
                        </label>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-slate-50 px-3 py-2 text-sm">
                          <input type="checkbox" className="h-4 w-4 rounded border border-input text-red-600" />
                          Mostrar código de descuento
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-border bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">Página de checkout</p>
                        <p className="text-sm text-muted-foreground">Ajustes del proceso de pago</p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-slate-50 px-3 py-2 text-sm">
                          <input type="checkbox" className="h-4 w-4 rounded border border-input text-red-600" />
                          Checkout en una página
                        </label>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-slate-50 px-3 py-2 text-sm">
                          <input type="checkbox" className="h-4 w-4 rounded border border-input text-red-600" />
                          Mostrar resumen del pedido
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tipografia">
              <Card>
                <CardHeader>
                  <CardTitle>Tipografía</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Fuente para títulos</Label>
                      <Select value={fontTitle} onValueChange={setFontTitle}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map((font) => (
                            <SelectItem key={font} value={font}>{font}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Fuente para cuerpo</Label>
                      <Select value={fontBody} onValueChange={setFontBody}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map((font) => (
                            <SelectItem key={font} value={font}>{font}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Tamaño de fuente base: {baseFontSize}px</Label>
                    <input
                      type="range"
                      min={14}
                      max={20}
                      value={baseFontSize}
                      onChange={(event) => setBaseFontSize(Number(event.target.value))}
                      className="w-full"
                    />
                  </div>

                  <Card className="rounded-3xl border border-border bg-slate-50">
                    <CardContent className="space-y-4 p-6">
                      <div style={{ fontFamily: fontTitle, fontSize: `${baseFontSize + 8}px`, color: colors.text }}>
                        <p className="text-2xl font-semibold">Título de ejemplo</p>
                      </div>
                      <div style={{ fontFamily: fontBody, fontSize: `${baseFontSize}px`, color: colors.text }}>
                        <p className="text-sm leading-7">Este es un párrafo de ejemplo para ver cómo se muestra la tipografía seleccionada en el cuerpo del sitio.</p>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vista previa</CardTitle>
                </div>
                <button onClick={() => setShowPreview(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-4 py-6">
              <div className="rounded-3xl border border-border p-6" style={{ backgroundColor: colors.background, color: colors.text, fontFamily: fontBody, fontSize: `${baseFontSize}px` }}>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Tema seleccionado</p>
                    <h2 className="text-3xl font-semibold" style={{ fontFamily: fontTitle }}>{currentTheme?.name}</h2>
                  </div>
                  <Badge className="rounded-full bg-red-100 text-red-700">{colors.primary}</Badge>
                </div>
                <div className="rounded-3xl border border-border p-6" style={{ backgroundColor: colors.primary, color: '#ffffff' }}>
                  <h3 className="text-2xl font-semibold">{heroConfig.title}</h3>
                  <p className="mt-3 text-sm leading-6">{heroConfig.subtitle}</p>
                  <Button className="mt-6 bg-white text-foreground hover:bg-slate-100" style={{ color: colors.primary }}>
                    {heroConfig.ctaText}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showHeroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Editar hero</CardTitle>
                </div>
                <button onClick={() => setShowHeroModal(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="hero-title">Título del hero</Label>
                <Input
                  id="hero-title"
                  value={heroConfig.title}
                  onChange={(event) => setHeroConfig((current) => ({ ...current, title: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-subtitle">Subtítulo</Label>
                <textarea
                  id="hero-subtitle"
                  value={heroConfig.subtitle}
                  onChange={(event) => setHeroConfig((current) => ({ ...current, subtitle: event.target.value }))}
                  rows={4}
                  className="w-full rounded-2xl border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-ring/50"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Imagen de fondo</Label>
                  <Button variant="outline" className="w-full">
                    <Image className="mr-2 h-4 w-4" /> Subir imagen
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta-text">Botón CTA</Label>
                  <Input
                    id="cta-text"
                    value={heroConfig.ctaText}
                    onChange={(event) => setHeroConfig((current) => ({ ...current, ctaText: event.target.value }))}
                    placeholder="Texto del botón"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta-link">Link del CTA</Label>
                <Input
                  id="cta-link"
                  value={heroConfig.ctaLink}
                  onChange={(event) => setHeroConfig((current) => ({ ...current, ctaLink: event.target.value }))}
                  placeholder="/productos"
                />
              </div>
            </CardContent>
            <Separator />
            <div className="flex justify-end gap-3 bg-slate-50 p-4">
              <Button variant="outline" onClick={() => setShowHeroModal(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setShowHeroModal(false)} className="bg-red-600 text-white hover:bg-red-700">
                Guardar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
