"use client"

import { useState, useEffect } from 'react'
import { log } from '@/lib/secureLogger'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RestablecerPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [completed, setCompleted] = useState(false)
  const [token, setToken] = useState<string>('')
  const router = useRouter()

  // Extraer el token de los params
  useEffect(() => {
    params.then(({ token }) => {
      setToken(token)
    })
  }, [params])

  // Verificar si el token es válido
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/verificar-token?token=${token}`)
        const data = await response.json()
        
        setIsValid(response.ok)
        if (!response.ok) {
          toast.error(data.error || 'El enlace no es válido o ha expirado')
        }
      } catch (error) {
        log.error('Error:', error)
        toast.error('Error al verificar el enlace')
        setIsValid(false)
      } finally {
        setVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/restablecer-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setCompleted(true)
        toast.success('Contraseña restablecida con éxito')
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        toast.error(data.error || 'Error al restablecer la contraseña')
      }
    } catch (error) {
      log.error('Error:', error)
      toast.error('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-elegant py-12">
        <div className="bg-white rounded-xl shadow-elegant p-6 w-full max-w-sm text-center">
          <h1 className="text-xl font-bold text-neutral-700 mb-4">Verificando enlace</h1>
          <div className="animate-pulse flex justify-center">
            <div className="h-8 w-8 bg-primary-200 rounded-full"></div>
          </div>
          <p className="text-neutral-600 mt-4">Estamos verificando la validez de tu enlace...</p>
        </div>
      </main>
    )
  }

  if (!isValid) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-elegant py-12">
        <div className="bg-white rounded-xl shadow-elegant p-6 w-full max-w-sm">
          <h1 className="text-xl font-bold text-neutral-700 mb-2 text-center">Enlace inválido</h1>
          <p className="text-neutral-600 mb-4 text-center">
            El enlace para restablecer tu contraseña no es válido o ha expirado.
          </p>
          <Link href="/recuperar-password" className="btn-secondary w-full py-2 rounded-lg font-medium mt-2 text-sm block text-center">
            Solicitar nuevo enlace
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-elegant py-12">
      <div className="bg-white rounded-xl shadow-elegant p-6 w-full max-w-sm">
        <Link href="/login" className="text-primary-600 hover:text-primary-700 flex items-center gap-1 mb-4 text-sm">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio de sesión
        </Link>
        
        {completed ? (
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-neutral-700 mb-2">¡Contraseña restablecida!</h1>
            <p className="text-neutral-600 mb-4">
              Tu contraseña ha sido actualizada correctamente. Serás redirigido al inicio de sesión en unos segundos.
            </p>
            <Link href="/login" className="btn-primary w-full py-2 rounded-lg font-medium mt-2 text-sm block text-center">
              Ir al inicio de sesión
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-neutral-700 mb-2 text-center">Crear nueva contraseña</h1>
            <p className="text-neutral-600 mb-4 text-center">
              Ingresa y confirma tu nueva contraseña
            </p>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Nueva contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Confirmar contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2 rounded-lg font-medium mt-2 disabled:opacity-60 text-sm"
              >
                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}