import React, { useState } from 'react'
import { useAppStore } from '../../store'
import { usePermissionGuard } from '../../hooks/usePermissionGuard'
import { useGlobalNavigation } from '../../hooks/useKeyboardShortcuts'
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
  X,
  Keyboard,
  Receipt
} from 'lucide-react'


const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#2979FF', shortcut: 'F1' },
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart, color: '#7C4DFF', shortcut: 'F2' },
  { id: 'facturacion', label: 'Facturación', icon: Receipt, color: '#E91E63', shortcut: 'F3' },
  { id: 'productos', label: 'Productos', icon: Package, color: '#2979FF', shortcut: 'F4' },
  { id: 'clientes', label: 'Clientes', icon: UserCheck, color: '#4CAF50', shortcut: 'F5' },
  { id: 'empleados', label: 'Empleados', icon: Users, color: '#7C4DFF', shortcut: 'F6' },
  { id: 'caja', label: 'Caja', icon: DollarSign, color: '#FF9800', shortcut: 'F7' },
  { id: 'reportes', label: 'Reportes', icon: BarChart3, color: '#2979FF', shortcut: 'F8' },
]

export const Sidebar: React.FC = () => {
  // Hooks
  const user = useAppStore((state) => state.auth.user)
  const logout = useAppStore((state) => state.logout)
  const currentModule = useAppStore((state) => state.ui.currentModule)
  const setCurrentModule = useAppStore((state) => state.setCurrentModule)
  const permissions = usePermissionGuard()
  
  // Activar navegación global con shortcuts
  useGlobalNavigation()
  
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-dark-bg-secondary rounded-lg shadow-dark-lg border border-dark-border hover:bg-dark-bg-tertiary transition-colors"
      >
        {isMobileOpen ? <X size={24} className="text-dark-text-primary" /> : <Menu size={24} className="text-dark-text-primary" />}
      </button>

      {/* Overlay para móviles */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-75 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-dark-bg-primary border-r border-dark-border z-50 
        w-[min(280px,85vw)] sm:w-[280px]
        flex flex-col shadow-dark-xl transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header del sidebar */}
        <div className="p-4 sm:p-8 pb-4 sm:pb-6 bg-gradient-to-br from-primary-500 to-secondary-500 text-white border-b border-dark-border">
          <div className="mb-3 sm:mb-4">
            <h1 className="text-lg sm:text-xl font-bold leading-tight tracking-tight text-white">
              Motorepuestos F.L.
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-semibold text-white shadow-glow-blue">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-base font-semibold mb-1 text-white">
                {user.nombre}
              </div>
              <div className="text-sm opacity-90 bg-white/20 px-2 py-1 rounded inline-block text-white">
                {user.rol}
              </div>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-3 sm:p-6 overflow-y-auto bg-dark-bg-primary">
          <div className="mb-4">
            <div className="text-xs font-semibold text-dark-text-secondary uppercase tracking-wider mb-3 pl-2">
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
                    w-full flex items-center justify-between px-4 py-3 text-left rounded-xl
                    transition-all duration-200 mb-2 font-medium text-sm relative group
                    ${isActive 
                      ? 'text-primary-500 bg-primary-500/20 font-semibold border border-primary-500/30 shadow-glow-blue' 
                      : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-tertiary hover:translate-x-1 border border-transparent'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-3/5 bg-primary-500 rounded-r shadow-glow-blue" />
                  )}
                  
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-5 h-5 flex items-center justify-center
                      ${isActive ? 'text-primary-500' : 'text-dark-text-secondary group-hover:text-dark-text-primary'}
                    `}>
                      <Icon size={20} />
                    </div>
                    <span>{item.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Footer del sidebar */}
        <div className="p-3 sm:p-6 border-t border-dark-border bg-dark-bg-primary">
          <div className="flex items-center gap-2 mb-4 p-3 bg-dark-bg-secondary rounded-lg border border-dark-border">
            <div className="w-2 h-2 rounded-full bg-success-500 shadow-glow-blue animate-pulse" />
            <span className="text-sm text-dark-text-primary">
              Sistema activo
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dark-border rounded-lg bg-dark-bg-secondary text-dark-text-primary hover:bg-dark-bg-tertiary hover:border-dark-border-light hover:text-white transition-all duration-200 text-sm font-medium shadow-dark-sm hover:shadow-dark-md"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  )
}
