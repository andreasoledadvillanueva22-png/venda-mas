'use client'

import { useState } from 'react'
import { Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isValidWaitlistEmail } from '@/lib/waitlist'
import { cn } from '@/lib/utils'

type WaitlistFormProps = {
  className?: string
  inputClassName?: string
  buttonClassName?: string
  iconClassName?: string
  placeholder?: string
  submitLabel?: string
  helperText?: string
  showIcon?: boolean
}

export function WaitlistForm({
  className,
  inputClassName,
  buttonClassName,
  iconClassName,
  placeholder = 'tu@email.com',
  submitLabel = 'Quiero vender sin comisiones',
  helperText,
  showIcon = true,
}: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccess('')
    setError('')

    if (!isValidWaitlistEmail(email)) {
      setError('Ingresá un email válido')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = (await response.json()) as { success?: boolean; error?: string }

      if (!response.ok) {
        setError(data.error ?? 'Este email ya está registrado o hubo un error.')
        return
      }

      setSuccess('¡Gracias! Te avisaremos cuando lancemos.')
      setEmail('')
    } catch {
      setError('Este email ya está registrado o hubo un error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          {showIcon ? (
            <Mail
              className={cn(
                'pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70',
                iconClassName,
              )}
            />
          ) : null}
          <Input
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder={placeholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
            required
            className={cn(
              'h-12 border-white/30 bg-white/20 text-base text-white placeholder:text-white/70 focus-visible:border-white/50 focus-visible:ring-white/20',
              showIcon ? 'pl-10' : 'px-4',
              inputClassName,
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className={cn(
            'h-12 bg-white px-6 text-base font-semibold text-brand-700 hover:bg-brand-50',
            buttonClassName,
          )}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Enviando...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </form>

      {helperText && !success && !error ? (
        <p className="mt-3 text-sm text-white/75">{helperText}</p>
      ) : null}

      {success ? (
        <p
          className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-500/20 px-3 py-2 text-sm font-medium text-white"
          role="status"
        >
          {success}
        </p>
      ) : null}

      {error ? (
        <p
          className="mt-3 rounded-lg border border-red-400/30 bg-red-500/20 px-3 py-2 text-sm font-medium text-white"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
