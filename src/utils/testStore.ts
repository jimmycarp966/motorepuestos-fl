import { useAppStore } from '../store'

export const testStore = () => {
  const store = useAppStore.getState()
  
  console.log('🧪 Test Store - Verificando funciones disponibles:')
  console.log('  login:', typeof store.login)
  console.log('  logout:', typeof store.logout)
  console.log('  checkAuth:', typeof store.checkAuth)
  console.log('  fetchEmpleados:', typeof store.fetchEmpleados)
  console.log('  fetchProductos:', typeof store.fetchProductos)
  console.log('  fetchClientes:', typeof store.fetchClientes)
  console.log('  fetchVentas:', typeof store.fetchVentas)
  console.log('  fetchMovimientos:', typeof store.fetchMovimientos)
  
  // Verificar estado inicial
  console.log('  Estado auth:', store.auth)
  console.log('  Estado empleados:', store.empleados)
  console.log('  Estado productos:', store.productos)
  console.log('  Estado clientes:', store.clientes)
  console.log('  Estado ventas:', store.ventas)
  console.log('  Estado caja:', store.caja)
  console.log('  Estado ui:', store.ui)
  console.log('  Estado notifications:', store.notifications)
  
  return {
    hasLogin: typeof store.login === 'function',
    hasLogout: typeof store.logout === 'function',
    hasCheckAuth: typeof store.checkAuth === 'function',
    hasFetchEmpleados: typeof store.fetchEmpleados === 'function',
    hasFetchProductos: typeof store.fetchProductos === 'function',
    hasFetchClientes: typeof store.fetchClientes === 'function',
    hasFetchVentas: typeof store.fetchVentas === 'function',
    hasFetchMovimientos: typeof store.fetchMovimientos === 'function',
  }
}
