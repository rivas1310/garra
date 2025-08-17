'use client'

import { useState, useRef, useEffect } from 'react'
import { log } from '@/lib/secureLogger'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  Plus,
  Trash2,
  Eye,
  Package
} from 'lucide-react'
import toast from 'react-hot-toast'

const categories = [
  { id: 'mujer', name: 'Mujer' },
  { id: 'hombre', name: 'Hombre' },
  { id: 'accesorios', name: 'Accesorios' },
  { id: 'calzado', name: 'Calzado' },
  { id: 'bolsos', name: 'Bolsos' },
  { id: 'deportes', name: 'Deportes' }
]

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
  calzado: ["Zapatos", "Zapatillas", "Botas"],
  "calzado-mujer": ["Tacones", "Zapatillas", "Zapatos", "Sneakers", "Botas", "Huaraches", "Sandalias"],
  "calzado-hombre": ["Zapatos", "Sneakers", "Botas", "Sandalias"],
  "calzado-nino": ["Zapatos", "Botas", "Sneakers", "Sandalias"],
  "calzado-nina": ["Zapatos", "Botas", "Sneakers", "Sandalias"],
  ninas: ["Vestidos", "Blusas", "Pantalones", "Pants", "Chaleco", "Suéter", "Faldas", "Shorts","Playeras","Sudaderas","Chamarras"],
  ninos: ["Camisetas", "Pantalones", "Pants", "Chaleco", "Suéter", "Shorts", "Sudaderas", "Chamarras","Playeras"],
  bolsos: ["Carteras de Dama","Carteras de Cabalalero","Bolso de mano", "Mochilas de Dama", "Mochilas de Caballero"],
  deportes: ["Ropa deportiva", "Zapatillas", "Accesorios deportivos"],

};

