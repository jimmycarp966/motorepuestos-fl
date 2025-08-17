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
  Calendar,
  BarChart3, 
  LogOut
} from 'lucide-react'
import { useDebug } from '../../hooks/useDebug'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#667eea' },
  { id: 'empleados', label: 'Empleados', icon: Users, color: '#f093fb' },
  { id: 'productos', label: 'Productos', icon: Package, color: '#4facfe' },
  { id: 'clientes', label: 'Clientes', icon: UserCheck, color: '#43e97b' },
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart, color: '#fa709a' },
  { id: 'caja', label: 'Caja', icon: DollarSign, color: '#ffecd2' },
  { id: 'calendario', label: 'Calendario', icon: Calendar, color: '#a8edea' },
  { id: 'reportes', label: 'Reportes', icon: BarChart3, color: '#a8edea' },
]

export const Sidebar: React.FC = () => {
  // Registrar componente para debug
  const { logError, logInfo } = useDebug({ componentName: 'Sidebar' })
  
  const user = useAppStore((state) => state.auth.user)
  const logout = useAppStore((state) => state.logout)
  const currentModule = useAppStore((state) => state.ui.currentModule)
  const setCurrentModule = useAppStore((state) => state.setCurrentModule)

  const handleLogout = async () => {
    try {
      logInfo('Intentando logout')
      await logout()
      logInfo('Logout exitoso')
    } catch (error) {
      logError(error, 'Error en logout')
    }
  }

  const handleMenuClick = (moduleId: string) => {
    logInfo('Cambiando módulo', { from: currentModule, to: moduleId })
    setCurrentModule(moduleId)
  }

  if (!user) return null

  // Lógica de permisos basada en permisos específicos del usuario
  const accessibleModules = menuItems.filter(item => {
    // Usar los permisos específicos asignados al usuario (siempre)
    return user.permisos_modulos?.includes(item.id) || false
  })

  // Debug: Log de módulos accesibles
  logInfo('Módulos accesibles', { 
    total: accessibleModules.length, 
    modules: accessibleModules.map(m => m.id),
    userRol: user.rol
  })

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100%',
      backgroundColor: 'white',
      borderRight: '1px solid #e2e8f0',
      zIndex: 50,
      width: '280px',
      boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column'
    }}>
        {/* Header del sidebar */}
        <div style={{
          padding: '2rem 1.5rem 1.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700',
              margin: 0,
              letterSpacing: '-0.025em'
            }}>
              Motorepuestos F.L.
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                {user.nombre}
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                opacity: 0.9,
                background: 'rgba(255,255,255,0.2)',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                display: 'inline-block'
              }}>
                {user.rol}
              </div>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav style={{ 
          flex: 1, 
          padding: '1.5rem 1rem',
          overflowY: 'auto'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ 
              fontSize: '0.75rem', 
              fontWeight: '600', 
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
              paddingLeft: '0.5rem'
            }}>
              Navegación ({accessibleModules.length} módulos)
            </div>
            
            {accessibleModules.map((item) => {
              const Icon = item.icon
              const isActive = currentModule === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    textAlign: 'left',
                    color: isActive ? '#667eea' : '#64748b',
                    borderRadius: '0.75rem',
                    border: 'none',
                    background: isActive ? '#f1f5f9' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: '0.5rem',
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '0.875rem',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#f8fafc'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }
                  }}
                >
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '4px',
                      height: '60%',
                      backgroundColor: '#667eea',
                      borderRadius: '0 2px 2px 0'
                    }} />
                  )}
                  <div style={{
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? '#667eea' : '#94a3b8'
                  }}>
                    <Icon size={20} />
                  </div>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Footer del sidebar */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981'
            }} />
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Sistema activo
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              backgroundColor: 'white',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9'
              e.currentTarget.style.borderColor = '#cbd5e1'
              e.currentTarget.style.color = '#475569'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.color = '#64748b'
            }}
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </div>
  )
}
