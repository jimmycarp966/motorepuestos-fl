import { useAppStore } from '../store'

// Test rápido para verificar que las funciones del store estén disponibles
export const quickTest = () => {
  try {
    const store = useAppStore.getState()
    
    console.log('🧪 Quick Test - Verificando funciones:')
    console.log('  login:', typeof store.login)
    console.log('  logout:', typeof store.logout)
    console.log('  checkAuth:', typeof store.checkAuth)
    
    const result = {
      login: typeof store.login === 'function',
      logout: typeof store.logout === 'function',
      checkAuth: typeof store.checkAuth === 'function',
      store: store
    }
    
    console.log('✅ Quick Test completado:', result)
    return result
    
  } catch (error) {
    console.error('❌ Quick Test falló:', error)
    return {
      login: false,
      logout: false,
      checkAuth: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}
