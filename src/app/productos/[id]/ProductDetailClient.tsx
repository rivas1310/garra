"use client";

import { useEffect, useState } from "react";
import { log } from '@/lib/secureLogger';
import { useParams, useSearchParams } from "next/navigation";
import { ShoppingCart, Star, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import Breadcrumbs from "@/components/Breadcrumbs";

interface Variante {
  id: string;
  color: string;
  size: string;
  stock: number;
  price?: number;
}

interface ProductDetailClientProps {
  initialProduct: any;
}

export default function ProductDetailClient({ initialProduct }: ProductDetailClientProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const { id } = params;
  const [producto, setProducto] = useState<any>(initialProduct);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [addToCartMessage, setAddToCartMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const { addToCart, getItemQuantity } = useCart();

  // Efecto para manejar parámetros de navegación desde URL
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const subcatParam = searchParams.get('subcat');
    const fromParam = searchParams.get('from');
    
    console.log('🔗 ProductDetail - Parámetros de URL:', {
      from: fromParam,
      category: categoryParam,
      subcat: subcatParam
    });
    
    if (fromParam === 'category' && categoryParam) {
      // DEBUGGING: Log detallado antes de guardar estado
      console.log('🐛 DEBUG - ProductDetail - Parámetros recibidos:', {
        fromParam,
        categoryParam,
        subcatParam,
        fullURL: window.location.href,
        searchString: window.location.search
      });
      
      // Actualizar sessionStorage con la información de navegación
      const navigationState = {
        categoria: categoryParam,
        subcategoria: subcatParam || '',
        timestamp: Date.now()
      };
      console.log('💾 ProductDetail - Guardando estado:', navigationState);
      sessionStorage.setItem('categoryNavigationState', JSON.stringify(navigationState));
    }
  }, [searchParams]);

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
    
    // Solo cargar si no tenemos datos iniciales
    if (!initialProduct) {
      loadProduct();
    }
    
    // Configurar un intervalo para actualizar el stock cada 10 segundos
    const intervalId = setInterval(loadProduct, 10000);
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [id, initialProduct]);

  // Actualizar estado cuando cambie initialProduct
  useEffect(() => {
    if (initialProduct) {
      setProducto(initialProduct);
    }
  }, [initialProduct]);

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">{error}</div>;
  }

  if (!producto) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  // Obtener variantes disponibles
  const availableColors: string[] = Array.from(new Set(producto.variants?.map((v: Variante) => v.color) || []));
  const availableSizes: string[] = Array.from(new Set(
    producto.variants
      ?.filter((v: Variante) => v.color === selectedColor)
      ?.map((v: Variante) => v.size)
      ?.filter((size: any): size is string => typeof size === 'string') || []
  ));

  // Obtener variante seleccionada
  const selectedVariant = producto.variants?.find(
    (v: Variante) => v.color === selectedColor && v.size === selectedSize
  );

  // Función para agregar al carrito
  const handleAddToCart = () => {
    if (!selectedVariant) {
      setAddToCartMessage({ text: "Por favor selecciona color y talla", type: "error" });
      setTimeout(() => setAddToCartMessage(null), 3000);
      return;
    }

    if (selectedVariant.stock <= 0) {
      setAddToCartMessage({ text: "Producto sin stock", type: "error" });
      setTimeout(() => setAddToCartMessage(null), 3000);
      return;
    }

    const currentQuantity = getItemQuantity(selectedVariant.id);
    if (currentQuantity >= selectedVariant.stock) {
      setAddToCartMessage({ text: "No hay más stock disponible", type: "error" });
      setTimeout(() => setAddToCartMessage(null), 3000);
      return;
    }

    try {
      addToCart({
        id: producto.id, // Usar el ID del producto padre
        name: producto.name,
        price: selectedVariant.price || producto.price,
        image: producto.images?.[0] || "/img/placeholder.png",
        color: selectedVariant.color,
        size: selectedVariant.size,
        stock: selectedVariant.stock,
        variantId: selectedVariant.id // Agregar el ID de la variante
      });
      
      setAddToCartMessage({ text: "Producto agregado al carrito", type: "success" });
      setTimeout(() => setAddToCartMessage(null), 3000);
      
      log.info('Producto agregado al carrito', {
        productId: producto.id,
        variantId: selectedVariant.id,
        color: selectedVariant.color,
        size: selectedVariant.size
      });
    } catch (error) {
      setAddToCartMessage({ text: "Error al agregar al carrito", type: "error" });
      setTimeout(() => setAddToCartMessage(null), 3000);
    }
  };

  // Función para obtener breadcrumbs dinámicos basados en el estado de navegación
  const getBreadcrumbs = () => {
    const defaultBreadcrumbs = [
      { label: 'Inicio', href: '/' },
      { label: 'Productos', href: '/productos' },
      { label: producto?.name || 'Cargando...', href: '#' }
    ];

    // Intentar obtener el estado de navegación guardado
    if (typeof window !== 'undefined') {
      try {
        const savedState = sessionStorage.getItem('categoryNavigationState');
        console.log('🍞 ProductDetail - Estado guardado para breadcrumbs:', savedState);
        
        if (savedState) {
          const state = JSON.parse(savedState);
          console.log('🍞 ProductDetail - Estado parseado para breadcrumbs:', state);
          
          // Solo usar si no ha pasado más de 30 minutos
          if ((Date.now() - state.timestamp) < 30 * 60 * 1000) {
            // DEBUGGING: Log detallado de construcción de URL
            console.log('🐛 DEBUG - Breadcrumb - Estado completo:', state);
            console.log('🐛 DEBUG - Breadcrumb - Subcategoría original:', state.subcategoria);
            console.log('🐛 DEBUG - Breadcrumb - Subcategoría encoded:', encodeURIComponent(state.subcategoria));
            
            const categoryUrl = `/categorias/${state.categoria}?from=category${state.subcategoria ? `&subcat=${encodeURIComponent(state.subcategoria)}` : ''}`;
            console.log('🍞 ProductDetail - URL del breadcrumb construida:', categoryUrl);
            
            // DEBUGGING: Verificar que la URL se construyó correctamente
            console.log('🐛 DEBUG - Breadcrumb - URL final verificada:', categoryUrl);
            console.log('🐛 DEBUG - Breadcrumb - Contiene Abrigos?:', categoryUrl.includes('Abrigos'));
            console.log('🐛 DEBUG - Breadcrumb - Contiene vestidos?:', categoryUrl.includes('vestidos'));
            
            const categoryBreadcrumbs = [
              { label: 'Inicio', href: '/' },
              { label: 'Categorías', href: '/categorias' },
              { 
                label: state.categoria.charAt(0).toUpperCase() + state.categoria.slice(1), 
                href: categoryUrl
              },
              { label: producto?.name || 'Cargando...', href: '#' }
            ];
            return categoryBreadcrumbs;
          }
        }
      } catch (error) {
        console.error('Error getting navigation state for breadcrumbs:', error);
      }
    }

    return defaultBreadcrumbs;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={getBreadcrumbs()} />
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* Imagen con slider */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="relative">
            <img
              src={producto.images?.[currentImageIndex] || "/img/placeholder.png"}
              alt={`${producto.name} - Imagen ${currentImageIndex + 1}`}
              className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-contain rounded-lg"
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
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-blue-600' : 'bg-white bg-opacity-50'
                      }`}
                      aria-label={`Ver imagen ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información del producto */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{producto.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-gray-600">(4.8)</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              ${selectedVariant?.price || producto.price}
            </p>
          </div>

          {/* Selección de color */}
          {availableColors.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Color</h3>
              <div className="flex gap-2 flex-wrap">
                {availableColors.map((color) => {
                  const hasStock = producto.variants?.some((v: Variante) => 
                    v.color === color && v.stock > 0
                  );
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        // Reset size when color changes
                        const sizesForColor = producto.variants
                          ?.filter((v: Variante) => v.color === color && v.stock > 0)
                          ?.map((v: Variante) => v.size) || [];
                        setSelectedSize(sizesForColor[0] || "");
                      }}
                      className={`px-4 py-2 border rounded-lg transition-all ${
                        selectedColor === color
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : hasStock
                          ? 'border-gray-300 hover:border-gray-400'
                          : 'border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!hasStock}
                    >
                      {color}
                      {!hasStock && <span className="ml-1 text-xs">(Sin stock)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selección de talla */}
          {availableSizes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Talla</h3>
              <div className="flex gap-2 flex-wrap">
                {availableSizes.map((size) => {
                  const variant = producto.variants?.find((v: Variante) => 
                    v.color === selectedColor && v.size === size
                  );
                  const hasStock = variant && variant.stock > 0;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-lg transition-all ${
                        selectedSize === size
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : hasStock
                          ? 'border-gray-300 hover:border-gray-400'
                          : 'border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!hasStock}
                    >
                      {size}
                      {!hasStock && <span className="ml-1 text-xs">(Sin stock)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock disponible */}
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <span className="text-sm text-gray-600">
              {selectedVariant 
                ? (selectedVariant.stock > 0 
                    ? `${selectedVariant.stock} unidades disponibles`
                    : 'Sin stock'
                  )
                : (() => {
                    // Calcular stock total cuando no hay variante seleccionada
                    const totalStock = producto.variants?.reduce((sum: number, variant: Variante) => sum + variant.stock, 0) || 0;
                    return totalStock > 0 ? `${totalStock} unidades disponibles` : 'Sin stock';
                  })()
              }
            </span>
          </div>

          {/* Botón agregar al carrito */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            {selectedVariant 
              ? (selectedVariant.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock')
              : 'Selecciona color y talla'
            }
          </button>

          {/* Mensaje de confirmación */}
          {addToCartMessage && (
            <div className={`p-3 rounded-lg text-center font-medium ${
              addToCartMessage.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {addToCartMessage.text}
            </div>
          )}

          {/* Descripción */}
          {producto.description && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Descripción del Producto</h3>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                  {producto.description}
                </p>
              </div>
              
              {/* Características adicionales si existen */}
              {(producto.material || producto.brand || producto.conditionTag) && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Detalles del Producto</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {producto.brand && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="text-gray-600">Marca:</span>
                        <span className="font-medium text-gray-900">{producto.brand}</span>
                      </div>
                    )}
                    {producto.material && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-gray-600">Material:</span>
                        <span className="font-medium text-gray-900">{producto.material}</span>
                      </div>
                    )}
                    {producto.conditionTag && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        <span className="text-gray-600">Condición:</span>
                        <span className="font-medium text-gray-900">{producto.conditionTag}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Términos y Condiciones */}
      <div className="mt-12 bg-amber-50 rounded-xl shadow-lg p-6 border-l-4 border-amber-400">
        <h2 className="text-xl font-semibold mb-4 text-amber-800 flex items-center gap-2">
          ⚠️ Lea con Atención - Términos y Condiciones
        </h2>
        
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold text-amber-800 mb-2">1. Naturaleza de los productos</h3>
            <p>
              En <strong>Garras Felinas</strong> comercializamos prendas de vestir, calzado y accesorios de segunda mano (preloved, gently used, Like New, vintage, etc.), así como 
              piezas únicas recuperadas o reutilizadas.
            </p>
            <p className="mt-2">
              Todas nuestras prendas son cuidadosamente seleccionadas, inspeccionadas y descritas con la mayor precisión posible, incluyendo detalles sobre su 
              estado, medidas y características relevantes.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-amber-800 mb-2">2. Condición de las prendas</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Las prendas no son nuevas, por lo que pueden presentar ligeros signos de uso, desgaste natural o variaciones propias del tiempo.</li>
              <li>El estado de cada artículo se indica de forma clara en la descripción del producto y en las fotografías publicadas.</li>
              <li>El color de las prendas puede variar ligeramente respecto a las fotografías debido a iluminación, pantalla o edición.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-amber-800 mb-2">3. Política de cambios y devoluciones</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>No se aceptan cambios ni devoluciones</strong> en ninguna de las prendas, salvo en caso de defecto grave no informado previamente.</li>
              <li>La Ley Federal de Protección al Consumidor reconoce que, en el caso de bienes usados o de segunda mano, el proveedor puede establecer políticas 
              específicas de garantía y devolución, siempre y cuando se informe claramente antes de la compra.</li>
              <li>Una vez confirmada y pagada la compra, el cliente acepta expresamente esta política.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-amber-800 mb-2">4. Revisión antes de la compra</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>El cliente es responsable de revisar cuidadosamente la descripción, medidas, fotografías y condición de la prenda antes de realizar la compra.</li>
              <li>En caso de duda, se puede solicitar información adicional o imágenes extra antes de concretar la transacción.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-amber-800 mb-2">5. Productos con defectos señalados</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
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
              <h4 className="font-semibold text-blue-800">Outlet / Overstock (Excedente)</h4>
              <p className="text-gray-700">Productos nuevos de temporadas pasadas, vendidos con descuento por exceso de inventario.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800">Repurposed (Reutilizado)</h4>
              <p className="text-gray-700">Prenda adaptada para otro uso o estilo diferente al original.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800">Nearly New (Casi nuevo)</h4>
              <p className="text-gray-700">Estado impecable, pero con una señal mínima de uso apenas perceptible.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800">Designer Resale (Reventa de diseñador)</h4>
              <p className="text-gray-700">Ropa de diseñador de segunda mano, normalmente curada y autenticada por expertos.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800">Sustainable Fashion (Moda sostenible)</h4>
              <p className="text-gray-700">Moda que busca minimizar impacto ambiental, incluye segunda mano, reciclaje y producción ética.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800">Thrifted (De tienda de segunda)</h4>
              <p className="text-gray-700">Prenda comprada en una tienda de segunda mano (thrift store), muy popular en redes sociales.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800">Circular Fashion (Moda circular)</h4>
              <p className="text-gray-700">Prendas que forman parte de un ciclo de uso, reutilización y reciclaje continuo para reducir desperdicios.</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}