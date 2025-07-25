'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  Search,
  Filter,
  RefreshCw // <-- Agrego el icono de refrescar
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

// Datos simulados para el dashboard
const stats = [
  { title: 'Total Productos', value: '156', icon: Package, change: '+12%', color: 'text-primary-600' },
  { title: 'Clientes Activos', value: '2,847', icon: Users, change: '+8%', color: 'text-secondary-600' },
  { title: 'Pedidos Hoy', value: '23', icon: ShoppingCart, change: '+15%', color: 'text-accent-600' },
  { title: 'Ventas del Mes', value: '$12,847', icon: TrendingUp, change: '+23%', color: 'text-primary-600' }
]

const recentProducts = [
  {
    id: 1,
    name: 'Vestido Floral de Verano',
    category: 'Mujer',
    price: 89.99,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2028&q=80',
    status: 'active'
  },
  {
    id: 2,
    name: 'Camisa de Lino Clásica',
    category: 'Hombre',
    price: 65.00,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80',
    status: 'low-stock'
  },
  {
    id: 3,
    name: 'Jeans Slim Fit Premium',
    category: 'Hombre',
    price: 95.00,
    stock: 0,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2026&q=80',
    status: 'out-of-stock'
  }
]

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/productos')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      });
  }, []);

  // Nueva función para refrescar productos
  const handleRefresh = () => {
    fetch('/api/productos')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      });
  };

  // Función para eliminar producto
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      const res = await fetch('/api/productos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId }),
      });
      const data = await res.json();
      if (data.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        handleRefresh();
        toast.success('Producto eliminado');
      } else {
        toast.error(data.error || 'Error al eliminar');
      }
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  // Estadísticas reales
  const totalProductos = Array.isArray(products) ? products.length : 0;
  const productosRecientes = Array.isArray(products) ? products.slice(0, 3) : [];

  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Header */}
      <div className="bg-white shadow-elegant border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-700">Panel de Administración</h1>
              <p className="text-neutral-600">Gestiona tu inventario y ventas</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-secondary inline-flex items-center" onClick={handleRefresh} type="button">
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </button>
              <Link href="/admin/productos/nuevo" className="btn-primary inline-flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-elegant p-6 border border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Total Productos</p>
                <p className="text-2xl font-bold text-neutral-700">{totalProductos}</p>
              </div>
              <div className="p-3 rounded-full bg-primary-50 text-primary-600">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </div>
          {/* Puedes agregar más tarjetas de stats reales aquí si tienes más datos */}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/productos" className="bg-white rounded-lg shadow-elegant p-6 border border-neutral-100 hover:shadow-premium transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-50 text-primary-600">
                <Package className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-neutral-700">Gestionar Productos</h3>
                <p className="text-neutral-600">Agregar, editar y eliminar productos</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/inventario" className="bg-white rounded-lg shadow-elegant p-6 border border-neutral-100 hover:shadow-premium transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-secondary-50 text-secondary-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-neutral-700">Control de Stock</h3>
                <p className="text-neutral-600">Actualizar inventario y precios</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/pedidos" className="bg-white rounded-lg shadow-elegant p-6 border border-neutral-100 hover:shadow-premium transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-accent-50 text-accent-600">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-neutral-700">Gestionar Pedidos</h3>
                <p className="text-neutral-600">Ver y procesar pedidos</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-elegant border border-neutral-100">
          <div className="p-6 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-700">Productos Recientes</h2>
              <Link href="/admin/productos" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Ver todos
              </Link>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {productosRecientes.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
                  <img
                    src={Array.isArray(product.images) && product.images[0] ? product.images[0] : '/img/placeholder.png'}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-neutral-700">{product.name}</h3>
                    <p className="text-sm text-neutral-500">{product.category?.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm font-medium text-neutral-700">${product.price}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 0 ? 'En Stock' : 'Sin Stock'} ({product.stock})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/productos/${product.id}`}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/productos/${product.id}/editar`}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={() => handleDeleteProduct(product.id)} title="Eliminar">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 