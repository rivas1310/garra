"use client"

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { FcGoogle } from 'react-icons/fc'
import { toast } from 'react-hot-toast'
import { useRouter, useSearchParams } from 'next/navigation'

const errorMessages: Record<string, string> = {
  OAuthAccountNotLinked: 'Esta cuenta ya está registrada con otro método. Usa el método original para iniciar sesión.',
  AccessDenied: 'Acceso denegado. Intenta con otra cuenta.',
  Configuration: 'Error de configuración de autenticación. Contacta al soporte.',
  default: 'Ocurrió un error al iniciar sesión. Intenta de nuevo.'
}

function LoginContent() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Obtener la URL de retorno si existe
    const returnUrl = searchParams.get('returnUrl') || '/perfil'
    
    const res = await signIn('credentials', {
      redirect: false,
      email: form.email,
      password: form.password,
    })
    setLoading(false)
    if (res?.ok) {
      toast.success('¡Bienvenido!')
      router.push(returnUrl)
    } else {
      toast.error('Credenciales incorrectas')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-elegant py-12">
      <div className="bg-white rounded-xl shadow-elegant p-6 w-full max-w-sm">
        <h1 className="text-xl font-bold text-neutral-700 mb-2 text-center">Iniciar sesión</h1>
        <p className="text-neutral-600 mb-4 text-center">Accede a tu cuenta para ver tu perfil y compras</p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm text-center">
            {errorMessages[error] || errorMessages.default}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-neutral-700 font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-neutral-700 font-medium">Contraseña</label>
              <a href="/recuperar-password" className="text-primary-600 text-xs hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2 rounded-lg font-medium mt-2 disabled:opacity-60 text-sm"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
        <div className="my-4 flex items-center gap-2">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-neutral-400 text-xs">o</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>
        <button
          onClick={() => signIn('google', { callbackUrl: '/perfil' })}
          className="w-full flex items-center justify-center gap-3 border border-neutral-200 rounded-lg py-2 font-medium hover:bg-neutral-50 transition-colors text-sm"
        >
          <FcGoogle className="h-5 w-5" /> Iniciar sesión con Google
        </button>
        <p className="text-center text-neutral-500 text-xs mt-4">
          ¿No tienes cuenta?{' '}
          <a href="/registro" className="text-primary-600 font-semibold hover:underline">Regístrate</a>
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <LoginContent />
    </Suspense>
  )
}