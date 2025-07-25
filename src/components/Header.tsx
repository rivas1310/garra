'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Search, Menu, X, User, Heart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useSession, signOut } from 'next-auth/react'
import { signIn } from 'next-auth/react'
import { FcGoogle } from 'react-icons/fc'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import ClientOnly from './ClientOnly'

function DrawerRegistro({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('¡Registro exitoso! Ahora puedes iniciar sesión.')
      onSuccess && onSuccess()
    }, 1500)
  }
  return (
    <div className="bg-white rounded-xl shadow-elegant p-6 w-full max-w-xs mx-auto">
      <h2 className="text-lg font-bold text-neutral-700 mb-2 text-center">Crear cuenta</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-neutral-700 font-medium mb-1">Nombre</label>
          <input type="text" name="nombre" required value={form.nombre} onChange={handleChange} className="w-full border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm" />
        </div>
        <div>
          <label className="block text-neutral-700 font-medium mb-1">Email</label>
          <input type="email" name="email" required value={form.email} onChange={handleChange} className="w-full border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm" />
        </div>
        <div>
          <label className="block text-neutral-700 font-medium mb-1">Contraseña</label>
          <input type="password" name="password" required minLength={6} value={form.password} onChange={handleChange} className="w-full border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-2 rounded-lg font-medium mt-2 disabled:opacity-60 text-sm">{loading ? 'Registrando...' : 'Registrarse'}</button>
      </form>
      <div className="my-4 flex items-center gap-2">
        <div className="flex-1 h-px bg-neutral-200" />
        <span className="text-neutral-400 text-xs">o</span>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>
      <button onClick={() => signIn('google')} className="w-full flex items-center justify-center gap-3 border border-neutral-200 rounded-lg py-2 font-medium hover:bg-neutral-50 transition-colors text-sm">
        <FcGoogle className="h-5 w-5" /> Registrarse con Google
      </button>
    </div>
  )
}

function DrawerLogin({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const router = useRouter()
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await signIn('credentials', {
      redirect: false,
      email: form.email,
      password: form.password,
    })
    setLoading(false)
    if (res?.ok) {
      toast.success('¡Bienvenido!')
      onSuccess && onSuccess()
      router.push('/perfil')
    } else {
      toast.error('Credenciales incorrectas')
    }
  }
  return (
    <div className="bg-white rounded-xl shadow-elegant p-6 w-full max-w-xs mx-auto">
      <h2 className="text-lg font-bold text-neutral-700 mb-2 text-center">Iniciar sesión</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-neutral-700 font-medium mb-1">Email</label>
          <input type="email" name="email" required value={form.email} onChange={handleChange} className="w-full border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm" />
        </div>
        <div>
          <label className="block text-neutral-700 font-medium mb-1">Contraseña</label>
          <input type="password" name="password" required minLength={6} value={form.password} onChange={handleChange} className="w-full border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-2 rounded-lg font-medium mt-2 disabled:opacity-60 text-sm">{loading ? 'Ingresando...' : 'Iniciar sesión'}</button>
      </form>
      <div className="my-4 flex items-center gap-2">
        <div className="flex-1 h-px bg-neutral-200" />
        <span className="text-neutral-400 text-xs">o</span>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>
      <button onClick={() => signIn('google')} className="w-full flex items-center justify-center gap-3 border border-neutral-200 rounded-lg py-2 font-medium hover:bg-neutral-50 transition-colors text-sm">
        <FcGoogle className="h-5 w-5" /> Iniciar sesión con Google
      </button>
    </div>
  )
}

function CartBadgeContent() {
  const { getItemCount } = useCart()
  const cartItemsCount = getItemCount()
  
  if (cartItemsCount === 0) return null
  
  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse">
      {cartItemsCount > 99 ? '99+' : cartItemsCount}
    </span>
  )
}

