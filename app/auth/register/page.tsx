'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Store, Eye, EyeOff, Loader2, Check } from 'lucide-react'
import type { SupabaseClient, User as AuthUser } from '@supabase/supabase-js'
import { completeOnboardingRequest } from '@/lib/onboarding-client'
import { trackEvent, identifyUser } from '@/lib/posthog'
import { captureError, setUser } from '@/lib/sentry'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthFormHeader } from '@/components/auth/auth-form-header'
import {
  authErrorClassName,
  authGlassCardClassName,
  authInputClassName,
  authLabelClassName,
  authLinkClassName,
  authMutedTextClassName,
  authSubmitButtonClassName,
} from '@/lib/auth-styles'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

function mapAuthError(message: string): string {
  if (message.includes('already registered') || message.includes('already been registered')) {
    return 'Este email ya está registrado'
  }
  if (message.includes('Password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres'
  }
  if (message.includes('Unable to validate email') || message.includes('is invalid')) {
    return 'Email inválido'
  }
  if (message.includes('Email not confirmed')) {
    return 'Debés confirmar tu email antes de continuar'
  }
  return message
}

type AuthResult =
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'pending_verification' }
  | { status: 'error'; message: string }

async function resolveAuthenticatedUser(
  supabase: SupabaseClient,
  email: string,
  password: string,
  signUpUser: AuthUser | null,
  hasSession: boolean,
): Promise<AuthResult> {
  if (signUpUser && hasSession) {
    return { status: 'authenticated', user: signUpUser }
  }

  if (!signUpUser) {
    return { status: 'error', message: 'No se pudo crear la cuenta' }
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInData.user) {
    return { status: 'authenticated', user: signInData.user }
  }

  if (signInError?.message.includes('Email not confirmed')) {
    return { status: 'pending_verification' }
  }

  if (signInError) {
    return { status: 'error', message: mapAuthError(signInError.message) }
  }

  return { status: 'pending_verification' }
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [storeName, setStoreName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(false)

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      setError('El nombre completo es requerido')
      return false
    }
    if (!storeName.trim()) {
      setError('El nombre de la tienda es requerido')
      return false
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Email válido requerido')
      return false
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return false
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }
    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones')
      return false
    }
    return true
  }

  const completeOnboarding = async () => {
    const payload = await completeOnboardingRequest({
      fullName: fullName.trim(),
      storeName: storeName.trim(),
    })

    if (!payload.success) {
      throw new Error(payload.error ?? 'No se pudo crear la tienda')
    }

    trackEvent('store_created', {
      store_id: payload.storeId,
      store_name: storeName.trim(),
      slug: payload.slug,
    })

    return payload
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const trimmedEmail = email.trim()

      const { data, error: authError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            store_name: storeName.trim(),
          },
        },
      })

      if (authError) {
        setError(mapAuthError(authError.message))
        return
      }

      const authResult = await resolveAuthenticatedUser(
        supabase,
        trimmedEmail,
        password,
        data.user,
        Boolean(data.session),
      )

      if (authResult.status === 'error') {
        setError(authResult.message)
        return
      }

      if (authResult.status === 'pending_verification') {
        setPendingVerification(true)
        return
      }

      const onboardingResult = await completeOnboarding()

      if (authResult.status === 'authenticated') {
        const userId = authResult.user.id
        identifyUser(userId, {
          email: trimmedEmail,
          created_at: new Date().toISOString(),
        })
        setUser(userId, trimmedEmail)
      }

      trackEvent('user_registered', {
        method: 'email',
        email: trimmedEmail,
        store_id: onboardingResult.storeId,
      })

      setSuccess(true)
      router.refresh()
      setTimeout(() => {
        router.push('/admin')
      }, 1500)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Ocurrió un error inesperado')
      setError(error.message)
      captureError(error, { flow: 'register' })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (pendingVerification) {
    return (
      <Card className={authGlassCardClassName}>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-white">Revisá tu email</h2>
            <p className="max-w-sm text-sm text-white/80">
              Te enviamos un enlace de confirmación a <strong className="text-white">{email}</strong>.
              Al confirmar, iniciá sesión para completar la configuración de tu tienda.
            </p>
          </div>
          <Link href="/auth/login" className={`text-sm ${authLinkClassName}`}>
            Ir a iniciar sesión
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <Card className={authGlassCardClassName}>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Check className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-white">¡Cuenta creada!</h2>
            <p className="text-sm text-white/80">Tu tienda está lista. Redirigiendo al panel...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={authGlassCardClassName}>
      <CardHeader className="space-y-0 pb-0">
        <AuthFormHeader title="Crear cuenta" description="Registrate y empezá a vender en minutos" />
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleRegister} className="space-y-4">
          {error && <div className={authErrorClassName}>{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="fullName" className={authLabelClassName}>Nombre completo</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
              <Input
                id="fullName"
                type="text"
                placeholder="Juan Pérez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                className={`pl-10 ${authInputClassName}`}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeName" className={authLabelClassName}>Nombre de la tienda</Label>
            <div className="relative">
              <Store className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
              <Input
                id="storeName"
                type="text"
                placeholder="Mi Tienda Online"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                disabled={loading}
                className={`pl-10 ${authInputClassName}`}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className={authLabelClassName}>Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
              <Input
                id="email"
                type="email"
                placeholder="tú@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className={`pl-10 ${authInputClassName}`}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className={authLabelClassName}>Contraseña</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className={`pl-10 pr-10 ${authInputClassName}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 transition hover:text-white disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-white/70">Mínimo 6 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className={authLabelClassName}>Confirmar contraseña</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className={`pl-10 pr-10 ${authInputClassName}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 transition hover:text-white disabled:opacity-50"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              disabled={loading}
              className="mt-1 h-4 w-4 rounded accent-red-600 cursor-pointer disabled:opacity-50"
            />
            <span className="text-xs text-white/80">
              Acepto los <a href="#" className={authLinkClassName}>términos y condiciones</a> y la{' '}
              <a href="#" className={authLinkClassName}>política de privacidad</a>
            </span>
          </label>

          <Button
            type="submit"
            disabled={loading}
            className={authSubmitButtonClassName}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>

        <p className={`text-center text-sm ${authMutedTextClassName}`}>
          ¿Ya tenés cuenta?{' '}
          <Link href="/auth/login" className={authLinkClassName}>
            Inicia sesión aquí
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
