import React, { useState } from 'react'
import { useAppStore } from '../../store'
import { usePermissionGuard } from '../../hooks/usePermissionGuard'
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
  Shield,
  Menu,
  X
} from 'lucide-react'


const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#667eea' },
  { id: 'empleados', label: 'Empleados', icon: Users, color: '#f093fb' },
  { id: 'productos', label: 'Productos', icon: Package, color: '#4facfe' },
  { id: 'clientes', label: 'Clientes', icon: UserCheck, color: '#43e97b' },
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart, color: '#fa709a' },
  { id: 'caja', label: 'Caja', icon: DollarSign, color: '#ffecd2' },
  { id: 'reportes', label: 'Reportes', icon: BarChart3, color: '#a8edea' },
]

export const Sidebar: React.FC = () => {
  // Hooks
  const user = useAppStore((state) => state.auth.user)
  const logout = useAppStore((state) => state.logout)
  const currentModule = useAppStore((state) => state.ui.currentModule)
  const setCurrentModule = useAppStore((state) => state.setCurrentModule)
  const permissions = usePermissionGuard()
  
  // Estado para sidebar móvil
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      // Error en logout
    }
  }

  const addNotification = useAppStore((state) => state.addNotification)

  const handleMenuClick = (moduleId: string) => {
    // Verificar acceso antes de cambiar módulo (función síncrona)
    const navigationCheck = permissions.canNavigateTo(moduleId as any)
    
    if (navigationCheck.canNavigate) {
      // Navegación exitosa
      setCurrentModule(moduleId)
      
      // Cerrar sidebar móvil después de navegar
      setIsMobileOpen(false)
      
      // Notificación de éxito (opcional, solo para debug)
      if (process.env.NODE_ENV === 'development') {
        addNotification({
          id: Date.now().toString(),
          type: 'info',
          title: 'Navegación',
          message: `Accediendo a ${moduleId}`,
          duration: 2000
        })
      }
    } else {
      // Navegación denegada - mostrar notificación
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Acceso Denegado',
        message: navigationCheck.reason || `No tienes permisos para acceder a ${moduleId}`,
        duration: 5000
      })
      
      console.warn('Navegación denegada:', {
        module: moduleId,
        reason: navigationCheck.reason,
        user: user?.nombre,
        role: user?.rol
      })
    }
  }

  if (!user) return null

  // Filtrar módulos accesibles usando el sistema de permisos
  const accessibleModules = menuItems.filter(item => {
    return permissions.canAccess(item.id as any)
  })

  return (
    <>
      {/* Botón de toggle para móviles */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para móviles */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 
        w-[min(280px,85vw)] sm:w-[280px]
        flex flex-col shadow-xl transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header del sidebar */}
        <div className="p-4 sm:p-8 pb-4 sm:pb-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white border-b border-white/10">
          <div className="mb-3 sm:mb-4">
            <h1 className="text-lg sm:text-xl font-bold leading-tight tracking-tight">
              Motorepuestos F.L.
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-semibold">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-base font-semibold mb-1">
                {user.nombre}
              </div>
              <div className="text-sm opacity-90 bg-white/20 px-2 py-1 rounded inline-block">
                {user.rol}
              </div>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-3 sm:p-6 overflow-y-auto">
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 pl-2">
              Navegación
            </div>
            
            {accessibleModules.map((item) => {
              const Icon = item.icon
              const isActive = currentModule === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl
                    transition-all duration-200 mb-2 font-medium text-sm relative
                    ${isActive 
                      ? 'text-blue-600 bg-blue-50 font-semibold' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:translate-x-1'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-3/5 bg-blue-600 rounded-r" />
                  )}
                  <div className={`
                    w-5 h-5 flex items-center justify-center
                    ${isActive ? 'text-blue-600' : 'text-gray-400'}
                  `}>
                    <Icon size={20} />
                  </div>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Footer del sidebar */}
        <div className="p-3 sm:p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 mb-4 p-3 bg-white rounded-lg border border-gray-200">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">
              Sistema activo
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 transition-all duration-200 text-sm font-medium"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  )
}