// Datos simulados del producto
const mockProduct = {
  id: 1,
  name: 'Vestido Floral de Verano',
  description: 'Hermoso vestido floral perfecto para el verano. Fabricado con materiales de alta calidad y diseño elegante.',
  category: 'mujer',
  price: 89.99,
  originalPrice: 120.00,
  stock: 15,
  images: [
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2028&q=80',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  ],
  variants: [
    { size: 'S', color: 'Azul', stock: 5 },
    { size: 'M', color: 'Azul', stock: 8 },
    { size: 'L', color: 'Azul', stock: 2 }
  ],
  isNew: true,
  isOnSale: true,
  isActive: true,
  createdAt: '2024-01-15',
  updatedAt: '2024-01-20'
}

export default function EditarProductoPage() {
  const params = useParams()
  const productId = params.id

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
    isSecondHand: false,
    isActive: true
  })
  
  const [images, setImages] = useState<string[]>([])
  const [variants, setVariants] = useState<Array<{
    size: string
    color: string
    stock: number
    price?: number
  }>>([])
  
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

  // Mapear id de categoría a slug para subcategorías
  const getSlugByCategoryId = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (cat && cat.name) {
      const nombre = cat.name.toLowerCase();
      if (nombre.includes('mujer')) return 'mujer';
      if (nombre.includes('hombre')) return 'hombre';
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
    
    if (categorySlug === 'calzado') {
      // Para calzado, necesitamos determinar si es de mujer u hombre
      // Primero verificar si la categoría principal indica el género
      const categoryName = categories.find(c => c.id === formData.category)?.name?.toLowerCase() || '';
      const subcategory = formData.subcategoria.toLowerCase();
      
      // Palabras clave para identificar género
      const womenKeywords = ['mujer', 'femenino', 'dama', 'damas', 'femenina', 'mujeres'];
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

  // Cargar datos del producto y categorías
  useEffect(() => {
    const loadProduct = async () => {
      try {
        // Cargar categorías reales
        const categorias = await fetch('/api/categorias').then(res => res.json());
        setCategories(categorias);
        // Cargar datos reales del producto con timestamp para evitar caché
        const timestamp = Date.now();
        const producto = await fetch(`/api/productos/${productId}?t=${timestamp}`).then(res => res.json());
        setFormData({
          name: producto.name || '',
          description: producto.description || '',
          category: producto.category?.id || producto.category || '',
          subcategoria: producto.subcategoria || '',
          price: producto.price?.toString() || '',
          originalPrice: producto.originalPrice?.toString() || '',
          stock: producto.stock?.toString() || '',
          barcode: producto.barcode || '', // Cargar código de barras existente
          isNew: !!producto.isNew,
          isOnSale: !!producto.isOnSale,
          isSecondHand: !!producto.isSecondHand,
          isActive: producto.isActive !== false
        });
        setImages(Array.isArray(producto.images) ? producto.images : []);
        setVariants(Array.isArray(producto.variants) ? producto.variants : []);
      } catch (error) {
        toast.error('Error al cargar el producto');
      } finally {
        setIsLoadingData(false);
      }
    };
    loadProduct();
  }, [productId]);

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
    // Validar categoría
    const categoriaValida = categories.find(c => c.id === formData.category);
    if (!categoriaValida) {
      toast.error('Selecciona una categoría válida');
      setIsLoading(false);
      return;
    }
    try {
              // Subir imágenes nuevas a Cloudflare si son base64
      const uploadedImageUrls: string[] = [];
      for (const image of images) {
        if (image.startsWith('http')) {
          uploadedImageUrls.push(image);
        } else {
          // Subir a Cloudflare usando FormData
          const res = await fetch(image);
          const blob = await res.blob();
          const formData = new FormData();
          formData.append('file', blob, 'imagen.jpg');
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const uploadData = await uploadRes.json();
          if (uploadData.url && uploadData.url.startsWith('http')) {
            uploadedImageUrls.push(uploadData.url);
          }
        }
      }
      // Verificar las variantes antes de enviar
      log.error('Variantes a enviar:', variants);
      
      // Preparar datos para enviar
      const productData = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.category, // ID real
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
      
      // Actualizar producto en la base de datos
      const response = await fetch(`/api/productos/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Error al actualizar el producto');
      toast.success('Producto actualizado correctamente')
      // Redirigir a la lista de productos o refrescar
    } catch (error) {
      toast.error('Error al actualizar el producto')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-primary-400 mb-4 animate-pulse" />
          <p className="text-body">Cargando producto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/productos" className="btn-secondary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-title">Editar Producto</h1>
                <p className="text-body">Modifica la información del producto</p>
              </div>
            </div>
            <button
              type="submit"
              form="product-form"
              disabled={isLoading}
              className="btn-primary inline-flex items-center"
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información Básica */}
              <div className="bg-white rounded-lg shadow-sm border border-primary-100 p-6">
                <h2 className="text-lg font-semibold text-title mb-4">Información Básica</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-title mb-2">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Ej: Vestido Floral de Verano"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-title mb-2">
                      Categoría *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="input-field"
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
                    <label className="block text-sm font-medium text-title mb-2">
                      Subcategoría {formData.category && '*'}
                    </label>
                    <select
                      name="subcategoria"
                      value={formData.subcategoria}
                      onChange={handleInputChange}
                      required={!!formData.category && (subcategoriasPorCategoria[getSlugByCategoryId(formData.category)] || []).length > 0}
                      className="input-field"
                      disabled={!formData.category || !(subcategoriasPorCategoria[getSlugByCategoryId(formData.category)] || []).length}
                    >
                      <option value="">{formData.category ? 'Seleccionar subcategoría' : 'Selecciona una categoría primero'}</option>
                      {(subcategoriasPorCategoria[getSlugByCategoryId(formData.category)] || []).map((subcat) => (
                        <option key={subcat} value={subcat}>{subcat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-title mb-2">
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
                      className="input-field"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-title mb-2">
                      Precio Original
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="input-field"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-title mb-2">
                      Stock Total *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="input-field"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-title mb-2">
                      Código de Barras
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="barcode"
                        value={formData.barcode}
                        onChange={handleInputChange}
                        className="input-field flex-1"
                        placeholder="Código de barras del producto"
                        readOnly={!!formData.barcode} // Solo lectura si ya tiene código
                      />
                      {!formData.barcode && (
                        <button
                          type="button"
                          onClick={() => {
                            // Generar código de barras automáticamente
                            const timestamp = Date.now().toString().slice(-8);
                            const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                            const barcode = `PRD${timestamp}${randomDigits}`;
                            setFormData(prev => ({ ...prev, barcode }));
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Generar
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.barcode 
                        ? 'Código de barras asignado al producto' 
                        : 'Genera un código de barras para escanear en ventas físicas'
                      }
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-title mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="input-field"
                    placeholder="Describe el producto..."
                  />
                </div>
              </div>

              {/* Variantes */}
              <div className="bg-white rounded-lg shadow-sm border border-primary-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-title">Variantes</h2>
                    <p className="text-sm text-muted mt-1">
                      Total de variantes: <span className="font-semibold text-primary-600">{variants.length}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="btn-secondary inline-flex items-center"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Variante
                  </button>
                </div>

                {variants.length === 0 ? (
                  <p className="text-muted text-center py-8">
                    No hay variantes agregadas. Haz clic en "Agregar Variante" para comenzar.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {variants.map((variant, index) => (
                      <div key={`variant-${index}-${variant.size}-${variant.color}`} className="flex items-center gap-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
                        <div className="flex items-center gap-2 min-w-[60px]">
                          <span className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                        </div>
                        
                        <select
                          value={variant.size}
                          onChange={(e) => updateVariant(index, 'size', e.target.value)}
                          className="flex-1 px-3 py-2 border border-primary-200 rounded-lg"
                        >
                          <option value="">Seleccionar talla</option>
                          {getAvailableSizes().map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>

                        <select
                          value={variant.color}
                          onChange={(e) => updateVariant(index, 'color', e.target.value)}
                          className="flex-1 px-3 py-2 border border-primary-200 rounded-lg"
                        >
                          <option value="">Seleccionar color</option>
                          {colors.map((color) => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>

                        <input
                          type="number"
                          value={variant.stock || 0}
                          onChange={(e) => updateVariant(index, 'stock', e.target.value ? parseInt(e.target.value) : 0)}
                          min="0"
                          className="w-24 px-3 py-2 border border-primary-200 rounded-lg"
                          placeholder="Stock"
                        />

                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          title="Eliminar variante"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Resumen de variantes */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Resumen de variantes:</h4>
                      <div className="text-xs text-blue-700">
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
            <div className="space-y-6">
              {/* Imágenes */}
              <div className="bg-white rounded-lg shadow-sm border border-primary-100 p-6">
                <h2 className="text-lg font-semibold text-title mb-4">Imágenes</h2>
                
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-primary-200 rounded-lg p-6 text-center cursor-pointer hover:border-primary-300 transition-colors"
                  >
                    <Upload className="mx-auto h-8 w-8 text-primary-400 mb-2" />
                    <p className="text-sm text-muted">Haz clic para agregar más imágenes</p>
                    <p className="text-xs text-muted mt-1">PNG, JPG hasta 5MB</p>
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
                      <div className="grid grid-cols-2 gap-2">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Imagen ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                              {index + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
              <div className="bg-white rounded-lg shadow-sm border border-primary-100 p-6">
                <h2 className="text-lg font-semibold text-title mb-4">Configuración</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isNew"
                      checked={formData.isNew}
                      onChange={handleInputChange}
                      className="mr-2 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-body">Marcar como nuevo</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isOnSale"
                      checked={formData.isOnSale}
                      onChange={handleInputChange}
                      className="mr-2 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-body">Producto en oferta</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isSecondHand"
                      checked={formData.isSecondHand}
                      onChange={handleInputChange}
                      className="mr-2 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-body">Segunda mano</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="mr-2 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-body">Producto activo</span>
                  </label>
                </div>
              </div>

              {/* Información del Producto */}
              <div className="bg-white rounded-lg shadow-sm border border-primary-100 p-6">
                <h2 className="text-lg font-semibold text-title mb-4">Información del Producto</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">ID:</span>
                    <span className="text-title font-medium">#{productId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Creado:</span>
                    <span className="text-title">15 Ene 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Última actualización:</span>
                    <span className="text-title">20 Ene 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Estado:</span>
                    <span className="text-green-600 font-medium">Activo</span>
                  </div>
                </div>
              </div>

              {/* Vista Previa */}
              {formData.name && (
                <div className="bg-white rounded-lg shadow-sm border border-primary-100 p-6">
                  <h2 className="text-lg font-semibold text-title mb-4">Vista Previa</h2>
                  
                  <div className="space-y-3">
                    {images[0] && (
                      <img
                        src={images[0]}
                        alt="Vista previa"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-title">{formData.name}</h3>
                      <p className="text-sm text-muted">{formData.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-title">
                          ${formData.price}
                        </span>
                        {formData.originalPrice && (
                          <span className="text-sm text-muted line-through">
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