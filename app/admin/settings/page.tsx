'use client'

import { useEffect, useState } from 'react'
import {
  Banknote,
  CreditCard,
  Plus,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

const paymentMethodsMock = [
  {
    id: 'mercadoPago',
    name: 'Mercado Pago',
    active: true,
    icon: CreditCard,
    credentials: {
      publicKey: '•••••••••••',
      accessToken: '•••••••••••',
    },
  },
  {
    id: 'transferencia',
    name: 'Transferencia bancaria',
    active: false,
    icon: Banknote,
    credentials: {
      cbu: '',
      cvu: '',
      alias: '',
      titular: '',
    },
  },
  {
    id: 'efectivo',
    name: 'Efectivo contra entrega',
    active: false,
    icon: ShieldCheck,
    credentials: {
      costoAdicional: '0',
    },
  },
]

const initialTeam = [
  {
    id: '1',
    name: 'Andrea Villanueva',
    email: 'admin@vendamas.com',
    role: 'Dueño',
    removable: false,
  },
  {
    id: '2',
    name: 'Juan Pérez',
    email: 'juan@fashion.com',
    role: 'Admin',
    removable: true,
  },
]

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [savedMessage, setSavedMessage] = useState('')

  const [storeName, setStoreName] = useState('Fashion Store')
  const [storeDescription, setStoreDescription] = useState('Tienda de moda con envío rápido a clientes en Argentina.')
  const [logoUrl, setLogoUrl] = useState('/logo.svg')
  const [domain, setDomain] = useState('fashion.vendamas.com')
  const [timezone, setTimezone] = useState('Buenos Aires (GMT-3)')
  const [currency, setCurrency] = useState('Peso Argentino (ARS)')

  const [paymentMethods, setPaymentMethods] = useState(paymentMethodsMock)
  const [shippingZones, setShippingZones] = useState([
    { id: 'cf', name: 'Capital Federal', cost: '2500', eta: '24-48hs', active: true },
    { id: 'gba', name: 'GBA', cost: '3500', eta: '48-72hs', active: true },
    { id: 'interior', name: 'Interior', cost: '5000', eta: '3-5 días', active: true },
  ])
  const [freeShippingActive, setFreeShippingActive] = useState(true)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('50000')

  const [notifications, setNotifications] = useState({
    pedidoCreado: true,
    pedidoEnviado: true,
    pedidoEntregado: true,
    nuevoPedidoAdmin: true,
    resumenDiario: false,
    email: 'notificaciones@vendamas.com',
  })

  const [team, setTeam] = useState(initialTeam)

  useEffect(() => {
    if (!savedMessage) return
    const timer = window.setTimeout(() => setSavedMessage(''), 2500)
    return () => window.clearTimeout(timer)
  }, [savedMessage])

  const toast = savedMessage ? (
    <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-slate-900/10">
      {savedMessage}
    </div>
  ) : null

  const saveSettings = () => {
    setSavedMessage('Configuración guardada correctamente')
  }

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods((current) =>
      current.map((method) =>
        method.id === id ? { ...method, active: !method.active } : method
      )
    )
  }

  const updatePaymentField = (id: string, field: string, value: string) => {
    setPaymentMethods((current) =>
      current.map((method) =>
        method.id === id
          ? { ...method, credentials: { ...method.credentials, [field]: value } }
          : method
      )
    )
  }

  const toggleShippingZone = (id: string) => {
    setShippingZones((current) =>
      current.map((zone) =>
        zone.id === id ? { ...zone, active: !zone.active } : zone
      )
    )
  }

  const removeTeamMember = (id: string) => {
    setTeam((current) => current.filter((member) => member.id !== id))
  }

  const addShippingZone = () => {
    const nextId = `zone-${shippingZones.length + 1}`
    setShippingZones((current) => [
      ...current,
      { id: nextId, name: 'Nueva zona', cost: '0', eta: '0 días', active: false },
    ])
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      {toast}

      <div className="space-y-3 pb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">Configuración</p>
            <h1 className="text-3xl font-semibold text-foreground">Configuración de la tienda</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Users className="h-5 w-5 text-red-600" />
            <p className="text-sm text-muted-foreground">Administra la configuración general de tu tienda.</p>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="px-0 py-0">
            <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
              <div className="overflow-x-auto border-b border-border bg-white px-4 py-2">
                <TabsList className="flex min-w-[640px] gap-2">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="pagos">Pagos</TabsTrigger>
                  <TabsTrigger value="envios">Envíos</TabsTrigger>
                  <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
                  <TabsTrigger value="equipo">Equipo</TabsTrigger>
                </TabsList>
              </div>

              <div className="bg-slate-50 p-6">
                {/* GENERAL */}
                <TabsContent value="general">
                  <Card>
                    <CardHeader>
                      <CardTitle>General</CardTitle>
                      <CardDescription>Información básica de tu tienda y dominio.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="store-name">Nombre de la tienda</Label>
                          <Input
                            id="store-name"
                            value={storeName}
                            onChange={(event) => setStoreName(event.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="store-domain">Dominio de la tienda</Label>
                          <div className="flex gap-2">
                            <Input id="store-domain" value={domain} readOnly className="flex-1" />
                            <Button variant="outline">Conectar dominio propio</Button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="store-description">Descripción de la tienda</Label>
                        <textarea
                          id="store-description"
                          value={storeDescription}
                          onChange={(event) => setStoreDescription(event.target.value)}
                          rows={5}
                          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-ring/50"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Logo actual</Label>
                          <div className="flex items-center gap-4 rounded-3xl border border-border bg-white p-4">
                            <img src={logoUrl} alt="Logo actual" className="h-16 w-16 rounded-full object-cover" />
                            <Button variant="outline">Cambiar logo</Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timezone">Zona horaria</Label>
                          <Select value={timezone} onValueChange={setTimezone}>
                            <SelectTrigger id="timezone" className="w-full">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Buenos Aires (GMT-3)">Buenos Aires (GMT-3)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="currency">Moneda</Label>
                          <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger id="currency" className="w-full">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Peso Argentino (ARS)">Peso Argentino (ARS)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="button" onClick={saveSettings}>Guardar cambios</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* PAGOS */}
                <TabsContent value="pagos">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pagos</CardTitle>
                      <CardDescription>Activa o desactiva los métodos de pago disponibles.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {paymentMethods.map((method) => {
                        const Icon = method.icon
                        return (
                          <Card key={method.id} className="rounded-3xl border border-border bg-white">
                            <CardContent className="space-y-4">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                    <Icon className="h-5 w-5" />
                                  </span>
                                  <div>
                                    <p className="text-base font-semibold text-foreground">{method.name}</p>
                                    <p className="text-sm text-muted-foreground">{method.active ? 'Activo' : 'Desactivado'}</p>
                                  </div>
                                </div>
                                <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={method.active}
                                    onChange={() => togglePaymentMethod(method.id)}
                                    className="peer sr-only"
                                  />
                                  <span className="inline-flex h-6 w-11 items-center rounded-full bg-slate-300 px-1 transition peer-checked:bg-red-600">
                                    <span className="inline-flex h-4 w-4 transform rounded-full bg-white transition peer-checked:translate-x-5" />
                                  </span>
                                </label>
                              </div>
                              {method.active && (
                                <div className="space-y-4 border-t border-border pt-4">
                                  {method.id === 'mercadoPago' && (
                                    <>
                                      <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                          <Label htmlFor="public-key">Public Key</Label>
                                          <Input
                                            id="public-key"
                                            type="password"
                                            value={method.credentials.publicKey}
                                            onChange={(event) => updatePaymentField(method.id, 'publicKey', event.target.value)}
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="access-token">Access Token</Label>
                                          <Input
                                            id="access-token"
                                            type="password"
                                            value={method.credentials.accessToken}
                                            onChange={(event) => updatePaymentField(method.id, 'accessToken', event.target.value)}
                                          />
                                        </div>
                                      </div>
                                      <Button variant="outline">Conectar cuenta de Mercado Pago</Button>
                                    </>
                                  )}
                                  {method.id === 'transferencia' && (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                      <div className="space-y-2">
                                        <Label htmlFor="cbu">CBU</Label>
                                        <Input
                                          id="cbu"
                                          value={method.credentials.cbu}
                                          onChange={(event) => updatePaymentField(method.id, 'cbu', event.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="cvu">CVU</Label>
                                        <Input
                                          id="cvu"
                                          value={method.credentials.cvu}
                                          onChange={(event) => updatePaymentField(method.id, 'cvu', event.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="alias">Alias</Label>
                                        <Input
                                          id="alias"
                                          value={method.credentials.alias}
                                          onChange={(event) => updatePaymentField(method.id, 'alias', event.target.value)}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="titular">Titular</Label>
                                        <Input
                                          id="titular"
                                          value={method.credentials.titular}
                                          onChange={(event) => updatePaymentField(method.id, 'titular', event.target.value)}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  {method.id === 'efectivo' && (
                                    <div className="space-y-2">
                                      <Label htmlFor="costo-adicional">Costo adicional (%)</Label>
                                      <Input
                                        id="costo-adicional"
                                        type="number"
                                        value={method.credentials.costoAdicional}
                                        onChange={(event) => updatePaymentField(method.id, 'costoAdicional', event.target.value)}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                      <div className="flex justify-end">
                        <Button type="button" onClick={saveSettings}>Guardar cambios</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ENVÍOS */}
                <TabsContent value="envios">
                  <Card>
                    <CardHeader>
                      <CardTitle>Envíos</CardTitle>
                      <CardDescription>Configura zonas de envío y promociones de envío gratis.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        {shippingZones.map((zone) => (
                          <div key={zone.id} className="rounded-3xl border border-border bg-white p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-base font-semibold text-foreground">{zone.name}</p>
                                <p className="text-sm text-muted-foreground">Costo: ${zone.cost} · Tiempo: {zone.eta}</p>
                              </div>
                              <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={zone.active}
                                  onChange={() => toggleShippingZone(zone.id)}
                                  className="peer sr-only"
                                />
                                <span className="inline-flex h-6 w-11 items-center rounded-full bg-slate-300 px-1 transition peer-checked:bg-red-600">
                                  <span className="inline-flex h-4 w-4 transform rounded-full bg-white transition peer-checked:translate-x-5" />
                                </span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" onClick={addShippingZone}>
                        <Plus className="mr-2 h-4 w-4" /> Agregar zona de envío
                      </Button>
                      <div className="rounded-3xl border border-border bg-white p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-base font-semibold text-foreground">Ofrecer envío gratis</p>
                            <p className="text-sm text-muted-foreground">Activa un umbral para envío gratuito.</p>
                          </div>
                          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={freeShippingActive}
                              onChange={() => setFreeShippingActive((current) => !current)}
                              className="peer sr-only"
                            />
                            <span className="inline-flex h-6 w-11 items-center rounded-full bg-slate-300 px-1 transition peer-checked:bg-red-600">
                              <span className="inline-flex h-4 w-4 transform rounded-full bg-white transition peer-checked:translate-x-5" />
                            </span>
                          </label>
                        </div>
                        {freeShippingActive && (
                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="free-shipping-threshold">En compras superiores a</Label>
                              <Input
                                id="free-shipping-threshold"
                                type="number"
                                value={freeShippingThreshold}
                                onChange={(event) => setFreeShippingThreshold(event.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <Button type="button" onClick={saveSettings}>Guardar cambios</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* NOTIFICACIONES */}
                <TabsContent value="notificaciones">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notificaciones</CardTitle>
                      <CardDescription>Configura los correos automáticos de la tienda.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        {[
                          { key: 'pedidoCreado', label: 'Enviar email al cliente cuando se crea un pedido' },
                          { key: 'pedidoEnviado', label: 'Enviar email al cliente cuando se envía el pedido' },
                          { key: 'pedidoEntregado', label: 'Enviar email al cliente cuando se entrega el pedido' },
                          { key: 'nuevoPedidoAdmin', label: 'Enviar email al admin cuando hay un nuevo pedido' },
                          { key: 'resumenDiario', label: 'Enviar resumen diario de ventas' },
                        ].map((item) => (
                          <label key={item.key} className="inline-flex w-full cursor-pointer items-center justify-between rounded-3xl border border-border bg-white px-4 py-4 text-sm">
                            <span>{item.label}</span>
                            <input
                              type="checkbox"
                              checked={notifications[item.key as keyof typeof notifications] as boolean}
                              onChange={() =>
                                setNotifications((current) => ({
                                  ...current,
                                  [item.key]: !current[item.key as keyof typeof notifications],
                                }))
                              }
                              className="peer sr-only"
                            />
                            <span className="inline-flex h-6 w-11 items-center rounded-full bg-slate-300 px-1 transition peer-checked:bg-red-600">
                              <span className="inline-flex h-4 w-4 transform rounded-full bg-white transition peer-checked:translate-x-5" />
                            </span>
                          </label>
                        ))}
                        <div className="space-y-2">
                          <Label htmlFor="notifications-email">Email de notificaciones</Label>
                          <Input
                            id="notifications-email"
                            type="email"
                            value={notifications.email}
                            onChange={(event) => setNotifications((current) => ({ ...current, email: event.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="button" onClick={saveSettings}>Guardar cambios</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* EQUIPO */}
                <TabsContent value="equipo">
                  <Card>
                    <CardHeader>
                      <CardTitle>Equipo</CardTitle>
                      <CardDescription>Administra los miembros de tu equipo.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Miembro</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {team.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-foreground">{member.name}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{member.email}</TableCell>
                              <TableCell>{member.role}</TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeTeamMember(member.id)}
                                    disabled={!member.removable}
                                  >
                                    Eliminar
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <Button type="button">
                        <Plus className="mr-2 h-4 w-4" /> Invitar miembro
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}