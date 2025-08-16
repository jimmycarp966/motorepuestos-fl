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
    set((state) => ({ auth: { ...state.auth, loading: true, error: null } }))
    
    try {
      console.log('🔐 Auth: Intentando login para:', email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Auth: Error en login:', error.message)
        throw error
      }

      if (data.user) {
        console.log('✅ Auth: Usuario autenticado, obteniendo datos del empleado...')
        
        // Obtener datos del empleado
        const { data: empleado, error: empleadoError } = await supabase
          .from('empleados')
          .select('*')
          .eq('email', email)
          .single()

        if (empleadoError) {
          console.warn('⚠️ Auth: No se encontró empleado para:', email)
          
          // En desarrollo, crear usuario temporal si no existe empleado
          if (process.env.NODE_ENV === 'development') {
            const tempUser = {
              id: data.user.id,
              nombre: 'Usuario de Prueba',
              email: data.user.email || '',
              rol: 'admin' as const,
              activo: true,
              created_at: data.user.created_at,
              updated_at: data.user.updated_at || data.user.created_at,
            }
            
            console.log('✅ Auth: Usuario temporal creado para desarrollo')
            
            set((state) => ({
              auth: {
                ...state.auth,
                session: data.session,
                user: tempUser,
                loading: false,
              },
            }))
            return
          }
        }

        const user = {
          id: empleado?.id || data.user.id,
          nombre: empleado?.nombre || data.user.email || 'Usuario',
          email: data.user.email || '',
          rol: empleado?.rol || 'consulta',
          activo: empleado?.activo ?? true,
          created_at: empleado?.created_at || data.user.created_at,
          updated_at: empleado?.updated_at || data.user.updated_at,
        }

        console.log('✅ Auth: Login exitoso para:', user.nombre, '(', user.rol, ')')

        set((state) => ({
          auth: {
            ...state.auth,
            session: data.session,
            user,
            loading: false,
          },
        }))
      }
    } catch (error: any) {
      console.error('❌ Auth: Error en login:', error.message)
      
      set((state) => ({
        auth: {
          ...state.auth,
          loading: false,
          error: error.message,
        },
      }))
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
      console.log('🔍 Auth: Verificando sesión...')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Auth: Error obteniendo sesión:', error)
        throw error
      }

      if (session?.user) {
        console.log('✅ Auth: Sesión encontrada, obteniendo datos del empleado...')
        
        // Obtener datos del empleado
        const { data: empleadoData, error: empleadoError } = await supabase
          .from('empleados')
          .select('*')
          .eq('email', session.user.email)
          .eq('activo', true)
          .single()

        if (empleadoError) {
          console.warn('⚠️ Auth: No se encontró empleado activo para:', session.user.email)
          
          // En desarrollo, crear usuario temporal si no existe empleado
          if (process.env.NODE_ENV === 'development') {
            const tempUser = {
              id: session.user.id,
              nombre: 'Usuario de Prueba',
              email: session.user.email || '',
              rol: 'admin' as const,
              activo: true,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at,
            }
            
            console.log('✅ Auth: Usuario temporal creado para desarrollo')
            
            set(() => ({
              auth: {
                session,
                user: tempUser,
                loading: false,
              }
            }))
            return
          }
          
          throw empleadoError
        }

        console.log('✅ Auth: Empleado encontrado:', empleadoData.nombre)

        set(() => ({
          auth: {
            session,
            user: empleadoData,
            loading: false,
          }
        }))
      } else {
        console.log('ℹ️ Auth: No hay sesión activa')
        set(() => ({
          auth: {
            session: null,
            user: null,
            loading: false,
          }
        }))
      }

    } catch (error: any) {
      console.error('❌ Auth: Error en checkAuth:', error.message)
      
      set(() => ({
        auth: {
          session: null,
          user: null,
          loading: false,
        }
      }))
      
      // Notificar error solo si no es un error de "no hay sesión"
      if (!error.message.includes('No session')) {
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
