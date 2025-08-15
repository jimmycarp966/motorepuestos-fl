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

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
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
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100%',
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        zIndex: 50,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        width: '256px',
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            borderBottom: '1px solid #e5e7eb',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Motorepuestos F.L.</h1>
              <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>{user.nombre}</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, padding: '1rem' }}>
            {accessibleModules.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    textAlign: 'left',
                    color: '#374151',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div style={{
            padding: '1rem',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Rol:</span>
              <span style={{ 
                marginLeft: '0.25rem', 
                fontSize: '0.875rem', 
                fontWeight: '500',
                textTransform: 'capitalize',
                color: '#667eea'
              }}>{user.rol}</span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                e.currentTarget.style.borderColor = '#9ca3af'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white'
                e.currentTarget.style.borderColor = '#d1d5db'
              }}
            >
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 50,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '0.375rem',
          padding: '0.5rem',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Menu size={20} />
      </button>
    </>
  )
}
