import { useCallback, useMemo } from 'react'
import { useAppStore } from '../store'
import { config } from '../lib/config'
import { AuditLogger } from '../lib/auditLogger'
import { supabase } from '../lib/supabase'
import type { AuthenticatedUser } from '../store/types'

// Tipos para sistema de permisos
export type ModuleName = 
  | 'dashboard' 
  | 'empleados' 
  | 'productos' 
  | 'clientes' 
  | 'ventas' 
  | 'caja' 
  | 'calendario' 
  | 'reportes'

export type Permission = 'read' | 'create' | 'update' | 'delete' | 'manage'

export interface PermissionCheck {
  hasPermission: boolean
  reason?: string
  redirectTo?: string
}

export interface UserPermissions {
  canAccess: (module: ModuleName) => boolean
  canPerform: (module: ModuleName, permission: Permission) => boolean
  checkModuleAccess: (module: ModuleName) => PermissionCheck
  getAccessibleModules: () => ModuleName[]
  isAdmin: boolean
  isManager: boolean
  currentUser: AuthenticatedUser | null
}

// Mapeo de roles a permisos granulares
const ROLE_PERMISSIONS: Record<string, Record<ModuleName, Permission[]>> = {
  Administrador: {
    dashboard: ['read'],
    empleados: ['read', 'create', 'update', 'delete', 'manage'],
    productos: ['read', 'create', 'update', 'delete', 'manage'],
    clientes: ['read', 'create', 'update', 'delete', 'manage'],
    ventas: ['read', 'create', 'update', 'delete', 'manage'],
    caja: ['read', 'create', 'update', 'delete', 'manage'],
    calendario: ['read', 'create', 'update', 'delete'],
    reportes: ['read', 'create', 'manage']
  },
  Gerente: {
    dashboard: ['read'],
    empleados: ['read', 'create', 'update'],
    productos: ['read', 'create', 'update', 'delete'],
    clientes: ['read', 'create', 'update', 'delete'],
    ventas: ['read', 'create', 'update', 'delete'],
    caja: ['read', 'create', 'update', 'manage'],
    calendario: ['read', 'create', 'update'],
    reportes: ['read', 'create']
  },
  Vendedor: {
    dashboard: ['read'],
    empleados: [],
    productos: ['read'],
    clientes: ['read', 'create', 'update'],
    ventas: ['read', 'create'],
    caja: ['read'],
    calendario: ['read', 'create'],
    reportes: []
  },
  Técnico: {
    dashboard: ['read'],
    empleados: [],
    productos: ['read', 'create', 'update'],
    clientes: ['read'],
    ventas: [],
    caja: [],
    calendario: ['read'],
    reportes: []
  },
  Almacén: {
    dashboard: ['read'],
    empleados: [],
    productos: ['read', 'create', 'update'],
    clientes: [],
    ventas: [],
    caja: [],
    calendario: ['read'],
    reportes: []
  },
  Cajero: {
    dashboard: ['read'],
    empleados: [],
    productos: ['read'],
    clientes: ['read'],
    ventas: ['read', 'create'],
    caja: ['read', 'create', 'update'],
    calendario: ['read'],
    reportes: []
  }
}

