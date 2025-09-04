'use client'

import { useState, useEffect } from 'react'
import { log } from '@/lib/secureLogger'
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
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal'

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
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productId: string | null;
    productName: string;
  }>({
    isOpen: false,
    productId: null,
    productName: ''
  });

  useEffect(() => {
    // Agregar timestamp para evitar caché
    const timestamp = Date.now();
    fetch(`/api/productos?admin=true&limit=1000&t=${timestamp}`)
      .then(res => res.json())
      .then(data => {
        log.error('Datos recibidos en dashboard:', data);
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.productos)) {
          setProducts(data.productos);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      });
  }, []);

  // Nueva función para refrescar productos
  const handleRefresh = () => {
    // Agregar timestamp para evitar caché
    const timestamp = Date.now();
    fetch(`/api/productos?admin=true&limit=1000&t=${timestamp}`)
      .then(res => res.json())
      .then(data => {
        log.error('Datos recibidos en refresh:', data);
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.productos)) {
          setProducts(data.productos);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      });
  };

  // Función para eliminar producto
  const handleDeleteProduct = async (productId: string) => {
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
      } else if (res.status === 409) {
        // Producto asociado a órdenes, ofrecer desactivarlo en lugar de eliminarlo
        if (confirm(`${data.error}. ${data.detalle}\n\n¿Desea desactivar el producto en su lugar?`)) {
          await handleDeactivateProduct(productId);
        }
      } else {
        toast.error(data.error || 'Error al eliminar');
      }
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const openDeleteModal = (productId: string, productName: string) => {
    setDeleteModal({
      isOpen: true,
      productId,
      productName
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      productId: null,
      productName: ''
    });
  };

  // Función para desactivar producto
  const handleDeactivateProduct = async (productId: string) => {
    try {
      const res = await fetch('/api/productos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, isActive: false }),
      });
      const data = await res.json();
      
      if (data.ok) {
        // Actualizar el producto en la lista local
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, isActive: false } : p
        ));
        handleRefresh();
        toast.success('Producto desactivado correctamente');
      } else {
        toast.error(data.error || 'Error al desactivar el producto');
      }
    } catch (err) {
      toast.error('Error al desactivar el producto');
    }
  };

  // Estadísticas reales
  const totalProductos = Array.isArray(products) ? products.length : 0;
  const productosRecientes = Array.isArray(products) ? products.slice(0, 3) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 shadow-2xl border-b border-indigo-200 animate-slide-down">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center sm:text-left flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Panel de Administración</h1>
                <p className="text-sm sm:text-base text-indigo-100">Gestiona tu inventario y ventas de manera eficiente</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button 
                className="inline-flex items-center justify-center px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl hover:bg-white/30 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105" 
                onClick={handleRefresh} 
                type="button"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>Actualizar</span>
              </button>
              <Link 
                href="/admin/productos/nuevo" 
                className="inline-flex items-center justify-center px-4 py-2.5 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Nuevo Producto</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10 animate-fade-in-up">
          {/* Total Productos */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-xs bg-white/20 px-2 py-1 rounded-full">+12%</div>
              </div>
            </div>
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Productos</p>
              <p className="text-3xl font-bold">{totalProductos}</p>
            </div>
          </div>

          {/* Clientes Activos */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-xs bg-white/20 px-2 py-1 rounded-full">+8%</div>
              </div>
            </div>
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Clientes Activos</p>
              <p className="text-3xl font-bold">2,847</p>
            </div>
          </div>

          {/* Pedidos Hoy */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-xs bg-white/20 px-2 py-1 rounded-full">+15%</div>
              </div>
            </div>
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Pedidos Hoy</p>
              <p className="text-3xl font-bold">23</p>
            </div>
          </div>

          {/* Ventas del Mes */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-xs bg-white/20 px-2 py-1 rounded-full">+23%</div>
              </div>
            </div>
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">Ventas del Mes</p>
              <p className="text-3xl font-bold">$12,847</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 sm:mb-10 animate-fade-in-up">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Acciones Rápidas</h2>
            <p className="text-gray-600">Accede rápidamente a las funciones principales</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/productos" className="group bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-200">
              <div className="flex items-center mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Package className="h-6 w-6" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Gestionar Productos</h3>
                  <p className="text-sm text-gray-600">Agregar, editar y eliminar productos</p>
                </div>
              </div>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                <span>Ir a productos</span>
                <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link href="/admin/inventario" className="group bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-emerald-200">
              <div className="flex items-center mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">Control de Stock</h3>
                  <p className="text-sm text-gray-600">Actualizar inventario y precios</p>
                </div>
              </div>
              <div className="flex items-center text-emerald-600 text-sm font-medium">
                <span>Ir a inventario</span>
                <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link href="/admin/pedidos" className="group bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-purple-200">
              <div className="flex items-center mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors">Gestionar Pedidos</h3>
                  <p className="text-sm text-gray-600">Ver y procesar pedidos</p>
                </div>
              </div>
              <div className="flex items-center text-purple-600 text-sm font-medium">
                <span>Ir a pedidos</span>
                <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <Package className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Productos Recientes</h2>
                  <p className="text-sm text-gray-600">Últimos productos agregados al inventario</p>
                </div>
              </div>
              <Link 
                href="/admin/productos" 
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span>Ver todos</span>
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="p-6">
            {productosRecientes.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-2xl inline-block mb-4">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay productos recientes</h3>
                <p className="text-gray-500 mb-6">Agrega tu primer producto para verlo aquí</p>
                <Link 
                  href="/admin/productos/nuevo" 
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Producto
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {productosRecientes.map((product) => (
                  <div key={product.id} className="group bg-gradient-to-r from-gray-50 to-white p-4 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-indigo-200">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={Array.isArray(product.images) && product.images[0] ? product.images[0] : '/img/placeholder.png'}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          product.stock > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {product.stock}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{product.category?.name || 'Sin categoría'}</p>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-bold text-indigo-600">${product.price}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            product.stock > 0 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/productos/${product.id}`}
                          className="p-2.5 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all duration-200 hover:scale-110 shadow-sm"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/productos/${product.id}/editar`}
                          className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 transition-all duration-200 hover:scale-110 shadow-sm"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button 
                          className="p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-200 hover:scale-110 shadow-sm" 
                          onClick={() => openDeleteModal(product.id, product.name)} 
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => {
          if (deleteModal.productId) {
            handleDeleteProduct(deleteModal.productId);
          }
        }}
        title="Eliminar Producto"
        message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        itemName={deleteModal.productName}
      />
    </div>
  )
}