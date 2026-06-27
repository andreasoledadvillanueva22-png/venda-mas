'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { validateStoreSlug } from '@/lib/slug'
import { cn } from '@/lib/utils'

type StoreSlugFieldProps = {
  defaultSlug: string
  formId: string
  platformDomain: string
}

export function StoreSlugField({ defaultSlug, formId, platformDomain }: StoreSlugFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [slug, setSlug] = useState(defaultSlug)

  const validation = useMemo(() => validateStoreSlug(slug), [slug])
  const previewUrl = `https://${platformDomain}/storefront?store=${
    validation.valid ? validation.slug : 'tu-slug'
  }`

  useEffect(() => {
    const input = inputRef.current
    if (!input) {
      return
    }

    if (!validation.valid) {
      input.setCustomValidity(validation.error)
    } else {
      input.setCustomValidity('')
    }
  }, [validation])

  return (
    <div className="space-y-2">
      <Label htmlFor="storeSlug">Slug de la tienda</Label>
      <Input
        ref={inputRef}
        id="storeSlug"
        name="storeSlug"
        form={formId}
        value={slug}
        onChange={(event) => setSlug(event.target.value)}
        placeholder="mi-tienda"
        autoComplete="off"
        spellCheck={false}
        className={cn(
          'font-mono',
          validation.valid
            ? 'border-emerald-300 focus-visible:border-emerald-500'
            : 'border-red-300 focus-visible:border-red-500',
        )}
        required
        minLength={3}
        maxLength={50}
      />

      {validation.valid ? (
        <p className="text-xs text-emerald-700">Formato válido: {validation.slug}</p>
      ) : (
        <p className="text-xs text-red-600">{validation.error}</p>
      )}

      <p className="text-xs text-muted-foreground">
        Este slug se usa en la URL de tu tienda:{' '}
        <span className="font-mono text-foreground">{previewUrl}</span>
      </p>

      {slug.trim() !== defaultSlug ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Cambiar el slug cambiará la URL de tu tienda. Los enlaces antiguos dejarán de funcionar.
        </p>
      ) : null}
    </div>
  )
}
