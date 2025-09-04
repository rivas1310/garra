'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, User, Users, Footprints, Baby, Dumbbell, ShoppingBag, Sparkles, Search } from 'lucide-react'

// Definir las categorías y subcategorías
const categoriesData = {
  mujer: [
    { name: 'Vestidos', href: '/categorias/mujer?subcat=vestidos' },
    { name: 'Blusas', href: '/categorias/mujer?subcat=blusas' },
    { name: 'Pantalones', href: '/categorias/mujer?subcat=pantalones' },
    { name: 'Pants', href: '/categorias/mujer?subcat=pants' },
    { name: 'Conjunto', href: '/categorias/mujer?subcat=conjunto' },
    { name: 'Suéter', href: '/categorias/mujer?subcat=sueter' },
    { name: 'Chaleco', href: '/categorias/mujer?subcat=chaleco' },
    { name: 'Faldas', href: '/categorias/mujer?subcat=faldas' },
    { name: 'Chaquetas', href: '/categorias/mujer?subcat=chaquetas' },
    
  ],
  hombre: [
    { name: 'Camisas', href: '/categorias/hombre?subcat=camisas' },
    { name: 'Camisetas', href: '/categorias/hombre?subcat=camisetas' },
    { name: 'Pantalones', href: '/categorias/hombre?subcat=pantalones' },
    { name: 'Chaleco', href: '/categorias/hombre?subcat=chaleco' },
    { name: 'Pants', href: '/categorias/hombre?subcat=pants' },
    { name: 'Suéter', href: '/categorias/hombre?subcat=sueter' },
    { name: 'Chaquetas', href: '/categorias/hombre?subcat=chaquetas' },
    
  ],
  calzado: [
    { name: 'Calzado de Hombre', href: '/categorias/calzado-hombre' },
    { name: 'Calzado de Mujer', href: '/categorias/calzado-mujer' },
    { name: 'Calzado de Niño', href: '/categorias/calzado-nino' },
    { name: 'Calzado de Niña', href: '/categorias/calzado-nina' }
  ],
  ninos: [
    { name: 'Ropa Bebé', href: '/categorias/bebe' },
    { name: 'Niñas', href: '/categorias/ninas' },
    { name: 'Niños', href: '/categorias/ninos' }
  ],
  deportivo: [
    { name: 'Ropa Gym', href: '/categorias/deportes?subcat=gym' },
    { name: 'Zapatillas', href: '/categorias/deportes?subcat=gym' },
    { name: 'Accesorios Deportivos', href: '/categorias/deportes?subcat=accesorios' }
  ],
  bolsos: [
    { name: 'Carteras de Dama', href: '/categorias/bolsos?subcat=carterasdedama' },
    { name: 'Carteras de Caballero', href: '/categorias/bolsos?subcat=carterasdecaballero' },
    { name: 'Mochilas de Dama', href: '/categorias/bolsos?subcat=mochilasdedama' },
    { name: 'Mochilas de Caballero', href: '/categorias/bolsos?subcat=mochilasdecaballero' },
    { name: 'Bolsos de Mano', href: '/categorias/bolsos?subcat=bolsodemano' }
  ],
  accesorios: [
    { name: 'joyeria', href: '/categorias/accesorios?subcat=joyeria' },
    { name: 'cinturones', href: '/categorias/accesorios?subcat=cinturones' },
    
  ]
}

