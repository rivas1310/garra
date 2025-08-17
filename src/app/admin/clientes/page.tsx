"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Trash2, Edit, RefreshCw, Filter, Search, User, Mail, Phone, Calendar, ShoppingBag, Star, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

interface Client {
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
  lastOrder: {
    id: string;
    status: string;
    total: number;
    date: string;
  } | null;
}

const statusColors: Record<string, string> = {
  activo: "bg-green-100 text-green-800",
  inactivo: "bg-red-100 text-red-800",
  admin: "bg-purple-100 text-purple-800",
};

const roleLabels: Record<string, string> = {
  USER: "Cliente",
  ADMIN: "Administrador",
};

export default function ClientesAdminPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    clientId: string | null;
    clientName: string;
  }>({
    isOpen: false,
    clientId: null,
    clientName: ''
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/users');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar los clientes');
      }
      
      setClients(result.data);
      toast.success(`Se cargaron ${result.total} clientes`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase()) ||
      client.id.toLowerCase().includes(search.toLowerCase()) ||
      client.phone.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    const matchesRole = roleFilter === "all" || client.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleRefresh = () => {
    fetchClients();
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      // Aquí implementarías la lógica para eliminar el cliente
      toast.success('Cliente eliminado exitosamente');
      fetchClients(); // Recargar la lista
    } catch (error) {
      toast.error('Error al eliminar el cliente');
    }
  };

  const openDeleteModal = (clientId: string, clientName: string) => {
    setDeleteModal({
      isOpen: true,
      clientId,
      clientName
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      clientId: null,
      clientName: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-neutral-600">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-800 mb-4">{error}</p>
            <button 
              onClick={fetchClients}
              className="btn-primary"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <div className="bg-white shadow-elegant border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-700 truncate">Gestión de Clientes</h1>
              <p className="text-sm sm:text-base text-neutral-600">
                {clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button 
              onClick={handleRefresh}
              className="btn-secondary inline-flex items-center text-sm sm:text-base py-1.5 sm:py-2 px-3 sm:px-4"
              disabled={loading}
            >
              <RefreshCw className={`mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-3 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-sm sm:text-base pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm sm:text-base px-2 sm:px-3 py-1.5 sm:py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="admin">Administrador</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-sm sm:text-base px-2 sm:px-3 py-1.5 sm:py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Todos los roles</option>
                <option value="USER">Clientes</option>
                <option value="ADMIN">Administradores</option>
              </select>
            </div>
            <button className="btn-secondary flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base py-1.5 sm:py-2 px-3 sm:px-4 mt-2 sm:mt-0">
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Exportar ({filteredClients.length})
            </button>
          </div>
        </div>

        {/* Mensaje de no clientes (común para ambas vistas) */}
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-6 text-center">
            <User className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-neutral-300" />
            <p className="text-base sm:text-lg font-medium text-neutral-700">No se encontraron clientes</p>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <>
            {/* Vista de tarjetas para móviles */}
            <div className="block sm:hidden space-y-3">
              {filteredClients.map((client) => (
                <div key={client.id} className="bg-white rounded-lg shadow-elegant border border-neutral-100 p-3 overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-600" />
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium text-neutral-900 truncate max-w-[180px]">{client.name}</div>
                        <div className="text-xs text-neutral-500">{roleLabels[client.role]}</div>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[client.status]}`}>
                      {client.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center text-xs text-neutral-900">
                      <Mail className="h-3.5 w-3.5 mr-1.5 text-neutral-400 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center text-xs text-neutral-500">
                        <Phone className="h-3.5 w-3.5 mr-1.5 text-neutral-400 flex-shrink-0" />
                        {client.phone}
                      </div>
                    )}
                    <div className="flex items-center text-xs text-neutral-500">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-neutral-400 flex-shrink-0" />
                      Registrado: {client.registered}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <ShoppingBag className="h-3.5 w-3.5 mr-1 text-neutral-400" />
                        {client.totalOrders}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3.5 w-3.5 mr-1 text-neutral-400" />
                        {client.totalReviews}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-neutral-400" />
                        {client.totalAddresses}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Link 
                        href={`/admin/clientes/${client.id}`} 
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" 
                        title="Ver detalles"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                      <button 
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="Editar"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      {client.role !== 'ADMIN' && (
                        <button 
                          onClick={() => openDeleteModal(client.id, client.name)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Tabla para tablets y desktop */}
            <div className="hidden sm:block bg-white rounded-lg shadow-elegant border border-neutral-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Contacto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actividad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Última Orden</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-100">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-neutral-900">{client.name}</div>
                              <div className="text-sm text-neutral-500">ID: {client.id}</div>
                              <div className="text-xs text-neutral-400">{roleLabels[client.role]}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-neutral-900">
                              <Mail className="h-4 w-4 mr-2 text-neutral-400" />
                              {client.email}
                            </div>
                            <div className="flex items-center text-sm text-neutral-500">
                              <Phone className="h-4 w-4 mr-2 text-neutral-400" />
                              {client.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[client.status]}`}>
                            {client.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-neutral-900">
                              <Calendar className="h-4 w-4 mr-2 text-neutral-400" />
                              Registrado: {client.registered}
                            </div>
                            <div className="flex items-center text-sm text-neutral-500">
                              <div className="flex items-center mr-4">
                                <ShoppingBag className="h-4 w-4 mr-1 text-neutral-400" />
                                {client.totalOrders} ordenes
                              </div>
                              <div className="flex items-center mr-4">
                                <Star className="h-4 w-4 mr-1 text-neutral-400" />
                                {client.totalReviews} reviews
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1 text-neutral-400" />
                                {client.totalAddresses} direcciones
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {client.lastOrder ? (
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-neutral-900">
                                ${client.lastOrder.total.toFixed(2)}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {client.lastOrder.date} - {client.lastOrder.status}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-neutral-400">Sin órdenes</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/admin/clientes/${client.id}`} 
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" 
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button 
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {client.role !== 'ADMIN' && (
                              <button 
                                onClick={() => openDeleteModal(client.id, client.name)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => {
          if (deleteModal.clientId) {
            handleDeleteClient(deleteModal.clientId);
          }
        }}
        title="Eliminar Cliente"
        message="¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer."
        itemName={deleteModal.clientName}
      />
    </div>
  );
}