"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShoppingCart, Star, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface Variante {
  id: string;
  color: string;
  size: string;
  stock: number;
  price?: number;
}

export default function DetalleProducto() {
  const params = useParams();
  const { id } = params;
  const [producto, setProducto] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [addToCartMessage, setAddToCartMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const { addToCart } = useCart();

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
        // Asegurarse de que el stock de las variantes refleje el stock total si es necesario
        if (data.variants && data.variants.length > 0 && data.totalStock > 0) {
          // Si hay stock total pero las variantes tienen stock 0, asignar el stock total a la primera variante
          const todasConStockCero = data.variants.every((v: any) => v.stock === 0);
          if (todasConStockCero && data.totalStock > 0) {
            data.variants[0].stock = data.totalStock;
          }
        }
        
        setProducto(data);
        setError("");
        
        // Extraer colores y tallas disponibles de todas las variantes
        if (data.variants && data.variants.length > 0) {
          // Obtener todas las variantes
          const todasLasVariantes = data.variants;
          // Obtener variantes con stock
          const variantesConStock = data.variants.filter((v: any) => v.stock > 0);
          
          // Seleccionar color por defecto (priorizar los que tienen stock)
          let firstColor;
          if (variantesConStock.length > 0) {
            // Si hay variantes con stock, seleccionar el primer color con stock
            firstColor = variantesConStock[0].color;
          } else {
            // Si no hay variantes con stock, seleccionar el primer color disponible
            firstColor = todasLasVariantes[0].color;
          }
          setSelectedColor(firstColor || "");
          
          // Seleccionar talla por defecto para el color seleccionado (priorizar las que tienen stock)
          const sizesForColorWithStock = todasLasVariantes
            .filter((v: any) => v.color === firstColor && v.stock > 0)
            .map((v: any) => v.size);
          
          const allSizesForColor = todasLasVariantes
            .filter((v: any) => v.color === firstColor)
            .map((v: any) => v.size);
          
          if (sizesForColorWithStock.length > 0) {
            // Si hay tallas con stock para este color, seleccionar la primera
            setSelectedSize(sizesForColorWithStock[0] || "");
          } else if (allSizesForColor.length > 0) {
            // Si no hay tallas con stock pero hay tallas disponibles, seleccionar la primera
            setSelectedSize(allSizesForColor[0] || "");
          } else {
            setSelectedSize("");
          }
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
        {/* Imagen con slider */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="relative">
            <img
              src={producto.images?.[currentImageIndex] || "/img/placeholder.png"}
              alt={`${producto.name} - Imagen ${currentImageIndex + 1}`}
              className="w-full h-96 object-contain rounded-lg"
            />
            
            {/* Controles del slider */}
            {Array.isArray(producto.images) && producto.images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between">
                <button 
                  onClick={() => setCurrentImageIndex(prev => (prev === 0 ? producto.images.length - 1 : prev - 1))}
                  className="bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full p-2 ml-2 transition-all"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button 
                  onClick={() => setCurrentImageIndex(prev => (prev === producto.images.length - 1 ? 0 : prev + 1))}
                  className="bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full p-2 mr-2 transition-all"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            )}
            
            {/* Indicadores de imágenes */}
            {Array.isArray(producto.images) && producto.images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0">
                <div className="flex justify-center gap-2">
                  {producto.images.map((_: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 w-2 rounded-full transition-all ${currentImageIndex === index ? 'bg-primary-500 w-4' : 'bg-gray-300'}`}
                      aria-label={`Ver imagen ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Miniaturas */}
          {Array.isArray(producto.images) && producto.images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-2">
              {producto.images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`border-2 rounded-md overflow-hidden ${currentImageIndex === index ? 'border-primary-500' : 'border-transparent'}`}
                >
                  <img 
                    src={img} 
                    alt={`Miniatura ${index + 1}`} 
                    className="w-full h-16 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
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
          {/* Mensaje de agregar al carrito */}
          {addToCartMessage && (
            <div className={`mb-4 p-3 rounded-lg flex items-center ${addToCartMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {addToCartMessage.type === 'success' ? (
                <ShoppingCart size={18} className="mr-2" />
              ) : (
                <AlertCircle size={18} className="mr-2" />
              )}
              <span>{addToCartMessage.text}</span>
            </div>
          )}
          
          {/* Variantes de color */}
          {producto.variants && producto.variants.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Color:</h4>
              <div className="flex flex-wrap gap-2">
                {/* Extraer todos los colores únicos de las variantes */}
                {(Array.from(new Set(
                  producto.variants
                    .map((v: any) => v.color)
                )) as string[])
                  .filter(Boolean)
                  .map((color) => (
                    <div
                      key={color}
                      className={`px-4 py-2 rounded-lg border-2 ${selectedColor === color 
                        ? "border-primary-500 bg-primary-500 text-white shadow-md" 
                        : "border-gray-200 bg-white text-gray-800 hover:border-primary-300"} 
                        cursor-pointer transition-all duration-200 flex items-center justify-center relative`}
                      onClick={() => {
                        setSelectedColor(color);
                        // Resetear la talla seleccionada y buscar tallas disponibles
                        const sizesForColor = producto.variants
                          .filter((v: any) => v.color === color)
                          .map((v: any) => v.size);
                        
                        // Buscar primero una talla con stock (considerando también el stock total)
                        const sizesWithStock = producto.variants
                          .filter((v: any) => v.color === color && (v.stock > 0 || producto.totalStock > 0))
                          .map((v: any) => v.size);
                        
                        if (sizesWithStock.length > 0) {
                          setSelectedSize(sizesWithStock[0]);
                        } else if (sizesForColor.length > 0) {
                          // Si no hay tallas con stock, seleccionar la primera talla disponible
                          setSelectedSize(sizesForColor[0]);
                        } else {
                          setSelectedSize("");
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selectedColor === color}
                      aria-label={`Color ${color}`}
                    >
                      {color}
                      {selectedColor === color && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              <div className="mt-2 text-sm text-blue-700 font-medium">
                ↑ Haz clic para seleccionar un color
              </div>
            </div>
          )}
          
          {/* Tallas */}
          {selectedColor && producto.variants && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Talla:</h4>
              <div className="flex flex-wrap gap-2">
                {/* Filtrar tallas disponibles para el color seleccionado */}
                {(producto.variants
                  .filter((v: any) => v.color === selectedColor)
                  .map((v: any) => v.size)
                  .filter(Boolean) as string[])
                  .map((size) => {
                    // Verificar si hay stock para esta combinación de color y talla
                    const variant = producto.variants.find(
                      (v: any) => v.color === selectedColor && v.size === size
                    );
                    // Considerar el stock de la variante o el stock total del producto
                    const hasStock = (variant && variant.stock > 0) || producto.totalStock > 0;
                    
                    return (
                      <div
                        key={size}
                        className={`px-4 py-2 rounded-lg border-2 
                          ${selectedSize === size 
                            ? "border-primary-500 bg-primary-500 text-white shadow-md" 
                            : "border-gray-200 bg-white text-gray-800 hover:border-primary-300"}
                          ${!hasStock 
                            ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-100 text-gray-600" 
                            : "cursor-pointer transition-all duration-200"} 
                          flex items-center justify-center min-w-[60px] relative`}
                        onClick={() => hasStock && setSelectedSize(size)}
                        role="button"
                        tabIndex={hasStock ? 0 : -1}
                        aria-pressed={selectedSize === size}
                        aria-label={`Talla ${size}${!hasStock ? ", agotado" : ""}`}
                        aria-disabled={!hasStock}
                      >
                        {size} {!hasStock && "(Agotado)"}
                        {selectedSize === size && hasStock && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
              <div className="mt-2 text-sm text-blue-700 font-medium">
                ↑ Haz clic para seleccionar una talla
              </div>
            </div>
          )}
          
          {/* Mostrar stock disponible */}
          <div 
            className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-100 text-yellow-800 border-2 border-yellow-300 hover:border-yellow-400 cursor-pointer shadow-sm transition-all duration-200 relative"
            role="button"
            tabIndex={0}
            onClick={() => alert(`Hay ${producto.totalStock} unidades disponibles en total`)}
            aria-label={producto.totalStock > 0 ? `Solo ${producto.totalStock} disponibles` : "Sin stock disponible"}
          >
            <AlertCircle size={18} className="text-yellow-800" />
            <span className="text-sm font-medium">
              {producto.totalStock > 0 ? `Solo ${producto.totalStock} disponibles` : "Sin stock disponible"}
            </span>
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-sm text-blue-700 font-medium">
            ↑ Haz clic para ver detalles del stock
          </div>
          
          {/* Mensaje de selección */}
          {(!selectedColor || !selectedSize) && (
            <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-100 text-blue-800 border-2 border-blue-300">
              <AlertCircle size={18} className="text-blue-800" />
              <span className="text-sm font-medium">
                {!selectedColor && !selectedSize 
                  ? "Selecciona color y talla para continuar" 
                  : !selectedColor 
                    ? "Selecciona un color para continuar" 
                    : "Selecciona una talla para continuar"}
              </span>
            </div>
          )}
          
          <button 
            className={`mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg shadow-md transition-all duration-200 ${(!selectedColor || !selectedSize) 
              ? 'bg-gray-400 hover:bg-gray-400 text-white cursor-not-allowed' 
              : 'bg-azulrey hover:bg-azuloscuro text-white'}`}
            disabled={!selectedColor || !selectedSize}
            onClick={() => {
              // Verificar que se haya seleccionado color y talla
              if (!selectedColor || !selectedSize) {
                setAddToCartMessage({
                  text: "Por favor selecciona color y talla",
                  type: "error"
                });
                return;
              }
              
              // Encontrar la variante seleccionada
              const selectedVariant = producto.variants.find(
                (v: any) => v.color === selectedColor && v.size === selectedSize
              );
              
              if (!selectedVariant) {
                setAddToCartMessage({
                  text: "Variante no disponible",
                  type: "error"
                });
                return;
              }
              
              // Verificar stock (usar el stock de la variante o el stock total)
              const stockDisponible = selectedVariant.stock > 0 ? selectedVariant.stock : producto.totalStock;
              
              if (stockDisponible <= 0) {
                setAddToCartMessage({
                  text: "Producto sin stock disponible",
                  type: "error"
                });
                return;
              }
              
              // Agregar al carrito
              const result = addToCart({
                id: producto.id,
                name: producto.name,
                price: selectedVariant.price || producto.price,
                image: producto.images?.[0] || "/img/placeholder.png",
                size: selectedSize,
                color: selectedColor,
                stock: stockDisponible,
                maxStock: stockDisponible,
                variantId: selectedVariant.id
              });
              
              setAddToCartMessage({
                text: result.message,
                type: result.success ? "success" : "error"
              });
              
              // Limpiar el mensaje después de 3 segundos
              setTimeout(() => {
                setAddToCartMessage(null);
              }, 3000);
            }}
          >
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