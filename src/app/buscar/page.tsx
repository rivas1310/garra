"use client"

import { useSearchParams } from 'next/navigation'
import { log } from '@/lib/secureLogger'
import { useState, useEffect, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Definir la interfaz para el tipo de producto
interface Producto {
  id: string;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  category?: {
    id: string;
    name: string;
  };
}

function BuscarContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.toLowerCase() || ''
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        
        // Construir URL con parámetros de búsqueda
        const params = new URLSearchParams();
        if (query.trim()) {
          params.append('search', query.trim());
          params.append('limit', '100'); // Limitar resultados para búsquedas
        } else {
          params.append('limit', '50'); // Menos productos si no hay búsqueda
        }
        params.append('t', Date.now().toString());
        

        
        const response = await fetch(`/api/productos?${params}`);
        if (!response.ok) {
          throw new Error('Error al cargar productos');
        }
        const data = await response.json();
        
        // Manejar tanto array directo como objeto con propiedad productos
        const productsArray = Array.isArray(data) ? data : (data.productos || []);
        setProductos(productsArray);
        

        
      } catch (error) {
        log.error('Error al cargar productos:', error)
        toast.error('Error al cargar productos')
      } finally {
        setLoading(false)
      }
    }

    fetchProductos();
  }, [query]) // Ahora se ejecuta cuando cambia la query

  const resultados = useMemo(() => {
    // Si no hay query, no mostrar nada
    if (!query) return [];
    
    // Si no hay productos, no mostrar nada
    if (!Array.isArray(productos)) return [];
    
    // Los productos ya vienen filtrados de la API
    
    return productos;
  }, [query, productos])

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
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {query && resultados.length === 0 && (
              <div className="bg-white rounded-xl shadow-elegant p-8 text-center">
                <p className="text-neutral-500 mb-4">No se encontraron productos para tu búsqueda.</p>
                <Link href="/productos" className="btn-primary mt-2 inline-block">Ver todos los productos</Link>
              </div>
            )}
            
            {resultados.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {resultados.map((producto) => (
                  <div key={producto.id} className="bg-white rounded-xl shadow-elegant p-4 flex flex-col">
                    <div className="h-48 bg-neutral-100 rounded-lg mb-4 overflow-hidden">
                      <img 
                        src={producto.images?.[0] || '/placeholder-product.jpg'} 
                        alt={producto.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    <h2 className="text-lg font-semibold text-neutral-800 mb-1 line-clamp-1">{producto.name}</h2>
                    <p className="text-neutral-500 text-sm mb-2 line-clamp-2">{producto.description}</p>
                    <div className="mt-auto pt-2">
                      <span className="text-primary-600 font-bold text-lg block mb-3">
                        ${producto.price?.toFixed(2) || producto.price}
                      </span>
                      <Link 
                        href={`/productos/${producto.id}`} 
                        className="btn-primary text-center block w-full"
                      >
                        Ver producto
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
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