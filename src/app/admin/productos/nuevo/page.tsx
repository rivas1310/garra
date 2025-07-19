'use client'

import { useState, useRef, useEffect } from 'react'
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

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const colors = ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde', 'Amarillo', 'Rosa', 'Gris']

// Subcategorías por categoría (slug o id)
const subcategoriasPorCategoria: Record<string, string[]> = {
  mujer: ["Vestidos", "Blusas", "Pantalones", "Chamarras", "Sudaderas"],
  hombre: ["Chamarras", "Camisas", "Playeras", "Pantalones", "Shorts"],
  accesorios: ["Joyas", "Relojes", "Cinturones", "Bolsos"],
  calzado: ["Zapatos", "Zapatillas", "Botas"],
  bolsos: ["Carteras", "Mochilas", "Bolsos de mano"],
  deportes: ["Ropa deportiva", "Fitness", "Accesorios deportivos"],
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
    isNew: false,
    isOnSale: false,
    isActive: true,
    isSecondHand: false // <-- nuevo campo
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
    console.log('Fetching categories...');
    fetch('/api/categorias')
      .then(res => {
        console.log('Categories response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Categories data received:', data);
        if (Array.isArray(data)) {
          setCategories(data);
          console.log('Categories set successfully:', data.length, 'categories');
        } else {
          console.error('Categories data is not an array:', data);
          setCategories([]);
        }
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        setCategories([]);
      });
  }, []);

  // Mapear id de categoría a slug para subcategorías
  const getSlugByCategoryId = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    // Si tienes el campo slug en la respuesta de categorías, usa c.slug
    // Si no, puedes mapear manualmente aquí
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
    setVariants(prev => [...prev, { size: '', color: '', stock: 0 }])
  }

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: string, value: string | number) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Subir imágenes a Cloudinary
      const uploadedImageUrls: string[] = [];
      for (const image of images) {
        console.log('Imagen a subir:', image);
        // Convertir base64 a Blob
        const res = await fetch(image);
        const blob = await res.blob();
        const formData = new FormData();
        formData.append('file', blob, 'imagen.jpg');
        const uploadRes = await fetch('/api/registro', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        console.log('Respuesta de /api/registro:', uploadData);
        if (uploadData.url && uploadData.url.startsWith('http')) {
          uploadedImageUrls.push(uploadData.url);
        }
      }
      console.log('Imágenes subidas a Cloudinary:', uploadedImageUrls);
      if (uploadedImageUrls.length === 0) {
        toast.error('No se subieron imágenes correctamente');
        setIsLoading(false);
        return;
      }
      // Guardar el producto en la base de datos
      const response = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          categoryId: formData.category,
          subcategoria: formData.subcategoria,
          price: formData.price,
          originalPrice: formData.originalPrice,
          images: uploadedImageUrls,
          stock: formData.stock,
          isActive: formData.isActive,
          isNew: formData.isNew,
          isOnSale: formData.isOnSale,
          isSecondHand: formData.isSecondHand, // <-- nuevo campo
          variants: variants.map(v => ({
            size: v.size,
            color: v.color,
            stock: v.stock,
            price: v.price,
          })),
        }),
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/productos" className="btn-secondary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-title">Nuevo Producto</h1>
                <p className="text-body">Agrega un nuevo producto a tu catálogo</p>
              </div>
            </div>
            <button
              type="submit"
              form="product-form"
              disabled={isLoading}
              className="btn-primary inline-flex items-center"
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Guardando...' : 'Guardar Producto'}
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
                      Stock Inicial *
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
                  <h2 className="text-lg font-semibold text-title">Variantes</h2>
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
                      <div key={index} className="flex items-center gap-4 p-4 bg-primary-50 rounded-lg">
                        <select
                          value={variant.size}
                          onChange={(e) => updateVariant(index, 'size', e.target.value)}
                          className="flex-1 px-3 py-2 border border-primary-200 rounded-lg"
                        >
                          <option value="">Seleccionar talla</option>
                          {sizes.map((size) => (
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
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value))}
                          min="0"
                          className="w-24 px-3 py-2 border border-primary-200 rounded-lg"
                          placeholder="Stock"
                        />

                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
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
                    <p className="text-sm text-muted">Haz clic para subir imágenes</p>
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
                    <div className="grid grid-cols-2 gap-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
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
                  )}
                </div>
              </div>

              {/* Configuración */}
              <div className="bg-white rounded-lg shadow-sm border border-primary-100 p-6">
                <h2 className="text-lg font-semibold text-title mb-4">Configuración</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isNew"
                      checked={formData.isNew}
                      onChange={handleInputChange}
                    />
                    Marcar como nuevo
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isOnSale"
                      checked={formData.isOnSale}
                      onChange={handleInputChange}
                    />
                    Producto en oferta
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isSecondHand"
                      checked={formData.isSecondHand}
                      onChange={handleInputChange}
                    />
                    Segunda mano
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    Producto activo
                  </label>
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
                      <h3 className="font-medium text-title">{formData.name || 'Nombre del producto'}</h3>
                      <p className="text-sm text-muted">{formData.category || 'Categoría'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-title">
                          ${formData.price || '0.00'}
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