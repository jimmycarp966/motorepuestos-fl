export const createUISlice = (set, get) => ({
  ui: {
    theme: 'light',
    sidebarOpen: false,
    currentModule: 'dashboard',
    loading: false,
    error: null
  },

  // Acciones de UI
  setTheme: (theme) => {
    set((state) => ({
      ui: { ...state.ui, theme }
    }))
  },

  toggleSidebar: () => {
    set((state) => ({
      ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
    }))
  },

  setSidebarOpen: (open) => {
    set((state) => ({
      ui: { ...state.ui, sidebarOpen: open }
    }))
  },

  setCurrentModule: (module) => {
    set((state) => ({
      ui: { ...state.ui, currentModule: module }
    }))
  },

  setLoading: (loading) => {
    set((state) => ({
      ui: { ...state.ui, loading }
    }))
  },

  setError: (error) => {
    set((state) => ({
      ui: { ...state.ui, error }
    }))
  },

  clearError: () => {
    set((state) => ({
      ui: { ...state.ui, error: null }
    }))
  },

  // Módulos disponibles
  getModules: () => [
    { id: 'dashboard', name: 'Dashboard', icon: 'Home' },
    { id: 'productos', name: 'Productos', icon: 'Package' },
    { id: 'ventas', name: 'Ventas', icon: 'ShoppingCart' },
    { id: 'caja', name: 'Caja', icon: 'DollarSign' },
    { id: 'clientes', name: 'Clientes', icon: 'Users' },
    { id: 'empleados', name: 'Empleados', icon: 'UserCheck' },
    { id: 'reportes', name: 'Reportes', icon: 'BarChart3' }
  ],

  // Verificar acceso a módulo
  canAccessModule: (moduleId) => {
    const user = get().auth.user
    if (!user) return false

    // Por ahora, todos los usuarios autenticados tienen acceso
    // Aquí se puede implementar lógica de roles más compleja
    return true
  }
})
