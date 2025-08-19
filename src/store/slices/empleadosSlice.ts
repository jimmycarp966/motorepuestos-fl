import type { StateCreator } from 'zustand'
import { supabase, supabaseAdmin } from '../../lib/supabase'
import type { AppStore } from '../index'
import type { EmpleadosState, CreateEmpleadoData, UpdateEmpleadoData, ModuloPermitido, PermisosModulo } from '../types'

// Estados iniciales
const initialState: EmpleadosState = {
  empleados: [],
  loading: false,
  error: null,
}

// Configuración de módulos y permisos
export const MODULOS_DISPONIBLES: PermisosModulo[] = [
  {
    modulo: 'dashboard',
    nombre: 'Dashboard',
    descripcion: 'Panel principal con estadísticas',
    roles_permitidos: ['Administrador', 'Gerente', 'Vendedor', 'Técnico', 'Almacén', 'Cajero']
  },
  {
    modulo: 'empleados',
    nombre: 'Empleados',
    descripcion: 'Gestión de personal',
    roles_permitidos: ['Administrador', 'Gerente']
  },
  {
    modulo: 'productos',
    nombre: 'Productos',
    descripcion: 'Gestión de inventario',
    roles_permitidos: ['Administrador', 'Gerente', 'Técnico', 'Almacén']
  },
  {
    modulo: 'clientes',
    nombre: 'Clientes',
    descripcion: 'Gestión de clientes',
    roles_permitidos: ['Administrador', 'Gerente', 'Vendedor', 'Cajero']
  },
  {
    modulo: 'ventas',
    nombre: 'Ventas',
    descripcion: 'Registro de ventas',
    roles_permitidos: ['Administrador', 'Gerente', 'Vendedor', 'Cajero']
  },
  {
    modulo: 'caja',
    nombre: 'Caja',
    descripcion: 'Gestión de caja y arqueos',
    roles_permitidos: ['Administrador', 'Gerente', 'Cajero']
  },
  {
    modulo: 'calendario',
    nombre: 'Calendario',
    descripcion: 'Eventos y programación',
    roles_permitidos: ['Administrador', 'Gerente', 'Vendedor', 'Técnico', 'Almacén', 'Cajero']
  },
  {
    modulo: 'reportes',
    nombre: 'Reportes',
    descripcion: 'Reportes y estadísticas del sistema',
    roles_permitidos: ['Administrador', 'Gerente']
  }
]

