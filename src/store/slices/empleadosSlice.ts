import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { AppStore, EmpleadosState, CreateEmpleadoData, UpdateEmpleadoData } from '../index'

// Estados iniciales
const initialState: EmpleadosState = {
  empleados: [],
  loading: false,
  error: null,
}

// Mapeo de roles a permisos de acceso
export const ROLES_PERMISSIONS = {
  admin: {
    canAccess: ['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'reportes'],
    canManage: ['empleados', 'productos', 'clientes', 'ventas', 'caja', 'reportes'],
  },
  cajero: {
    canAccess: ['dashboard', 'ventas', 'caja', 'clientes'],
    canManage: ['ventas', 'caja'],
  },
  vendedor: {
    canAccess: ['dashboard', 'ventas', 'clientes'],
    canManage: ['ventas'],
  },
  consulta: {
    canAccess: ['dashboard', 'productos', 'clientes'],
    canManage: [],
  },
} as const

export const empleadosSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'empleados' | 'fetchEmpleados' | 'createEmpleado' | 'updateEmpleado' | 'deleteEmpleado'>> = (set, get) => ({
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

  // Crear nuevo empleado
  createEmpleado: async (empleadoData: CreateEmpleadoData) => {
    set((state) => ({
      empleados: { ...state.empleados, loading: true, error: null }
    }))

    try {
      // Validar que el usuario actual sea admin
      const currentUser = get().auth.user
      if (!currentUser || currentUser.rol !== 'admin') {
        throw new Error('No tienes permisos para crear empleados')
      }

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

  // Actualizar empleado
  updateEmpleado: async (id: string, empleadoData: UpdateEmpleadoData) => {
    set((state) => ({
      empleados: { ...state.empleados, loading: true, error: null }
    }))

    try {
      // Validar que el usuario actual sea admin
      const currentUser = get().auth.user
      if (!currentUser || currentUser.rol !== 'admin') {
        throw new Error('No tienes permisos para editar empleados')
      }

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
      // Validar que el usuario actual sea admin
      const currentUser = get().auth.user
      if (!currentUser || currentUser.rol !== 'admin') {
        throw new Error('No tienes permisos para eliminar empleados')
      }

      // Verificar que no se elimine a sí mismo
      if (currentUser.id === id) {
        throw new Error('No puedes eliminar tu propia cuenta')
      }

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

// Utilidades para verificar permisos
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
