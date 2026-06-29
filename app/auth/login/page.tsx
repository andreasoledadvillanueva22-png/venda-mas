'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  buildAbsoluteRedirectUrl,
  buildAuthCallbackUrl,
  createClient,
  getSiteOrigin,
} from '@/lib/supabase/client'
import { completeOnboardingRequest } from '@/lib/onboarding-client'
import {
  authErrorClassName,
  authGlassCardClassName,
  authInputClassName,
  authLabelClassName,
  authLinkClassName,
  authMutedTextClassName,
  authSubmitButtonClassName,
} from '@/lib/auth-styles'
import { AuthFormHeader } from '@/components/auth/auth-form-header'
import Link from 'next/link'

function getRedirectPath(searchParams: URLSearchParams): string {
  const redirect = searchParams.get('redirect')

  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect
  }

  return '/admin'
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-800 via-brand-600 to-brand-400">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}

function LoginPageContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(searchParams.get('error') ?? '')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const origin = getSiteOrigin()
    const redirectPath = getRedirectPath(searchParams)
    const redirectUrl = buildAbsoluteRedirectUrl(redirectPath)

    console.log('[login] submit', {
      origin,
      redirectPath,
      redirectUrl,
      email: email.trim(),
    })

    try {
      console.log('[login] calling signInWithPassword...')
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      console.log('[login] signInWithPassword result', {
        authError: authError?.message ?? null,
        userId: data.user?.id ?? null,
        hasSession: Boolean(data.session),
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Email o contraseña incorrectos')
        } else {
          setError(authError.message || 'Error al iniciar sesión')
        }
        return
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      console.log('[login] getSession after signIn', {
        sessionError: sessionError?.message ?? null,
        hasSession: Boolean(sessionData.session),
        cookieCount: typeof document !== 'undefined' ? document.cookie.split('; ').filter(Boolean).length : 0,
      })

      if (sessionError || !sessionData.session) {
        setError('No se pudo establecer la sesión. Revisá la consola para más detalles.')
        return
      }

      if (data.user) {
        await completeOnboardingRequest()
        console.log('[login] redirecting to', redirectUrl)
        window.location.href = redirectUrl
        return
      }

      console.log('[login] no user returned without error')
      setError('No se pudo iniciar sesión')
    } catch (err) {
      console.error('[login] unexpected error', err)
      setError('Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)

    const redirectPath = getRedirectPath(searchParams)
    const callbackUrl = buildAuthCallbackUrl(redirectPath)

    console.log('[login] google oauth start', {
      origin: getSiteOrigin(),
      callbackUrl,
    })

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
        },
      })

      console.log('[login] signInWithOAuth result', {
        authError: authError?.message ?? null,
      })

      if (authError) {
        setError(authError.message || 'Error al iniciar sesión con Google')
      }
    } catch (err) {
      console.error('[login] google unexpected error', err)
      setError('Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={authGlassCardClassName}>
      <CardHeader className="space-y-0 pb-0">
        <AuthFormHeader title="Iniciar sesión" description="Ingresá a tu panel de administración" />
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleLogin} className="space-y-4">
          {error && <div className={authErrorClassName}>{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="email" className={authLabelClassName}>
              Email
            </Label>
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
            <Label htmlFor="password" className={authLabelClassName}>
              Contraseña
            </Label>
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
          </div>

          <Link href="/auth/forgot-password" className={`text-xs ${authLinkClassName}`}>
            ¿Olvidaste tu contraseña?
          </Link>

          <Button type="submit" disabled={loading} className={authSubmitButtonClassName}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full bg-white/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-transparent px-2 font-medium text-white/70">o</span>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          variant="secondary"
          className="h-11 w-full rounded-xl border-white/30 bg-white/20 text-white hover:bg-white/30"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuar con Google
        </Button>

        <p className={`text-center text-sm ${authMutedTextClassName}`}>
          ¿No tenés cuenta?{' '}
          <Link href="/auth/register" className={authLinkClassName}>
            Registrate aquí
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
