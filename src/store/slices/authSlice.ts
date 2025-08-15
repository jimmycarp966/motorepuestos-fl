import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { AppStore, AuthState } from '../index'

const initialState: AuthState = {
  session: null,
  user: null,
  loading: false,
}

export const authSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'auth' | 'login' | 'logout' | 'checkAuth'>> = (set, get) => ({
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

        set(() => ({
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

    } catch (error: unknown) {
      set(() => ({
        auth: {
          session: null,
          user: null,
          loading: false,
        }
      }))

      // Notificar error
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error de autenticación',
        message: error instanceof Error ? error.message : 'Error desconocido',
      })

      throw error
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      set(() => ({
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

    } catch (error: unknown) {
      // Notificar error
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al cerrar sesión',
        message: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  },

  // Verificar autenticación
  checkAuth: async () => {
    set(() => ({
      auth: { session: null, user: null, loading: true }
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

        set(() => ({
          auth: {
            session,
            user: empleadoData,
            loading: false,
          }
        }))
      } else {
        set(() => ({
          auth: {
            session: null,
            user: null,
            loading: false,
          }
        }))
      }

    } catch {
      set(() => ({
        auth: {
          session: null,
          user: null,
          loading: false,
        }
      }))
    }
  },
})
