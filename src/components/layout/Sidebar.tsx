import React from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  UserCheck, 
  ShoppingCart, 
  DollarSign, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'empleados', label: 'Empleados', icon: Users },
  { id: 'productos', label: 'Productos', icon: Package },
  { id: 'clientes', label: 'Clientes', icon: UserCheck },
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
  { id: 'caja', label: 'Caja', icon: DollarSign },
  { id: 'reportes', label: 'Reportes', icon: BarChart3 },
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const user = useAppStore((state) => state.auth.user)
  const currentModule = useAppStore((state) => state.ui.currentModule)
  const setCurrentModule = useAppStore((state) => state.setCurrentModule)
  const logout = useAppStore((state) => state.logout)
  const canAccessModule = useAppStore((state) => state.canAccessModule)
  const getUserPermissions = useAppStore((state) => state.getUserPermissions)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const userPermissions = user ? getUserPermissions(user.rol) : null

  // Filtrar elementos del menú según permisos del usuario
  const filteredMenuItems = menuItems.filter(item => {
    if (!user) return false
    return canAccessModule(user.rol, item.id)
  })

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Motorepuestos</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.nombre}
                  </p>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500 capitalize">
                      {user.rol}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentModule === item.id
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`
                    w-full justify-start space-x-3
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  onClick={() => setCurrentModule(item.id)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start space-x-3 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
