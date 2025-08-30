'use client'

import { useState, useRef, useEffect } from 'react'
import { log } from '@/lib/secureLogger'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  Plus,
  Trash2,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
import { generateManualBarcode, generateManualEAN13 } from '@/lib/barcodeUtils'

// Tallas por tipo de producto
const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const womenShoeSizes = ['2', '3', '4', '5', '6', '7', '8']
const menShoeSizes = ['2', '3', '4', '5', '6', '7', '8', '9', '10']
const colors = ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde', 'Amarillo', 'Rosa','naranja','turquesa','cafe','morado','plata','dorado','Gris']

// Subcategorías por categoría (slug o id)
const subcategoriasPorCategoria: Record<string, string[]> = {
  mujer: ["Vestidos", "Blusas", "Pantalones", "Pants", "Conjunto", "Suéter", "Chaleco", "Chamarras", "Sudaderas", "Sacos", "Abrigos", "Tops", "Overoles", "Faldas", "Shorts"],
  hombre: ["Chamarras", "Camisas", "Playeras", "Pantalones", "Chaleco", "Pants", "Suéter", "Shorts","Sudaderas"],
  accesorios: ["Joyeria Para Dama", "Joyeria Para Caballero","Cinturones de Dama", "Cinturones de Hombre",],
  calzado: ["Tacones", "Zapatillas", "Zapatos", "Sneakers", "Botas", "Huaraches", "Sandalias"],
  "calzado-mujer": ["Tacones", "Zapatillas", "Zapatos", "Sneakers", "Botas", "Huaraches", "Sandalias"],
  "calzado-hombre": ["Zapatos", "Sneakers", "Botas", "Sandalias"],
  "calzado-nino": ["Zapatos", "Botas", "Sneakers", "Sandalias"],
  "calzado-nina": ["Zapatos", "Botas", "Sneakers", "Sandalias"],
  ninas: ["Vestidos", "Blusas", "Pantalones", "Pants", "Chaleco", "Suéter", "Faldas", "Shorts","Playeras","Sudaderas","Chamarras"],
  ninos: ["Camisetas", "Pantalones", "Pants", "Chaleco", "Suéter", "Shorts", "Sudaderas", "Chamarras","Playeras"],
  bolsos: ["Carteras de Dama","Carteras de Cabalalero","Bolso de mano", "Mochilas de Dama", "Mochilas de Caballero"],
  deportes: ["Ropa deportiva", "Zapatillas", "Accesorios deportivos"],
};

