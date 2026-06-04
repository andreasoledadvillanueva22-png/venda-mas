'use client'

import { useState } from 'react'
import {
  DollarSign,
  Edit,
  Mail,
  Pause,
  Percent,
  Play,
  Plus,
  Tag,
  TrendingUp,
  Trash2,
  Truck,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const discountsMock = [
  {
    id: 1,
    code: 'VERANO20',
    type: 'Porcentaje',
    value: '20%',
    uses: { current: 23, max: 100 },
    status: 'Activo',
    expiration: '31/07/2026',
  },
  {
    id: 2,
    code: 'BIENVENIDO10',
    type: 'Porcentaje',
    value: '10%',
    uses: { current: 45, max: null },
    status: 'Activo',
    expiration: 'Sin expiración',
  },
  {
    id: 3,
    code: 'ENVIOGRATIS',
    type: 'Envío gratis',
    value: 'Gratis',
    uses: { current: 12, max: 50 },
    status: 'Activo',
    expiration: '30/06/2026',
  },
  {
    id: 4,
    code: 'BLACKFRIDAY',
    type: 'Monto fijo',
    value: '$10.000',
    uses: { current: 100, max: 100 },
    status: 'Expirado',
    expiration: 'Expiró 30/11/2025',
  },
]

const campaignsMock = [
  {
    id: 1,
    title: 'Campaña Invierno 2026',
    status: 'Activa',
    dates: '01/06 - 31/07',
    reach: 12450,
    clicks: 890,
    conversions: 67,
    revenue: 456000,
  },
  {
    id: 2,
    title: 'Día de la Madre',
    status: 'Finalizada',
    dates: '01/05 - 20/05',
    reach: 8900,
    clicks: 1234,
    conversions: 145,
    revenue: 890000,
  },
  {
    id: 3,
    title: 'Lanzamiento Productos',
    status: 'Pausada',
    dates: '15/06 - 30/06',
    reach: 3400,
    clicks: 234,
    conversions: 12,
    revenue: 78000,
  },
]

const emailsMock = [
  {
    id: 1,
    subject: 'Nuevos productos de invierno',
    sendDate: '03/06/2026',
    recipients: 1245,
    openRate: 34.2,
    clickRate: 8.7,
    status: 'Enviado',
  },
  {
    id: 2,
    subject: 'Oferta especial fin de semana',
    sendDate: '01/06/2026',
    recipients: 1198,
    openRate: 28.5,
    clickRate: 6.3,
    status: 'Enviado',
  },
  {
    id: 3,
    subject: 'Recordatorio de carrito abandonado',
    sendDate: 'Programado 06/06/2026',
    recipients: 89,
    openRate: null,
    clickRate: null,
    status: 'Programado',
  },
  {
    id: 4,
    subject: 'Newsletter mensual mayo',
    sendDate: '15/05/2026',
    recipients: 1156,
    openRate: 31.8,
    clickRate: 7.2,
    status: 'Enviado',
  },
]

function formatPrice(value: number) {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  })
}

function statusBadgeClasses(status: string) {
  switch (status) {
    case 'Activo':
      return 'bg-emerald-100 text-emerald-700'
    case 'Expirado':
      return 'bg-slate-100 text-slate-700'
    case 'Pausado':
      return 'bg-amber-100 text-amber-700'
    case 'Activa':
      return 'bg-emerald-100 text-emerald-700'
    case 'Pausada':
      return 'bg-amber-100 text-amber-700'
    case 'Finalizada':
      return 'bg-slate-100 text-slate-700'
    case 'Enviado':
      return 'bg-emerald-100 text-emerald-700'
    case 'Programado':
      return 'bg-blue-100 text-blue-700'
    case 'Borrador':
      return 'bg-slate-100 text-slate-700'
    default:
      return 'bg-muted text-foreground'
  }
}

