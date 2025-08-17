'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

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

  return (
    <div 
      ref={dropdownRef}
      className={`absolute top-full left-1/2 transform -translate-x-1/2 w-screen max-w-4xl bg-white rounded-lg shadow-lg border border-gray-200 z-50 mt-1 transition-all duration-200 ${
        isOpen 
          ? 'opacity-100 visible translate-y-0' 
          : 'opacity-0 invisible -translate-y-2'
      }`}
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
      <div className="grid grid-cols-4 gap-8 p-6">
        {/* Mujer */}
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
            <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
            Mujer
          </h3>
          <ul className="space-y-2">
            {categoriesData.mujer.map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors block py-2 px-2 rounded-lg hover:bg-gray-50"
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Hombre */}
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            Hombre
          </h3>
          <ul className="space-y-2">
            {categoriesData.hombre.map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors block py-2 px-2 rounded-lg hover:bg-gray-50"
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Calzado */}
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
            Calzado
          </h3>
          <ul className="space-y-2">
            {categoriesData.calzado.map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors block py-2 px-2 rounded-lg hover:bg-gray-50"
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Niños */}
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            Niños
          </h3>
          <ul className="space-y-2">
            {categoriesData.ninos.map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors block py-2 px-2 rounded-lg hover:bg-gray-50"
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Accesorios */}
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
            Accesorios
          </h3>
          <ul className="space-y-2">
            {categoriesData.accesorios.map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors block py-2 px-2 rounded-lg hover:bg-gray-50"
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Bolsos */}
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
            <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></span>
            Bolsos
          </h3>
          <ul className="space-y-2">
            {categoriesData.bolsos.map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors block py-2 px-2 rounded-lg hover:bg-gray-50"
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Deportivo */}
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
            Deportivo
          </h3>
          <ul className="space-y-2">
            {categoriesData.deportivo.map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors block py-2 px-2 rounded-lg hover:bg-gray-50"
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
      <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
        <Link 
          href="/categorias"
          className="text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center justify-center group"
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
        className="flex items-center space-x-1 text-gray-800 hover:text-blue-600 font-medium transition-colors"
      >
        <span>Categorías</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      <CategoriesDropdown 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </div>
  )
} 