import { supabase } from '../../lib/supabase'

export const createEmpleadosSlice = (set, get) => ({
  empleados: {
    empleados: [],
    loading: false,
    error: null
  },

  fetchEmpleados: async () => {
    set((state) => ({ 
      empleados: { ...state.empleados, loading: true, error: null } 
    }))

    try {
      const { data, error } = await supabase
        .from('empleados')
        .select('*')
        .eq('activo', true)
        .order('nombre')

      if (error) throw error

      set((state) => ({
        empleados: {
          ...state.empleados,
          empleados: data || [],
          loading: false
        }
      }))
    } catch (error) {
      set((state) => ({
        empleados: {
          ...state.empleados,
          loading: false,
          error: error.message
        }
      }))
    }
  },

  createEmpleado: async (empleadoData) => {
    try {
      const { data, error } = await supabase
        .from('empleados')
        .insert([{
          ...empleadoData,
          activo: true,
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      const currentEmpleados = get().empleados.empleados
      set((state) => ({
        empleados: {
          ...state.empleados,
          empleados: [...currentEmpleados, data[0]]
        }
      }))

      return { success: true, data: data[0] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  updateEmpleado: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('empleados')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      const currentEmpleados = get().empleados.empleados
      const updatedEmpleados = currentEmpleados.map(e => 
        e.id === id ? data[0] : e
      )

      set((state) => ({
        empleados: {
          ...state.empleados,
          empleados: updatedEmpleados
        }
      }))

      return { success: true, data: data[0] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  deleteEmpleado: async (id) => {
    try {
      const { error } = await supabase
        .from('empleados')
        .update({ 
          activo: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      const currentEmpleados = get().empleados.empleados
      const updatedEmpleados = currentEmpleados.filter(e => e.id !== id)

      set((state) => ({
        empleados: {
          ...state.empleados,
          empleados: updatedEmpleados
        }
      }))

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  getRoles: () => [
    'Administrador',
    'Vendedor',
    'Técnico',
    'Cajero',
    'Almacén',
    'Auxiliar'
  ],

  searchEmpleados: (query) => {
    const empleados = get().empleados.empleados
    if (!query) return empleados

    return empleados.filter(empleado =>
      empleado.nombre.toLowerCase().includes(query.toLowerCase()) ||
      empleado.email?.toLowerCase().includes(query.toLowerCase()) ||
      empleado.rol?.toLowerCase().includes(query.toLowerCase())
    )
  }
})

// Funciones de permisos
export const canAccessModule = (userRole, module) => {
  const rolePermissions = {
    'admin': ['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'reportes'],
    'cajero': ['dashboard', 'ventas', 'caja'],
    'vendedor': ['dashboard', 'productos', 'clientes', 'ventas'],
    'consulta': ['dashboard', 'reportes']
  }
  
  return rolePermissions[userRole]?.includes(module) || false
}

export const canManageModule = (userRole, module) => {
  const managementPermissions = {
    'admin': ['empleados', 'productos', 'clientes', 'ventas', 'caja', 'reportes'],
    'cajero': ['ventas', 'caja'],
    'vendedor': ['productos', 'clientes', 'ventas'],
    'consulta': []
  }
  
  return managementPermissions[userRole]?.includes(module) || false
}
