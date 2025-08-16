import { useAppStore } from '../store'
import { supabase } from '../lib/supabase'

export interface SyncStatus {
  empleados: { synced: boolean; count: number; error?: string }
  productos: { synced: boolean; count: number; error?: string }
  clientes: { synced: boolean; count: number; error?: string }
  ventas: { synced: boolean; count: number; error?: string }
  caja: { synced: boolean; count: number; error?: string }
}

export const verifySyncStatus = async (): Promise<SyncStatus> => {
  const store = useAppStore.getState()
  const status: SyncStatus = {
    empleados: { synced: false, count: 0 },
    productos: { synced: false, count: 0 },
    clientes: { synced: false, count: 0 },
    ventas: { synced: false, count: 0 },
    caja: { synced: false, count: 0 }
  }

  try {
    // Verificar empleados
    const { data: empleadosDB, error: empleadosError } = await supabase
      .from('empleados')
      .select('id')
      .eq('activo', true)
    
    if (empleadosError) {
      status.empleados.error = empleadosError.message
    } else {
      const empleadosLocal = store.empleados.empleados.filter(e => e.activo)
      status.empleados.count = empleadosDB?.length || 0
      status.empleados.synced = empleadosLocal.length === empleadosDB?.length
    }

    // Verificar productos
    const { data: productosDB, error: productosError } = await supabase
      .from('productos')
      .select('id')
      .eq('activo', true)
    
    if (productosError) {
      status.productos.error = productosError.message
    } else {
      const productosLocal = store.productos.productos.filter(p => p.activo)
      status.productos.count = productosDB?.length || 0
      status.productos.synced = productosLocal.length === productosDB?.length
    }

    // Verificar clientes
    const { data: clientesDB, error: clientesError } = await supabase
      .from('clientes')
      .select('id')
      .eq('activo', true)
    
    if (clientesError) {
      status.clientes.error = clientesError.message
    } else {
      const clientesLocal = store.clientes.clientes.filter(c => c.activo)
      status.clientes.count = clientesDB?.length || 0
      status.clientes.synced = clientesLocal.length === clientesDB?.length
    }

    // Verificar ventas
    const { data: ventasDB, error: ventasError } = await supabase
      .from('ventas')
      .select('id')
    
    if (ventasError) {
      status.ventas.error = ventasError.message
    } else {
      status.ventas.count = ventasDB?.length || 0
      status.ventas.synced = store.ventas.ventas.length === ventasDB?.length
    }

    // Verificar caja
    const { data: cajaDB, error: cajaError } = await supabase
      .from('caja_movimientos')
      .select('id')
    
    if (cajaError) {
      status.caja.error = cajaError.message
    } else {
      status.caja.count = cajaDB?.length || 0
      status.caja.synced = store.caja.movimientos.length === cajaDB?.length
    }

  } catch (error: any) {
    console.error('Error verificando sincronización:', error)
  }

  return status
}

export const forceSyncAll = async (): Promise<void> => {
  const store = useAppStore.getState()
  
  try {
    console.log('🔄 Forzando sincronización completa...')
    
    await Promise.all([
      store.fetchEmpleados(),
      store.fetchProductos(),
      store.fetchClientes(),
      store.fetchVentas(),
      store.fetchMovimientos()
    ])
    
    console.log('✅ Sincronización completa finalizada')
    
    store.addNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Sincronización completada',
      message: 'Todos los datos han sido sincronizados con la base de datos'
    })
    
  } catch (error: any) {
    console.error('❌ Error en sincronización:', error)
    
    store.addNotification({
      id: Date.now().toString(),
      type: 'error',
      title: 'Error de sincronización',
      message: 'No se pudo completar la sincronización de datos'
    })
  }
}
