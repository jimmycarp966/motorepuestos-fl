import { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import { AppStore, AuthState } from '../index'

const initialState: AuthState = {
  session: null,
  user: null,
  loading: false,
}

export const authSlice: StateCreator<AppStore, [], [], AppStore> = (set, get) => ({
  auth: initialState,

  // Iniciar sesión
  login: async (email: string, password: string) => {
    set((state) => ({
      auth: { ...state.auth, loading: true }
    }))

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Obtener datos del empleado
      if (data.user) {
        const { data: empleadoData, error: empleadoError } = await supabase
          .from('empleados')
          .select('*')
          .eq('email', data.user.email)
          .eq('activo', true)
          .single()

        if (empleadoError) throw empleadoError

        set((state) => ({
          auth: {
            session: data.session,
            user: empleadoData,
            loading: false,
          }
        }))

        // Notificar éxito
        get().addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Sesión iniciada',
          message: `Bienvenido ${empleadoData.nombre}`,
        })
      }

    } catch (error: any) {
      set((state) => ({
        auth: {
          ...state.auth,
          loading: false,
        }
      }))

      // Notificar error
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error de autenticación',
        message: error.message,
      })

      throw error
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      set((state) => ({
        auth: {
          session: null,
          user: null,
          loading: false,
        }
      }))

      // Notificar éxito
      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Sesión cerrada',
        message: 'Has cerrado sesión exitosamente',
      })

    } catch (error: any) {
      // Notificar error
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al cerrar sesión',
        message: error.message,
      })
    }
  },

  // Verificar autenticación
  checkAuth: async () => {
    set((state) => ({
      auth: { ...state.auth, loading: true }
    }))

    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error

      if (session?.user) {
        // Obtener datos del empleado
        const { data: empleadoData, error: empleadoError } = await supabase
          .from('empleados')
          .select('*')
          .eq('email', session.user.email)
          .eq('activo', true)
          .single()

        if (empleadoError) throw empleadoError

        set((state) => ({
          auth: {
            session,
            user: empleadoData,
            loading: false,
          }
        }))
      } else {
        set((state) => ({
          auth: {
            session: null,
            user: null,
            loading: false,
          }
        }))
      }

    } catch (error: any) {
      set((state) => ({
        auth: {
          session: null,
          user: null,
          loading: false,
        }
      }))
    }
  },
})