function CartBadge() {
  return (
    <ClientOnly>
      <CartBadgeContent />
    </ClientOnly>
  )
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const handleProfileClick = () => {
    if (session) {
      setShowProfileMenu((v) => !v);
    } else {
      router.push('/login');
    }
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <img src="/logos/diseno-sin-titulo-5.png" alt="Logo Garra Felina" className="w-10 h-10 object-contain rounded-lg shadow-azulrey group-hover:scale-105 transition-transform" />
            <span className="text-2xl font-extrabold text-azulrey drop-shadow-sm tracking-tight group-hover:text-azuloscuro transition-colors">Garra Felina</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-800 hover:text-blue-600 font-medium transition-colors">Inicio</Link>
            <Link href="/productos" className="text-gray-800 hover:text-blue-600 font-medium transition-colors">Productos</Link>
            <Link href="/categorias" className="text-gray-800 hover:text-blue-600 font-medium transition-colors">Categorías</Link>
            <Link href="/ofertas" className="text-gray-800 hover:text-blue-600 font-medium transition-colors">Ofertas</Link>
            <Link href="/quienes-somos" className="text-gray-800 hover:text-blue-600 font-medium transition-colors">¿Quiénes somos?</Link>
            <Link href="/contacto" className="text-gray-800 hover:text-blue-600 font-medium transition-colors">Contacto</Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Search size={20} />
            </button>
            <Link href="/favoritos" className="p-2 text-gray-700 hover:text-blue-600 transition-colors">
              <Heart size={20} />
            </Link>
            <button
              onClick={handleProfileClick}
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors relative"
            >
              <User size={20} />
              {/* Menú de usuario autenticado */}
              {session && showProfileMenu && (
                <div ref={profileMenuRef} className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                    <img src={session.user?.image || '/avatar.png'} alt="avatar" className="w-12 h-12 rounded-full border" />
                    <div>
                      <div className="font-semibold text-gray-900">{session.user?.name}</div>
                      <div className="text-sm text-gray-600 truncate">{session.user?.email}</div>
                    </div>
                  </div>
                  <div className="flex flex-col p-2">
                    <Link href="/perfil" className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">Mi perfil</Link>
                    <Link href="/perfil?tab=compras" className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">Mis compras</Link>
                    <div
                      onClick={() => { signOut(); setShowProfileMenu(false); }}
                      className="px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 font-medium text-left mt-2 cursor-pointer"
                    >
                      Cerrar sesión
                    </div>
                  </div>
                </div>
              )}
            </button>
            <Link href="/carrito" className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors group">
              <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
              <CartBadge />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t border-gray-200">
            <form
              className="relative"
              onSubmit={e => {
                e.preventDefault();
                if (searchValue.trim()) {
                  router.push(`/buscar?q=${encodeURIComponent(searchValue)}`);
                  setIsSearchOpen(false);
                  setSearchValue("");
                }
              }}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              />
            </form>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <nav className="py-4 space-y-4">
              <Link href="/" className="block text-gray-800 hover:text-blue-600 transition-colors">
                Inicio
              </Link>
              <Link href="/productos" className="block text-gray-800 hover:text-blue-600 transition-colors">
                Productos
              </Link>
              <Link href="/categorias" className="block text-gray-800 hover:text-blue-600 transition-colors">
                Categorías
              </Link>
              <Link href="/ofertas" className="block text-gray-800 hover:text-blue-600 transition-colors">
                Ofertas
              </Link>
              <Link href="/quienes-somos" className="block text-gray-800 hover:text-blue-600 transition-colors">
                ¿Quiénes somos?
              </Link>
              <Link href="/contacto" className="block text-gray-800 hover:text-blue-600 transition-colors">
                Contacto
              </Link>
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <Link href="/favoritos" className="p-2 text-gray-700 hover:text-blue-600 transition-colors">
                  <Heart size={20} />
                </Link>
                <button
                  onClick={handleProfileClick}
                  className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User size={20} />
                </button>
                <Link href="/carrito" className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors group">
                  <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                  <CartBadge />
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}