interface CategoriesDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export default function CategoriesDropdown({ isOpen, onClose }: CategoriesDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const [searchTerm, setSearchTerm] = useState('')

  // Cerrar el dropdown si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isOpen, onClose])

  // Filtrar categorías basado en el término de búsqueda
  const filterCategories = (items: any[]) => {
    if (!searchTerm) return items
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Iconos para cada categoría
  const categoryIcons = {
    mujer: User,
    hombre: Users,
    calzado: Footprints,
    ninos: Baby,
    deportivo: Dumbbell,
    bolsos: ShoppingBag,
    accesorios: Sparkles
  }

  return (
    <div 
      ref={dropdownRef}
      className={`absolute top-full left-1/2 transform -translate-x-1/2 w-screen max-w-3xl bg-white rounded-xl shadow-xl border border-gray-100 z-50 mt-2 transition-all duration-300 ease-out backdrop-blur-sm ${
        isOpen 
          ? 'opacity-100 visible translate-y-0 scale-100' 
          : 'opacity-0 invisible -translate-y-4 scale-95'
      }`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.8)'
      }}
      onMouseEnter={() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }}
      onMouseLeave={() => {
        timeoutRef.current = setTimeout(() => {
          onClose()
        }, 150)
      }}
    >
      {/* Barra de búsqueda */}
      <div className="p-4 pb-3 border-b border-gray-100">
        <div className="relative max-w-sm mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {/* Mujer */}
        <div className="group">
          <h3 className="font-semibold text-gray-900 text-base mb-3 flex items-center group-hover:text-pink-600 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg mr-2 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <User className="text-white" size={14} />
            </div>
            Mujer
          </h3>
          <ul className="space-y-0.5">
            {filterCategories(categoriesData.mujer).map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className="text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-all duration-200 block py-2 px-3 rounded-lg text-sm font-medium hover:translate-x-1 hover:shadow-sm border border-transparent hover:border-pink-100"
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Hombre */}
        <div className="group">
          <h3 className="font-semibold text-gray-900 text-base mb-3 flex items-center group-hover:text-blue-600 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mr-2 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Users className="text-white" size={14} />
            </div>
            Hombre
          </h3>
          <ul className="space-y-0.5">
            {filterCategories(categoriesData.hombre).map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 block py-2 px-3 rounded-lg text-sm font-medium hover:translate-x-1 hover:shadow-sm border border-transparent hover:border-blue-100"
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Calzado */}
        <div className="group">
          <h3 className="font-semibold text-gray-900 text-base mb-3 flex items-center group-hover:text-purple-600 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg mr-2 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Footprints className="text-white" size={14} />
            </div>
            Calzado
          </h3>
          <ul className="space-y-0.5">
            {filterCategories(categoriesData.calzado).map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 block py-2 px-3 rounded-lg text-sm font-medium hover:translate-x-1 hover:shadow-sm border border-transparent hover:border-purple-100"
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Niños */}
        <div className="group">
          <h3 className="font-semibold text-gray-900 text-base mb-3 flex items-center group-hover:text-green-600 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg mr-2 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Baby className="text-white" size={14} />
            </div>
            Niños
          </h3>
          <ul className="space-y-0.5">
            {filterCategories(categoriesData.ninos).map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className="text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200 block py-2 px-3 rounded-lg text-sm font-medium hover:translate-x-1 hover:shadow-sm border border-transparent hover:border-green-100"
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Accesorios */}
        <div className="group">
          <h3 className="font-semibold text-gray-900 text-base mb-3 flex items-center group-hover:text-yellow-600 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg mr-2 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Sparkles className="text-white" size={14} />
            </div>
            Accesorios
          </h3>
          <ul className="space-y-0.5">
            {filterCategories(categoriesData.accesorios).map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className="text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 transition-all duration-200 block py-2 px-3 rounded-lg text-sm font-medium hover:translate-x-1 hover:shadow-sm border border-transparent hover:border-yellow-100"
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Bolsos */}
        <div className="group">
          <h3 className="font-semibold text-gray-900 text-base mb-3 flex items-center group-hover:text-cyan-600 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg mr-2 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <ShoppingBag className="text-white" size={14} />
            </div>
            Bolsos
          </h3>
          <ul className="space-y-0.5">
            {filterCategories(categoriesData.bolsos).map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200 block py-2 px-3 rounded-lg text-sm font-medium hover:translate-x-1 hover:shadow-sm border border-transparent hover:border-cyan-100"
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Deportivo */}
        <div className="group">
          <h3 className="font-semibold text-gray-900 text-base mb-3 flex items-center group-hover:text-orange-600 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg mr-2 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Dumbbell className="text-white" size={14} />
            </div>
            Deportivo
          </h3>
          <ul className="space-y-0.5">
            {filterCategories(categoriesData.deportivo).map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 block py-2 px-3 rounded-lg text-sm font-medium hover:translate-x-1 hover:shadow-sm border border-transparent hover:border-orange-100"
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer con enlace a todas las categorías */}
      <div className="border-t border-gray-100 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-xl">
        <Link 
          href="/categorias"
          className="text-blue-600 hover:text-blue-700 font-medium transition-all duration-200 flex items-center justify-center group bg-white hover:bg-blue-50 py-2 px-4 rounded-lg shadow-sm hover:shadow-md border border-blue-100 hover:border-blue-200 text-sm"
          onClick={onClose}
        >
          <span>Ver todas las categorías</span>
          <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  )
}

// Componente para el botón de categorías
export function CategoriesButton() {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150)
  }

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 group ${
          isOpen 
            ? 'text-blue-600 bg-blue-50 shadow-sm' 
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        <span>Categorías</span>
        <ChevronDown 
          size={16} 
          className={`transition-all duration-300 group-hover:scale-110 ${
            isOpen ? 'rotate-180 text-blue-600' : 'group-hover:text-blue-600'
          }`}
        />
      </button>
      
      <CategoriesDropdown 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </div>
  )
}