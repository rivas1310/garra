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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <div className="text-gray-700 text-lg font-semibold animate-pulse">Cargando clientes...</div>
          <div className="text-gray-500 text-sm mt-2">Por favor espera un momento</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="h-8 w-8 text-red-600" />
          </div>
          <div className="text-red-600 text-xl font-bold mb-2">Error al cargar clientes</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchClients}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <RefreshCw className="h-4 w-4 inline mr-2" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 animate-fade-in">
      {/* Encabezado mejorado con gradiente */}
      <div className="bg-gradient-to-r from-white via-blue-50 to-indigo-50 shadow-xl border-b border-blue-100/50 backdrop-blur-sm animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
            <div className="space-y-2 animate-fade-in-left">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg animate-bounce">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Gestión de Clientes
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">
                    {clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 animate-fade-in-right"
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Sección de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Clientes</p>
                <p className="text-3xl font-bold">{clients.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-400 bg-opacity-30 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Clientes Activos</p>
                <p className="text-3xl font-bold">{clients.filter(c => c.status === 'activo').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-400 bg-opacity-30 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Órdenes</p>
                <p className="text-3xl font-bold">{clients.reduce((sum, client) => sum + client.totalOrders, 0)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-400 bg-opacity-30 rounded-xl flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Promedio Órdenes</p>
                <p className="text-3xl font-bold">
                  {clients.length > 0 ? (clients.reduce((sum, client) => sum + client.totalOrders, 0) / clients.length).toFixed(1) : '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-400 bg-opacity-30 rounded-xl flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Sección de filtros mejorada responsive */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50 p-4 md:p-6 mb-8 animate-fade-in-up">
          <div className="space-y-4">
            {/* Título de filtros */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Filtros de Búsqueda</h2>
            </div>
            
            {/* Controles de filtros responsive */}
            <div className="space-y-4">
              {/* Barra de búsqueda mejorada */}
              <div className="relative w-full">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, ID o teléfono..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-500 text-sm sm:text-base"
                />
              </div>
              
              {/* Filtros y botón de exportar */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                {/* Filtros de estado y rol */}
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 font-medium text-sm sm:text-base"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="admin">Administrador</option>
                  </select>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 font-medium text-sm sm:text-base"
                  >
                    <option value="all">Todos los roles</option>
                    <option value="USER">Clientes</option>
                    <option value="ADMIN">Administradores</option>
                  </select>
                </div>
                
                {/* Botón de exportar mejorado */}
                <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-sm sm:text-base">
                  <Filter className="mr-2 h-4 w-4" />
                Exportar ({filteredClients.length})
              </button>
            </div>
          </div>
        </div>

        {/* Mensaje de no clientes mejorado */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-xl border border-gray-100 animate-fade-in">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <User className="h-12 w-12 text-blue-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3 animate-fade-in-up">No se encontraron clientes</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto animate-fade-in-up">No hay clientes que coincidan con los filtros aplicados. Intenta ajustar los criterios de búsqueda.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up">
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setRoleFilter('all');
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                Limpiar filtros
              </button>
              <button
                onClick={fetchClients}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <Search className="h-5 w-5" />
                Recargar clientes
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Vista de tarjetas mejorada para móviles */}
            <div className="block sm:hidden space-y-4 animate-fade-in-up">
              {filteredClients.map((client) => (
                <div key={client.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50 p-5 overflow-hidden transform transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl">
                  {/* Encabezado de la tarjeta */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-base font-bold text-gray-900 truncate max-w-[180px]">{client.name}</div>
                        <div className="text-sm text-gray-600 font-medium">{roleLabels[client.role]}</div>
                      </div>
                    </div>
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${statusColors[client.status]}`}>
                      {client.status}
                    </span>
                  </div>
                  
                  {/* Información de contacto */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-800">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="truncate font-medium">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center text-sm text-gray-700">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                          <Phone className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="font-medium">{client.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <span>Registrado: {client.registered}</span>
                    </div>
                  </div>
                  
                  {/* Estadísticas y acciones */}
                  <div className="flex items-center justify-between border-t border-blue-100 pt-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 mb-1">
                          <ShoppingBag className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="text-xs font-bold text-gray-800">{client.totalOrders}</div>
                        <div className="text-xs text-gray-500">Órdenes</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100 mb-1">
                          <Star className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="text-xs font-bold text-gray-800">{client.totalReviews}</div>
                        <div className="text-xs text-gray-500">Reviews</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 mb-1">
                          <MapPin className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="text-xs font-bold text-gray-800">{client.totalAddresses}</div>
                        <div className="text-xs text-gray-500">Direcciones</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/admin/clientes/${client.id}`} 
                        className="flex items-center justify-center w-10 h-10 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm" 
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button 
                        className="flex items-center justify-center w-10 h-10 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm" 
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {client.role !== 'ADMIN' && (
                        <button 
                          onClick={() => openDeleteModal(client.id, client.name)}
                          className="flex items-center justify-center w-10 h-10 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm" 
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Tabla responsive para tablets y desktop */}
            <div className="hidden sm:block bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <User className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Cliente</span>
                        </div>
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider hidden md:table-cell">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden lg:inline">Contacto</span>
                        </div>
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Estado</span>
                        </div>
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider hidden lg:table-cell">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden xl:inline">Actividad</span>
                        </div>
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider hidden xl:table-cell">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Última Orden</span>
                        </div>
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Acciones</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {filteredClients.map((client, index) => (
                      <tr key={client.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group">
                        <td className="px-3 sm:px-6 py-3 sm:py-5">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 sm:h-12 sm:w-12">
                              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <User className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                              </div>
                            </div>
                            <div className="ml-2 sm:ml-4">
                              <div className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate max-w-[120px] sm:max-w-none">{client.name}</div>
                              <div className="text-xs text-gray-600 font-medium sm:block hidden">ID: {client.id}</div>
                              <div className="text-xs sm:hidden">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  client.role === 'ADMIN' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {roleLabels[client.role]}
                                </span>
                              </div>
                              <div className="text-xs hidden sm:block">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  client.role === 'ADMIN' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {roleLabels[client.role]}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Información adicional para móvil en tablet */}
                          <div className="sm:hidden mt-2 space-y-1">
                            <div className="text-xs text-gray-600 truncate">{client.email}</div>
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-full shadow-sm ${statusColors[client.status]}`}>
                              <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                client.status === 'activo' ? 'bg-green-200' : 'bg-red-200'
                              }`}></div>
                              {client.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-5 hidden md:table-cell">
                          <div className="space-y-1 sm:space-y-2">
                            <div className="flex items-center text-xs sm:text-sm font-medium text-gray-900">
                              <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 mr-1 sm:mr-2" />
                              <span className="truncate max-w-[150px] lg:max-w-none">{client.email}</span>
                            </div>
                            {client.phone && (
                              <div className="flex items-center text-xs sm:text-sm text-gray-600">
                                <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1 sm:mr-2" />
                                {client.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-bold rounded-xl shadow-sm ${statusColors[client.status]}`}>
                            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 sm:mr-2 ${
                              client.status === 'activo' ? 'bg-green-200' : 'bg-red-200'
                            }`}></div>
                            <span className="hidden sm:inline">{client.status}</span>
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-5 hidden lg:table-cell">
                          <div className="space-y-1 sm:space-y-2">
                            <div className="flex items-center text-xs sm:text-sm font-medium text-gray-700">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 mr-1 sm:mr-2" />
                              <span className="hidden xl:inline">Registrado: </span>{client.registered}
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                              <div className="flex items-center">
                                <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 mr-1" />
                                <span className="font-bold text-orange-600">{client.totalOrders}</span>
                                <span className="ml-1 hidden xl:inline">órdenes</span>
                              </div>
                              <div className="flex items-center">
                                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mr-1" />
                                <span className="font-bold text-yellow-600">{client.totalReviews}</span>
                                <span className="ml-1 hidden xl:inline">reviews</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mr-1" />
                                <span className="font-bold text-red-600">{client.totalAddresses}</span>
                                <span className="ml-1 hidden xl:inline">direcciones</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-5 hidden xl:table-cell">
                          {client.lastOrder ? (
                            <div className="space-y-1">
                              <div className="text-xs sm:text-sm font-bold text-gray-900">
                                ${client.lastOrder.total.toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-600 font-medium">
                                {client.lastOrder.date} - {client.lastOrder.status}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs sm:text-sm text-gray-400 italic">Sin órdenes</span>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Link 
                              href={`/admin/clientes/${client.id}`} 
                              className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm" 
                              title="Ver detalles"
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Link>
                            <button 
                              className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm" 
                              title="Editar cliente"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            {client.role !== 'ADMIN' && (
                              <button 
                                onClick={() => openDeleteModal(client.id, client.name)}
                                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm" 
                                title="Eliminar cliente"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
    </div>
  );
}
