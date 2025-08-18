import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { AppStore } from '../index'
import type { AuthState } from '../types'

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

      if (error) {
        // Si el email no está confirmado, continuar con el login de Supabase Auth
        if (error.message.includes('Email not confirmed')) {
          console.warn('Email no confirmado, pero continuando con el login')
        } else {
          throw error
        }
      }

              // Obtener datos del empleado con permisos
        if (data.user) {
          const { data: empleadoData, error: empleadoError } = await supabase
            .from('empleados')
            .select('id, nombre, email, rol, permisos_modulos, activo, created_at, updated_at')
            .eq('email', data.user.email)
            .eq('activo', true)
            .single()

        if (empleadoError) {
          console.warn('Empleado no encontrado en BD, usando datos de Auth básicos')
          // No crear empleado automáticamente, solo usar datos básicos de Auth
          set(() => ({
            auth: {
              session: data.session,
              user: {
                id: data.user.id,
                nombre: data.user.user_metadata?.nombre || 'Usuario Auth',
                email: data.user.email || '',
                rol: 'Cajero', // Rol limitado por defecto
                permisos_modulos: ['dashboard', 'ventas'], // Solo permisos básicos
                activo: true,
                created_at: data.user.created_at,
                updated_at: data.user.updated_at || data.user.created_at
              },
              loading: false,
            }
          }))

          // Notificar que debe crear el empleado manualmente
          get().addNotification({
            id: Date.now().toString(),
            type: 'warning',
            title: 'Usuario sin empleado asociado',
            message: 'Contacta al administrador para configurar tu empleado en el sistema',
          })
        } else {
          set(() => ({
            auth: {
              session: data.session,
              user: empleadoData,
              loading: false,
            }
          }))
        }

        // Notificar éxito
        get().addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Sesión iniciada',
          message: `Bienvenido ${empleadoData?.nombre || 'Usuario'}`,
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

    } catch (error) {
      set(() => ({
        auth: {
          session: null,
          user: null,
          loading: false,
        }
      }))
      
      // Solo notificar errores críticos de conexión
      if (error instanceof Error && !error.message.includes('No session')) {
        get().addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Error de conexión',
          message: 'No se pudo verificar la autenticación',
        })
      }
    }
  },
})
