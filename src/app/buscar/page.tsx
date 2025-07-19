"use client"

import { useSearchParams } from 'next/navigation'
import { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

// Mock de productos
const productos = [
  {
    id: 1,
    name: 'Vestido Fucsia Elegante',
    description: 'Vestido moderno para ocasiones especiales',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
    price: 899,
  },
  {
    id: 2,
    name: 'Camisa Lavanda Clásica',
    description: 'Camisa de algodón color lavanda',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    price: 599,
  },
  {
    id: 3,
    name: 'Bolso Beige Moderno',
    description: 'Bolso elegante y espacioso',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80',
    price: 699,
  },
  {
    id: 4,
    name: 'Zapatillas Grafito',
    description: 'Zapatillas deportivas color grafito',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    price: 799,
  },
]

function BuscarContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.toLowerCase() || ''

  const resultados = useMemo(() => {
    if (!query) return []
    return productos.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    )
  }, [query])

  return (
    <main className="min-h-screen bg-gradient-elegant py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-neutral-700 mb-6 flex items-center gap-2">
          <Search className="h-6 w-6 text-primary-500" />
          Resultados de búsqueda
        </h1>
        {query && (
          <p className="mb-8 text-neutral-500">
            Mostrando resultados para: <span className="font-semibold text-primary-600">{query}</span>
          </p>
        )}
        {!query && (
          <p className="mb-8 text-neutral-500">Ingresa un término de búsqueda para ver resultados.</p>
        )}
        {query && resultados.length === 0 && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-neutral-500">No se encontraron productos para tu búsqueda.</p>
            <Link href="/productos" className="btn-primary mt-4 inline-block">Ver todos los productos</Link>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {resultados.map((producto) => (
            <div key={producto.id} className="bg-white rounded-xl shadow-elegant p-4 flex flex-col">
              <img src={producto.image} alt={producto.name} className="w-full h-48 object-cover rounded-lg mb-4" />
              <h2 className="text-lg font-semibold text-neutral-800 mb-1">{producto.name}</h2>
              <p className="text-neutral-500 text-sm mb-2">{producto.description}</p>
              <span className="text-primary-600 font-bold text-lg mb-4">${producto.price}</span>
              <Link href={`/productos/${producto.id}`} className="btn-primary text-center mt-auto">Ver producto</Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default function BuscarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <BuscarContent />
    </Suspense>
  )
} 