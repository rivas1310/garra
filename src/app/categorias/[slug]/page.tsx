"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import SubcategoryGrid from "@/components/SubcategoryGrid";
import PaginatedProductGrid from "@/components/PaginatedProductGrid";



export default function CategoriaPage() {
  const params = useParams();
  const { slug } = params;
  const [categoria, setCategoria] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subcatSeleccionada, setSubcatSeleccionada] = useState<string>("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    // Solo cargar información de la categoría, no los productos
    const timestamp = Date.now();
    fetch(`/api/categorias/${slug}?t=${timestamp}&limit=1`) // Cargar solo 1 producto para obtener info de categoría
      .then((res) => res.json())
      .then((data) => {
        setCategoria(data.categoria || null);
      })
      .catch((error) => {
        console.error('Error cargando categoría:', error);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!categoria) {
    return <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">Categoría no encontrada</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white text-title mb-4">{categoria.name}</h1>
        <p className="text-body text-white mb-8">{categoria.description || "Descubre los productos de esta categoría."}</p>

        {/* Subcategorías con imágenes */}
        <SubcategoryGrid
          categoriaSlug={slug as string}
          subcatSeleccionada={subcatSeleccionada}
          onSubcatChange={setSubcatSeleccionada}
        />

        {/* Grid de productos con paginación */}
        <PaginatedProductGrid
          categorySlug={slug as string}
          subcategoria={subcatSeleccionada}
          pageSize={12}
        />
      </div>
    </div>
  );
}