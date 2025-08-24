'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  Home, 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  ShoppingBag,
  Users, 
  Settings,
  BarChart3,
  FileText,
  Ticket,
  ClipboardList,
  X,
  Upload,
  QrCode
} from 'lucide-react'

// Navegación completa para administradores
const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Productos', href: '/admin/productos', icon: Package },
  { name: 'Importación Masiva', href: '/admin/importacion-masiva', icon: Upload },
  { name: 'Etiquetas de Códigos', href: '/admin/etiquetas-codigos', icon: QrCode },
  { name: 'Inventario', href: '/admin/inventario', icon: TrendingUp },
  { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingCart },
  { name: 'Venta Física', href: '/admin/venta-fisica', icon: ShoppingBag },
  { name: 'Historial Ventas Físicas', href: '/admin/ventas-fisicas', icon: ClipboardList },
  { name: 'Clientes', href: '/admin/clientes', icon: Users },
  { name: 'Cupones', href: '/admin/cupones', icon: Ticket },
  { name: 'Reportes', href: '/admin/reportes', icon: BarChart3 },
  { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
]

// Navegación restringida para vendedores
const vendedorNavigation = [
  { name: 'Venta Física', href: '/admin/venta-fisica', icon: ShoppingBag },
]

interface AdminNavProps {
  onCloseMobile?: () => void;
}

export default function AdminNav({ onCloseMobile }: AdminNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  // Determinar qué navegación mostrar según el rol del usuario
  const navigation = session?.user?.role === 'VENDEDOR' ? vendedorNavigation : adminNavigation
  
  // Función para manejar clics en enlaces móviles
  const handleMobileClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  }

  return (
    <nav className="bg-white shadow-elegant border-r border-neutral-100 w-64 h-full overflow-y-auto">
      <div className="p-4 sm:p-6">
        {/* Mobile close button */}
        <div className="flex items-center justify-between lg:hidden mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-premium rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-neutral-700">
              {session?.user?.role === 'VENDEDOR' ? 'Bazar Ventas' : 'Bazar Admin'}
            </h1>
          </div>
          {onCloseMobile && (
            <button 
              onClick={onCloseMobile}
              className="p-1.5 sm:p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
        </div>
        <div className="hidden lg:flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-premium rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-700">
              {session?.user?.role === 'VENDEDOR' ? 'Bazar Ventas' : 'Bazar Admin'}
            </h1>
            <p className="text-xs text-neutral-500">
              {session?.user?.role === 'VENDEDOR' ? 'Panel de Ventas' : 'Panel de Control'}
            </p>
          </div>
        </div>

        <div className="space-y-1 sm:space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleMobileClick}
                className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-500'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-primary-600'
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </div>

        {/* Quick Actions - Solo visible para administradores */}
        {session?.user?.role === 'ADMIN' && (
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-neutral-100">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 sm:mb-3">
              Acciones Rápidas
            </h3>
            <div className="space-y-1 sm:space-y-2">
              <Link
                href="/admin/productos/nuevo"
                onClick={handleMobileClick}
                className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-primary-600 transition-colors"
              >
                <Package className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Nuevo Producto</span>
              </Link>
              <Link
                href="/admin/inventario"
                onClick={handleMobileClick}
                className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-primary-600 transition-colors"
              >
                <TrendingUp className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Ver Inventario</span>
              </Link>
            </div>
          </div>
        )}

        {/* User Info */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-neutral-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-secondary-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-neutral-700 truncate">
                {session?.user?.role === 'ADMIN' ? 'Administrador' : 'Vendedor'}
              </p>
              <p className="text-xs text-neutral-500 truncate">{session?.user?.email || ''}</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}