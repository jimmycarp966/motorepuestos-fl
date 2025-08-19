import React from 'react'
import { useAppStore } from '../../store'
import { usePermissionGuard } from '../../hooks/usePermissionGuard'
import { config } from '../../lib/config'

export const PermissionsDebug: React.FC = () => {
  const user = useAppStore((state) => state.auth.user)
  const permissions = usePermissionGuard()

  // Solo mostrar en modo debug
  if (!config.debug) {
    return null
  }

  if (!user) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg mb-4">
        <h3 className="font-bold text-yellow-800">🔐 Debug de Permisos</h3>
        <p className="text-yellow-700">Usuario no autenticado</p>
      </div>
    )
  }

  const modules = ['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'reportes'] as const

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
      <h3 className="font-bold text-blue-800 mb-2">🔐 Debug de Permisos - {user.nombre}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-blue-700 mb-2">Información del Usuario</h4>
          <div className="text-sm space-y-1">
            <p><strong>Rol:</strong> {user.rol}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Activo:</strong> {user.activo ? 'Sí' : 'No'}</p>
            <p><strong>Permisos específicos:</strong></p>
            <ul className="ml-4 list-disc">
              {user.permisos_modulos?.map(permiso => (
                <li key={permiso} className="text-green-600">{permiso}</li>
              )) || <li className="text-red-600">Ninguno</li>}
            </ul>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-blue-700 mb-2">Acceso a Módulos</h4>
          <div className="space-y-1">
            {modules.map(module => {
              const canAccess = permissions.canAccess(module)
              return (
                <div key={module} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{module}:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    canAccess 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {canAccess ? '✅ Acceso' : '❌ Denegado'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-100 rounded">
        <h4 className="font-semibold text-gray-700 mb-2">Módulos Accesibles</h4>
        <div className="flex flex-wrap gap-2">
          {permissions.getAccessibleModules().map(module => (
            <span key={module} className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs">
              {module}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
