'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Settings,
  BarChart3,
  FileText
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Productos', href: '/admin/productos', icon: Package },
  { name: 'Inventario', href: '/admin/inventario', icon: TrendingUp },
  { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingCart },
  { name: 'Clientes', href: '/admin/clientes', icon: Users },
  { name: 'Reportes', href: '/admin/reportes', icon: BarChart3 },
  { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-elegant border-r border-neutral-100 w-64 min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-premium rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-700">Bazar Admin</h1>
            <p className="text-xs text-neutral-500">Panel de Control</p>
          </div>
        </div>

        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-500'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-primary-600'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-neutral-100">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Acciones Rápidas
          </h3>
          <div className="space-y-2">
            <Link
              href="/admin/productos/nuevo"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-primary-600 transition-colors"
            >
              <Package className="h-4 w-4" />
              Nuevo Producto
            </Link>
            <Link
              href="/admin/inventario"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-primary-600 transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              Ver Inventario
            </Link>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-8 pt-6 border-t border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-secondary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">Administrador</p>
              <p className="text-xs text-neutral-500">admin@bazar.com</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 