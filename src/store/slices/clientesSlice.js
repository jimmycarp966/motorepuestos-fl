import { supabase } from '../../lib/supabase.js'

export const createClientesSlice = (set, get) => ({
  clientes: {
    clientes: [],
    loading: false,
    error: null
  },

  fetchClientes: async () => {
    set((state) => ({ 
      clientes: { ...state.clientes, loading: true, error: null } 
    }))

    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('activo', true)
        .order('nombre')

      if (error) throw error

      set((state) => ({
        clientes: {
          ...state.clientes,
          clientes: data || [],
          loading: false
        }
      }))
    } catch (error) {
      set((state) => ({
        clientes: {
          ...state.clientes,
          loading: false,
          error: error.message
        }
      }))
    }
  },

  createCliente: async (clienteData) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([{
          ...clienteData,
          activo: true,
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      const currentClientes = get().clientes.clientes
      set((state) => ({
        clientes: {
          ...state.clientes,
          clientes: [...currentClientes, data[0]]
        }
      }))

      return { success: true, data: data[0] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  updateCliente: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      const currentClientes = get().clientes.clientes
      const updatedClientes = currentClientes.map(c => 
        c.id === id ? data[0] : c
      )

      set((state) => ({
        clientes: {
          ...state.clientes,
          clientes: updatedClientes
        }
      }))

      return { success: true, data: data[0] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  deleteCliente: async (id) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ 
          activo: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      const currentClientes = get().clientes.clientes
      const updatedClientes = currentClientes.filter(c => c.id !== id)

      set((state) => ({
        clientes: {
          ...state.clientes,
          clientes: updatedClientes
        }
      }))

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  searchClientes: (query) => {
    const clientes = get().clientes.clientes
    if (!query) return clientes

    return clientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(query.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(query.toLowerCase()) ||
      cliente.telefono?.includes(query)
    )
  }
})
