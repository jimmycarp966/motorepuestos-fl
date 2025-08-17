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
        // Manejar error de email no confirmado
        if (error.message.includes('Email not confirmed')) {
          // Crear empleado automáticamente si no existe
          const { data: empleadoData, error: empleadoError } = await supabase
            .from('empleados')
            .select('*')
            .eq('email', email)
            .eq('activo', true)
            .single()

          if (empleadoError) {
            // Si no existe el empleado, crearlo
            const { data: newEmpleado, error: createError } = await supabase
              .from('empleados')
              .insert([{
                nombre: 'Usuario de Prueba',
                email: email,
                rol: 'Administrador',
                permisos_modulos: ['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'calendario'],
                activo: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }])
              .select('id, nombre, email, rol, permisos_modulos, activo, created_at, updated_at')
              .single()

            if (createError) {
              console.error('Error creando empleado:', createError)
              // Continuar con el login aunque no se pueda crear el empleado
            } else {
      
            }
          }

          // Permitir login aunque el email no esté confirmado
          set(() => ({
            auth: {
              session: null, // No hay sesión válida
              user: { 
                id: 'temp-user',
                nombre: 'Usuario de Prueba',
                email: email,
                rol: 'Administrador',
                permisos_modulos: ['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'calendario'], // Permisos por defecto
                activo: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              },
              loading: false,
            }
          }))

          // Notificar éxito con advertencia
          get().addNotification({
            id: Date.now().toString(),
            type: 'warning',
            title: 'Sesión iniciada (modo prueba)',
            message: 'Email no confirmado, pero puedes usar el sistema en modo prueba',
          })

          return
        }
        throw error
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
          // Si no existe el empleado, crearlo
          const { data: newEmpleado, error: createError } = await supabase
            .from('empleados')
            .insert([{
              nombre: 'Usuario de Prueba',
              email: data.user.email,
              rol: 'Administrador',
              permisos_modulos: ['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'calendario'],
              activo: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select('id, nombre, email, rol, permisos_modulos, activo, created_at, updated_at')
            .single()

          if (createError) {
            console.error('Error creando empleado:', createError)
            // Usar datos del usuario de Auth
                         set(() => ({
               auth: {
                 session: data.session,
                 user: {
                   id: data.user.id,
                   nombre: data.user.user_metadata?.nombre || 'Usuario',
                   email: data.user.email || '',
                   rol: data.user.user_metadata?.rol || 'Administrador',
                   permisos_modulos: ['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'calendario'], // Permisos por defecto
                   activo: true,
                   created_at: data.user.created_at,
                   updated_at: data.user.updated_at || data.user.created_at
                 },
                 loading: false,
               }
             }))
          } else {
            set(() => ({
              auth: {
                session: data.session,
                user: newEmpleado,
                loading: false,
              }
            }))
          }
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
      
      if (error) {
        console.error('❌ Auth: Error obteniendo sesión:', error)
        throw error
      }

      if (session?.user) {

        // Obtener datos del empleado
        const { data: empleadoData, error: empleadoError } = await supabase
          .from('empleados')
          .select('*')
          .eq('email', session.user.email)
          .eq('activo', true)
          .single()

        if (empleadoError) {
          console.error('❌ Auth: Error obteniendo empleado:', empleadoError)
          throw empleadoError
        }

        
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
      console.error('❌ Auth: Error en checkAuth:', error)
      set(() => ({
        auth: {
          session: null,
          user: null,
          loading: false,
        }
      }))
      
      // Notificar error solo si no es un error de "no hay sesión"
      if (error instanceof Error && !error.message.includes('No session')) {
        get().addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Error de conexión',
          message: 'No se pudo verificar la autenticación. Verificando conexión...',
        })
      }
    }
  },
})
