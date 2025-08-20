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
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-elegant border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-700">Panel de Administración</h1>
              <p className="text-sm sm:text-base text-neutral-600">Gestiona tu inventario y ventas</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button className="btn-secondary inline-flex items-center justify-center text-sm" onClick={handleRefresh} type="button">
                <RefreshCw className="mr-2 h-4 w-4" />
                <span className="sm:inline">Actualizar</span>
              </button>
              <Link href="/admin/productos/nuevo" className="btn-primary inline-flex items-center justify-center text-sm">
                <Plus className="mr-2 h-4 w-4" />
                <span className="sm:inline">Nuevo Producto</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-elegant p-4 sm:p-6 border border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-neutral-500">Total Productos</p>
                <p className="text-xl sm:text-2xl font-bold text-neutral-700">{totalProductos}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-primary-50 text-primary-600">
                <Package className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
          </div>
          {/* Puedes agregar más tarjetas de stats reales aquí si tienes más datos */}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Link href="/admin/productos" className="bg-white rounded-lg shadow-elegant p-4 sm:p-6 border border-neutral-100 hover:shadow-premium transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-primary-50 text-primary-600 flex-shrink-0">
                <Package className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-neutral-700">Gestionar Productos</h3>
                <p className="text-sm sm:text-base text-neutral-600">Agregar, editar y eliminar productos</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/inventario" className="bg-white rounded-lg shadow-elegant p-4 sm:p-6 border border-neutral-100 hover:shadow-premium transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-secondary-50 text-secondary-600 flex-shrink-0">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-neutral-700">Control de Stock</h3>
                <p className="text-sm sm:text-base text-neutral-600">Actualizar inventario y precios</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/pedidos" className="bg-white rounded-lg shadow-elegant p-4 sm:p-6 border border-neutral-100 hover:shadow-premium transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-accent-50 text-accent-600 flex-shrink-0">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-neutral-700">Gestionar Pedidos</h3>
                <p className="text-sm sm:text-base text-neutral-600">Ver y procesar pedidos</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-elegant border border-neutral-100">
          <div className="p-4 sm:p-6 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-neutral-700">Productos Recientes</h2>
              <Link href="/admin/productos" className="text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium">
                Ver todos
              </Link>
            </div>
          </div>

          <div className="p-3 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {productosRecientes.map((product) => (
                <div key={product.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-neutral-50 rounded-lg">
                  <img
                    src={Array.isArray(product.images) && product.images[0] ? product.images[0] : '/img/placeholder.png'}
                    alt={product.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-medium text-neutral-700 truncate">{product.name}</h3>
                    <p className="text-xs sm:text-sm text-neutral-500">{product.category?.name}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                      <span className="text-sm font-medium text-neutral-700">${product.price}</span>
                      <span className={`text-xs px-2 py-1 rounded-full inline-block w-fit ${
                        product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 0 ? 'En Stock' : 'Sin Stock'} ({product.stock})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Link
                      href={`/admin/productos/${product.id}`}
                      className="p-1.5 sm:p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Link>
                    <Link
                      href={`/admin/productos/${product.id}/editar`}
                      className="p-1.5 sm:p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Link>
                    <button 
                      className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                      onClick={() => openDeleteModal(product.id, product.name)} 
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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