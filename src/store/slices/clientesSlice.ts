import { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import { AppStore, ClientesState, CreateClienteData, UpdateClienteData } from '../index'

const initialState: ClientesState = {
  clientes: [],
  loading: false,
  error: null,
}

export const clientesSlice: StateCreator<AppStore, [], [], AppStore> = (set, get) => ({
  clientes: initialState,

  fetchClientes: async () => {
    set((state) => ({ clientes: { ...state.clientes, loading: true, error: null } }))
    try {
      const { data, error } = await supabase.from('clientes').select('*').order('created_at', { ascending: false })
      if (error) throw error
      set((state) => ({ clientes: { ...state.clientes, clientes: data || [], loading: false } }))
    } catch (error: any) {
      set((state) => ({ clientes: { ...state.clientes, loading: false, error: error.message } }))
    }
  },

  createCliente: async (clienteData: CreateClienteData) => {
    set((state) => ({ clientes: { ...state.clientes, loading: true, error: null } }))
    try {
      const { data, error } = await supabase.from('clientes').insert([clienteData]).select().single()
      if (error) throw error
      set((state) => ({ clientes: { ...state.clientes, clientes: [data, ...state.clientes.clientes], loading: false } }))
    } catch (error: any) {
      set((state) => ({ clientes: { ...state.clientes, loading: false, error: error.message } }))
    }
  },

  updateCliente: async (id: string, clienteData: UpdateClienteData) => {
    set((state) => ({ clientes: { ...state.clientes, loading: true, error: null } }))
    try {
      const { data, error } = await supabase.from('clientes').update(clienteData).eq('id', id).select().single()
      if (error) throw error
      set((state) => ({ clientes: { ...state.clientes, clientes: state.clientes.clientes.map(c => c.id === id ? data : c), loading: false } }))
    } catch (error: any) {
      set((state) => ({ clientes: { ...state.clientes, loading: false, error: error.message } }))
    }
  },

  deleteCliente: async (id: string) => {
    set((state) => ({ clientes: { ...state.clientes, loading: true, error: null } }))
    try {
      const { error } = await supabase.from('clientes').update({ activo: false }).eq('id', id)
      if (error) throw error
      set((state) => ({ clientes: { ...state.clientes, clientes: state.clientes.clientes.map(c => c.id === id ? { ...c, activo: false } : c), loading: false } }))
    } catch (error: any) {
      set((state) => ({ clientes: { ...state.clientes, loading: false, error: error.message } }))
    }
  },
})
