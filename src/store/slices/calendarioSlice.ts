import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { AppStore } from '../index'
import type { CalendarioState, CreateEventoData } from '../types'

const initialState: CalendarioState = {
  eventos: [],
  loading: false,
  error: null,
}

export const calendarioSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'calendario' | 'fetchEventos' | 'createEvento' | 'updateEvento' | 'deleteEvento'>> = (set, get) => ({
  calendario: initialState,

  fetchEventos: async () => {
    set((state) => ({ calendario: { ...state.calendario, loading: true, error: null } }))
    try {
      const { data, error } = await supabase
        .from('eventos_calendario')
        .select(`
          *,
          empleado:empleados(*)
        `)
        .order('fecha_inicio', { ascending: true })
      
      if (error) throw error
      
      set((state) => ({ 
        calendario: { 
          ...state.calendario, 
          eventos: data || [], 
          loading: false 
        } 
      }))

      // Notificar éxito
      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Eventos cargados',
        message: `Se cargaron ${data?.length || 0} eventos del calendario`,
      })

    } catch (error: any) {
      set((state) => ({ 
        calendario: { 
          ...state.calendario, 
          loading: false, 
          error: error.message 
        } 
      }))

      // Notificar error
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al cargar eventos',
        message: error.message,
      })
    }
  },

  createEvento: async (eventoData: CreateEventoData) => {
    set((state) => ({ calendario: { ...state.calendario, loading: true, error: null } }))
    try {
      const currentUser = get().auth.user
      if (!currentUser) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('eventos_calendario')
        .insert([{
          ...eventoData,
          empleado_id: currentUser.id,
          created_at: new Date().toISOString(),
        }])
        .select(`
          *,
          empleado:empleados(*)
        `)
        .single()

      if (error) throw error

      // Actualizar estado local
      set((state) => ({ 
        calendario: { 
          ...state.calendario, 
          eventos: [...state.calendario.eventos, data], 
          loading: false 
        } 
      }))

      // Notificar éxito
      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Evento creado',
        message: `Evento "${eventoData.titulo}" creado exitosamente`,
      })

    } catch (error: any) {
      set((state) => ({ 
        calendario: { 
          ...state.calendario, 
          loading: false, 
          error: error.message 
        } 
      }))

      // Notificar error
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al crear evento',
        message: error.message,
      })
    }
  },

  updateEvento: async (id: string, eventoData: Partial<CreateEventoData>) => {
    set((state) => ({ calendario: { ...state.calendario, loading: true, error: null } }))
    try {
      const { data, error } = await supabase
        .from('eventos_calendario')
        .update({
          ...eventoData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          empleado:empleados(*)
        `)
        .single()

      if (error) throw error

      // Actualizar estado local
      set((state) => ({ 
        calendario: { 
          ...state.calendario, 
          eventos: state.calendario.eventos.map(e => e.id === id ? data : e), 
          loading: false 
        } 
      }))

      // Notificar éxito
      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Evento actualizado',
        message: `Evento "${data.titulo}" actualizado exitosamente`,
      })

    } catch (error: any) {
      set((state) => ({ 
        calendario: { 
          ...state.calendario, 
          loading: false, 
          error: error.message 
        } 
      }))

      // Notificar error
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al actualizar evento',
        message: error.message,
      })
    }
  },

  deleteEvento: async (id: string) => {
    set((state) => ({ calendario: { ...state.calendario, loading: true, error: null } }))
    try {
      const { error } = await supabase
        .from('eventos_calendario')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Actualizar estado local
      set((state) => ({ 
        calendario: { 
          ...state.calendario, 
          eventos: state.calendario.eventos.filter(e => e.id !== id), 
          loading: false 
        } 
      }))

      // Notificar éxito
      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Evento eliminado',
        message: 'Evento eliminado exitosamente',
      })

    } catch (error: any) {
      set((state) => ({ 
        calendario: { 
          ...state.calendario, 
          loading: false, 
          error: error.message 
        } 
      }))

      // Notificar error
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al eliminar evento',
        message: error.message,
      })
    }
  },
})
