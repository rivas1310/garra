"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Agregar timestamp para evitar caché
    const timestamp = Date.now();
    
    fetch(`/api/productos?conditionTag=LIKE_NEW&limit=8&t=${timestamp}`)
      .then(res => res.json())
      .then(data => {
        // Manejar tanto array directo como objeto con propiedad productos
        const productsArray = Array.isArray(data) ? data : (data.productos || []);
        
        // Mapear los productos para incluir las propiedades necesarias
        const mappedProducts = productsArray.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice,
          image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '/img/placeholder.png',
          rating: p.rating ?? 0,
          reviewCount: p.reviewCount ?? 0,
          category: p.category?.name ?? '',
          conditionTag: p.conditionTag,
          isOnSale: p.isOnSale,
          stock: p.stock ?? 0,
          isActive: p.isActive ?? true,
          isAvailable: p.isAvailable ?? true,
          totalStock: p.totalStock ?? p.stock ?? 0,
          variants: p.variants ?? [],
        }));
        
        setProducts(mappedProducts);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error cargando productos destacados:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-elegant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Productos Destacados</h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16 bg-gradient-elegant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Productos Destacados</h2>
            <p className="text-white/80">No hay productos nuevos disponibles actualmente.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-elegant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Productos Destacados</h2>
          <p className="text-white/80">Descubre nuestras últimas novedades</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}