'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
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

type DiscountType = 'percentage' | 'fixed' | 'free_shipping'

type CreateDiscountDialogProps = {
  createDiscount: (formData: FormData) => Promise<{ error?: string } | void>
}

const TYPE_LABELS: Record<DiscountType, string> = {
  percentage: 'Porcentaje (%)',
  fixed: 'Monto fijo ($)',
  free_shipping: 'Envío gratis',
}

export function CreateDiscountDialog({ createDiscount }: CreateDiscountDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [type, setType] = useState<DiscountType>('percentage')
  const [value, setValue] = useState('')
  const [minPurchase, setMinPurchase] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [pending, startTransition] = useTransition()

  function resetForm() {
    setCode('')
    setType('percentage')
    setValue('')
    setMinPurchase('')
    setMaxUses('')
    setExpiresAt('')
    setError(null)
  }

  function handleClose() {
    setOpen(false)
    resetForm()
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await createDiscount(formData)

      if (result?.error) {
        setError(result.error)
        return
      }

      handleClose()
      router.refresh()
    })
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-red-600 text-white hover:bg-red-700"
      >
        <Plus className="mr-2 h-4 w-4" /> Crear descuento
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
          <Card className="my-8 w-full max-w-2xl sm:my-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Crear descuento</CardTitle>
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <Separator />
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 py-6">
                {error ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="code">Código del descuento</Label>
                  <Input
                    id="code"
                    name="code"
                    placeholder="VERANO20"
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de descuento</Label>
                    <Select
                      value={type}
                      onValueChange={(nextValue) => {
                        if (nextValue === 'percentage' || nextValue === 'fixed' || nextValue === 'free_shipping') {
                          setType(nextValue)
                        }
                      }}
                    >
                      <SelectTrigger id="type" className="w-full">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(TYPE_LABELS) as DiscountType[]).map((option) => (
                          <SelectItem key={option} value={option}>
                            {TYPE_LABELS[option]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="type" value={type} />
                  </div>

                  {type !== 'free_shipping' ? (
                    <div className="space-y-2">
                      <Label htmlFor="value">Valor</Label>
                      <Input
                        id="value"
                        name="value"
                        type="number"
                        min="0"
                        step={type === 'percentage' ? '0.01' : '1'}
                        placeholder={type === 'percentage' ? '20' : '5000'}
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        required
                      />
                    </div>
                  ) : (
                    <input type="hidden" name="value" value="1" />
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="minPurchase">Mínimo de compra (opcional)</Label>
                    <Input
                      id="minPurchase"
                      name="minPurchase"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="50000"
                      value={minPurchase}
                      onChange={(event) => setMinPurchase(event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxUses">Máximo de usos (opcional)</Label>
                    <Input
                      id="maxUses"
                      name="maxUses"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="100"
                      value={maxUses}
                      onChange={(event) => setMaxUses(event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Fecha de expiración (opcional)</Label>
                  <Input
                    id="expiresAt"
                    name="expiresAt"
                    type="date"
                    value={expiresAt}
                    onChange={(event) => setExpiresAt(event.target.value)}
                  />
                </div>
              </CardContent>

              <Separator />
              <div className="flex justify-end gap-3 bg-slate-50 p-4">
                <Button type="button" variant="outline" onClick={handleClose} disabled={pending}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={pending}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {pending ? 'Creando...' : 'Crear descuento'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </>
  )
}
