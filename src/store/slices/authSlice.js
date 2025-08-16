import { supabase } from '../../lib/supabase-config.js'

export const createAuthSlice = (set, get) => ({
  auth: {
    session: null,
    user: null,
    loading: true,
    error: null,
    permissions: [] // Agregar permisos al estado
  },

  // Acciones de autenticación
  signIn: async (email, password) => {
    set((state) => ({ 
      auth: { ...state.auth, loading: true, error: null } 
    }))

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Obtener permisos del usuario
      const permissions = await get().getUserPermissions(data.user.email)

      set((state) => ({
        auth: {
          ...state.auth,
          session: data.session,
          user: data.user,
          permissions,
          loading: false,
          error: null
        }
      }))

      return { success: true }
    } catch (error) {
      set((state) => ({
        auth: {
          ...state.auth,
          loading: false,
          error: error.message
        }
      }))
      return { success: false, error: error.message }
    }
  },

  signUp: async (email, password, userData = {}) => {
    set((state) => ({ 
      auth: { ...state.auth, loading: true, error: null } 
    }))

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error

      // Obtener permisos del usuario
      const permissions = await get().getUserPermissions(data.user.email)

      set((state) => ({
        auth: {
          ...state.auth,
          session: data.session,
          user: data.user,
          permissions,
          loading: false,
          error: null
        }
      }))

      return { success: true }
    } catch (error) {
      set((state) => ({
        auth: {
          ...state.auth,
          loading: false,
          error: error.message
        }
      }))
      return { success: false, error: error.message }
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut()
      set((state) => ({
        auth: {
          session: null,
          user: null,
          permissions: [],
          loading: false,
          error: null
        }
      }))
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  },

  checkSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      let permissions = []
      if (session?.user) {
        permissions = await get().getUserPermissions(session.user.email)
      }
      
      set((state) => ({
        auth: {
          ...state.auth,
          session,
          user: session?.user || null,
          permissions,
          loading: false
        }
      }))
    } catch (error) {
      console.error('Error en checkSession:', error)
      set((state) => ({
        auth: {
          ...state.auth,
          loading: false,
          error: error.message
        }
      }))
    }
  },

  // Función mejorada para obtener permisos del usuario
  getUserPermissions: async (email) => {
    try {
      console.log('🔍 Obteniendo permisos para:', email)
      
      // Primero verificar en tabla empleados (más confiable)
      const { data: empleado, error: empleadoError } = await supabase
        .from('empleados')
        .select('rol, activo')
        .eq('email', email)
        .eq('activo', true)
        .single()

      if (empleadoError) {
        console.log('❌ Error buscando empleado:', empleadoError.message)
      } else if (empleado) {
        console.log('✅ Empleado encontrado:', empleado.rol)
        
        // Mapear rol a permisos
        const rolePermissions = {
          'Administrador': ['admin', 'dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'reportes', 'inventario', 'proveedores', 'categorias', 'compras', 'gastos'],
          'Gerente': ['dashboard', 'productos', 'clientes', 'ventas', 'reportes', 'inventario'],
          'Vendedor': ['dashboard', 'productos', 'clientes', 'ventas'],
          'Técnico': ['dashboard', 'productos', 'inventario', 'reportes'],
          'Almacén': ['dashboard', 'productos', 'inventario', 'reportes'],
          'Cajero': ['dashboard', 'ventas', 'caja', 'clientes']
        }

        const permissions = rolePermissions[empleado.rol] || []
        console.log('📋 Permisos asignados:', permissions)
        return permissions
      }

      // Si no se encuentra en empleados, verificar auth.users
      try {
        const { data: authUser, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.log('❌ Error obteniendo usuario auth:', authError.message)
        } else if (authUser?.user) {
          console.log('✅ Usuario auth encontrado:', authUser.user.email)
          
          // Verificar si tiene rol admin en metadata
          const userRole = authUser.user.user_metadata?.role || authUser.user.raw_user_meta_data?.role
          
          if (userRole === 'admin') {
            console.log('👑 Usuario es admin, asignando todos los permisos')
            return ['admin', 'dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'reportes', 'inventario', 'proveedores', 'categorias', 'compras', 'gastos']
          }
        }
      } catch (authError) {
        console.log('❌ Error en verificación de auth:', authError.message)
      }

      // Si no se encuentra en ningún lado, dar permisos básicos
      console.log('⚠️ Usuario no encontrado, asignando permisos básicos')
      return ['dashboard']
      
    } catch (error) {
      console.error('❌ Error obteniendo permisos:', error)
      // En caso de error, dar permisos básicos
      return ['dashboard']
    }
  },

  updateProfile: async (updates) => {
    try {
      const { data, error } = await supabase.auth.updateUser(updates)
      if (error) throw error

      set((state) => ({
        auth: {
          ...state.auth,
          user: data.user
        }
      }))

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
})