export default function AdminMarketingPage() {
  const [activeTab, setActiveTab] = useState('descuentos')
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [discountForm, setDiscountForm] = useState({
    code: '',
    type: 'Porcentaje',
    value: '',
    maxUses: '',
    expiration: '',
    minPurchase: false,
    minPurchaseAmount: '',
    categoryRestrict: false,
  })

  const handleDiscountChange = (field: string, value: string | boolean) => {
    setDiscountForm((current) => ({ ...current, [field]: value }))
  }

  const handleCreateDiscount = () => {
    if (!discountForm.code.trim() || !discountForm.value.trim()) {
      alert('Por favor completa los campos requeridos')
      return
    }
    setShowDiscountModal(false)
    setDiscountForm({
      code: '',
      type: 'Porcentaje',
      value: '',
      maxUses: '',
      expiration: '',
      minPurchase: false,
      minPurchaseAmount: '',
      categoryRestrict: false,
    })
    alert('Descuento creado exitosamente: ' + discountForm.code.toUpperCase())
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-border bg-white px-6 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Marketing</h1>
            <p className="text-sm text-muted-foreground">Gestiona descuentos, campañas y email marketing.</p>
          </div>
          <Button onClick={() => setShowDiscountModal(true)} className="bg-red-600 text-white hover:bg-red-700">
            <Plus className="mr-2 h-4 w-4" /> Crear descuento
          </Button>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="descuentos" value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto">
            <TabsList className="inline-flex min-w-[480px] gap-2 rounded-lg bg-white p-2">
              <TabsTrigger value="descuentos">Descuentos</TabsTrigger>
              <TabsTrigger value="campanas">Campañas</TabsTrigger>
              <TabsTrigger value="email">Email marketing</TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-6 space-y-6">
            <TabsContent value="descuentos">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center gap-3 py-6">
                    <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                      <Tag className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-foreground">3</p>
                      <p className="text-sm text-muted-foreground">Descuentos activos</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center gap-3 py-6">
                    <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-foreground">47</p>
                      <p className="text-sm text-muted-foreground">Usados este mes</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center gap-3 py-6">
                    <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-foreground">{formatPrice(234500)}</p>
                      <p className="text-sm text-muted-foreground">Revenue generado</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Descuentos activos</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Usos</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Expiración</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {discountsMock.map((discount) => (
                        <TableRow key={discount.id}>
                          <TableCell>
                            <Badge className="rounded-lg bg-red-100 px-2 py-1 font-mono text-sm font-semibold text-red-700">
                              {discount.code}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{discount.type}</TableCell>
                          <TableCell className="text-sm font-semibold">{discount.value}</TableCell>
                          <TableCell className="text-sm">
                            {discount.uses.max
                              ? `${discount.uses.current}/${discount.uses.max}`
                              : `${discount.uses.current}/∞`}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClasses(discount.status)}`}>
                              {discount.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{discount.expiration}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                {discount.status === 'Activo' ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="campanas">
              <div className="grid gap-6 lg:grid-cols-2">
                {campaignsMock.map((campaign) => (
                  <Card key={campaign.id}>
                    <CardHeader>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                          <CardTitle>{campaign.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{campaign.dates}</p>
                        </div>
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusBadgeClasses(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm text-muted-foreground">Alcance</p>
                          <p className="mt-2 text-2xl font-semibold text-foreground">{campaign.reach.toLocaleString('es-AR')}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm text-muted-foreground">Clics</p>
                          <p className="mt-2 text-2xl font-semibold text-foreground">{campaign.clicks}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm text-muted-foreground">Conversiones</p>
                          <p className="mt-2 text-2xl font-semibold text-foreground">{campaign.conversions}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm text-muted-foreground">Revenue</p>
                          <p className="mt-2 text-2xl font-semibold text-foreground">{formatPrice(campaign.revenue)}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-4 w-full">
                        Ver detalles
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>Campañas de email</CardTitle>
                    <Button onClick={() => setShowEmailModal(true)} className="bg-red-600 text-white hover:bg-red-700">
                      <Mail className="mr-2 h-4 w-4" /> Crear campaña
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asunto</TableHead>
                        <TableHead>Fecha de envío</TableHead>
                        <TableHead>Destinatarios</TableHead>
                        <TableHead>Tasa de apertura</TableHead>
                        <TableHead>Tasa de clics</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailsMock.map((email) => (
                        <TableRow key={email.id}>
                          <TableCell className="font-medium">{email.subject}</TableCell>
                          <TableCell className="text-sm">{email.sendDate}</TableCell>
                          <TableCell className="text-sm">{email.recipients}</TableCell>
                          <TableCell className="text-sm">{email.openRate ? `${email.openRate}%` : '-'}</TableCell>
                          <TableCell className="text-sm">{email.clickRate ? `${email.clickRate}%` : '-'}</TableCell>
                          <TableCell>
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClasses(email.status)}`}>
                              {email.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Crear descuento</CardTitle>
                </div>
                <button onClick={() => setShowDiscountModal(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="code">Código del descuento</Label>
                <Input
                  id="code"
                  placeholder="VERANO20"
                  value={discountForm.code}
                  onChange={(event) => handleDiscountChange('code', event.target.value.toUpperCase())}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de descuento</Label>
                  <Select value={discountForm.type} onValueChange={(value) => handleDiscountChange('type', value)}>
                    <SelectTrigger id="type" className="w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Porcentaje">Porcentaje (%)</SelectItem>
                      <SelectItem value="Monto fijo">Monto fijo ($)</SelectItem>
                      <SelectItem value="Envío gratis">Envío gratis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {discountForm.type !== 'Envío gratis' && (
                  <div className="space-y-2">
                    <Label htmlFor="value">Valor</Label>
                    <Input
                      id="value"
                      placeholder={discountForm.type === 'Porcentaje' ? '20' : '5000'}
                      value={discountForm.value}
                      onChange={(event) => handleDiscountChange('value', event.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Usos máximos (opcional)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    placeholder="100"
                    value={discountForm.maxUses}
                    onChange={(event) => handleDiscountChange('maxUses', event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiration">Fecha de expiración (opcional)</Label>
                  <Input
                    id="expiration"
                    type="date"
                    value={discountForm.expiration}
                    onChange={(event) => handleDiscountChange('expiration', event.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={discountForm.minPurchase}
                    onChange={(event) => handleDiscountChange('minPurchase', event.target.checked)}
                    className="h-4 w-4 rounded border border-input text-red-600"
                  />
                  <span className="text-sm font-medium">Compra mínima requerida</span>
                </label>
                {discountForm.minPurchase && (
                  <Input
                    placeholder="50000"
                    value={discountForm.minPurchaseAmount}
                    onChange={(event) => handleDiscountChange('minPurchaseAmount', event.target.value)}
                  />
                )}

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={discountForm.categoryRestrict}
                    onChange={(event) => handleDiscountChange('categoryRestrict', event.target.checked)}
                    className="h-4 w-4 rounded border border-input text-red-600"
                  />
                  <span className="text-sm font-medium">Aplica solo a ciertas categorías</span>
                </label>
                {discountForm.categoryRestrict && (
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suplementos">Suplementos</SelectItem>
                      <SelectItem value="hogar">Hogar</SelectItem>
                      <SelectItem value="mascotas">Mascotas</SelectItem>
                      <SelectItem value="manualidades">Manualidades</SelectItem>
                      <SelectItem value="tecnologia">Tecnología</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>

            <Separator />
            <div className="flex justify-end gap-3 bg-slate-50 p-4">
              <Button variant="outline" onClick={() => setShowDiscountModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateDiscount} className="bg-red-600 text-white hover:bg-red-700">
                Crear descuento
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Crear campaña de email</CardTitle>
                <button onClick={() => setShowEmailModal(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Asunto</Label>
                <Input id="subject" placeholder="Escribe el asunto del email" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenido</Label>
                <textarea
                  id="content"
                  rows={6}
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-ring/50"
                  placeholder="Escribe el contenido del email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipients">Destinatarios</Label>
                <Select>
                  <SelectTrigger id="recipients" className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los clientes</SelectItem>
                    <SelectItem value="vip">Segmento VIP</SelectItem>
                    <SelectItem value="nuevos">Nuevos clientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sendDate">Fecha de envío</Label>
                <Input id="sendDate" type="datetime-local" />
              </div>
            </CardContent>

            <Separator />
            <div className="flex justify-end gap-3 bg-slate-50 p-4">
              <Button variant="outline" onClick={() => setShowEmailModal(false)}>
                Cancelar
              </Button>
              <Button className="bg-red-600 text-white hover:bg-red-700">
                <Send className="mr-2 h-4 w-4" /> Programar envío
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
