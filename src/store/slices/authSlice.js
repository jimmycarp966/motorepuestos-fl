import { supabase } from '../../supabase'

export const createAuthSlice = (set, get) => ({
  auth: {
    session: null,
    user: null,
    loading: true,
    error: null
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

      set((state) => ({
        auth: {
          ...state.auth,
          session: data.session,
          user: data.user,
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

      set((state) => ({
        auth: {
          ...state.auth,
          session: data.session,
          user: data.user,
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
      
      set((state) => ({
        auth: {
          ...state.auth,
          session,
          user: session?.user || null,
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
