// Importar desde el store principal en lugar de los slices individuales
import { useAppStore } from '../store'

export const debugSlices = () => {
  console.log('🔍 Debug Slices - Verificando store completo:')
  
  try {
    const store = useAppStore.getState()
    
    console.log('🔍 Store completo:', store)
    console.log('🔍 Tipos de funciones disponibles:')
    
    // Verificar todas las funciones del store
    const functions = [
      'login', 'logout', 'checkAuth',
      'fetchEmpleados', 'createEmpleado', 'updateEmpleado', 'deleteEmpleado',
      'fetchProductos', 'createProducto', 'updateProducto', 'deleteProducto',
      'fetchClientes', 'createCliente', 'updateCliente', 'deleteCliente',
      'fetchVentas', 'registrarVenta',
      'fetchMovimientos', 'registrarIngreso', 'registrarEgreso',
      'setTheme', 'setSidebarOpen', 'setCurrentModule',
      'addNotification', 'removeNotification'
    ]
    
    functions.forEach(funcName => {
      const func = (store as any)[funcName]
      console.log(`${funcName}:`, typeof func)
    })
    
    // Verificar estados
    console.log('🔍 Estados disponibles:')
    const states = ['auth', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'ui', 'notifications']
    states.forEach(stateName => {
      const state = (store as any)[stateName]
      console.log(`${stateName}:`, typeof state, state)
    })
    
  } catch (error) {
    console.error('❌ Error probando store:', error)
  }
}
