import { supabase } from '../../lib/supabase.js'

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
      set((state) => ({
        auth: {
          ...state.auth,
          loading: false,
          error: error.message
        }
      }))
    }
  },

  // Nueva función para obtener permisos del usuario
  getUserPermissions: async (email) => {
    try {
      // Verificar si es admin en auth.users
      const { data: authUser } = await supabase.auth.getUser()
      if (authUser?.user?.role === 'admin') {
        return ['admin', 'dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'reportes', 'inventario', 'proveedores', 'categorias', 'compras', 'gastos']
      }

      // Buscar en tabla empleados
      const { data: empleado, error } = await supabase
        .from('empleados')
        .select('rol, activo')
        .eq('email', email)
        .eq('activo', true)
        .single()

      if (error || !empleado) {
        return []
      }

      // Mapear rol a permisos
      const rolePermissions = {
        'Administrador': ['admin', 'dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'reportes', 'inventario', 'proveedores', 'categorias', 'compras', 'gastos'],
        'Gerente': ['dashboard', 'productos', 'clientes', 'ventas', 'reportes', 'inventario'],
        'Vendedor': ['dashboard', 'productos', 'clientes', 'ventas'],
        'Técnico': ['dashboard', 'productos', 'inventario', 'reportes'],
        'Almacén': ['dashboard', 'productos', 'inventario', 'reportes'],
        'Cajero': ['dashboard', 'ventas', 'caja', 'clientes']
      }

      return rolePermissions[empleado.rol] || []
    } catch (error) {
      console.error('Error obteniendo permisos:', error)
      return []
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
