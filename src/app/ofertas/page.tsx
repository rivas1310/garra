'use client'

import { ArrowRight, Percent } from 'lucide-react'
import { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'

export default function OfertasPage() {
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    // Agregar timestamp para evitar caché
    const timestamp = Date.now();
    fetch(`/api/productos?isOnSale=true&t=${timestamp}`)
      .then(res => res.json())
      .then(data => {
        // Manejar tanto array directo como objeto con propiedad productos
        const productsArray = Array.isArray(data) ? data : (data.productos || []);
        setProducts(productsArray);
      });
  }, []);

  // Filtrar solo productos en oferta
  const ofertas = Array.isArray(products) ? products.filter((p: any) => p.isOnSale) : [];

  return (
    <main className="min-h-screen bg-gradient-elegant py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="bg-primary-500 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between mb-12 shadow-elegant">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2">
              <Percent className="h-8 w-8 text-accent-200" />
              Ofertas Exclusivas
            </h1>
            <p className="text-lg text-white/90 max-w-xl">
              Aprovecha los mejores descuentos en productos seleccionados. ¡Solo por tiempo limitado!
            </p>
          </div>
          <a
            href="/productos"
            className="inline-flex items-center bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-neutral-50 transition-colors shadow"
          >
            Ver todos los productos
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>

        {/* Ofertas Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ofertas.length === 0 ? (
            <div className="col-span-full text-center text-neutral-500 py-12">
              No hay productos en oferta actualmente.
            </div>
          ) : (
            ofertas.map((product: any) => (
              <ProductCard key={product.id} product={{
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: Array.isArray(product.images) && product.images[0] ? product.images[0] : '/img/placeholder.png',
                rating: product.rating ?? 0,
                reviewCount: product.reviewCount ?? 0,
                category: product.category?.name ?? '',
                isNew: product.isNew,
                isSale: product.isOnSale,
                isSecondHand: product.isSecondHand,
              }} />
            ))
          )}
        </div>
      </div>
    </main>
  )
}