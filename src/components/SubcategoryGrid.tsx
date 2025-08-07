'use client'

import { useState } from 'react'
import { ArrowRight, Sparkles, TrendingUp, Star, Grid, Filter } from 'lucide-react'

// Definir subcategorías con imágenes de alta calidad y datos mejorados
const subcategoriasData: Record<string, Array<{
  name: string
  image: string
  description: string
  isNew?: boolean
  isTrending?: boolean
  discount?: string
  count?: number
  color?: string
}>> = {
  mujer: [
    {
      name: 'Vestidos',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Elegantes vestidos para toda ocasión',
      isTrending: true,
      count: 12,
      color: 'from-pink-500 to-rose-500'
    },
    {
      name: 'Blusas',
      image: 'https://images.unsplash.com/photo-1564257631407-3deb25e91aa1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Blusas versátiles y cómodas',
      count: 8,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      name: 'Pantalones',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Pantalones modernos y elegantes',
      discount: '15% OFF',
      count: 15,
      color: 'from-gray-600 to-gray-800'
    },
    {
      name: 'Chamarras',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Chamarras y abrigos de temporada',
      isNew: true,
      count: 6,
      color: 'from-black to-gray-900'
    },
    {
      name: 'Sudaderas',
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Sudaderas cómodas y casuales',
      count: 10,
      color: 'from-purple-500 to-violet-500'
    },
    {
      name: 'Sacos',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Sacos elegantes para la oficina',
      count: 7,
      color: 'from-slate-600 to-slate-800'
    },
    {
      name: 'Abrigos',
      image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Abrigos de invierno y otoño',
      isTrending: true,
      count: 9,
      color: 'from-amber-600 to-orange-600'
    },
    {
      name: 'Tops',
      image: 'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Tops modernos y versátiles',
      count: 11,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      name: 'Overoles',
      image: '/img/subcategorias/overolverde.png',
      description: 'Overoles casuales y elegantes',
      isNew: true,
      count: 4,
      color: 'from-green-500 to-emerald-600'
    },
    {
      name: 'Faldas',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Faldas para toda ocasión',
      count: 13,
      color: 'from-rose-400 to-pink-500'
    },
    {
      name: 'Shorts',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Shorts cómodos para el verano',
      discount: '20% OFF',
      count: 8,
      color: 'from-cyan-500 to-blue-500'
    }
  ],
  hombre: [
    {
      name: 'Chamarras',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Chamarras modernas y elegantes',
      isTrending: true,
      count: 8,
      color: 'from-gray-700 to-black'
    },
    {
      name: 'Camisas',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Camisas formales y casuales',
      count: 12,
      color: 'from-blue-600 to-indigo-700'
    },
    {
      name: 'Playeras',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Playeras cómodas y estilosas',
      discount: '10% OFF',
      count: 15,
      color: 'from-slate-500 to-gray-600'
    },
    {
      name: 'Pantalones',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Pantalones elegantes y cómodos',
      count: 10,
      color: 'from-neutral-600 to-neutral-800'
    },
    {
      name: 'Shorts',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Shorts casuales para el verano',
      isNew: true,
      count: 6,
      color: 'from-amber-500 to-orange-500'
    }
  ],
  accesorios: [
    {
      name: 'Joyas',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Joyas elegantes y únicas',
      isTrending: true,
      count: 20,
      color: 'from-yellow-400 to-amber-500'
    },
    {
      name: 'Relojes',
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Relojes de lujo y casuales',
      count: 12,
      color: 'from-slate-700 to-gray-900'
    },
    {
      name: 'Cinturones',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Cinturones de cuero y tela',
      count: 8,
      color: 'from-amber-700 to-brown-800'
    },
    {
      name: 'Bolsos',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Bolsos y carteras elegantes',
      isNew: true,
      count: 15,
      color: 'from-red-500 to-rose-600'
    }
  ],
  // Calzado de Hombre
  'calzado-hombre': [
    {
      name: 'Zapatos',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Zapatos formales y casuales para hombres',
      isTrending: true,
      count: 8,
      color: 'from-brown-600 to-brown-800'
    },
    {
      name: 'Sneakers',
      image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Sneakers deportivos y casuales',
      discount: '20% OFF',
      count: 15,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      name: 'Botas',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Botas de trabajo y moda',
      isNew: true,
      count: 6,
      color: 'from-black to-gray-900'
    },
    {
      name: 'Sandalias',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Sandalias casuales para hombres',
      count: 12,
      color: 'from-amber-500 to-orange-600'
    }
  ],
  // Calzado de Mujer
  'calzado-mujer': [
    {
      name: 'Tacones',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Tacones elegantes para mujeres',
      isTrending: true,
      count: 10,
      color: 'from-pink-500 to-rose-600'
    },
    {
      name: 'Zapatillas',
      image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Zapatillas deportivas para mujeres',
      discount: '25% OFF',
      count: 18,
      color: 'from-purple-500 to-violet-600'
    },
    {
      name: 'Zapatos',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Zapatos de oficina y casuales',
      count: 14,
      color: 'from-gray-600 to-gray-800'
    },
    {
      name: 'Sneakers',
      image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Sneakers casuales para mujeres',
      count: 20,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      name: 'Botas',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Botas elegantes para mujeres',
      isNew: true,
      count: 8,
      color: 'from-black to-gray-900'
    },
    {
      name: 'Huaraches',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Huaraches artesanales',
      count: 25,
      color: 'from-amber-600 to-orange-700'
    },
    {
      name: 'Sandalias',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Sandalias de playa y casuales',
      count: 30,
      color: 'from-yellow-400 to-amber-500'
    }
  ],
  // Calzado de Niño
  'calzado-nino': [
    {
      name: 'Zapatos',
      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Zapatos escolares y deportivos',
      isTrending: true,
      count: 12,
      color: 'from-blue-600 to-indigo-700'
    },
    {
      name: 'Botas',
      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Botas de lluvia e invierno',
      count: 15,
      color: 'from-green-600 to-emerald-700'
    },
    {
      name: 'Sneakers',
      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Sneakers con luces y deportivos',
      discount: '15% OFF',
      count: 18,
      color: 'from-red-500 to-red-600'
    },
    {
      name: 'Sandalias',
      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Sandalias de playa para niños',
      count: 22,
      color: 'from-cyan-500 to-blue-500'
    }
  ],
  // Calzado de Niña
  'calzado-nina': [
    {
      name: 'Zapatos',
      image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Zapatos de fiesta y ballet',
      isTrending: true,
      count: 10,
      color: 'from-pink-500 to-rose-600'
    },
    {
      name: 'Botas',
      image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Botas de invierno y lluvia',
      count: 8,
      color: 'from-purple-500 to-violet-600'
    },
    {
      name: 'Sneakers',
      image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Sneakers brillantes y deportivos',
      discount: '20% OFF',
      count: 16,
      color: 'from-indigo-500 to-purple-600'
    },
    {
      name: 'Sandalias',
      image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Sandalias de playa para niñas',
      count: 25,
      color: 'from-yellow-400 to-amber-500'
    }
  ],
  // Categoría general de calzado (mantener para compatibilidad)
  calzado: [
    {
      name: 'Zapatos',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Zapatos elegantes y casuales',
      isTrending: true,
      count: 18,
      color: 'from-brown-600 to-brown-800'
    },
    {
      name: 'Zapatillas',
      image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Zapatillas deportivas y casuales',
      discount: '25% OFF',
      count: 22,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      name: 'Botas',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Botas de moda y trabajo',
      isNew: true,
      count: 14,
      color: 'from-black to-gray-900'
    }
  ],
  bolsos: [
    {
      name: 'Carteras',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Carteras elegantes y funcionales',
      isTrending: true,
      count: 16,
      color: 'from-purple-500 to-violet-600'
    },
    {
      name: 'Mochilas',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Mochilas modernas y cómodas',
      count: 12,
      color: 'from-green-600 to-emerald-700'
    },
    {
      name: 'Bolsos de mano',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: 'Bolsos de mano elegantes',
      isNew: true,
      count: 10,
      color: 'from-pink-500 to-rose-600'
    }
     ],
   // Categoría Niñas
   ninas: [
     {
       name: 'Vestidos',
       image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
       description: 'Vestidos elegantes para niñas',
       isTrending: true,
       count: 15,
       color: 'from-pink-500 to-rose-600'
     },
     {
       name: 'Blusas',
       image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
       description: 'Blusas cómodas para niñas',
       count: 12,
       color: 'from-purple-500 to-violet-600'
     },
     {
       name: 'Pantalones',
       image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
       description: 'Pantalones modernos para niñas',
       discount: '20% OFF',
       count: 18,
       color: 'from-indigo-500 to-purple-600'
     },
     {
       name: 'Faldas',
       image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
       description: 'Faldas elegantes para niñas',
       isNew: true,
       count: 10,
       color: 'from-rose-400 to-pink-500'
     },
     {
       name: 'Shorts',
       image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
       description: 'Shorts cómodos para niñas',
       count: 14,
       color: 'from-cyan-500 to-blue-500'
     }
   ],
   // Categoría Niños
   ninos: [
     {
       name: 'Camisetas',
       image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
       description: 'Camisetas cómodas para niños',
       isTrending: true,
       count: 20,
       color: 'from-blue-600 to-indigo-700'
     },
     {
       name: 'Pantalones',
       image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
       description: 'Pantalones resistentes para niños',
       count: 16,
       color: 'from-green-600 to-emerald-700'
     },
     {
       name: 'Shorts',
       image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
       description: 'Shorts deportivos para niños',
       discount: '15% OFF',
       count: 12,
       color: 'from-red-500 to-red-600'
     },
     {
       name: 'Sudaderas',
       image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
       description: 'Sudaderas cómodas para niños',
       isNew: true,
       count: 18,
       color: 'from-amber-500 to-orange-600'
     },
     {
       name: 'Chamarras',
       image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
       description: 'Chamarras abrigadas para niños',
       count: 8,
       color: 'from-gray-600 to-gray-800'
     }
   ],
   deportes: [
     {
       name: 'Ropa deportiva',
       image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
       description: 'Ropa para entrenamiento',
       isTrending: true,
       count: 25,
       color: 'from-red-500 to-red-600'
     },
     {
       name: 'Zapatillas',
       image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
       description: 'Zapatillas deportivas y casuales',
       discount: '25% OFF',
       count: 22,
       color: 'from-blue-500 to-indigo-600'
     },
     {
       name: 'Accesorios deportivos',
       image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
       description: 'Accesorios para deporte',
       count: 15,
       color: 'from-orange-500 to-orange-600'
     }
   ]
}