// Mapeo de roles a permisos de acceso (legacy - mantener para compatibilidad)
export const ROLES_PERMISSIONS = {
  Administrador: {
    canAccess: ['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'calendario', 'reportes'],
    canManage: ['empleados', 'productos', 'clientes', 'ventas', 'caja', 'calendario', 'reportes'],
  },
  Gerente: {
    canAccess: ['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'calendario', 'reportes'],
    canManage: ['productos', 'clientes', 'ventas', 'caja', 'calendario', 'reportes'],
  },
  Vendedor: {
    canAccess: ['dashboard', 'ventas', 'clientes', 'calendario'],
    canManage: ['ventas'],
  },
  Técnico: {
    canAccess: ['dashboard', 'productos', 'calendario'],
    canManage: ['productos'],
  },
  Almacén: {
    canAccess: ['dashboard', 'productos', 'calendario'],
    canManage: ['productos'],
  },
  Cajero: {
    canAccess: ['dashboard', 'ventas', 'caja', 'clientes', 'calendario'],
    canManage: ['ventas', 'caja'],
  },
} as const

export const empleadosSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'empleados' | 'fetchEmpleados' | 'createEmpleado' | 'updateEmpleado' | 'deleteEmpleado' | 'createEmpleadoWithAuth' | 'updateEmpleadoWithAuth' | 'getEmpleadoPermissions'>> = (set, get) => ({
  empleados: initialState,

  // Obtener todos los empleados
  fetchEmpleados: async () => {
    set((state) => ({
      empleados: { ...state.empleados, loading: true, error: null }
    }))

    try {
      const { data, error } = await supabase
        .from('empleados')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Procesar los datos para asegurar que los permisos estén correctos
      const empleadosProcesados = (data || []).map(empleado => {
        // Si el empleado es administrador y no tiene permisos específicos, asignar todos los módulos
        if (empleado.rol === 'Administrador' && (!empleado.permisos_modulos || empleado.permisos_modulos.length === 0)) {
          return {
            ...empleado,
            permisos_modulos: MODULOS_DISPONIBLES.map(modulo => modulo.modulo)
          }
        }
        // Si tiene permisos pero no incluye los del rol, agregarlos
        if (empleado.permisos_modulos && empleado.permisos_modulos.length > 0) {
          const permisosDelRol = get().getEmpleadoPermissions(empleado.rol)
          const permisosCompletos = [...new Set([...empleado.permisos_modulos, ...permisosDelRol])]
          return {
            ...empleado,
            permisos_modulos: permisosCompletos
          }
        }
        return empleado
      })

      set((state) => ({
        empleados: {
          ...state.empleados,
          empleados: empleadosProcesados,
          loading: false,
        }
      }))

      // Notificar éxito solo si hay empleados
      if (empleadosProcesados.length > 0) {
        get().addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: '✅ Empleados cargados',
          message: `${empleadosProcesados.length} empleado${empleadosProcesados.length > 1 ? 's' : ''} disponible${empleadosProcesados.length > 1 ? 's' : ''}`,
        })
      }

    } catch (error: any) {
      set((state) => ({
        empleados: {
          ...state.empleados,
          loading: false,
          error: error.message,
        }
      }))

      // Notificar error
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al cargar empleados',
        message: error.message,
      })
    }
  },

  // Crear nuevo empleado con autenticación
  createEmpleadoWithAuth: async (empleadoData: CreateEmpleadoData) => {
    set((state) => ({
      empleados: { ...state.empleados, loading: true, error: null }
    }))

    try {
      // 1. Crear usuario en auth.users usando service role key
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: empleadoData.email,
        password: empleadoData.password,
        email_confirm: true,
        user_metadata: {
          nombre: empleadoData.nombre,
          rol: empleadoData.rol
        }
      })

      if (authError) throw authError

      // 2. Usar los permisos seleccionados por el administrador (selección libre)
      let permisosCompletos = empleadoData.permisos_modulos || []
      
      // Si no se seleccionaron permisos específicos, usar los del rol como fallback
      if (permisosCompletos.length === 0) {
        if (empleadoData.rol === 'Administrador') {
          permisosCompletos = MODULOS_DISPONIBLES.map(modulo => modulo.modulo)
        } else {
          const permisosDelRol = get().getEmpleadoPermissions(empleadoData.rol)
          permisosCompletos = permisosDelRol
        }
      }

      // 3. Crear empleado en tabla empleados usando el ID del usuario auth
      const { data: empleadoDataResult, error: empleadoError } = await supabase
        .from('empleados')
        .insert([{
          id: authData.user.id,
          nombre: empleadoData.nombre,
          email: empleadoData.email,
          rol: empleadoData.rol,
          salario: empleadoData.salario,
          permisos_modulos: permisosCompletos,
          activo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single()

      if (empleadoError) throw empleadoError

      // Actualizar estado local
      set((state) => ({
        empleados: {
          ...state.empleados,
          empleados: [empleadoDataResult, ...state.empleados.empleados],
          loading: false,
        }
      }))

      // Notificar éxito
      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: '✅ Empleado creado',
        message: `${empleadoData.nombre} ahora tiene acceso al sistema`,
      })

    } catch (error: any) {
      set((state) => ({
        empleados: {
          ...state.empleados,
          loading: false,
          error: error.message,
        }
      }))

      // Notificar error
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: '❌ Error al crear empleado',
        message: error.message,
      })
    }
  },

  // Actualizar empleado con autenticación
  updateEmpleadoWithAuth: async (id: string, empleadoData: UpdateEmpleadoData) => {
    set((state) => ({
      empleados: { ...state.empleados, loading: true, error: null }
    }))

    try {
      // 1. Actualizar datos de autenticación si se proporciona password
      if (empleadoData.password) {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
          password: empleadoData.password,
          user_metadata: {
            nombre: empleadoData.nombre,
            rol: empleadoData.rol
          }
        })

        if (authError) throw authError
      }

      // 2. Usar los permisos seleccionados por el administrador (selección libre)
      let permisosCompletos = empleadoData.permisos_modulos || []
      
      // Si no se seleccionaron permisos específicos, usar los del rol como fallback
      if (permisosCompletos.length === 0) {
        if (empleadoData.rol === 'Administrador') {
          permisosCompletos = MODULOS_DISPONIBLES.map(modulo => modulo.modulo)
        } else {
          const permisosDelRol = get().getEmpleadoPermissions(empleadoData.rol)
          permisosCompletos = permisosDelRol
        }
      }

      // 3. Actualizar empleado en tabla empleados
      const { data, error } = await supabase
        .from('empleados')
        .update({
          nombre: empleadoData.nombre,
          email: empleadoData.email,
          rol: empleadoData.rol,
          salario: empleadoData.salario,
          permisos_modulos: permisosCompletos,
          activo: empleadoData.activo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Actualizar estado local
      set((state) => ({
        empleados: {
          ...state.empleados,
          empleados: state.empleados.empleados.map(emp => 
            emp.id === id ? data : emp
          ),
          loading: false,
        }
      }))

      // Notificar éxito
      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: '✅ Empleado actualizado',
        message: `Los datos de ${empleadoData.nombre || 'el empleado'} han sido actualizados`,
      })

    } catch (error: any) {
      set((state) => ({
        empleados: {
          ...state.empleados,
          loading: false,
          error: error.message,
        }
      }))

      // Notificar error
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al actualizar empleado',
        message: error.message,
      })
    }
  },

  // Obtener permisos de módulos para un rol
  getEmpleadoPermissions: (rol: string): ModuloPermitido[] => {
    return MODULOS_DISPONIBLES
      .filter(modulo => modulo.roles_permitidos.includes(rol))
      .map(modulo => modulo.modulo)
  },



  // Crear nuevo empleado (legacy - mantener para compatibilidad)
  createEmpleado: async (empleadoData: CreateEmpleadoData) => {
    set((state) => ({
      empleados: { ...state.empleados, loading: true, error: null }
    }))

    try {
      const { data, error } = await supabase
        .from('empleados')
        .insert([{
          ...empleadoData,
          activo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single()

      if (error) throw error

      // Actualizar estado local
      set((state) => ({
        empleados: {
          ...state.empleados,
          empleados: [data, ...state.empleados.empleados],
          loading: false,
        }
      }))

      // Notificar éxito
      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Empleado creado',
        message: `Empleado ${empleadoData.nombre} creado exitosamente`,
      })

    } catch (error: any) {
      set((state) => ({
        empleados: {
          ...state.empleados,
          loading: false,
          error: error.message,
        }
      }))

      // Notificar error
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al crear empleado',
        message: error.message,
      })
    }
  },

  // Actualizar empleado (legacy - mantener para compatibilidad)
  updateEmpleado: async (id: string, empleadoData: UpdateEmpleadoData) => {
    set((state) => ({
      empleados: { ...state.empleados, loading: true, error: null }
    }))

    try {
      const { data, error } = await supabase
        .from('empleados')
        .update({
          ...empleadoData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Actualizar estado local
      set((state) => ({
        empleados: {
          ...state.empleados,
          empleados: state.empleados.empleados.map(emp => 
            emp.id === id ? data : emp
          ),
          loading: false,
        }
      }))

      // Notificar éxito
      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Empleado actualizado',
        message: `Empleado ${empleadoData.nombre || 'actualizado'} exitosamente`,
      })

    } catch (error: any) {
      set((state) => ({
        empleados: {
          ...state.empleados,
          loading: false,
          error: error.message,
        }
      }))

      // Notificar error
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al actualizar empleado',
        message: error.message,
      })
    }
  },

  // Actualizar permisos de administrador específico
  updateAdminPermissions: async (email: string) => {
    set((state) => ({
      empleados: { ...state.empleados, loading: true, error: null }
    }))

    try {
      const { data, error } = await supabase
        .from('empleados')
        .update({
          permisos_modulos: MODULOS_DISPONIBLES.map(modulo => modulo.modulo),
          updated_at: new Date().toISOString(),
        })
        .eq('email', email)
        .eq('rol', 'Administrador')
        .select()
        .single()

      if (error) throw error

      // Actualizar estado local
      set((state) => ({
        empleados: {
          ...state.empleados,
          empleados: state.empleados.empleados.map(emp => 
            emp.email === email ? data : emp
          ),
          loading: false,
        }
      }))

      // Notificar éxito
      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Permisos actualizados',
        message: `Permisos de administrador actualizados para ${email}`,
      })

    } catch (error: any) {
      set((state) => ({
        empleados: {
          ...state.empleados,
          loading: false,
          error: error.message,
        }
      }))

      // Notificar error
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al actualizar permisos',
        message: error.message,
      })
    }
  },

  // Eliminar empleado (eliminación real)
  deleteEmpleado: async (id: string) => {
    set((state) => ({
      empleados: { ...state.empleados, loading: true, error: null }
    }))

    try {
      // 1. Eliminar empleado de la tabla empleados
      const { error: empleadoError } = await supabase
        .from('empleados')
        .delete()
        .eq('id', id)

      if (empleadoError) throw empleadoError

      // 2. Eliminar usuario de auth (si existe)
      try {
        await supabaseAdmin.auth.admin.deleteUser(id)
      } catch (authError) {
        console.warn('⚠️ No se pudo eliminar usuario de auth:', authError)
      }

      // Actualizar estado local - remover completamente del array
      set((state) => ({
        empleados: {
          ...state.empleados,
          empleados: state.empleados.empleados.filter(emp => emp.id !== id),
          loading: false,
        }
      }))

      // Notificar éxito
      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Empleado eliminado',
        message: 'Empleado eliminado exitosamente',
      })

    } catch (error: any) {
      set((state) => ({
        empleados: {
          ...state.empleados,
          loading: false,
          error: error.message,
        }
      }))

      // Notificar error
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al eliminar empleado',
        message: error.message,
      })
    }
  },
})

// Utilidades para verificar permisos (legacy - mantener para compatibilidad)
export const hasPermission = (userRole: string, action: string): boolean => {
  const permissions = ROLES_PERMISSIONS[userRole as keyof typeof ROLES_PERMISSIONS]
  if (!permissions) return false
  
  return permissions.canManage.includes(action as never) || 
         permissions.canAccess.includes(action as never)
}

export const canAccessModule = (userRole: string, module: string): boolean => {
  const permissions = ROLES_PERMISSIONS[userRole as keyof typeof ROLES_PERMISSIONS]
  if (!permissions) return false
  
  return permissions.canAccess.includes(module as never)
}

export const canManageModule = (userRole: string, module: string): boolean => {
  const permissions = ROLES_PERMISSIONS[userRole as keyof typeof ROLES_PERMISSIONS]
  if (!permissions) return false
  
  return permissions.canManage.includes(module as never)
}
