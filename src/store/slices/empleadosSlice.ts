import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
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
  }
]

// Mapeo de roles a permisos de acceso (legacy - mantener para compatibilidad)
export const ROLES_PERMISSIONS = {
  Administrador: {
    canAccess: ['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'calendario'],
    canManage: ['empleados', 'productos', 'clientes', 'ventas', 'caja', 'calendario'],
  },
  Gerente: {
    canAccess: ['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'calendario'],
    canManage: ['productos', 'clientes', 'ventas', 'caja', 'calendario'],
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

      set((state) => ({
        empleados: {
          ...state.empleados,
          empleados: data || [],
          loading: false,
        }
      }))

      // Notificar éxito
      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Empleados cargados',
        message: `Se cargaron ${data?.length || 0} empleados exitosamente`,
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
      // 1. Crear usuario en auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: empleadoData.email,
        password: empleadoData.password,
        email_confirm: true,
        user_metadata: {
          nombre: empleadoData.nombre,
          rol: empleadoData.rol
        }
      })

      if (authError) throw authError

      // 2. Crear empleado en tabla empleados
      const { data: empleadoDataResult, error: empleadoError } = await supabase
        .from('empleados')
        .insert([{
          id: authData.user.id,
          nombre: empleadoData.nombre,
          email: empleadoData.email,
          rol: empleadoData.rol,
          salario: empleadoData.salario,
          permisos_modulos: empleadoData.permisos_modulos,
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
        title: 'Empleado creado',
        message: `Empleado ${empleadoData.nombre} creado exitosamente con acceso al sistema`,
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

  // Actualizar empleado con autenticación
  updateEmpleadoWithAuth: async (id: string, empleadoData: UpdateEmpleadoData) => {
    set((state) => ({
      empleados: { ...state.empleados, loading: true, error: null }
    }))

    try {
      // 1. Actualizar datos de autenticación si se proporciona password
      if (empleadoData.password) {
        const { error: authError } = await supabase.auth.admin.updateUserById(id, {
          password: empleadoData.password,
          user_metadata: {
            nombre: empleadoData.nombre,
            rol: empleadoData.rol
          }
        })

        if (authError) throw authError
      }

      // 2. Actualizar empleado en tabla empleados
      const { data, error } = await supabase
        .from('empleados')
        .update({
          nombre: empleadoData.nombre,
          email: empleadoData.email,
          rol: empleadoData.rol,
          salario: empleadoData.salario,
          permisos_modulos: empleadoData.permisos_modulos,
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

  // Eliminar empleado (soft delete)
  deleteEmpleado: async (id: string) => {
    set((state) => ({
      empleados: { ...state.empleados, loading: true, error: null }
    }))

    try {
      const { error } = await supabase
        .from('empleados')
        .update({ 
          activo: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      // Actualizar estado local
      set((state) => ({
        empleados: {
          ...state.empleados,
          empleados: state.empleados.empleados.map(emp => 
            emp.id === id ? { ...emp, activo: false } : emp
          ),
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
