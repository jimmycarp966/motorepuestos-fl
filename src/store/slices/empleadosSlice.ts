import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { AppStore, EmpleadosState, CreateEmpleadoData, UpdateEmpleadoData } from '../index'

const initialState: EmpleadosState = {
  empleados: [],
  loading: false,
  error: null,
}

export const empleadosSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'empleados' | 'fetchEmpleados' | 'createEmpleado' | 'updateEmpleado' | 'deleteEmpleado' | 'canAccessModule' | 'getUserPermissions'>> = (set, get) => ({
  empleados: initialState,

  fetchEmpleados: async () => {
    set((state) => ({ empleados: { ...state.empleados, loading: true, error: null } }))
    try {
      const { data, error } = await supabase
        .from('empleados')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      set((state) => ({ empleados: { ...state.empleados, empleados: data || [], loading: false } }))
    } catch (error: any) {
      set((state) => ({ empleados: { ...state.empleados, loading: false, error: error.message } }))
    }
  },

  createEmpleado: async (empleado: CreateEmpleadoData) => {
    set((state) => ({ empleados: { ...state.empleados, loading: true, error: null } }))
    
    try {
      const { data, error } = await supabase
        .from('empleados')
        .insert([{
          ...empleado,
          activo: true,
        }])
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        empleados: {
          ...state.empleados,
          empleados: [data, ...state.empleados.empleados],
          loading: false
        }
      }))

    } catch (error: any) {
      set((state) => ({ 
        empleados: { 
          ...state.empleados, 
          loading: false, 
          error: error.message 
        } 
      }))
      throw error
    }
  },

  updateEmpleado: async (id: string, empleado: UpdateEmpleadoData) => {
    set((state) => ({ empleados: { ...state.empleados, loading: true, error: null } }))
    
    try {
      const { data, error } = await supabase
        .from('empleados')
        .update({
          ...empleado,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        empleados: {
          ...state.empleados,
          empleados: state.empleados.empleados.map(emp => 
            emp.id === id ? data : emp
          ),
          loading: false
        }
      }))

    } catch (error: any) {
      set((state) => ({ 
        empleados: { 
          ...state.empleados, 
          loading: false, 
          error: error.message 
        } 
      }))
      throw error
    }
  },

  deleteEmpleado: async (id: string) => {
    set((state) => ({ empleados: { ...state.empleados, loading: true, error: null } }))
    
    try {
      // Soft delete - marcar como inactivo
      const { error } = await supabase
        .from('empleados')
        .update({ 
          activo: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        empleados: {
          ...state.empleados,
          empleados: state.empleados.empleados.map(emp => 
            emp.id === id ? { ...emp, activo: false } : emp
          ),
          loading: false
        }
      }))

    } catch (error: any) {
      set((state) => ({ 
        empleados: { 
          ...state.empleados, 
          loading: false, 
          error: error.message 
        } 
      }))
      throw error
    }
  },

  // Sistema de permisos basado en roles
  canAccessModule: (userRole: string, moduleId: string): boolean => {
    const permissions = {
      admin: ['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'reportes'],
      cajero: ['dashboard', 'productos', 'clientes', 'ventas', 'caja'],
      vendedor: ['dashboard', 'productos', 'clientes', 'ventas'],
      consulta: ['dashboard', 'productos', 'clientes', 'reportes']
    }

    return permissions[userRole as keyof typeof permissions]?.includes(moduleId) || false
  },

  // Obtener permisos específicos del usuario
  getUserPermissions: (userRole: string) => {
    const permissions = {
      admin: {
        canManageEmployees: true,
        canManageProducts: true,
        canManageClients: true,
        canManageSales: true,
        canManageCash: true,
        canViewReports: true,
        canPerformArqueo: true,
        canDeleteRecords: true,
        canViewAllData: true
      },
      cajero: {
        canManageEmployees: false,
        canManageProducts: true,
        canManageClients: true,
        canManageSales: true,
        canManageCash: true,
        canViewReports: false,
        canPerformArqueo: true,
        canDeleteRecords: false,
        canViewAllData: false
      },
      vendedor: {
        canManageEmployees: false,
        canManageProducts: true,
        canManageClients: true,
        canManageSales: true,
        canManageCash: false,
        canViewReports: false,
        canPerformArqueo: false,
        canDeleteRecords: false,
        canViewAllData: false
      },
      consulta: {
        canManageEmployees: false,
        canManageProducts: false,
        canManageClients: false,
        canManageSales: false,
        canManageCash: false,
        canViewReports: true,
        canPerformArqueo: false,
        canDeleteRecords: false,
        canViewAllData: false
      }
    }

    return permissions[userRole as keyof typeof permissions] || permissions.consulta
  },
})
