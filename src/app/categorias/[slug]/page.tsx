"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";

// Definir subcategorías por slug
const subcategoriasPorCategoria: Record<string, string[]> = {
  mujer: ["Vestidos", "Blusas", "Pantalones", "Chamarras", "Sudaderas"],
  hombre: ["Chamarras", "Camisas", "Playeras", "Pantalones", "Shorts"],
  accesorios: ["Joyas", "Relojes", "Cinturones", "Bolsos"],
  calzado: ["Zapatos", "Zapatillas", "Botas"],
  bolsos: ["Carteras", "Mochilas", "Bolsos de mano"],
  deportes: ["Ropa deportiva", "Fitness", "Accesorios deportivos"],
  // Agrega más según tus categorías
};

export default function CategoriaPage() {
  const params = useParams();
  const { slug } = params;
  const [productos, setProductos] = useState<any[]>([]);
  const [categoria, setCategoria] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subcatSeleccionada, setSubcatSeleccionada] = useState<string>("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/categorias/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setCategoria(data.categoria || null);
        setProductos(
          (data.productos || []).map((p: any) => ({
            ...p,
            image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '/img/placeholder.png',
            stock: p.stock ?? 0,
            isActive: p.isActive ?? true,
            isAvailable: p.isAvailable ?? true,
            totalStock: p.totalStock ?? p.stock ?? 0,
          }))
        );
        setSubcatSeleccionada("");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!categoria) {
    return <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">Categoría no encontrada</div>;
  }

  // Obtener subcategorías para la categoría actual
  const subcategorias = subcategoriasPorCategoria[slug as string] || [];

  // Filtrar productos por subcategoría si está seleccionada
  const productosFiltrados = subcatSeleccionada
    ? productos.filter((p) =>
        (p.subcategoria || "").toLowerCase() === subcatSeleccionada.toLowerCase()
      )
    : productos;

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white text-title mb-4">{categoria.name}</h1>
        <p className="text-body text-white mb-8">{categoria.description || "Descubre los productos de esta categoría."}</p>

        {/* Botones de subcategoría */}
        {subcategorias.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-3">
            <button
              className={`px-4 py-2 rounded-full border font-medium ${subcatSeleccionada === "" ? "bg-primary-500 text-white" : "bg-white text-title"}`}
              onClick={() => setSubcatSeleccionada("")}
            >
              Todas
            </button>
            {subcategorias.map((subcat) => (
              <button
                key={subcat}
                className={`px-4 py-2 rounded-full border font-medium ${subcatSeleccionada === subcat ? "bg-primary-500 text-white" : "bg-white text-title"}`}
                onClick={() => setSubcatSeleccionada(subcat)}
              >
                {subcat}
              </button>
            ))}
          </div>
        )}

        {productosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
              <ProductCard key={producto.id} product={producto} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-title mb-2">No hay productos en esta subcategoría</h3>
            <p className="text-body">Pronto agregaremos más productos.</p>
          </div>
        )}
      </div>
    </div>
  );
} 