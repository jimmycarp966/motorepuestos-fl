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
  X
} from 'lucide-react'
import { canAccessModule } from '../../store/slices/empleadosSlice'

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
  const logout = useAppStore((state) => state.logout)
  const sidebarOpen = useAppStore((state) => state.ui.sidebarOpen)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)

  const handleLogout = async () => {
    await logout()
  }

  const handleMenuClick = (moduleId: string) => {
    // Aquí se manejaría la navegación
    console.log(`Navegando a: ${moduleId}`)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  if (!user) return null

  const accessibleModules = menuItems.filter(item => 
    canAccessModule(user.rol, item.id)
  )

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-auto
        w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Motorepuestos F.L.</h1>
              <p className="text-sm text-gray-500">{user.nombre}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {accessibleModules.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="mb-2">
              <span className="text-xs text-gray-500">Rol:</span>
              <span className="ml-1 text-sm font-medium capitalize">{user.rol}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden"
      >
        <Menu className="w-5 h-5" />
      </Button>
    </>
  )
}
