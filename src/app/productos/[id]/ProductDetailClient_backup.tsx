"use client";

import { useEffect, useState } from "react";
import { log } from '@/lib/secureLogger'
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
  const { addToCart, getItemQuantity } = useCart();

  useEffect(() => {
    if (!id) return;
    
    // Función para cargar el producto
    const loadProduct = async () => {
      try {
        // Usar timestamp para evitar caché y asegurar datos actualizados
        const res = await fetch(`/api/productos/${id}?t=${Date.now()}`, {
          cache: 'no-store'
        });
        
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'No se pudo cargar el producto');
        }
        
        const data = await res.json();
        
        // Cada variante tiene su propio stock independiente
        // No asignamos el stock total a ninguna variante para evitar duplicación
        
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
      } catch (err: any) {
        setError(err.message);
        setProducto(null);
      }
    };
    
    // Cargar el producto inicialmente
    loadProduct();
    
    // Configurar un intervalo para actualizar el stock cada 10 segundos
    const intervalId = setInterval(loadProduct, 10000);
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [id]);

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">{error}</div>;
  }

  if (!producto) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
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
                        ? "border-primary-500 bg-black text-white shadow-md" 
                        : "border-gray-200 bg-white text-gray-800 hover:border-primary-300"} 
                        cursor-pointer transition-all duration-200 flex items-center justify-center relative`}
                      onClick={() => {
                        setSelectedColor(color);
                        // Resetear la talla seleccionada y buscar tallas disponibles
                        const sizesForColor = producto.variants
                          .filter((v: any) => v.color === color)
                          .map((v: any) => v.size);
                        
                        // Buscar primero una talla con stock (considerando solo el stock de la variante)
                        const sizesWithStock = producto.variants
                          .filter((v: any) => v.color === color && v.stock > 0)
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
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          {producto.variants && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Talla:</h4>
              <div className="flex flex-wrap gap-2">
                {/* Mostrar todas las tallas disponibles */}
                {(Array.from(new Set(producto.variants
                  .map((v: any) => v.size)
                  .filter(Boolean)
                )) as string[]).map((size) => {
                    // Verificar si hay stock para esta talla (cualquier color)
                    const variantsForSize = producto.variants.filter(
                      (v: any) => v.size === size && v.stock > 0
                    );
                    const hasStock = variantsForSize.length > 0;
                    
                    // Si hay un color seleccionado, verificar que la combinación específica exista
                    let hasStockForSelectedColor;
                    if (selectedColor) {
                      const specificVariant = producto.variants.find(
                        (v: any) => v.color === selectedColor && v.size === size
                      );
                      hasStockForSelectedColor = specificVariant ? specificVariant.stock > 0 : false;
                    } else {
                      hasStockForSelectedColor = hasStock;
                    }
                    
                    return (
                      <div
                        key={size}
                        className={`px-4 py-2 rounded-lg border-2 
                          ${selectedSize === size 
                            ? "border-primary-500 bg-black text-white shadow-md" 
                            : "border-gray-200 bg-white text-gray-800 hover:border-primary-300"}
                          ${!hasStockForSelectedColor 
                            ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-100 text-gray-600" 
                            : "cursor-pointer transition-all duration-200"} 
                          flex items-center justify-center min-w-[60px] relative`}
                        onClick={() => hasStockForSelectedColor && setSelectedSize(size)}
                        role="button"
                        tabIndex={hasStockForSelectedColor ? 0 : -1}
                        aria-pressed={selectedSize === size}
                        aria-label={`Talla ${size}${!hasStockForSelectedColor ? ", agotado" : ""}`}
                        aria-disabled={!hasStockForSelectedColor}
                      >
                        {size} {!hasStockForSelectedColor && "(Agotado)"}
                        {selectedSize === size && hasStockForSelectedColor && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-100 text-black border-2 border-green-300 hover:border-green-400 cursor-pointer shadow-sm transition-all duration-200 relative"
            role="button"
            tabIndex={0}
            onClick={() => {
              // Calcular la cantidad en carrito
              const cantidadEnCarrito = getItemQuantity(producto.id);
              
              if (selectedColor && selectedSize) {
                const selectedVariant = producto.variants.find(
                  (v: any) => v.color === selectedColor && v.size === selectedSize
                );
                
                if (selectedVariant) {
                  const stockVariante = selectedVariant.stock;
                  const stockDisponibleReal = Math.max(0, stockVariante - cantidadEnCarrito);
                  alert(`Variante seleccionada (${selectedColor}, ${selectedSize}):\n- Stock de esta variante: ${stockVariante}\n- En tu carrito: ${cantidadEnCarrito}\n- Disponible para agregar: ${stockDisponibleReal}`);
                } else {
                  alert(`No se encontró la variante seleccionada.`);
                }
              } else {
                alert(`Stock total del producto: ${producto.calculatedStock || 0}\nEn tu carrito: ${cantidadEnCarrito}\n\nSelecciona color y talla para ver el stock específico de esa variante.`);
              }
            }}
            aria-label={(producto.calculatedStock || 0) > 0 ? `Solo ${producto.calculatedStock || 0} disponibles` : "Sin stock disponible"}
          >
            <AlertCircle size={18} className="text-yellow-800" />
            <span className="text-sm font-medium">
              {(() => {
                // Siempre mostrar el stock total del producto
                const cantidadEnCarrito = getItemQuantity(producto.id);
                const stockTotalDisponible = Math.max(0, (producto.calculatedStock || 0) - cantidadEnCarrito);
                
                // Si hay color y talla seleccionados, verificar disponibilidad de esa variante
                if (selectedColor && selectedSize) {
                  const selectedVariant = producto.variants.find(
                    (v: any) => v.color === selectedColor && v.size === selectedSize
                  );
                  
                  if (selectedVariant && selectedVariant.stock > 0) {
                    // Variante específica disponible
                    if (cantidadEnCarrito > 0) {
                      return `${stockTotalDisponible} disponibles en total (${cantidadEnCarrito} en carrito)`;
                    } else {
                      return `${producto.calculatedStock || 0} disponibles en total`;
                    }
                  } else {
                    // Variante específica no disponible
                    return `Esta combinación no está disponible (${stockTotalDisponible} disponibles en otras variantes)`;
                  }
                }
                
                // Sin variante seleccionada, mostrar stock total
                if (cantidadEnCarrito > 0) {
                  return `${stockTotalDisponible} disponibles (${cantidadEnCarrito} en carrito)`;
                } else {
                  return (producto.calculatedStock || 0) > 0 ? `${producto.calculatedStock || 0} disponibles` : "Sin stock disponible";
                }
              })()}
            </span>
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-sm text-blue-700 font-medium">
            
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
              
              // Usar el stock total del producto, no solo de la variante
              const stockDisponible = producto.calculatedStock || 0;
              
              if (stockDisponible <= 0) {
                setAddToCartMessage({
                  text: "Producto sin stock disponible",
                  type: "error"
                });
                return;
              }
              
              // Verificar si ya tiene productos en el carrito
              const cantidadEnCarrito = getItemQuantity(producto.id);
              const stockDisponibleReal = Math.max(0, stockDisponible - cantidadEnCarrito);
              
              if (stockDisponibleReal <= 0) {
                setAddToCartMessage({
                  text: `Ya tienes ${cantidadEnCarrito} unidades en el carrito (máximo disponible: ${stockDisponible})`,
                  type: "error"
                });
                return;
              }
              
              // Agregar al carrito (ahora es asíncrono)
              // Usar el stock total del producto
              addToCart({
                id: producto.id,
                name: producto.name,
                price: selectedVariant.price || producto.price,
                image: producto.images?.[0] || "/img/placeholder.png",
                size: selectedSize,
                color: selectedColor,
                stock: stockDisponible,
                maxStock: stockDisponible,
                variantId: selectedVariant.id
              }).then((result) => {
                setAddToCartMessage({
                  text: result.message,
                  type: result.success ? "success" : "error"
                });
                
                // Si se agregó correctamente, actualizar el producto inmediatamente
                if (result.success) {
                  // Recargar el producto para actualizar el stock con un timestamp para evitar caché
                  fetch(`/api/productos/${id}?t=${Date.now()}`, {
                    cache: 'no-store'
                  })
                  .then(res => {
                    if (!res.ok) {
                      throw new Error('Error al actualizar el stock');
                    }
                    return res.json();
                  })
                  .then(data => {
                    // Actualizar el estado del producto con los datos más recientes
                    setProducto(data);
                    
                    // Actualizar la selección de color y talla si es necesario
                    if (data.variants && data.variants.length > 0) {
                      // Verificar si la variante seleccionada todavía tiene stock
                      const updatedVariant = data.variants.find(
                        (v: any) => v.color === selectedColor && v.size === selectedSize
                      );
                      
                      // Si la variante ya no tiene stock, seleccionar otra con stock
                      if (!updatedVariant || updatedVariant.stock <= 0) {
                        const variantesConStock = data.variants.filter((v: any) => v.stock > 0);
                        
                        if (variantesConStock.length > 0) {
                          // Seleccionar la primera variante con stock
                          setSelectedColor(variantesConStock[0].color);
                          setSelectedSize(variantesConStock[0].size);
                        }
                      }
                    }
                  })
                  .catch(err => log.error('Error al actualizar stock:', err));
                }
                
                // Limpiar el mensaje después de 3 segundos
                setTimeout(() => {
                  setAddToCartMessage(null);
                }, 3000);
              }).catch((error) => {
                setAddToCartMessage({
                  text: "Error al agregar al carrito",
                  type: "error"
                });
                
                // Limpiar el mensaje después de 3 segundos
                setTimeout(() => {
                  setAddToCartMessage(null);
                }, 3000);
              });
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

      {/* Términos y Condiciones */}
      <div className="mt-8 bg-amber-50 rounded-xl shadow-lg p-6 border-l-4 border-amber-400">
        <h2 className="text-xl font-semibold mb-4 text-amber-800 flex items-center gap-2">
          <AlertCircle size={20} />
          ⚠️ Lea con Atención - Términos y Condiciones
        </h2>
        
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h3 className="font-semibold text-amber-800 mb-2">1. Naturaleza de los productos</h3>
            <p className="mb-2">
              En <strong>Garras Felinas</strong> comercializamos prendas de vestir, calzado y accesorios de segunda mano 
              (preloved, gently used, Like New, vintage, etc.), así como piezas únicas recuperadas o reutilizadas.
            </p>
            <p>
              Todas nuestras prendas son cuidadosamente seleccionadas, inspeccionadas y descritas con la mayor precisión posible, 
              incluyendo detalles sobre su estado, medidas y características relevantes.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-amber-800 mb-2">2. Condición de las prendas</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Las prendas no son nuevas, por lo que pueden presentar ligeros signos de uso, desgaste natural o variaciones propias del tiempo.</li>
              <li>El estado de cada artículo se indica de forma clara en la descripción del producto y en las fotografías publicadas.</li>
              <li>El color de las prendas puede variar ligeramente respecto a las fotografías debido a iluminación, pantalla o edición.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-amber-800 mb-2">3. Política de cambios y devoluciones</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>No se aceptan cambios ni devoluciones</strong> en ninguna de las prendas, salvo en caso de defecto grave no informado previamente.</li>
              <li>La Ley Federal de Protección al Consumidor reconoce que, en el caso de bienes usados o de segunda mano, el proveedor puede establecer políticas específicas de garantía y devolución, siempre y cuando se informe claramente antes de la compra.</li>
              <li>Una vez confirmada y pagada la compra, el cliente acepta expresamente esta política.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-amber-800 mb-2">4. Revisión antes de la compra</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>El cliente es responsable de revisar cuidadosamente la descripción, medidas, fotografías y condición de la prenda antes de realizar la compra.</li>
              <li>En caso de duda, se puede solicitar información adicional o imágenes extra antes de concretar la transacción.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-amber-800 mb-2">5. Productos con defectos señalados</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Si una prenda presenta algún defecto o desgaste visible, este se indicará claramente en la descripción y/o fotografías.</li>
              <li>La compra de un artículo con defecto señalado implica la aceptación del mismo, sin derecho a devolución.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-amber-800 mb-2">6. Aceptación de términos</h3>
            <p>
              Al realizar una compra en <strong>Garras Felinas</strong>, el cliente declara haber leído, comprendido y aceptado los presentes Términos y Condiciones.
            </p>
          </div>

          <div className="bg-amber-100 p-3 rounded-lg mt-4">
             <h4 className="font-semibold text-amber-800 mb-1">📌 Aviso legal:</h4>
             <p className="text-xs">
               Estos Términos y Condiciones están elaborados conforme a la <strong>Ley Federal de Protección al Consumidor de México</strong>, 
               particularmente en lo relativo a la venta de bienes usados y a la obligación del proveedor de informar claramente sobre 
               la condición y política de devoluciones antes de la compra.
             </p>
             <p className="text-xs mt-2">
               Estos Términos y Condiciones se apegan a lo dispuesto en la Ley Federal de Protección al Consumidor, artículos 1, 7, 10, 76 bis y demás aplicables.
             </p>
           </div>
        </div>
      </div>

      {/* Glosario de Términos */}
      <div className="mt-8 bg-blue-50 rounded-xl shadow-lg p-6 border-l-4 border-blue-400">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">
          📖 Glosario de Términos de Segunda Mano
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-blue-800">Like New (Como nuevo)</h4>
              <p className="text-gray-700">Prenda que parece nueva, sin señales visibles de uso.</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800">Pre Loved (Ropa Amada)</h4>
              <p className="text-gray-700">ropa de segunda mano bien cuidada, con historia.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800">Gently Used (Usado suavemente)</h4>
              <p className="text-gray-700">Usado muy pocas veces, en excelente estado.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800">Vintage</h4>
              <p className="text-gray-700">Prenda con más de 20 años, con valor histórico o estético.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800">Retro</h4>
              <p className="text-gray-700">Estilo inspirado en décadas pasadas, pero no necesariamente antiguo.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800">Upcycled (Suprarreciclado)</h4>
              <p className="text-gray-700">Prenda modificada o transformada creativamente para darle nueva vida.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800">Reworked</h4>
              <p className="text-gray-700">Similar a upcycled, pero con cambios más estéticos que funcionales (ej. cortar jeans para hacer shorts).</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800">Deadstock</h4>
              <p className="text-gray-700">Prendas nuevas, sin uso, que quedaron de inventarios pasados y no se volvieron a producir.</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-blue-800">Outlet / Overstock</h4>
              <p className="text-gray-700">Productos nuevos de temporadas pasadas, vendidos con descuento.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800">Repurposed</h4>
              <p className="text-gray-700">Prenda adaptada para otro uso o estilo.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800">Nearly New (Casi nuevo)</h4>
              <p className="text-gray-700">Estado impecable, pero con una señal mínima de uso.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800">Designer Resale</h4>
              <p className="text-gray-700">Ropa de diseñador de segunda mano, normalmente curada y autenticada.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800">Sustainable Fashion (Moda sostenible)</h4>
              <p className="text-gray-700">Moda que busca minimizar impacto ambiental, incluye segunda mano, reciclaje y producción ética.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800">Thrifted</h4>
              <p className="text-gray-700">Prenda comprada en una tienda de segunda mano (thrift store), muy popular en redes sociales.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800">Circular Fashion (Moda circular)</h4>
              <p className="text-gray-700">Prendas que forman parte de un ciclo de uso, reutilización y reciclaje continuo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}