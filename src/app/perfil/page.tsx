"use client"

import { useSession, signOut } from 'next-auth/react'
import { log } from '@/lib/secureLogger'
import { useState, useEffect, useRef } from 'react'
import { FaUser, FaShoppingBag, FaMapMarkerAlt, FaCog, FaSignOutAlt, FaEdit, FaSave, FaTimes, FaPlus, FaTrash, FaCamera, FaPhone, FaEnvelope, FaCalendar, FaHeart, FaGift, FaShieldAlt, FaLock, FaBell, FaChevronRight, FaHistory, FaTag, FaUserShield, FaDownload } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import ChangePasswordModal from '@/components/ChangePasswordModal'
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal'

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  items: {
    id: string
    quantity: number
    price: number
    product: {
      name: string
      images: string[]
    }
  }[]
}

interface Address {
  id: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
  label?: string
}

export default function PerfilPage() {
  const { data: session, status } = useSession()
  const [tab, setTab] = useState<'perfil' | 'compras' | 'direcciones' | 'configuracion'>('perfil')
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    addressId: string | null;
    addressInfo: string;
  }>({
    isOpen: false,
    addressId: null,
    addressInfo: ''
  });
  
  // Estados para edición de perfil
  const [profileData, setProfileData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    avatar: ''
  })
  
  // Estado para nueva dirección
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'México',
    isDefault: false,
    label: 'Casa'
  })
  
  // Cargar datos del usuario
  useEffect(() => {
    if (session?.user) {
      fetchUserProfile()
      fetchOrders()
      fetchAddresses()
      fetchFavoritesCount()
    }
  }, [session])
  
  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: '',
        avatar: ''
      })
    }
  }, [session])
  
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        log.error('📥 Datos del perfil cargados:', data)
        setProfileData({
          name: data.name || session?.user?.name || '',
          email: data.email || session?.user?.email || '',
          phone: data.phone || '',
          avatar: data.avatar || ''
        })
      }
    } catch (error) {
      log.error('Error fetching user profile:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data || [])
      }
    } catch (error) {
      log.error('Error fetching orders:', error)
    }
  }
  
  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses')
      if (response.ok) {
        const data = await response.json()
        setAddresses(data || [])
      }
    } catch (error) {
      log.error('Error fetching addresses:', error)
    }
  }

  const fetchFavoritesCount = async () => {
    try {
      const response = await fetch('/api/favoritos')
      if (response.ok) {
        const data = await response.json()
        setFavoritesCount(data.length || 0)
      }
    } catch (error) {
      log.error('Error fetching favorites count:', error)
    }
  }
  
  const updateProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })
      
      if (response.ok) {
        toast.success('Perfil actualizado correctamente')
        setEditingProfile(false)
        // Disparar evento para actualizar el header
        window.dispatchEvent(new Event('profile-updated'))
      } else {
        toast.error('Error al actualizar el perfil')
      }
    } catch (error) {
      toast.error('Error al actualizar el perfil')
    }
    setLoading(false)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB')
      return
    }

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'avatars') // Especificar carpeta para avatars

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        log.error('✅ Imagen subida a Cloudflare:', data.url)
        
        const newProfileData = { ...profileData, avatar: data.url }
        setProfileData(newProfileData)
        
        // Guardar automáticamente la imagen en el perfil
        log.error('🔄 Guardando avatar en perfil:', newProfileData)
        const saveResponse = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProfileData)
        })
        
        if (saveResponse.ok) {
          const savedData = await saveResponse.json()
          log.error('✅ Avatar guardado en perfil:', savedData)
          toast.success('Imagen subida y guardada correctamente')
          // Recargar el perfil para actualizar el header
          fetchUserProfile()
          // Disparar evento para actualizar el header
          window.dispatchEvent(new Event('profile-updated'))
        } else {
          const errorData = await saveResponse.json()
          log.error('❌ Error al guardar avatar:', errorData)
          toast.error('Error al guardar la imagen en el perfil')
        }
      } else {
        toast.error('Error al subir imagen')
      }
    } catch (error) {
      log.error('Error:', error)
      toast.error('Error al subir imagen')
    }
    setUploadingImage(false)
  }

  const triggerImageUpload = () => {
    fileInputRef.current?.click()
  }
  
  const saveAddress = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress)
      })
      
      if (response.ok) {
        toast.success('Dirección guardada correctamente')
        setShowAddAddress(false)
        setNewAddress({ street: '', city: '', state: '', zipCode: '', country: 'México', isDefault: false, label: 'Casa' })
        fetchAddresses()
      } else {
        toast.error('Error al guardar la dirección')
      }
    } catch (error) {
      toast.error('Error al guardar la dirección')
    }
    setLoading(false)
  }
  
  const deleteAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Dirección eliminada correctamente')
        fetchAddresses()
      } else {
        toast.error('Error al eliminar la dirección')
      }
    } catch (error) {
      toast.error('Error al eliminar la dirección')
    }
  }

  const openDeleteModal = (addressId: string, addressInfo: string) => {
    setDeleteModal({
      isOpen: true,
      addressId,
      addressInfo
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      addressId: null,
      addressInfo: ''
    });
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      case 'PROCESSING': return 'text-blue-600 bg-blue-100'
      case 'SHIPPED': return 'text-purple-600 bg-purple-100'
      case 'DELIVERED': return 'text-green-600 bg-green-100'
      case 'CANCELLED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente'
      case 'PROCESSING': return 'Procesando'
      case 'SHIPPED': return 'Enviado'
      case 'DELIVERED': return 'Entregado'
      case 'CANCELLED': return 'Cancelado'
      default: return status
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-elegant">
        <div className="bg-white rounded-xl shadow-elegant p-8 w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-neutral-700">Acceso restringido</h2>
          <p className="text-neutral-600 mb-6">Debes iniciar sesión para ver tu perfil.</p>
          <a href="/login" className="btn-primary py-2 px-6 rounded-lg font-medium">Iniciar sesión</a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
          {/* Header mejorado */}
          <div className="bg-gradient-to-r from-red-700 via-primary-700 to-blue-700 px-8 py-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Mi perfil</h1>
                  <p className="text-primary-100 text-lg">Gestiona tu información personal y preferencias</p>
                </div>
                <div className="hidden md:flex items-center gap-4 text-primary-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{orders.length}</div>
                    <div className="text-sm">Pedidos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{addresses.length}</div>
                    <div className="text-sm">Direcciones</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-8">
          {/* Navegación mejorada */}
          <div className="border-b border-neutral-200 mb-8">
            <div className="flex flex-wrap gap-1">
              <button onClick={() => setTab('perfil')} className={`flex items-center gap-2 px-6 py-3 font-medium transition-all duration-200 border-b-2 ${tab === 'perfil' ? 'border-primary-600 text-primary-700 bg-primary-50' : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'}`}><FaUser /> Datos personales</button>
              <button onClick={() => setTab('compras')} className={`flex items-center gap-2 px-6 py-3 font-medium transition-all duration-200 border-b-2 ${tab === 'compras' ? 'border-primary-600 text-primary-700 bg-primary-50' : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'}`}><FaShoppingBag /> Mis pedidos</button>
              <button onClick={() => setTab('direcciones')} className={`flex items-center gap-2 px-6 py-3 font-medium transition-all duration-200 border-b-2 ${tab === 'direcciones' ? 'border-primary-600 text-primary-700 bg-primary-50' : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'}`}><FaMapMarkerAlt /> Direcciones</button>
              <button onClick={() => setTab('configuracion')} className={`flex items-center gap-2 px-6 py-3 font-medium transition-all duration-200 border-b-2 ${tab === 'configuracion' ? 'border-primary-600 text-primary-700 bg-primary-50' : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'}`}><FaCog /> Configuración</button>
              <button onClick={() => signOut()} className="ml-auto flex items-center gap-2 px-6 py-3 font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 rounded-t-lg"><FaSignOutAlt /> Cerrar sesión</button>
            </div>
          </div>

          {/* Sección de datos personales mejorada */}
          {tab === 'perfil' && (
            <div>
              <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-xl p-6 mb-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center border-4 border-white shadow-lg">
                      {profileData.avatar ? (
                        <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <FaUser className="text-3xl text-primary-600" />
                      )}
                    </div>
                    <button
                      onClick={triggerImageUpload}
                      disabled={uploadingImage}
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors shadow-lg"
                      title="Cambiar foto"
                    >
                      {uploadingImage ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FaCamera className="text-xs" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="text-2xl font-bold text-neutral-800 mb-1">{session.user?.name}</div>
                    <div className="text-neutral-600 mb-2 flex items-center justify-center md:justify-start gap-2">
                      <FaEnvelope className="text-sm" />
                      {session.user?.email}
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-neutral-500">
                      <div className="flex items-center gap-1">
                        <FaCalendar />
                        Miembro desde {formatDate(new Date().toISOString())}
                      </div>
                      {profileData.phone && (
                        <div className="flex items-center gap-1">
                          <FaPhone />
                          {profileData.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-white text-primary-700 border-2 border-primary-200 hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 shadow-sm"
                  >
                    {editingProfile ? <FaTimes /> : <FaEdit />}
                    {editingProfile ? 'Cancelar' : 'Editar perfil'}
                  </button>
                </div>
              </div>
              
              {editingProfile ? (
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-6">Editar información personal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-neutral-700 font-medium mb-2">Nombre completo</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-700 font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-700 font-medium mb-2">Teléfono</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
                        placeholder="+52 123 456 7890"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={updateProfile}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-green-600 text-white hover:bg-green-600 disabled:opacity-50 transition-all duration-200 shadow-sm"
                    >
                      <FaSave /> {loading ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="px-6 py-3 rounded-lg font-medium bg-black text-white hover:bg-red-600 transition-all duration-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaUser className="text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-neutral-800">Información personal</h4>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div><span className="font-medium text-neutral-600">Nombre:</span> <span className="text-neutral-800">{session.user?.name}</span></div>
                      <div><span className="font-medium text-neutral-600">Email:</span> <span className="text-neutral-800">{session.user?.email}</span></div>
                      {profileData.phone && <div><span className="font-medium text-neutral-600">Teléfono:</span> <span className="text-neutral-800">{profileData.phone}</span></div>}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FaShieldAlt className="text-green-600" />
                      </div>
                      <h4 className="font-semibold text-neutral-800">Cuenta</h4>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div><span className="font-medium text-neutral-600">Estado:</span> <span className="text-green-600 font-medium">Activa</span></div>
                      <div><span className="font-medium text-neutral-600">Miembro desde:</span> <span className="text-neutral-800">{formatDate(new Date().toISOString())}</span></div>
                      <div><span className="font-medium text-neutral-600">Último acceso:</span> <span className="text-neutral-800">Hoy</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FaHeart className="text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-neutral-800">Actividad</h4>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div><span className="font-medium text-neutral-600">Pedidos totales:</span> <span className="text-neutral-800">{orders.length}</span></div>
                      <div><span className="font-medium text-neutral-600">Direcciones:</span> <span className="text-neutral-800">{addresses.length}</span></div>
                      <div><span className="font-medium text-neutral-600">Favoritos:</span> <span className="text-neutral-800">{favoritesCount}</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sección de pedidos */}
          {tab === 'compras' && (
            <div>
              <h3 className="text-lg font-bold mb-4 text-neutral-700">Historial de pedidos</h3>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <FaShoppingBag className="text-4xl text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-500 mb-4">No tienes pedidos registrados.</p>
                  <a href="/" className="btn-primary py-2 px-6 rounded-lg font-medium">Explorar productos</a>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-neutral-700">Pedido #{order.id.slice(-8)}</div>
                          <div className="text-sm text-neutral-500">{formatDate(order.createdAt)}</div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </div>
                          <div className="text-lg font-semibold text-neutral-700 mt-1">${order.total.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 text-sm">
                            <img 
                              src={item.product.images[0] || '/img/placeholder.png'} 
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium">{item.product.name}</div>
                              <div className="text-neutral-500">Cantidad: {item.quantity} × ${item.price.toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sección de direcciones mejorada */}
           {tab === 'direcciones' && (
             <div>
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                 <div>
                   <h3 className="text-2xl font-bold text-neutral-800">Mis direcciones</h3>
                   <p className="text-neutral-600">Gestiona tus direcciones de envío y facturación</p>
                 </div>
                 <button
                   onClick={() => setShowAddAddress(true)}
                   className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-red-600 text-white hover:bg-primary-700 transition-all duration-200 shadow-sm"
                 >
                   <FaPlus /> Agregar dirección
                 </button>
               </div>
               
               {showAddAddress && (
                 <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6 shadow-sm">
                   <h4 className="text-lg font-semibold text-neutral-800 mb-6">Nueva dirección</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <div>
                       <label className="block text-neutral-700 font-medium mb-2">Etiqueta</label>
                       <select
                         value={newAddress.label}
                         onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                         className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
                       >
                         <option value="Casa">🏠 Casa</option>
                         <option value="Trabajo">🏢 Trabajo</option>
                         <option value="Otro">📍 Otro</option>
                       </select>
                     </div>
                     <div className="md:col-span-2">
                       <label className="block text-neutral-700 font-medium mb-2">Dirección completa</label>
                       <input
                         type="text"
                         value={newAddress.street}
                         onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                         className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
                         placeholder="Calle, número, colonia, referencias"
                       />
                     </div>
                     <div>
                       <label className="block text-neutral-700 font-medium mb-2">Ciudad</label>
                       <input
                         type="text"
                         value={newAddress.city}
                         onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                         className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
                         placeholder="Ciudad"
                       />
                     </div>
                     <div>
                       <label className="block text-neutral-700 font-medium mb-2">Estado</label>
                       <input
                         type="text"
                         value={newAddress.state}
                         onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                         className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
                         placeholder="Estado"
                       />
                     </div>
                     <div>
                       <label className="block text-neutral-700 font-medium mb-2">Código postal</label>
                       <input
                         type="text"
                         value={newAddress.zipCode}
                         onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                         className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
                         placeholder="12345"
                       />
                     </div>
                     <div>
                       <label className="block text-neutral-700 font-medium mb-2">País</label>
                       <select
                         value={newAddress.country}
                         onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                         className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
                       >
                         <option value="México">🇲🇽 México</option>
                         <option value="Estados Unidos">🇺🇸 Estados Unidos</option>
                         <option value="Canadá">🇨🇦 Canadá</option>
                       </select>
                     </div>
                   </div>
                   <div className="flex items-center gap-3 mt-6 p-4 bg-neutral-50 rounded-lg">
                     <input
                       type="checkbox"
                       id="isDefault"
                       checked={newAddress.isDefault}
                       onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                       className="w-4 h-4 text-primary-600 rounded focus:ring-primary-300"
                     />
                     <label htmlFor="isDefault" className="text-neutral-700 font-medium">Establecer como dirección predeterminada</label>
                   </div>
                   <div className="flex gap-3 mt-6">
                     <button
                       onClick={saveAddress}
                       disabled={loading}
                       className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-green-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-all duration-200 shadow-sm"
                     >
                       <FaSave /> {loading ? 'Guardando...' : 'Guardar dirección'}
                     </button>
                     <button
                       onClick={() => setShowAddAddress(false)}
                       className="px-6 py-3 rounded-lg font-medium bg-black text-white hover:bg-red-600 transition-all duration-200"
                     >
                       Cancelar
                     </button>
                   </div>
                 </div>
               )}
               
               {addresses.length === 0 ? (
                 <div className="text-center py-12 bg-neutral-50 rounded-xl">
                   <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                     <FaMapMarkerAlt className="text-2xl text-neutral-400" />
                   </div>
                   <h4 className="text-lg font-semibold text-neutral-700 mb-2">No tienes direcciones guardadas</h4>
                   <p className="text-neutral-500 mb-6">Agrega tu primera dirección para facilitar tus compras</p>
                   <button
                     onClick={() => setShowAddAddress(true)}
                     className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-red-600 text-white hover:bg-primary-700 transition-colors"
                   >
                     <FaPlus /> Agregar dirección
                   </button>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {addresses.map((address) => (
                     <div key={address.id} className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                       <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                             <FaMapMarkerAlt className="text-primary-600" />
                           </div>
                           <div>
                             <div className="font-semibold text-neutral-800">{address.label || 'Dirección'}</div>
                             {address.isDefault && (
                               <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                 ✓ Predeterminada
                               </span>
                             )}
                           </div>
                         </div>
                         <button
                           onClick={() => openDeleteModal(address.id, `${address.street}, ${address.city}`)}
                           className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                           title="Eliminar dirección"
                         >
                           <FaTrash />
                         </button>
                       </div>
                       <div className="text-neutral-700 space-y-1">
                         <div className="font-medium">{address.street}</div>
                         <div>{address.city}, {address.state} {address.zipCode}</div>
                         <div className="text-neutral-500">{address.country}</div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           )}

          {/* Sección de configuración mejorada */}
          {tab === 'configuracion' && (
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-neutral-800">Configuración</h3>
                <p className="text-neutral-600">Gestiona tu cuenta y preferencias</p>
              </div>
              
              <div className="space-y-6">
                {/* Seguridad */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <FaShieldAlt className="text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-800">Seguridad</h4>
                      <p className="text-sm text-neutral-600">Protege tu cuenta</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                                         <button 
                       onClick={() => setShowChangePassword(true)}
                       className="flex items-center justify-between w-full p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-all duration-200 group"
                     >
                       <div className="flex items-center gap-3">
                         <FaLock className="text-neutral-600 group-hover:text-primary-600 transition-colors" />
                         <div className="text-left">
                           <div className="font-medium text-neutral-700">Cambiar contraseña</div>
                           <div className="text-sm text-neutral-500">Actualiza tu contraseña regularmente</div>
                         </div>
                       </div>
                       <FaChevronRight className="text-neutral-400 group-hover:text-primary-600 transition-colors" />
                     </button>
                     <button className="flex items-center justify-between w-full p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-all duration-200 group">
                       <div className="flex items-center gap-3">
                         <FaShieldAlt className="text-neutral-600 group-hover:text-primary-600 transition-colors" />
                         <div className="text-left">
                           <div className="font-medium text-neutral-700">Autenticación de dos factores</div>
                           <div className="text-sm text-neutral-500">Agrega una capa extra de seguridad</div>
                         </div>
                       </div>
                       <FaChevronRight className="text-neutral-400 group-hover:text-primary-600 transition-colors" />
                     </button>
                     <button className="flex items-center justify-between w-full p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-all duration-200 group">
                       <div className="flex items-center gap-3">
                         <FaHistory className="text-neutral-600 group-hover:text-primary-600 transition-colors" />
                         <div className="text-left">
                           <div className="font-medium text-neutral-700">Historial de sesiones</div>
                           <div className="text-sm text-neutral-500">Ve dónde has iniciado sesión</div>
                         </div>
                       </div>
                       <FaChevronRight className="text-neutral-400 group-hover:text-primary-600 transition-colors" />
                     </button>
                  </div>
                </div>
                
                {/* Notificaciones */}
                 <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                   <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                       <FaBell className="text-blue-600" />
                     </div>
                     <div>
                       <h4 className="text-lg font-semibold text-neutral-800">Notificaciones</h4>
                       <p className="text-sm text-neutral-600">Controla cómo te contactamos</p>
                     </div>
                   </div>
                   <div className="space-y-6">
                     <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                       <div className="flex items-center gap-3">
                         <FaEnvelope className="text-neutral-600" />
                         <div>
                           <div className="font-medium text-neutral-700">Notificaciones por email</div>
                           <div className="text-sm text-neutral-500">Recibe actualizaciones de pedidos</div>
                         </div>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" className="sr-only peer" defaultChecked />
                         <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                       </label>
                     </div>
                     <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                       <div className="flex items-center gap-3">
                         <FaBell className="text-neutral-600" />
                         <div>
                           <div className="font-medium text-neutral-700">Notificaciones push</div>
                           <div className="text-sm text-neutral-500">Alertas instantáneas en tu dispositivo</div>
                         </div>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" className="sr-only peer" />
                         <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                       </label>
                     </div>
                     <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                       <div className="flex items-center gap-3">
                         <FaTag className="text-neutral-600" />
                         <div>
                           <div className="font-medium text-neutral-700">Ofertas y promociones</div>
                           <div className="text-sm text-neutral-500">Recibe descuentos exclusivos</div>
                         </div>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" className="sr-only peer" defaultChecked />
                         <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                       </label>
                     </div>
                   </div>
                 </div>
                
                {/* Privacidad */}
                 <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                   <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                       <FaUserShield className="text-green-600" />
                     </div>
                     <div>
                       <h4 className="text-lg font-semibold text-neutral-800">Privacidad</h4>
                       <p className="text-sm text-neutral-600">Controla tu información personal</p>
                     </div>
                   </div>
                   <div className="space-y-4">
                     <button className="flex items-center justify-between w-full p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-all duration-200 group">
                       <div className="flex items-center gap-3">
                         <FaDownload className="text-neutral-600 group-hover:text-primary-600 transition-colors" />
                         <div className="text-left">
                           <div className="font-medium text-neutral-700">Descargar mis datos</div>
                           <div className="text-sm text-neutral-500">Obtén una copia de tu información</div>
                         </div>
                       </div>
                       <FaChevronRight className="text-neutral-400 group-hover:text-primary-600 transition-colors" />
                     </button>
                     <button className="flex items-center justify-between w-full p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 group">
                       <div className="flex items-center gap-3">
                         <FaTrash className="text-red-600" />
                         <div className="text-left">
                           <div className="font-medium text-red-700">Eliminar cuenta</div>
                           <div className="text-sm text-red-500">Esta acción no se puede deshacer</div>
                         </div>
                       </div>
                       <FaChevronRight className="text-red-400" />
                     </button>
                   </div>
                 </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Modal de cambio de contraseña */}
      <ChangePasswordModal 
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => {
          if (deleteModal.addressId) {
            deleteAddress(deleteModal.addressId);
          }
        }}
        title="Eliminar Dirección"
        message="¿Estás seguro de que quieres eliminar esta dirección? Esta acción no se puede deshacer."
        itemName={deleteModal.addressInfo}
      />
    </main>
  )
}