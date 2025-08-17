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
      {/* Header mejorado */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-3">
          
          <h3 className="text-2xl font-bold text-white">
            
          </h3>
        </div>
        <p className="text-white/80 text-sm max-w-2xl mx-auto">
          
        </p>
      </div>

      {/* Subcategorías Grid mejorado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
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
              <div className="flex items-center justify-between">
                <div className="text-xs opacity-75 bg-black/30 px-1.5 py-0.5 rounded-full">
                  {getProductCount(subcat.name)} productos
                </div>
                <ArrowRight className="h-3 w-3 opacity-60 group-hover:translate-x-1 group-hover:opacity-100 transition-all duration-300" />
              </div>
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
          {loading ? (
            <span className="text-sm">Cargando productos...</span>
          ) : error ? (
            <span className="text-sm text-yellow-300">Usando datos por defecto</span>
          ) : (
            <span className="text-sm">
              Total: {Object.values(counts).reduce((sum, count) => sum + count, 0)} productos en {categoriaSlug}
            </span>
          )}
        </div>
      </div>
    </div>
  )
} 