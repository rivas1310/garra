'use client'

import { useState } from 'react'
import { ArrowRight, Sparkles, TrendingUp, Star, Grid, Filter } from 'lucide-react'
import { useSubcategoryCounts } from '@/hooks/useSubcategoryCounts'

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
      description: '',
      isTrending: true,
      count: 12,
      color: 'from-pink-500 to-rose-500'
    },
    {
      name: 'Blusas',
      image: '/img/subcategorias/blusa.png',
      description: '',
      count: 8,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      name: 'Pantalones',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: '',
      discount: '15% OFF',
      count: 15,
      color: 'from-gray-600 to-gray-800'
    },
    {
      name: 'Pants',
      image: '/img/subcategorias/pantsmujer.jpg',
      description: '',
      isNew: true,
      count: 8,
      color: 'from-indigo-500 to-purple-600'
    },
    {
      name: 'Conjunto',
      image: '/img/subcategorias/conjuntomujer.jpg',
      description: '',
      isNew: true,
      count: 6,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      name: 'Suéter',
      image: '/img/subcategorias/suetermujer.png',
      description: '',
      isTrending: true,
      count: 10,
      color: 'from-orange-500 to-red-600'
    },
    {
      name: 'Chaleco',
      image: '/img/subcategorias/chalecomujer.jpg',
      description: '',
      isNew: true,
      count: 7,
      color: 'from-yellow-500 to-amber-600'
    },
    {
      name: 'Chamarras',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: '',
      isNew: true,
      count: 6,
      color: 'from-black to-gray-900'
    },
    {
      name: 'Sudaderas',
      image: '/img/subcategorias/sudaderamujer.png',
      description: '',
      count: 10,
      color: 'from-purple-500 to-violet-500'
    },
    {
      name: 'Sacos',
      image: '/img/subcategorias/sacomujer.png',
      description: '',
      count: 7,
      color: 'from-slate-600 to-slate-800'
    },
    {
      name: 'Abrigos',
      image: '/img/subcategorias/abrigomujer.png',
      description: '',
      isTrending: true,
      count: 9,
      color: 'from-amber-600 to-orange-600'
    },
    {
      name: 'Tops',
      image: '/img/subcategorias/tops.png',
      description: '',
      count: 11,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      name: 'Overoles',
      image: '/img/subcategorias/overolverde.png',
      description: '',
      isNew: true,
      count: 4,
      color: 'from-green-500 to-emerald-600'
    },
    {
      name: 'Faldas',
      image: '/img/subcategorias/falda.png',
      description: '',
      count: 13,
      color: 'from-rose-400 to-pink-500'
    },
    {
      name: 'Shorts',
      image: '/img/subcategorias/shortmujer.png',
      description: '',
      discount: '20% OFF',
      count: 8,
      color: 'from-cyan-500 to-blue-500'
    }
  ],
  hombre: [
    {
      name: 'Chamarras',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: '',
      isTrending: true,
      count: 8,
      color: 'from-gray-700 to-black'
    },
    {
      name: 'Camisas',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: '',
      count: 12,
      color: 'from-blue-600 to-indigo-700'
    },
    {
      name: 'Playeras',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: '',
      discount: '10% OFF',
      count: 15,
      color: 'from-slate-500 to-gray-600'
    },
    {
      name: 'Pantalones',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      description: '',
      count: 10,
      color: 'from-neutral-600 to-neutral-800'
    },
    {
      name: 'Chaleco',
      image: '/img/subcategorias/chalecohombre.jpg',
      description: '',
      isNew: true,
      count: 5,
      color: 'from-yellow-500 to-amber-600'
    },
    {
      name: 'Pants',
      image: '/img/subcategorias/pantshombre.jpg',
      description: '',
      isNew: true,
      count: 8,
      color: 'from-indigo-500 to-purple-600'
    },
    {
      name: 'Suéter',
      image: '/img/subcategorias/sueterhombre.png',
      description: '',
      isTrending: true,
      count: 12,
      color: 'from-orange-500 to-red-600'
    },
    {
      name: 'Shorts',
      image: '/img/subcategorias/shorthombre.png',
      description: '',
      isNew: true,
      count: 6,
      color: 'from-amber-500 to-orange-500'
    }
  ],
  accesorios: [
    {
      name: 'Joyeria Para Dama',
      image: '/img/subcategorias/joyeriamujer.png',
      description: '',
      isTrending: true,
      count: 20,
      color: 'from-yellow-400 to-amber-500'
    },
    {
      name: 'Joyeria Para Caballero',
      image: '/img/subcategorias/joyeriahombre.png',
      description: '',
      isTrending: true,
      count: 20,
      color: 'from-yellow-400 to-amber-500'
    },
    {
      name: 'Cinturones de Dama',
      image: '/img/subcategorias/cinturonmujer.png',
      description: '',
      count: 8,
      color: 'from-amber-700 to-brown-800'
    },
    {
      name: 'Cinturones de Caballero',
      image: '/img/subcategorias/cinturonhombre.png',
      description: '',
      count: 8,
      color: 'from-amber-700 to-brown-800'
    },
    
  ],
  // Calzado de Hombre
  'calzado-hombre': [
    {
      name: 'Zapatos',
      image: '/img/subcategorias/zapatohombre.png',
      description: '',
      isTrending: true,
      count: 8,
      color: 'from-brown-600 to-brown-800'
    },
    {
      name: 'Sneakers',
      image: '/img/subcategorias/tenishombre.jfif',
      description: '',
      discount: '20% OFF',
      count: 15,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      name: 'Botas',
      image: '/img/subcategorias/botashombre.png',
      description: '',
      isNew: true,
      count: 6,
      color: 'from-black to-gray-900'
    },
    {
      name: 'Sandalias',
      image: '/img/subcategorias/sandaliahombre.png',
      description: '',
      count: 12,
      color: 'from-amber-500 to-orange-600'
    }
  ],
  // Calzado de Mujer
  'calzado-mujer': [
    {
      name: 'Tacones',
      image: '/img/subcategorias/tacones.png',
      description: '',
      isTrending: true,
      count: 10,
      color: 'from-pink-500 to-rose-600'
    },
    {
      name: 'Zapatillas',
      image: '/img/subcategorias/zapatillasmujer.png',
      description: '',
      discount: '25% OFF',
      count: 18,
      color: 'from-purple-500 to-violet-600'
    },
    {
      name: 'Zapatos',
      image: '/img/subcategorias/zapatosmujer.png',
      description: '',
      count: 14,
      color: 'from-gray-600 to-gray-800'
    },
    {
      name: 'Sneakers',
      image: '/img/subcategorias/tenismujer.jfif',
      description: '',
      count: 20,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      name: 'Botas',
      image: '/img/subcategorias/botasmujer.png',
      description: '',
      isNew: true,
      count: 8,
      color: 'from-black to-gray-900'
    },
    {
      name: 'Huaraches',
      image: '/img/subcategorias/huarachesmujer.png',
      description: '',
      count: 25,
      color: 'from-amber-600 to-orange-700'
    },
    {
      name: 'Sandalias',
      image: '/img/subcategorias/sandaliasmujer.png',
      description: '',
      count: 30,
      color: 'from-yellow-400 to-amber-500'
    }
  ],
  // Calzado de Niño
  'calzado-nino': [
    {
      name: 'Zapatos',
      image: '/img/subcategorias/zapatonino.png',
      description: '',
      isTrending: true,
      count: 12,
      color: 'from-blue-600 to-indigo-700'
    },
    {
      name: 'Botas',
      image: '/img/subcategorias/botasnino.png',
      description: '',
      count: 15,
      color: 'from-green-600 to-emerald-700'
    },
    {
      name: 'Sneakers',
      image: '/img/subcategorias/tenisnino.jfif',
      description: '',
      discount: '15% OFF',
      count: 18,
      color: 'from-red-500 to-red-600'
    },
    {
      name: 'Sandalias',
      image: '/img/subcategorias/sandaliasnino.png',
      description: '',
      count: 22,
      color: 'from-cyan-500 to-blue-500'
    }
  ],
  // Calzado de Niña
  'calzado-nina': [
    {
      name: 'Zapatos',
      image: '/img/subcategorias/zapatonina.png',
      description: '',
      isTrending: true,
      count: 10,
      color: 'from-pink-500 to-rose-600'
    },
    {
      name: 'Botas',
      image: '/img/subcategorias/botasnina.png',
      description: '',
      count: 8,
      color: 'from-purple-500 to-violet-600'
    },
    {
      name: 'Sneakers',
      image: '/img/subcategorias/tenisnina.jfif',
      description: '',
      discount: '20% OFF',
      count: 16,
      color: 'from-indigo-500 to-purple-600'
    },
    {
      name: 'Sandalias',
      image: '/img/subcategorias/sandalianina.png',
      description: '',
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
      description: '',
      isNew: true,
      count: 14,
      color: 'from-black to-gray-900'
    }
  ],
  bolsos: [
    {
      name: 'Carteras de Dama',
      image: '/img/subcategorias/carteramujer.png',
      description: '',
      isTrending: true,
      count: 16,
      color: 'from-purple-500 to-violet-600'
    },
    {
      name: 'Carteras de Caballero',
      image: '/img/subcategorias/carterahombre.png',
      description: '',
      isTrending: true,
      count: 16,
      color: 'from-purple-500 to-violet-600'
    },
    {
      name: 'Mochilas de Dama',
      image: '/img/subcategorias/mochilamujer.png',
      description: '',
      count: 12,
      color: 'from-green-600 to-emerald-700'
    },
    {
      name: 'Mochilas de Caballero',
      image: '/img/subcategorias/mochilahombre.png',
      description: '',
      count: 12,
      color: 'from-green-600 to-emerald-700'
    },
    {
      name: 'Bolsos de mano',
      image: '/img/subcategorias/bolsodemano.png',
      description: '',
      isNew: true,
      count: 10,
      color: 'from-pink-500 to-rose-600'
    }
     ],
   // Categoría Niñas
   ninas: [
     {
       name: 'Vestidos',
       image: '/img/subcategorias/vestidonina.png',
       description: '',
       isTrending: true,
       count: 15,
       color: 'from-pink-500 to-rose-600'
     },
     {
       name: 'Blusas',
       image: '/img/subcategorias/blusanina.png',
       description: '',
       count: 12,
       color: 'from-purple-500 to-violet-600'
     },
     {
       name: 'Pantalones',
       image: '/img/subcategorias/pantalonnina.png',
       description: '',
       discount: '20% OFF',
       count: 18,
       color: 'from-indigo-500 to-purple-600'
     },
     {
       name: 'Pants',
       image: '/img/subcategorias/pantsnina.png',
       description: '',
       isNew: true,
       count: 8,
       color: 'from-indigo-500 to-purple-600'
     },
     {
       name: 'Chaleco',
       image: '/img/subcategorias/chaleconina.png',
       description: '',
       isNew: true,
       count: 6,
       color: 'from-yellow-500 to-amber-600'
     },
     {
       name: 'Suéter',
       image: '/img/subcategorias/sueternina.png',
       description: '',
       isTrending: true,
       count: 10,
       color: 'from-orange-500 to-red-600'
     },
     {
       name: 'Faldas',
       image: '/img/subcategorias/faldanina.png',
       description: '',
       isNew: true,
       count: 10,
       color: 'from-rose-400 to-pink-500'
     },
     {
      name: 'Sudaderas',
      image: '/img/subcategorias/sudaderanina.png',
      description: '',
      isNew: true,
      count: 10,
      color: 'from-rose-400 to-pink-500'
    },
    {
      name: 'Chamarras',
      image: '/img/subcategorias/chamarranina.png',
      description: '',
      isNew: true,
      count: 10,
      color: 'from-rose-400 to-pink-500'
    },
    {
      name: 'Playeras',
      image: '/img/subcategorias/playeranina.png',
      description: '',
      isNew: true,
      count: 10,
      color: 'from-rose-400 to-pink-500'
    },
     {
       name: 'Shorts',
       image: '/img/subcategorias/shortnina.png',
       description: '',
       count: 14,
       color: 'from-cyan-500 to-blue-500'
     }
   ],
   // Categoría Niños
   ninos: [
     {
       name: 'Camisetas',
       image: '/img/subcategorias/camisanino.png',
       description: '',
       isTrending: true,
       count: 20,
       color: 'from-blue-600 to-indigo-700'
     },
     {
       name: 'Pantalones',
       image: '/img/subcategorias/pantalonnino.png',
       description: '',
       count: 16,
       color: 'from-green-600 to-emerald-700'
     },
     {
       name: 'Pants',
       image: '/img/subcategorias/pantsnino.png',
       description: '',
       isNew: true,
       count: 8,
       color: 'from-indigo-500 to-purple-600'
     },
     {
       name: 'Chaleco',
       image: '/img/subcategorias/chaleconino.png',
       description: '',
       isNew: true,
       count: 6,
       color: 'from-yellow-500 to-amber-600'
     },
     {
       name: 'Suéter',
       image: '/img/subcategorias/sueternino.png',
       description: '',
       isTrending: true,
       count: 10,
       color: 'from-orange-500 to-red-600'
     },
     {
       name: 'Shorts',
       image: '/img/subcategorias/shortnino.png',
       description: '',
       discount: '15% OFF',
       count: 12,
       color: 'from-red-500 to-red-600'
     },
     {
      name: 'Playeras',
      image: '/img/subcategorias/playeranino.png',
      description: '',
      isNew: true,
      count: 10,
      color: 'from-rose-400 to-pink-500'
    },
     {
       name: 'Sudaderas',
       image: '/img/subcategorias/sudaderanino.png',
       description: '',
       isNew: true,
       count: 18,
       color: 'from-amber-500 to-orange-600'
     },
     {
       name: 'Chamarras',
       image: '/img/subcategorias/chamarranino.png',
       description: '',
       count: 8,
       color: 'from-gray-600 to-gray-800'
     }
   ],
   deportes: [
     {
       name: 'Ropa deportiva',
       image: '/img/subcategorias/ropagym.png',
       description: '',
       isTrending: true,
       count: 25,
       color: 'from-red-500 to-red-600'
     },
     {
       name: 'Zapatillas',
       image: '/img/subcategorias/tenisgym.png',
       description: '',
       discount: '25% OFF',
       count: 22,
       color: 'from-blue-500 to-indigo-600'
     },
     {
       name: 'Accesorios deportivos',
       image: '/img/subcategorias/accesoriosgym.png',
       description: '',
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
  const { counts, loading, error } = useSubcategoryCounts(categoriaSlug)
  const subcategorias = subcategoriasData[categoriaSlug] || []

  if (subcategorias.length === 0) {
    return null
  }

  // Función para obtener el conteo real o mostrar loading
  const getProductCount = (subcategoryName: string) => {
    if (loading) return '...'
    if (error) return subcategoriasData[categoriaSlug]?.find(s => s.name === subcategoryName)?.count || 0
    return counts[subcategoryName] || 0
  }

  return (
    <div className="mb-12">
      {/* Header optimizado para móvil */}
      <div className="text-center mb-4 sm:mb-6 lg:mb-8">
        <div className="flex items-center justify-center mb-2 sm:mb-3 lg:mb-4">
          <div className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 border border-white/20">
            
          </div>
        </div>
       
      </div>

      {/* Subcategorías Grid mejorado con distribución optimizada */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 2xl:gap-7 max-w-7xl mx-auto px-2 sm:px-4">
        {/* Botón "Todas" mejorado */}
        <button
          onClick={() => onSubcatChange("")}
          className={`group relative h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-95 ${
            subcatSeleccionada === "" 
              ? "ring-1 sm:ring-2 md:ring-3 ring-primary-400 shadow-lg sm:shadow-xl transform scale-[1.02] z-10" 
              : "hover:shadow-md sm:hover:shadow-lg hover:ring-1 hover:ring-primary-300/50 shadow-sm"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-1 sm:px-2">
              <Grid className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 mx-auto mb-0.5 sm:mb-1 opacity-90 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
              <div className="text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold mb-0 sm:mb-0.5 drop-shadow-md">Todas</div>
              <div className="text-[8px] sm:text-[10px] opacity-90 hidden sm:block font-medium">Ver todo</div>
            </div>
          </div>
          {/* Efecto de brillo mejorado */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          {/* Efecto de partículas */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-2 left-2 w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
            <div className="absolute top-4 right-3 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-3 left-4 w-1 h-1 bg-white/50 rounded-full animate-pulse delay-700"></div>
          </div>
        </button>

        {/* Subcategorías con imágenes mejoradas */}
        {subcategorias.map((subcat) => (
          <button
            key={subcat.name}
            onClick={() => onSubcatChange(subcat.name)}
            className={`group relative h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-95 ${
              subcatSeleccionada === subcat.name 
                ? "ring-1 sm:ring-2 md:ring-3 ring-primary-400 shadow-lg sm:shadow-xl transform scale-[1.02] z-10" 
                : "hover:shadow-md sm:hover:shadow-lg hover:ring-1 hover:ring-primary-300/50 shadow-sm"
            }`}
          >
            {/* Imagen de fondo mejorada con mejor calidad */}
            <img
              src={subcat.image}
              alt={subcat.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter group-hover:brightness-110"
              loading="lazy"
            />
            
            {/* Overlay gradiente mejorado con mejor contraste */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent"></div>
            
            {/* Gradiente de color personalizado más sutil */}
            <div className={`absolute inset-0 bg-gradient-to-br ${subcat.color} opacity-15 group-hover:opacity-25 transition-opacity duration-300`}></div>
            
            {/* Badges optimizados para móvil */}
            <div className="absolute top-0.5 sm:top-1 md:top-2 left-0.5 sm:left-1 md:left-2 flex flex-col gap-0.5">
              {subcat.isNew && (
                <span className="inline-flex items-center px-1 sm:px-1.5 md:px-2 py-0.5 text-[8px] sm:text-[10px] font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-lg backdrop-blur-sm border border-white/20 animate-pulse">
                  <Sparkles className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 mr-0.5 animate-spin" />
                  <span className="hidden sm:inline">Nuevo</span>
                  <span className="sm:hidden">N</span>
                </span>
              )}
              {subcat.isTrending && (
                <span className="inline-flex items-center px-1 sm:px-1.5 md:px-2 py-0.5 text-[8px] sm:text-[10px] font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg backdrop-blur-sm border border-white/20">
                  <TrendingUp className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 mr-0.5" />
                  <span className="hidden sm:inline">Hot</span>
                  <span className="sm:hidden">🔥</span>
                </span>
              )}
              {subcat.discount && (
                <span className="inline-flex items-center px-1 sm:px-1.5 md:px-2 py-0.5 text-[8px] sm:text-[10px] font-bold bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-full shadow-lg backdrop-blur-sm border border-white/20 animate-bounce">
                  <Star className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 mr-0.5" />
                  {subcat.discount}
                </span>
              )}
            </div>

            {/* Contenido optimizado para móvil */}
            <div className="absolute bottom-0 left-0 right-0 p-1 sm:p-1.5 md:p-2 lg:p-3 text-white">
              <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold mb-0.5 sm:mb-1 truncate drop-shadow-lg">{subcat.name}</div>
              <div className="text-[8px] sm:text-[10px] opacity-90 mb-0.5 line-clamp-1 hidden md:block font-medium">{subcat.description}</div>
              <div className="flex items-center justify-between">
                <div className="text-[8px] sm:text-[10px] opacity-90 bg-black/40 backdrop-blur-sm px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-full border border-white/20 font-medium">
                  <span className="hidden sm:inline">{getProductCount(subcat.name)} productos</span>
                  <span className="sm:hidden">{getProductCount(subcat.name)}</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-0.5 sm:p-1 md:p-1.5 group-hover:bg-white/30 transition-all duration-300">
                  <ArrowRight className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 opacity-80 group-hover:translate-x-1 group-hover:opacity-100 transition-all duration-300" />
                </div>
              </div>
            </div>

            {/* Efecto hover mejorado con múltiples capas */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Efecto de brillo mejorado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            {/* Efecto de partículas en hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/60 rounded-full animate-ping"></div>
              <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/40 rounded-full animate-ping delay-300"></div>
              <div className="absolute bottom-1/4 left-3/4 w-1 h-1 bg-white/50 rounded-full animate-ping delay-700"></div>
            </div>
          </button>
        ))}
      </div>

      {/* Información adicional mejorada con mejor diseño */}
      <div className="mt-4 sm:mt-6 text-center">
        <div className="inline-flex items-center bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-white/90 border border-white/20 shadow-lg">
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
              <span className="text-sm font-medium">Cargando productos...</span>
            </div>
          ) : error ? (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-yellow-300">Usando datos por defecto</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium">
                Total: <span className="font-bold text-primary-300">{Object.values(counts).reduce((sum, count) => sum + count, 0)}</span> productos en <span className="capitalize font-semibold">{categoriaSlug}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}