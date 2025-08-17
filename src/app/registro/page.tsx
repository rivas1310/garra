"use client"

import { useState } from 'react'
import { log } from '@/lib/secureLogger'
import { signIn } from 'next-auth/react'
import { FcGoogle } from 'react-icons/fc'
import { toast } from 'react-hot-toast'

export default function RegistroPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('¡Registro exitoso! Ahora puedes iniciar sesión.')
        setForm({ nombre: '', email: '', password: '' })
        // Opcional: redirigir al login después de un breve delay
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else {
        toast.error(data.error || 'Error al registrar usuario')
      }
    } catch (error) {
      log.error('Error:', error)
      toast.error('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-elegant py-12">
      <div className="bg-white rounded-xl shadow-elegant p-6 w-full max-w-sm">
        <h1 className="text-xl font-bold text-neutral-700 mb-2 text-center">Crear cuenta</h1>
        <p className="text-neutral-600 mb-4 text-center">Regístrate para comprar y acceder a tu perfil</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-neutral-700 font-medium mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              required
              value={form.nombre}
              onChange={handleChange}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm"
            />
          </div>
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
            <label className="block text-neutral-700 font-medium mb-1">Contraseña</label>
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
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        <div className="my-4 flex items-center gap-2">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-neutral-400 text-xs">o</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>
        <button
          onClick={() => signIn('google')}
          className="w-full flex items-center justify-center gap-3 border border-neutral-200 rounded-lg py-2 font-medium hover:bg-neutral-50 transition-colors text-sm"
        >
          <FcGoogle className="h-5 w-5" /> Registrarse con Google
        </button>
        <p className="text-center text-neutral-500 text-xs mt-4">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-primary-600 font-semibold hover:underline">Inicia sesión</a>
        </p>
      </div>
    </main>
  )
}