import { useAppStore } from '../store'

export const debugStore = () => {
  const store = useAppStore.getState()
  
  console.log('🔍 Debug Store - Estado actual:', {
    auth: store.auth,
    hasLogin: typeof store.login === 'function',
    hasLogout: typeof store.logout === 'function',
    hasCheckAuth: typeof store.checkAuth === 'function',
    hasFetchEmpleados: typeof store.fetchEmpleados === 'function',
    hasFetchProductos: typeof store.fetchProductos === 'function',
    hasFetchClientes: typeof store.fetchClientes === 'function',
    hasFetchVentas: typeof store.fetchVentas === 'function',
    hasFetchMovimientos: typeof store.fetchMovimientos === 'function',
  })
  
  return store
}
