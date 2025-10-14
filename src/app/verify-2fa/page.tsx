"use client"

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { toast } from 'react-hot-toast'

function Verify2FAContent() {
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [timeLeft, setTimeLeft] = useState(3 * 60) // 3 minutos en segundos
  const [canResend, setCanResend] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Obtener email de los parámetros de URL
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    } else {
      // Si no hay email, redirigir al login
      router.push('/login')
    }
  }, [searchParams, router])

  useEffect(() => {
    // Timer de countdown
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleCodeChange = (index: number, value: string) => {
    // Solo permitir dígitos
    if (!/^\d*$/.test(value)) return

    // Actualizar el código
    const newCode = code.split('')
    newCode[index] = value
    setCode(newCode.join(''))

    // Auto-avanzar al siguiente campo
    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Retroceder con Backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    // Avanzar con Enter
    if (e.key === 'Enter' && code.length === 8) {
      handleSubmit()
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (code.length !== 8) {
      toast.error('Por favor ingresa el código completo de 8 dígitos')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Código verificado correctamente, proceder con el login usando el usuario verificado
        const result = await signIn('credentials', {
          redirect: false,
          email: data.user.email,
          password: '2FA_VERIFIED', // Flag especial para indicar que ya pasó 2FA
          twoFactorCode: code, // Incluir el código verificado
        })

        if (result?.ok) {
          // Marcar código como usado después del login exitoso
          if (data.codeId) {
            try {
              await fetch('/api/auth/mark-code-used', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  codeId: data.codeId,
                  email: email
                })
              })
            } catch (error) {
              console.error('Error marcando código como usado:', error)
            }
          }

          toast.success('¡Verificación exitosa! Bienvenido')
          // Obtener URL de retorno si existe
          const returnUrl = searchParams.get('returnUrl') || '/perfil'
          router.push(returnUrl)
        } else {
          console.error('Error en signIn:', result)
          toast.error('Error al completar el inicio de sesión')
        }
      } else {
        toast.error(data.error || 'Código inválido')
        setCode('')
        inputRefs.current[0]?.focus()
      }
    } catch (error) {
      toast.error('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResendLoading(true)
    
    try {
      const response = await fetch('/api/auth/resend-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Nuevo código enviado a tu correo')
        setTimeLeft(3 * 60)
        setCanResend(false)
        setCode('')
        inputRefs.current[0]?.focus()
      } else {
        toast.error(data.error || 'Error al reenviar el código')
      }
    } catch (error) {
      toast.error('Error de conexión. Intenta de nuevo.')
    } finally {
      setResendLoading(false)
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-neutral-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-elegant py-12">
      <div className="bg-white rounded-xl shadow-elegant p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-neutral-700 mb-2">Verificación de Seguridad</h1>
          <p className="text-neutral-600 text-sm">
            Hemos enviado un código de 8 dígitos a:
          </p>
          <p className="font-medium text-primary-600 mt-1">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-neutral-700 font-medium mb-3 text-center">
              Ingresa el código de verificación:
            </label>
            <div className="flex justify-center gap-2 mb-4">
              {Array.from({ length: 8 }, (_, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  maxLength={1}
                  value={code[index] || ''}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 text-center text-lg font-bold border-2 border-neutral-200 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={loading || code.length !== 8}
              className="btn-primary w-full py-3 rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Verificar Código'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <div className="mb-4">
            {timeLeft > 0 ? (
              <p className="text-sm text-neutral-600">
                El código expira en: <span className="font-bold text-orange-600">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <p className="text-sm text-red-600 font-medium">
                El código ha expirado
              </p>
            )}
          </div>

          <button
            onClick={handleResendCode}
            disabled={!canResend || resendLoading}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading ? 'Enviando...' : 'Reenviar código'}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-200 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-neutral-500 hover:text-neutral-700 text-sm"
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      </div>
    </main>
  )
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-neutral-600">Cargando...</p>
        </div>
      </div>
    }>
      <Verify2FAContent />
    </Suspense>
  )
}
