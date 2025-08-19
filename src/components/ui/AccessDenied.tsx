import React from 'react'
import { Lock, Shield, AlertTriangle, ArrowLeft } from 'lucide-react'
import { useAppStore } from '../../store'
import { usePermissionGuard } from '../../hooks/usePermissionGuard'

interface AccessDeniedProps {
  module: string
  requiredPermission?: string
  showBackButton?: boolean
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  module, 
  requiredPermission,
  showBackButton = true 
}) => {
  const user = useAppStore((state) => state.auth.user)
  const setCurrentModule = useAppStore((state) => state.setCurrentModule)
  const permissions = usePermissionGuard()

  const getModuleDisplayName = (moduleName: string) => {
    const moduleNames: Record<string, string> = {
      dashboard: 'Dashboard',
      empleados: 'Empleados',
      productos: 'Productos',
      clientes: 'Clientes',
      ventas: 'Ventas',
      caja: 'Caja',
      reportes: 'Reportes',
      calendario: 'Calendario'
    }
    return moduleNames[moduleName] || moduleName
  }

  const getAccessibleModules = () => {
    const accessibleModules = permissions.getAccessibleModules()
    return accessibleModules.filter(m => m !== module).slice(0, 3) // Mostrar máximo 3 módulos alternativos
  }

  const handleNavigateToModule = (targetModule: string) => {
    setCurrentModule(targetModule)
  }

  const accessibleModules = getAccessibleModules()

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif',
      backgroundColor: '#000000'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        backgroundColor: '#121212',
        borderRadius: '1rem',
        padding: '2rem',
        border: '1px solid #2C2C2C',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Icono principal */}
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 1.5rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #F44336'
        }}>
          <Lock size={40} style={{ color: '#F44336' }} />
        </div>

        {/* Título */}
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          color: '#FFFFFF',
          marginBottom: '0.5rem'
        }}>
          Acceso Denegado
        </h1>

        {/* Descripción */}
        <p style={{
          fontSize: '1rem',
          color: '#B0B0B0',
          marginBottom: '1.5rem',
          lineHeight: '1.6'
        }}>
          No tienes permisos para acceder al módulo{' '}
          <strong style={{ color: '#FFFFFF' }}>
            {getModuleDisplayName(module)}
          </strong>
          {requiredPermission && (
            <>
              {' '}con el permiso{' '}
              <strong style={{ color: '#FFFFFF' }}>
                {requiredPermission}
              </strong>
            </>
          )}
        </p>

        {/* Información del usuario */}
        {user && (
          <div style={{
            backgroundColor: '#1E1E1E',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            border: '1px solid #2C2C2C'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#2979FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: '#FFFFFF', fontWeight: '600', fontSize: '0.875rem' }}>
                  {user.nombre}
                </div>
                <div style={{ color: '#B0B0B0', fontSize: '0.75rem' }}>
                  Rol: {user.rol}
                </div>
              </div>
            </div>
            
            {user.permisos_modulos && user.permisos_modulos.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#B0B0B0' }}>
                Módulos permitidos: {user.permisos_modulos.map(m => getModuleDisplayName(m)).join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Módulos alternativos */}
        {accessibleModules.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{
              fontSize: '0.875rem',
              color: '#B0B0B0',
              marginBottom: '0.75rem'
            }}>
              Módulos a los que puedes acceder:
            </p>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {accessibleModules.map((moduleName) => (
                <button
                  key={moduleName}
                  onClick={() => handleNavigateToModule(moduleName)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#2979FF',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e6bff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2979FF'}
                >
                  {getModuleDisplayName(moduleName)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {showBackButton && accessibleModules.length > 0 && (
            <button
              onClick={() => {
                const firstModule = permissions.getFirstAvailableModule()
                setCurrentModule(firstModule)
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2979FF',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e6bff'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2979FF'}
            >
              <ArrowLeft size={16} />
              Ir al módulo principal
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#1E1E1E',
              color: '#FFFFFF',
              border: '1px solid #2C2C2C',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2C2C2C'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E1E1E'}
          >
            🔄 Refrescar
          </button>
        </div>

        {/* Información adicional */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          borderRadius: '0.5rem',
          border: '1px solid rgba(255, 152, 0, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <Shield size={16} style={{ color: '#FF9800' }} />
            <span style={{ color: '#FF9800', fontSize: '0.875rem', fontWeight: '500' }}>
              Información de Seguridad
            </span>
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#B0B0B0',
            margin: 0,
            lineHeight: '1.4'
          }}>
            Si crees que deberías tener acceso a este módulo, contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  )
}
