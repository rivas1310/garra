'use client'

import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative bg-gradient-elegant overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-200/30 to-primary-300/20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blanco mb-6">
              Descubre tu
              <span className="text-blanco block">Estilo Único</span>
            </h1>
            <p className="text-lg md:text-xl text-blanco mb-4 max-w-2xl font-semibold">
              Moda circular, apoya local, viste con causa.
            </p>
            <p className="text-lg md:text-xl text-blanco mb-8 max-w-2xl">
              En <span className="font-bold">Garras Felinas</span> damos nueva vida a la moda, apoyamos el talento mexicano y promovemos el consumo responsable. Cada prenda cuenta una historia, ¡sé parte del cambio!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                href="/productos" 
                className="btn-primary inline-flex items-center justify-center group"
              >
                Comprar Ahora
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/categorias" 
                className="btn-outline inline-flex items-center justify-center"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Ver Categorías
              </Link>
            </div>
            {/* Tagline extra */}
            <div className="mt-8">
              <span className="inline-block bg-white/20 text-blanco px-4 py-2 rounded-full font-medium text-lg">
                ♻️ Moda sostenible • Apoyo a emprendedores • Precios accesibles
              </span>
            </div>
            
            {/* Stats section removed as requested */}
          </div>
          
          {/* Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Fashion Collection"
                className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
              />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg border border-primary-100">
              <div className="text-sm font-medium text-blanco">Nueva Colección</div>
              <div className="text-xs text-blanco/80">Otoño 2024</div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-gradient-premium text-white p-4 rounded-xl shadow-lg">
              <div className="text-sm font-medium">Hasta 50% OFF</div>
              <div className="text-xs opacity-90">En seleccionados</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-30"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary-300 rounded-full opacity-20"></div>
    </section>
  )
}