// Hook principal para manejo de permisos
export function usePermissionGuard(): UserPermissions {
  const user = useAppStore((state) => state.auth.user)
  const session = useAppStore((state) => state.auth.session)

  // Verificar si el usuario está autenticado
  const isAuthenticated = useMemo(() => {
    return !!(user && session && user.activo)
  }, [user, session])

  // Obtener permisos del rol del usuario
  const rolePermissions = useMemo(() => {
    if (!user || !isAuthenticated) return {}
    return ROLE_PERMISSIONS[user.rol] || {}
  }, [user, isAuthenticated])

  // Verificar acceso a módulo
  const canAccess = useCallback((module: ModuleName): boolean => {
    if (!isAuthenticated || !user) return false
    
    // En modo estricto, usar solo rolePermissions
    if (config.strictRoles) {
      const permissions = rolePermissions[module] || []
      return permissions.length > 0
    }
    
    // Modo legacy: usar también permisos específicos del usuario
    const hasModuleInPermissions = user.permisos_modulos?.includes(module) || false
    const hasRolePermissions = (rolePermissions[module] || []).length > 0
    
    return hasModuleInPermissions || hasRolePermissions
  }, [isAuthenticated, user, rolePermissions])

  // Verificar permiso específico
  const canPerform = useCallback((module: ModuleName, permission: Permission): boolean => {
    if (!canAccess(module)) return false
    
    const permissions = rolePermissions[module] || []
    
    // 'manage' incluye todos los permisos
    if (permissions.includes('manage')) return true
    
    return permissions.includes(permission)
  }, [canAccess, rolePermissions])

  // Verificación completa de acceso a módulo con auditoría
  const checkModuleAccess = useCallback(async (module: ModuleName): Promise<PermissionCheck> => {
    // Log del intento de acceso
    AuditLogger.logAction('module_access_attempt', {
      module,
      userId: user?.id,
      userRole: user?.rol,
      isAuthenticated
    })

    if (!isAuthenticated) {
      AuditLogger.logAction('access_denied_unauthenticated', { module })
      
      // Registrar en base de datos si es posible
      try {
        await supabase.rpc('audit_log_module_access', {
          modulo_param: module,
          accion_param: 'access',
          resultado_param: 'denegado',
          razon_denegacion_param: 'Usuario no autenticado'
        })
      } catch (error) {
        console.warn('No se pudo registrar auditoría de acceso:', error)
      }

      return {
        hasPermission: false,
        reason: 'Usuario no autenticado',
        redirectTo: '/login'
      }
    }

    if (!user) {
      AuditLogger.logAction('access_denied_no_user_data', { module })
      return {
        hasPermission: false,
        reason: 'Datos de usuario no disponibles',
        redirectTo: '/login'
      }
    }

    if (!user.activo) {
      AuditLogger.logAction('access_denied_inactive_user', { 
        module, 
        userId: user.id,
        userRole: user.rol 
      })
      
      try {
        await supabase.rpc('audit_log_module_access', {
          modulo_param: module,
          accion_param: 'access',
          resultado_param: 'denegado',
          razon_denegacion_param: 'Usuario inactivo'
        })
      } catch (error) {
        console.warn('No se pudo registrar auditoría de acceso:', error)
      }

      return {
        hasPermission: false,
        reason: 'Usuario inactivo',
        redirectTo: '/unauthorized'
      }
    }

    if (!canAccess(module)) {
      AuditLogger.logAction('access_denied_insufficient_permissions', { 
        module, 
        userId: user.id,
        userRole: user.rol,
        userPermissions: user.permisos_modulos
      })
      
      try {
        await supabase.rpc('audit_log_module_access', {
          modulo_param: module,
          accion_param: 'access',
          resultado_param: 'denegado',
          razon_denegacion_param: `Sin permisos para módulo ${module}`
        })
      } catch (error) {
        console.warn('No se pudo registrar auditoría de acceso:', error)
      }

      return {
        hasPermission: false,
        reason: `Sin permisos para acceder al módulo ${module}`,
        redirectTo: '/dashboard'
      }
    }

    // Acceso permitido - registrar éxito
    AuditLogger.logSuccess('module_access_granted', {
      module,
      userId: user.id,
      userRole: user.rol
    })

    try {
      await supabase.rpc('audit_log_module_access', {
        modulo_param: module,
        accion_param: 'access',
        resultado_param: 'permitido'
      })
    } catch (error) {
      console.warn('No se pudo registrar auditoría de acceso exitoso:', error)
    }

    return {
      hasPermission: true
    }
  }, [isAuthenticated, user, canAccess])

  // Obtener módulos accesibles
  const getAccessibleModules = useCallback((): ModuleName[] => {
    if (!isAuthenticated) return []
    
    const modules: ModuleName[] = [
      'dashboard', 'empleados', 'productos', 'clientes', 
      'ventas', 'caja', 'calendario', 'reportes'
    ]
    
    return modules.filter(module => canAccess(module))
  }, [isAuthenticated, canAccess])

  // Verificaciones de rol específicas
  const isAdmin = useMemo(() => user?.rol === 'Administrador', [user])
  const isManager = useMemo(() => user?.rol === 'Gerente' || isAdmin, [user, isAdmin])

  return {
    canAccess,
    canPerform,
    checkModuleAccess,
    getAccessibleModules,
    isAdmin,
    isManager,
    currentUser: user
  }
}

// Hook para guards de ruta
export function useRouteGuard(requiredModule: ModuleName, requiredPermission?: Permission) {
  const permissions = usePermissionGuard()
  const addNotification = useAppStore((state) => state.addNotification)

  const checkAccess = useCallback(() => {
    const moduleCheck = permissions.checkModuleAccess(requiredModule)
    
    if (!moduleCheck.hasPermission) {
      // Notificar acceso denegado
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Acceso Denegado',
        message: moduleCheck.reason || 'No tienes permisos para acceder a esta sección',
        duration: 5000
      })
      
      return moduleCheck
    }

    // Verificar permiso específico si se requiere
    if (requiredPermission && !permissions.canPerform(requiredModule, requiredPermission)) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Acción No Permitida',
        message: `No tienes permisos para ${requiredPermission} en ${requiredModule}`,
        duration: 5000
      })
      
      return {
        hasPermission: false,
        reason: `Sin permisos para ${requiredPermission}`,
        redirectTo: '/dashboard'
      }
    }

    return moduleCheck
  }, [permissions, requiredModule, requiredPermission, addNotification])

  return {
    checkAccess,
    ...permissions
  }
}

// Hook para guards de acción
export function useActionGuard() {
  const permissions = usePermissionGuard()
  const addNotification = useAppStore((state) => state.addNotification)

  const guardAction = useCallback(async <T>(
    module: ModuleName,
    permission: Permission,
    action: () => Promise<T> | T,
    options?: {
      silentFail?: boolean
      customMessage?: string
    }
  ): Promise<T | null> => {
    const moduleCheck = permissions.checkModuleAccess(module)
    
    if (!moduleCheck.hasPermission) {
      if (!options?.silentFail) {
        addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Acceso Denegado',
          message: options?.customMessage || moduleCheck.reason || 'Acceso denegado',
          duration: 5000
        })
      }
      return null
    }

    if (!permissions.canPerform(module, permission)) {
      if (!options?.silentFail) {
        addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Acción No Permitida',
          message: options?.customMessage || `No tienes permisos para ${permission} en ${module}`,
          duration: 5000
        })
      }
      return null
    }

    try {
      return await action()
    } catch (error) {
      if (!options?.silentFail) {
        addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Error en la Acción',
          message: error instanceof Error ? error.message : 'Error desconocido',
          duration: 5000
        })
      }
      throw error
    }
  }, [permissions, addNotification])

  return {
    guardAction,
    ...permissions
  }
}

// HOC para proteger rutas (debe usarse en componentes React)
export function createPermissionGuard() {
  // Esta función debe implementarse en un archivo .tsx separado
  throw new Error('withPermissionGuard debe implementarse en componente React (.tsx)')
}

export default usePermissionGuard