interface SubcategoryGridProps {
  categoriaSlug: string
  subcatSeleccionada: string
  onSubcatChange: (subcat: string) => void
}

export default function SubcategoryGrid({ categoriaSlug, subcatSeleccionada, onSubcatChange }: SubcategoryGridProps) {
  const subcategorias = subcategoriasData[categoriaSlug] || []

  if (subcategorias.length === 0) {
    return null
  }

  return (
    <div className="mb-12">
      {/* Header mejorado */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-3">
          <Filter className="h-6 w-6 text-primary-400 mr-2" />
          <h3 className="text-2xl font-bold text-white">
            Explora por Subcategorías
          </h3>
        </div>
        <p className="text-white/80 text-sm max-w-2xl mx-auto">
          Encuentra exactamente lo que buscas en nuestra colección cuidadosamente seleccionada
        </p>
      </div>

      {/* Subcategorías Grid mejorado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Botón "Todas" mejorado */}
        <button
          onClick={() => onSubcatChange("")}
          className={`group relative h-32 rounded-xl overflow-hidden transition-all duration-500 hover:scale-105 ${
            subcatSeleccionada === "" 
              ? "ring-4 ring-primary-400 shadow-2xl transform scale-105" 
              : "hover:shadow-xl hover:ring-2 hover:ring-primary-300"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Grid className="h-8 w-8 mx-auto mb-2 opacity-90 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-lg font-bold mb-1">Todas</div>
              <div className="text-xs opacity-90">Ver todo</div>
            </div>
          </div>
          {/* Efecto de brillo */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </button>

        {/* Subcategorías con imágenes mejoradas */}
        {subcategorias.map((subcat) => (
          <button
            key={subcat.name}
            onClick={() => onSubcatChange(subcat.name)}
            className={`group relative h-32 rounded-xl overflow-hidden transition-all duration-500 hover:scale-105 ${
              subcatSeleccionada === subcat.name 
                ? "ring-4 ring-primary-400 shadow-2xl transform scale-105" 
                : "hover:shadow-xl hover:ring-2 hover:ring-primary-300"
            }`}
          >
            {/* Imagen de fondo mejorada */}
            <img
              src={subcat.image}
              alt={subcat.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            
            {/* Overlay gradiente mejorado */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            
            {/* Gradiente de color personalizado */}
            <div className={`absolute inset-0 bg-gradient-to-br ${subcat.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
            
            {/* Badges mejorados */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {subcat.isNew && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-primary-500 text-white rounded-full shadow-lg backdrop-blur-sm">
                  <Sparkles className="h-2.5 w-2.5 mr-1" />
                  Nuevo
                </span>
              )}
              {subcat.isTrending && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-secondary-500 text-white rounded-full shadow-lg backdrop-blur-sm">
                  <TrendingUp className="h-2.5 w-2.5 mr-1" />
                  Hot
                </span>
              )}
              {subcat.discount && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-accent-500 text-white rounded-full shadow-lg backdrop-blur-sm">
                  {subcat.discount}
                </span>
              )}
            </div>

            {/* Contenido mejorado */}
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <div className="text-sm font-bold mb-1 truncate">{subcat.name}</div>
              <div className="text-xs opacity-90 mb-1 line-clamp-1">{subcat.description}</div>
              {subcat.count && (
                <div className="flex items-center justify-between">
                  <div className="text-xs opacity-75 bg-black/30 px-1.5 py-0.5 rounded-full">
                    {subcat.count} productos
                  </div>
                  <ArrowRight className="h-3 w-3 opacity-60 group-hover:translate-x-1 group-hover:opacity-100 transition-all duration-300" />
                </div>
              )}
            </div>

            {/* Efecto hover mejorado */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Efecto de brillo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
        ))}
      </div>

      {/* Información adicional mejorada */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/80">
          <Filter className="h-3 w-3 mr-2" />
          <p className="text-xs font-medium">
            Haz clic en una subcategoría para filtrar los productos
          </p>
        </div>
      </div>
    </div>
  )
} 