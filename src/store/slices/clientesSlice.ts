import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { AppStore } from '../index'
import type { ClientesState, CreateClienteData, UpdateClienteData } from '../types'

const initialState: ClientesState = {
  clientes: [],
  loading: false,
  error: null,
}

export const clientesSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'clientes' | 'fetchClientes' | 'createCliente' | 'updateCliente' | 'deleteCliente' | 'actualizarCuentaCorriente'>> = (set, get) => ({
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
      const { data, error } = await supabase.from('clientes').insert([{
        ...clienteData,
        limite_credito: clienteData.limite_credito || 0,
        saldo_cuenta_corriente: 0,
        activo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]).select().single()
      if (error) throw error
      
      // Actualizar estado local
      set((state) => ({ clientes: { ...state.clientes, clientes: [data, ...state.clientes.clientes], loading: false } }))
      
      // Notificar éxito
      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Cliente creado',
        message: `Cliente ${clienteData.nombre} creado exitosamente${clienteData.limite_credito ? ` con límite de crédito $${clienteData.limite_credito}` : ''}`,
      })
      
    } catch (error: any) {
      set((state) => ({ clientes: { ...state.clientes, loading: false, error: error.message } }))
      
      // Notificar error
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al crear cliente',
        message: error.message,
      })
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

  actualizarCuentaCorriente: async (clienteId: string, monto: number, tipo: 'cargo' | 'pago') => {
    set((state) => ({ clientes: { ...state.clientes, loading: true, error: null } }))
    try {
      const cliente = get().clientes.clientes.find(c => c.id === clienteId)
      if (!cliente) throw new Error('Cliente no encontrado')

      const nuevoSaldo = tipo === 'cargo' 
        ? cliente.saldo_cuenta_corriente + monto
        : cliente.saldo_cuenta_corriente - monto

      // Verificar límite de crédito
      if (nuevoSaldo > cliente.limite_credito) {
        throw new Error(`El cargo excede el límite de crédito ($${cliente.limite_credito})`)
      }

      const { data, error } = await supabase
        .from('clientes')
        .update({
          saldo_cuenta_corriente: nuevoSaldo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clienteId)
        .select()
        .single()

      if (error) throw error

      // Actualizar estado local
      set((state) => ({ 
        clientes: { 
          ...state.clientes, 
          clientes: state.clientes.clientes.map(c => c.id === clienteId ? data : c), 
          loading: false 
        } 
      }))

      // Notificar éxito
      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Cuenta corriente actualizada',
        message: `${tipo === 'cargo' ? 'Cargo' : 'Pago'} de $${monto} registrado. Nuevo saldo: $${nuevoSaldo}`,
      })

    } catch (error: any) {
      set((state) => ({ clientes: { ...state.clientes, loading: false, error: error.message } }))

      // Notificar error
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al actualizar cuenta corriente',
        message: error.message,
      })
    }
  },
})