export default function NuevoProductoPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategoria: '',
    price: '',
    originalPrice: '',
    stock: '',
    barcode: '', // Campo para código de barras
    isNew: false,
    isOnSale: false,
    isActive: true,
    isSecondHand: false
  })
  
  const [images, setImages] = useState<string[]>([])
  const [variants, setVariants] = useState<Array<{
    size: string
    color: string
    stock: number
    price?: number
  }>>([])
  
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    log.error('Fetching categories...');
    fetch('/api/categorias')
      .then(res => {
        log.error('Categories response status:', res.status);
        return res.json();
      })
      .then(data => {
        log.error('Categories data received:', data);
        if (Array.isArray(data)) {
          setCategories(data);
          log.error('Categories set successfully', { count: data.length, type: 'categories' });
        } else {
          log.error('Categories data is not an array:', data);
          setCategories([]);
        }
      })
      .catch(error => {
        log.error('Error fetching categories:', error);
        setCategories([]);
      });
  }, []);

  // Mapear id de categoría a slug para subcategorías
  const getSlugByCategoryId = (id: string): 'mujer' | 'hombre' | 'accesorios' | 'calzado' | 'bolsos' | 'deportes' | 'calzado-mujer' | 'calzado-hombre' | 'calzado-nina' | 'calzado-nino' | 'ninas' | 'ninos' | '' => {
    const cat = categories.find((c) => c.id === id);
    // Si tienes el campo slug en la respuesta de categorías, usa c.slug
    // Si no, puedes mapear manualmente aquí
    if (cat && cat.name) {
      const nombre = cat.name.toLowerCase();
      if (nombre.includes('calzado de mujer')) return 'calzado-mujer';
      if (nombre.includes('calzado de hombre')) return 'calzado-hombre';
      if (nombre.includes('calzado') && nombre.includes('mujer')) return 'calzado-mujer';
      if (nombre.includes('calzado') && nombre.includes('hombre')) return 'calzado-hombre';
      if (nombre.includes('calzado de niño')) return 'calzado-nino';
      if (nombre.includes('calzado de niña')) return 'calzado-nina';
      if (nombre.includes('calzado') && (nombre.includes('niña') || nombre.includes('nina'))) return 'calzado-nina';
      if (nombre.includes('calzado') && (nombre.includes('niño') || nombre.includes('nino'))) return 'calzado-nino';
      if (nombre.includes('niña') && !nombre.includes('calzado')) return 'ninas';
      if (nombre.includes('niño') && !nombre.includes('calzado')) return 'ninos';
      if (nombre.includes('mujer') && !nombre.includes('calzado')) return 'mujer';
      if (nombre.includes('hombre') && !nombre.includes('calzado')) return 'hombre';
      if (nombre.includes('accesorio')) return 'accesorios';
      if (nombre.includes('calzado')) return 'calzado';
      if (nombre.includes('bolso')) return 'bolsos';
      if (nombre.includes('deporte')) return 'deportes';
    }
    return '';
  };

  // Obtener las tallas correctas según la categoría seleccionada
  const getAvailableSizes = () => {
    const categorySlug = getSlugByCategoryId(formData.category);
    
    // Verificar primero si es una categoría específica de calzado
    if (categorySlug === 'calzado-mujer' || categorySlug === 'calzado-nina') {
      return womenShoeSizes;
    } else if (categorySlug === 'calzado-hombre' || categorySlug === 'calzado-nino') {
      return menShoeSizes;
    } else if (categorySlug === 'calzado') {
      // Para calzado genérico, necesitamos determinar si es de mujer u hombre
      // Primero verificar si la categoría principal indica el género
      const categoryName = categories.find(c => c.id === formData.category)?.name?.toLowerCase() || '';
      const subcategory = formData.subcategoria.toLowerCase();
      
      // Palabras clave para identificar género
      const womenKeywords = ['mujer', 'femenino', 'dama', 'damas', 'femenina', 'mujeres','niñas','niños','bebes'];
      const menKeywords = ['hombre', 'masculino', 'caballero', 'caballeros', 'masculina', 'hombres'];
      
      // Verificar en el nombre de la categoría
      const isWomenCategory = womenKeywords.some(keyword => categoryName.includes(keyword));
      const isMenCategory = menKeywords.some(keyword => categoryName.includes(keyword));
      
      // Verificar en la subcategoría
      const isWomenSubcategory = womenKeywords.some(keyword => subcategory.includes(keyword));
      const isMenSubcategory = menKeywords.some(keyword => subcategory.includes(keyword));
      
      // Determinar el género
      if (isWomenCategory || isWomenSubcategory) {
        return womenShoeSizes;
      } else if (isMenCategory || isMenSubcategory) {
        return menShoeSizes;
      } else {
        // Si no hay indicación clara, mostrar ambas opciones
        return [...womenShoeSizes, ...menShoeSizes];
      }
    } else if (categorySlug === 'mujer' || categorySlug === 'hombre') {
      // Para categorías de ropa por género, usar tallas de ropa
      return clothingSizes;
    } else {
      // Para otros productos (accesorios, bolsos, deportes), usar tallas de ropa
      return clothingSizes;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setImages(prev => [...prev, result])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const addVariant = () => {
    log.error('Agregando nueva variante');
    setVariants(prev => {
      const newVariants = [...prev, { size: '', color: '', stock: 0 }];
      log.error('Nuevas variantes:', newVariants);
      log.error('Número total de variantes:', newVariants.length);
      return newVariants;
    });
  }

  const removeVariant = (index: number) => {
    log.error(`Eliminando variante en índice ${index}`);
    setVariants(prev => {
      const newVariants = prev.filter((_, i) => i !== index);
      log.error('Variantes después de eliminar:', newVariants);
      log.error('Número total de variantes:', newVariants.length);
      return newVariants;
    });
  }

  const updateVariant = (index: number, field: string, value: string | number) => {
    log.error(`Actualizando variante ${index}, campo ${field}, valor ${value}`);
    
    // Crear una copia profunda del array de variantes para evitar problemas de referencia
    const updatedVariants = JSON.parse(JSON.stringify(variants));
    
    // Actualizar el campo específico en la variante
    if (updatedVariants[index]) {
      updatedVariants[index][field] = value;
      log.error(`Variante ${index} actualizada:`, updatedVariants[index]);
      
      // Actualizar el estado con el nuevo array
      setVariants(updatedVariants);
      
      // Verificar el estado actualizado después de un breve retraso
      setTimeout(() => {
        log.error('Estado actual de variantes:', variants);
        log.error('Número total de variantes en estado:', variants.length);
      }, 100);
    } else {
      log.error(`Error: No se encontró la variante en el índice ${index}`);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
              // Subir imágenes a Cloudflare
      const uploadedImageUrls: string[] = [];
      for (const image of images) {
        log.error('Imagen a subir:', image);
        // Convertir base64 a Blob
        const res = await fetch(image);
        const blob = await res.blob();
        const formData = new FormData();
        formData.append('file', blob, 'imagen.jpg');
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        log.error('Respuesta de /api/upload:', uploadData);
        if (uploadData.url && uploadData.url.startsWith('http')) {
          uploadedImageUrls.push(uploadData.url);
        }
      }
              log.error('Imágenes subidas a Cloudflare:', uploadedImageUrls);
      if (uploadedImageUrls.length === 0) {
        toast.error('No se subieron imágenes correctamente');
        setIsLoading(false);
        return;
      }
      // Verificar las variantes antes de enviar
      log.error('Variantes a enviar:', variants);
      
      // Preparar datos para enviar
      const productData = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.category,
        subcategoria: formData.subcategoria,
        price: formData.price,
        originalPrice: formData.originalPrice,
        images: uploadedImageUrls,
        stock: formData.stock,
        barcode: formData.barcode || null, // Incluir código de barras
        isActive: formData.isActive,
        isNew: formData.isNew,
        isOnSale: formData.isOnSale,
        isSecondHand: formData.isSecondHand,
        variants: variants.map(v => ({
          size: v.size,
          color: v.color,
          stock: v.stock,
          price: v.price,
        })),
      };
      
      log.error('Datos completos a enviar:', productData);
      
      // Guardar el producto en la base de datos
      const response = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error + (result.detalle ? ': ' + result.detalle : ''));
        setIsLoading(false);
        return;
      }
      toast.success('Producto creado correctamente')
      // Redirigir a la lista de productos
    } catch (error) {
      toast.error('Error al crear el producto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link href="/admin/productos" className="btn-secondary text-sm px-3 py-2">
                <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Volver</span>
                <span className="sm:hidden">Atrás</span>
              </Link>
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-title">Nuevo Producto</h1>
                <p className="text-xs sm:text-sm text-body hidden sm:block">Agrega un nuevo producto a tu catálogo</p>
              </div>
            </div>
            <button
              type="submit"
              form="product-form"
              disabled={isLoading}
              className="btn-primary inline-flex items-center text-sm px-3 py-2 sm:px-4 sm:py-2 w-full sm:w-auto justify-center"
            >
              <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {isLoading ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <form id="product-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Formulario Principal */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Información Básica */}
              <div className="bg-white rounded-lg shadow-sm border border-primary-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-title mb-3 sm:mb-4">Información Básica</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-title mb-1 sm:mb-2">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="input-field text-sm"
                      placeholder="Ej: Vestido Floral de Verano"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-title mb-1 sm:mb-2">
                      Categoría *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="input-field text-sm"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-title mb-1 sm:mb-2">
                      Subcategoría {formData.category && '*'}
                    </label>
                    <select
                      name="subcategoria"
                      value={formData.subcategoria}
                      onChange={handleInputChange}
                      required={!!formData.category && (subcategoriasPorCategoria[getSlugByCategoryId(formData.category)] || []).length > 0}
                      className="input-field text-sm"
                      disabled={!formData.category || !(subcategoriasPorCategoria[getSlugByCategoryId(formData.category)] || []).length}
                    >
                      <option value="">{formData.category ? 'Seleccionar subcategoría' : 'Selecciona una categoría primero'}</option>
                      {(subcategoriasPorCategoria[getSlugByCategoryId(formData.category)] || []).map((subcat) => (
                        <option key={subcat} value={subcat}>{subcat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-title mb-1 sm:mb-2">
                      Precio de Venta *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="input-field text-sm"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-title mb-1 sm:mb-2">
                      Precio Original
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="input-field text-sm"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-title mb-1 sm:mb-2">
                      Stock Inicial *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="input-field text-sm"
                      placeholder="0"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-title mb-1 sm:mb-2">
                      Código de Barras
                    </label>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          name="barcode"
                          value={formData.barcode}
                          onChange={handleInputChange}
                          className="input-field flex-1 text-sm"
                          placeholder="Código de barras (opcional)"
                          readOnly
                        />
                        <select
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-auto"
                          onChange={(e) => {
                            const format = e.target.value as 'PRD' | 'EAN13';
                            let barcode: string;
                            
                            if (format === 'EAN13') {
                              barcode = generateManualEAN13();
                            } else {
                              barcode = generateManualBarcode('PRD');
                            }
                            
                            setFormData(prev => ({ ...prev, barcode }));
                          }}
                        >
                          <option value="">Generar código</option>
                          <option value="PRD">PRD (Formato largo)</option>
                          <option value="EAN13">EAN-13 (Estándar)</option>
                        </select>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <span className="text-gray-500 mt-0.5">💡</span>
                        <span className="text-gray-600 leading-relaxed">
                          <strong>EAN-13:</strong> Más compatible con lectores (13 dígitos)<br className="sm:hidden" />
                          <span className="hidden sm:inline"> | </span>
                          <strong>PRD:</strong> Formato interno (15 caracteres)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4">
                  <label className="block text-xs sm:text-sm font-medium text-title mb-1 sm:mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="input-field text-sm"
                    placeholder="Describe el producto..."
                  />
                </div>
              </div>

              {/* Variantes */}
              <div className="bg-white rounded-lg shadow-sm border border-primary-100 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-title">Variantes</h2>
                    <p className="text-xs sm:text-sm text-muted mt-1">
                      Total de variantes: <span className="font-semibold text-primary-600">{variants.length}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="btn-secondary inline-flex items-center text-sm px-3 py-2 w-full sm:w-auto justify-center"
                  >
                    <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Agregar Variante
                  </button>
                </div>

                {variants.length === 0 ? (
                  <p className="text-muted text-center py-8">
                    No hay variantes agregadas. Haz clic en "Agregar Variante" para comenzar.
                  </p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {variants.map((variant, index) => (
                      <div key={`variant-${index}-${variant.size}-${variant.color}`} className="p-3 sm:p-4 bg-primary-50 rounded-lg border border-primary-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded">
                            Variante #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg"
                            title="Eliminar variante"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Talla</label>
                            <select
                              value={variant.size}
                              onChange={(e) => updateVariant(index, 'size', e.target.value)}
                              className="w-full px-2 sm:px-3 py-2 border border-primary-200 rounded-lg text-sm"
                            >
                              <option value="">Seleccionar talla</option>
                              {getAvailableSizes().map((size) => (
                                <option key={size} value={size}>{size}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                            <select
                              value={variant.color}
                              onChange={(e) => updateVariant(index, 'color', e.target.value)}
                              className="w-full px-2 sm:px-3 py-2 border border-primary-200 rounded-lg text-sm"
                            >
                              <option value="">Seleccionar color</option>
                              {colors.map((color) => (
                                <option key={color} value={color}>{color}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Stock</label>
                            <input
                              type="number"
                              value={variant.stock || 0}
                              onChange={(e) => updateVariant(index, 'stock', e.target.value ? parseInt(e.target.value) : 0)}
                              min="0"
                              className="w-full px-2 sm:px-3 py-2 border border-primary-200 rounded-lg text-sm"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Resumen de variantes */}
                    <div className="mt-3 sm:mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-2">Resumen de variantes:</h4>
                      <div className="text-xs text-blue-700 space-y-1">
                        <p>• Total de variantes: <strong>{variants.length}</strong></p>
                        <p>• Variantes completas: <strong>{variants.filter(v => v.size && v.color && v.stock > 0).length}</strong></p>
                        <p>• Variantes incompletas: <strong>{variants.filter(v => !v.size || !v.color || v.stock === 0).length}</strong></p>
                        <p>• Tipo de tallas: <strong>{getSlugByCategoryId(formData.category) === 'calzado' ? 'Calzado' : 'Ropa'}</strong></p>
                        {getSlugByCategoryId(formData.category) === 'calzado' && (
                          <p>• Tallas disponibles: <strong>{getAvailableSizes().join(', ')}</strong></p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Imágenes */}
              <div className="bg-white rounded-lg shadow-sm border border-primary-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-title mb-3 sm:mb-4">Imágenes</h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-primary-200 rounded-lg p-4 sm:p-6 text-center cursor-pointer hover:border-primary-300 transition-colors"
                  >
                    <Upload className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-primary-400 mb-2" />
                    <p className="text-xs sm:text-sm text-muted">Haz clic para subir imágenes</p>
                    <p className="text-xs text-muted mt-1">PNG, JPG hasta 5MB</p>
                    <p className="text-xs font-medium text-primary-600 mt-2">{images.length > 0 ? `${images.length} imágenes seleccionadas` : "Ninguna imagen seleccionada"}</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {images.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-title">Vista previa de imágenes</h3>
                        <button 
                          type="button" 
                          onClick={() => setImages([])} 
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Eliminar todas
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Imagen ${index + 1}`}
                              className="w-full h-20 sm:h-24 object-cover rounded-lg"
                            />
                            <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                              {index + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted mt-2">La primera imagen será la principal. Puedes subir hasta 5 imágenes.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Configuración */}
              <div className="bg-white rounded-lg shadow-sm border border-primary-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-title mb-3 sm:mb-4">Configuración</h2>
                
                <div className="space-y-2 sm:space-y-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="isNew"
                      checked={formData.isNew}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    Marcar como nuevo
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="isOnSale"
                      checked={formData.isOnSale}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    Producto en oferta
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="isSecondHand"
                      checked={formData.isSecondHand}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    Segunda mano
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    Producto activo
                  </label>
                </div>
              </div>

              {/* Vista Previa */}
              {formData.name && (
                <div className="bg-white rounded-lg shadow-sm border border-primary-100 p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold text-title mb-3 sm:mb-4">Vista Previa</h2>
                  
                  <div className="space-y-2 sm:space-y-3">
                    {images[0] && (
                      <img
                        src={images[0]}
                        alt="Vista previa"
                        className="w-full h-28 sm:h-32 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="text-sm sm:text-base font-medium text-title">{formData.name || 'Nombre del producto'}</h3>
                      <p className="text-xs sm:text-sm text-muted">{formData.category || 'Categoría'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm sm:text-base font-bold text-title">
                          ${formData.price || '0.00'}
                        </span>
                        {formData.originalPrice && (
                          <span className="text-xs sm:text-sm text-muted line-through">
                            ${formData.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}