"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ShoppingBag, 
  Star, 
  MapPin, 
  Edit, 
  Trash2,
  RefreshCw,
  Package,
  DollarSign,
  TrendingUp,
  Clock
} from "lucide-react";
import toast from "react-hot-toast";

interface ClientDetail {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  registered: string;
  lastActivity: string;
  totalOrders: number;
  totalReviews: number;
  totalAddresses: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrder: {
    id: string;
    status: string;
    total: number;
    date: string;
  } | null;
  orders: Array<{
    id: string;
    status: string;
    total: number;
    date: string;
    items: number;
  }>;
  addresses: Array<{
    id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    date: string;
    productName: string;
  }>;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

const roleLabels: Record<string, string> = {
  USER: "Cliente",
  ADMIN: "Administrador",
};

export default function ClienteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/users/${clientId}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar los datos del cliente');
      }
      
      setClient(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchClientDetail();
    }
  }, [clientId]);

  const handleDeleteClient = async () => {
    if (!client) return;
    
    if (!confirm(`¿Estás seguro de que quieres eliminar al cliente ${client.name}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      // Aquí implementarías la lógica para eliminar el cliente
      toast.success('Cliente eliminado exitosamente');
      router.push('/admin/clientes');
    } catch (error) {
      toast.error('Error al eliminar el cliente');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-neutral-600">Cargando datos del cliente...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-800 mb-4">{error || 'Cliente no encontrado'}</p>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={fetchClientDetail}
                className="btn-primary"
              >
                Intentar de nuevo
              </button>
              <Link href="/admin/clientes" className="btn-secondary">
                Volver
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Header */}
      <div className="bg-white shadow-elegant border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/clientes"
                className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-700">Detalles del Cliente</h1>
                <p className="text-neutral-600">Información completa y actividad</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchClientDetail}
                className="btn-secondary inline-flex items-center"
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              <button className="btn-primary inline-flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </button>
              {client.role !== 'ADMIN' && (
                <button 
                  onClick={handleDeleteClient}
                  className="btn-danger inline-flex items-center"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del Cliente */}
          <div className="lg:col-span-1 space-y-6">
            {/* Perfil */}
            <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-6">
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-neutral-900">{client.name}</h2>
                  <p className="text-sm text-neutral-500">{roleLabels[client.role]}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${
                    client.status === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {client.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-3 text-neutral-400" />
                  <span className="text-neutral-900">{client.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-3 text-neutral-400" />
                  <span className="text-neutral-900">{client.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-3 text-neutral-400" />
                  <span className="text-neutral-900">Registrado: {client.registered}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-3 text-neutral-400" />
                  <span className="text-neutral-900">Última actividad: {client.lastActivity}</span>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Estadísticas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="text-sm text-neutral-600">Total de órdenes</span>
                  </div>
                  <span className="font-semibold text-neutral-900">{client.totalOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                    <span className="text-sm text-neutral-600">Total gastado</span>
                  </div>
                  <span className="font-semibold text-neutral-900">${client.totalSpent.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                    <span className="text-sm text-neutral-600">Promedio por orden</span>
                  </div>
                  <span className="font-semibold text-neutral-900">${client.averageOrderValue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-600" />
                    <span className="text-sm text-neutral-600">Reviews</span>
                  </div>
                  <span className="font-semibold text-neutral-900">{client.totalReviews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-red-600" />
                    <span className="text-sm text-neutral-600">Direcciones</span>
                  </div>
                  <span className="font-semibold text-neutral-900">{client.totalAddresses}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Última Orden */}
            {client.lastOrder && (
              <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Última Orden</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 mr-2 text-blue-600" />
                      <span className="font-medium text-blue-900">Orden #{client.lastOrder.id}</span>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[client.lastOrder.status]}`}>
                      {client.lastOrder.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Total: ${client.lastOrder.total.toFixed(2)}</span>
                    <span className="text-blue-600">{client.lastOrder.date}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Historial de Órdenes */}
            <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Historial de Órdenes</h3>
              {client.orders.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">No hay órdenes registradas</p>
              ) : (
                <div className="space-y-3">
                  {client.orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-3 text-neutral-400" />
                        <div>
                          <p className="font-medium text-neutral-900">Orden #{order.id}</p>
                          <p className="text-sm text-neutral-500">{order.date} • {order.items} artículos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-neutral-900">${order.total.toFixed(2)}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Direcciones */}
            <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Direcciones</h3>
              {client.addresses.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">No hay direcciones registradas</p>
              ) : (
                <div className="space-y-3">
                  {client.addresses.map((address) => (
                    <div key={address.id} className="p-3 border border-neutral-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-neutral-900">{address.label}</span>
                        {address.isDefault && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600">
                        {address.street}, {address.city}, {address.state} {address.zipCode}
                      </p>
                      <p className="text-sm text-neutral-500">{address.country}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Reviews</h3>
              {client.reviews.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">No hay reviews publicadas</p>
              ) : (
                <div className="space-y-3">
                  {client.reviews.map((review) => (
                    <div key={review.id} className="p-3 border border-neutral-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-neutral-900">{review.productName}</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-neutral-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-neutral-600 mb-2">{review.comment}</p>
                      )}
                      <p className="text-xs text-neutral-500">{review.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 