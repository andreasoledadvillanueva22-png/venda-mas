'use client'

import { useState } from 'react'
import { Check, Lock, Mail, MapPin, Phone, Shield, Truck, CreditCard, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const provincias = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Córdoba', 'Corrientes', 'Chaco',
  'Chubut', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
]

const shippingMethods = [
  { id: 'standard', label: 'Estándar (3-5 días)', price: 5000 },
  { id: 'express', label: 'Express (24-48hs)', price: 8500 },
  { id: 'free', label: 'Gratis (compra mayor a $50.000)', price: 0 },
]

const paymentMethods = [
  { id: 'mercadopago', label: 'Mercado Pago', icon: '💳' },
  { id: 'transfer', label: 'Transferencia Bancaria', icon: '🏦' },
  { id: 'effectivo', label: 'Efectivo Contra Entrega', icon: '💵' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    subscribir: false,
    nombre: '',
    dni: '',
    calle: '',
    piso: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    referencias: '',
  })

  const [shippingMethod, setShippingMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('mercadopago')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (items.length === 0 && !orderConfirmed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-lg font-semibold text-slate-900">Tu carrito está vacío</p>
            <p className="text-sm text-slate-500 text-center">No hay productos para comprar. Volvé a la tienda para agregar productos.</p>
            <Link href="/storefront/products">
              <Button className="mt-4 bg-red-600 text-white hover:bg-red-700">
                Ir a productos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const shippingCost = subtotal > 50000 && shippingMethod === 'free' ? 0 : shippingMethods.find(m => m.id === shippingMethod)?.price || 5000
  const total = subtotal + shippingCost

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email) newErrors.email = 'Email requerido'
    if (!formData.phone) newErrors.phone = 'Teléfono requerido'
    if (!formData.nombre) newErrors.nombre = 'Nombre requerido'
    if (!formData.dni) newErrors.dni = 'DNI requerido'
    if (!formData.calle) newErrors.calle = 'Calle requerida'
    if (!formData.ciudad) newErrors.ciudad = 'Ciudad requerida'
    if (!formData.provincia) newErrors.provincia = 'Provincia requerida'
    if (!formData.codigoPostal) newErrors.codigoPostal = 'Código postal requerido'
    if (!acceptTerms) newErrors.terms = 'Debes aceptar los términos y condiciones'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const randomNumber = Math.floor(Math.random() * 10000)
    const newOrderNumber = `#VM-${String(randomNumber).padStart(5, '0')}`
    setOrderNumber(newOrderNumber)
    setOrderConfirmed(true)
    clearCart()
  }

  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-6 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold text-slate-950">¡Compra confirmada!</h1>
              <p className="text-sm text-slate-500">Tu pedido fue procesado correctamente.</p>
            </div>
            <div className="w-full rounded-lg bg-slate-50 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">Número de pedido</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 font-mono">{orderNumber}</p>
            </div>
            <p className="text-sm text-slate-600 text-center">Te enviamos los detalles de tu compra a <span className="font-semibold">{formData.email}</span></p>
            <Link href="/storefront/products" className="w-full">
              <Button className="w-full bg-red-600 text-white hover:bg-red-700">
                Seguir comprando
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link href="/storefront/cart" className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700">
            <ArrowLeft className="h-4 w-4" />
            Volver al carrito
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 font-semibold">F</div>
            <h1 className="text-2xl font-semibold text-slate-950">Fashion Store - Checkout</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="rounded-[2rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-red-600" />
                  Datos de contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono/WhatsApp *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+54 9 11 1234-5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.subscribir}
                    onChange={(e) => setFormData({ ...formData, subscribir: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-red-600 accent-red-600"
                  />
                  <span className="text-sm text-slate-700">Enviarme novedades y promociones por email</span>
                </label>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  Dirección de envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre completo *</Label>
                  <Input
                    id="nombre"
                    placeholder="Juan Pérez"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="mt-1"
                  />
                  {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
                </div>
                <div>
                  <Label htmlFor="dni">DNI *</Label>
                  <Input
                    id="dni"
                    placeholder="12.345.678"
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    className="mt-1"
                  />
                  {errors.dni && <p className="mt-1 text-xs text-red-600">{errors.dni}</p>}
                </div>
                <div>
                  <Label htmlFor="calle">Calle y número *</Label>
                  <Input
                    id="calle"
                    placeholder="Av. Libertador 1234"
                    value={formData.calle}
                    onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
                    className="mt-1"
                  />
                  {errors.calle && <p className="mt-1 text-xs text-red-600">{errors.calle}</p>}
                </div>
                <div>
                  <Label htmlFor="piso">Piso/Departamento (opcional)</Label>
                  <Input
                    id="piso"
                    placeholder="5° B"
                    value={formData.piso}
                    onChange={(e) => setFormData({ ...formData, piso: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="ciudad">Ciudad *</Label>
                    <Input
                      id="ciudad"
                      placeholder="Buenos Aires"
                      value={formData.ciudad}
                      onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                      className="mt-1"
                    />
                    {errors.ciudad && <p className="mt-1 text-xs text-red-600">{errors.ciudad}</p>}
                  </div>
                  <div>
                    <Label htmlFor="provincia">Provincia *</Label>
                    <Select value={formData.provincia} onValueChange={(v) => setFormData({ ...formData, provincia: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {provincias.map((prov) => (
                          <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.provincia && <p className="mt-1 text-xs text-red-600">{errors.provincia}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="codigoPostal">Código postal *</Label>
                  <Input
                    id="codigoPostal"
                    placeholder="1010"
                    value={formData.codigoPostal}
                    onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                    className="mt-1"
                  />
                  {errors.codigoPostal && <p className="mt-1 text-xs text-red-600">{errors.codigoPostal}</p>}
                </div>
                <div>
                  <Label htmlFor="referencias">Referencias (opcional)</Label>
                  <textarea
                    id="referencias"
                    placeholder="Ej: Casa con portón azul, timbre en la derecha"
                    value={formData.referencias}
                    onChange={(e) => setFormData({ ...formData, referencias: e.target.value })}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-ring/50"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-red-600" />
                  Método de envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {shippingMethods.map((method) => (
                  <label key={method.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50">
                    <input
                      type="radio"
                      name="shipping"
                      value={method.id}
                      checked={shippingMethod === method.id}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="h-4 w-4 accent-red-600"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{method.label}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {method.price === 0 ? 'Gratis' : `$${method.price.toLocaleString('es-AR')}`}
                    </span>
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[2rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-red-600" />
                  Método de pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {paymentMethods.map((method) => (
                  <label key={method.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50">
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 accent-red-600"
                    />
                    <span className="text-lg">{method.icon}</span>
                    <span className="text-sm font-semibold text-slate-900">{method.label}</span>
                  </label>
                ))}
                {paymentMethod === 'transfer' && (
                  <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Datos de transferencia:</p>
                    <p className="mt-2">CBU: 0072001720000000000000</p>
                    <p>Alias: fashionstore.tienda</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[2rem]">
              <CardContent className="pt-6">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600 accent-red-600"
                  />
                  <span className="text-sm text-slate-600">
                    Acepto los <a href="#" className="text-red-600 hover:underline">términos y condiciones</a> y la <a href="#" className="text-red-600 hover:underline">política de privacidad</a>
                  </span>
                </label>
                {errors.terms && <p className="mt-2 text-xs text-red-600">{errors.terms}</p>}
                <Button type="submit" className="mt-6 w-full rounded-full bg-red-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-red-600/10 hover:bg-red-700">
                  Confirmar compra
                </Button>
              </CardContent>
            </Card>
          </form>

          <aside className="sticky top-6 space-y-6">
            <Card className="rounded-[2rem]">
              <CardHeader>
                <CardTitle>Resumen del pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-48 space-y-3 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                      <div className="flex-1 text-sm">
                        <p className="font-semibold text-slate-900 line-clamp-2">{item.name}</p>
                        <p className="text-slate-500">x{item.quantity}</p>
                        <p className="font-semibold text-slate-900">${(item.price * item.quantity).toLocaleString('es-AR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Envío</span>
                    <span>${shippingCost.toLocaleString('es-AR')}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-2xl font-semibold text-red-600">${total.toLocaleString('es-AR')}</span>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  Pago seguro con Mercado Pago
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
