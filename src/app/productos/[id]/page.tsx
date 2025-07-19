"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShoppingCart, Star } from "lucide-react";

interface Variante {
  color: string;
  tallas: string[];
}

export default function DetalleProducto() {
  const params = useParams();
  const { id } = params;
  const [producto, setProducto] = useState<any>(null);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<Variante | null>(null);
  const [tallaSeleccionada, setTallaSeleccionada] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/productos/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'No se pudo cargar el producto');
        }
        return res.json();
      })
      .then((data) => {
        setProducto(data);
        setError("");
        if (data.variantes && data.variantes.length > 0) {
          setVarianteSeleccionada(data.variantes[0]);
          setTallaSeleccionada(data.variantes[0].tallas[0] || "");
        }
      })
      .catch((err) => {
        setError(err.message);
        setProducto(null);
      });
  }, [id]);

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">{error}</div>;
  }

  if (!producto) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Imagen */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center">
          <img
            src={producto.images?.[0] || "/img/placeholder.png"}
            alt={producto.name}
            className="w-full h-96 object-contain rounded-lg"
          />
        </div>
        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold text-title mb-2">{producto.name}</h1>
          <div className="flex items-center mb-4">
            <Star size={18} className="text-yellow-400 fill-current" />
            <span className="ml-1 text-body">{producto.rating ?? 0} ({producto.reviewCount ?? 0} reseñas)</span>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl font-bold text-title">${producto.price}</span>
            {producto.originalPrice && (
              <span className="text-lg text-muted line-through">${producto.originalPrice}</span>
            )}
          </div>
          {/* Variantes de color */}
          {producto.variantes && producto.variantes.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Color:</h4>
              <div className="flex gap-2">
                {producto.variantes.map((v: Variante, idx: number) => (
                  <button
                    key={v.color}
                    className={`px-3 py-1 rounded-full border ${varianteSeleccionada?.color === v.color ? "bg-primary-500 text-white" : "bg-white text-title"}`}
                    onClick={() => {
                      setVarianteSeleccionada(v);
                      setTallaSeleccionada(v.tallas[0] || "");
                    }}
                  >
                    {v.color}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Tallas */}
          {varianteSeleccionada && varianteSeleccionada.tallas.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Talla:</h4>
              <div className="flex gap-2">
                {varianteSeleccionada.tallas.map((talla) => (
                  <button
                    key={talla}
                    className={`px-3 py-1 rounded-full border ${tallaSeleccionada === talla ? "bg-primary-500 text-white" : "bg-white text-title"}`}
                    onClick={() => setTallaSeleccionada(talla)}
                  >
                    {talla}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button className="btn-primary flex items-center gap-2">
            <ShoppingCart size={18} /> Agregar al Carrito
          </button>
        </div>
      </div>
      {/* Descripción */}
      <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Descripción</h2>
        <p className="text-body">{producto.description || "Sin descripción."}</p>
      </div>
    </div>
  );
} 