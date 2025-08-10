'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, TrendingUp, Star } from 'lucide-react'

const categories = [
  {
    id: 1,
    name: 'Ropa de Mujer',
    description: 'Vestidos, blusas, pantalones y más',
    image: '/img/categoriamujer.avif',
    count: '',
    href: '/categorias/mujer',
    isNew: false,
    isTrending: true,
    discount: null
  },
  {
    id: 2,
    name: 'Ropa de Hombre',
    description: 'Camisas, pantalones, trajes elegantes',
    image: '/img/categoriahombre.jpg',
    count: '',
    href: '/categorias/hombre',
    isNew: false,
    isTrending: false,
    discount: '20% OFF'
  },
  {
    id: 3,
    name: 'Accesorios',
    description: 'Joyas, relojes, cinturones y más',
    image: '/img/categoriaaccesorios.avif',
    count: '',
    href: '/categorias/accesorios',
    isNew: true,
    isTrending: true,
    discount: null
  },
  {
    id: 4,
    name: 'Calzado de Hombre',
    description: 'Zapatos, sneakers, botas y sandalias para hombres',
    image: '/img/botashombre.png',
    count: '',
    href: '/categorias/calzado-hombre',
    isNew: true,
    isTrending: true,
    discount: '20% OFF'
  },
  {
    id: 13,
    name: 'Calzado de Mujer',
    description: 'Tacones, zapatillas, zapatos, sneakers, botas, huaraches y sandalias',
    image: '/img/categoriacalzadomujer.avif',
    count: '',
    href: '/categorias/calzado-mujer',
    isNew: false,
    isTrending: true,
    discount: '25% OFF'
  },
  {
    id: 5,
    name: 'Bolsos',
    description: 'Carteras, mochilas, bolsos de mano',
    image: '/img/mochilahombre.png',
    count: '',
    href: '/categorias/bolsos',
    isNew: false,
    isTrending: true,
    discount: null
  },
  {
    id: 6,
    name: 'Deportes',
    description: 'Ropa deportiva y fitness',
    image: '/img/gym.jpg',
    count: '',
    href: '/categorias/deportes',
    isNew: true,
    isTrending: false,
    discount: '25% OFF'
  },
  {
    id: 7,
    name: 'Ropa Interior',
    description: 'Lencería elegante y cómoda',
    image: '/img/interiormujer.png',
    count: '',
    href: '/categorias/ropa-interior',
    isNew: true,
    isTrending: true,
    discount: null
  },
  {
    id: 8,
    name: 'Trajes de Baño',
    description: 'Bikinis, trajes de baño y cover-ups',
    image: '/img/trajedebano.png',
    count: '',
    href: '/categorias/trajesbano',
    isNew: false,
    isTrending: true,
    discount: '30% OFF'
  },
  {
    id: 9,
    name: 'Ropa de Bebé',
    description: 'Ropa adorable para los más pequeños',
    image: '/img/categoriabebe.avif',
    count: '',
    href: '/categorias/bebe',
    isNew: false,
    isTrending: false,
    discount: '10% OFF'
  },
  {
    id: 10,
    name: 'Niñas',
    description: 'Ropa elegante y divertida para niñas',
    image: '/img/categorianina.avif',
    count: '',
    href: '/categorias/ninas',
    isNew: true,
    isTrending: true,
    discount: '15% OFF'
  },
  {
    id: 11,
    name: 'Niños',
    description: 'Ropa cómoda y resistente para niños',
    image: '/img/categorianino.jpg',
    count: '',
    href: '/categorias/ninos',
    isNew: true,
    isTrending: false,
    discount: '20% OFF'
  },
  {
    id: 12,
    name: 'Calzado de Niño',
    description: 'Zapatos, botas, sneakers y sandalias para niños',
    image: '/img/tenisnino.jfif',
    count: '',
    href: '/categorias/calzado-nino',
    isNew: false,
    isTrending: true,
    discount: '25% OFF'
  },
  {
    id: 14,
    name: 'Calzado de Niña',
    description: 'Zapatos, botas, sneakers y sandalias para niñas',
    image: '/img/tenisnina.jfif',
    count: '',
    href: '/categorias/calzado-nina',
    isNew: true,
    isTrending: false,
    discount: '30% OFF'
  }
]

export default function Categories() {
  return (
    <section className="py-16 bg-gradient-elegant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
            Explora por Categorías
          </h2>
          <p className="text-base md:text-lg text-white max-w-2xl mx-auto mb-2">
            Encuentra exactamente lo que buscas en nuestras categorías .
          </p>
          <p className="text-sm md:text-base text-white/80 font-bold max-w-9xl mx-auto">
            ✅ Selección de calidad • 🇲🇽 Apoyo a emprendedores mexicanos • ♻️ Consumo responsable
          </p>
        </div>

        {/* Categories Grid - Optimizado para tablet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group bg-white rounded-xl shadow-elegant overflow-hidden hover:shadow-premium transition-all duration-300 hover:scale-105"
            >
              <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/20 to-transparent"></div>
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {category.isNew && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary-500 text-white rounded-full">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Nuevo
                    </span>
                  )}
                  {category.isTrending && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-secondary-500 text-white rounded-full">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </span>
                  )}
                  {category.discount && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-accent-500 text-white rounded-full">
                      {category.discount}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm opacity-90 mb-2">{category.description}</p>
                  <p className="text-sm opacity-90 mb-3">{category.count}</p>
                  <div className="flex items-center text-sm font-medium">
                    Explorar
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Categories */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              Categorías Destacadas
            </h3>
            <p className="text-white">
              Las más populares entre nuestros clientes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mujer */}
            <div className="relative h-80 rounded-xl overflow-hidden shadow-elegant group">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Ropa de Mujer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/80 to-secondary-500/80"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h4 className="text-3xl font-bold mb-2">Ropa de Mujer</h4>
                  <p className="text-lg mb-4"></p>
                  <Link
                    href="/categorias/mujer"
                    className="inline-flex items-center bg-blue-500 text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    Ver Colección
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Hombre */}
            <div className="relative h-80 rounded-xl overflow-hidden shadow-elegant group">
              <img
                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Ropa de Hombre"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-neutral-700/80 to-neutral-900/80"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h4 className="text-3xl font-bold mb-2">Ropa de Hombre</h4>
                  <p className="text-lg mb-4"></p>
                  <Link
                    href="/categorias/hombre"
                    className="inline-flex items-center bg-red-500 text-black px-700 px-6 py-3 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
                  >
                    Ver Colección
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-xl shadow-elegant p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-neutral-700 mb-4">
              ¿No encuentras lo que buscas?
            </h3>
            <p className="text-neutral-600 mb-6">
              Explora todas nuestras categorías y descubre productos únicos para cada ocasión
            </p>
            <Link
              href="/categorias"
              className="btn-primary inline-flex items-center group"
            >
              Ver Todas las Categorías
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
} 