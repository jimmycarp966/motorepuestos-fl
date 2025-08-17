// ================================================
// GESTOR DE FUNCIONALIDAD OFFLINE
// ================================================
// Sistema robusto para manejar ventas offline con sincronización automática

import { config } from './config'
import { AuditLogger } from './auditLogger'
import { businessCache } from './cacheManager'
import { supabase } from './supabase'

// Tipos para operaciones offline
export interface OfflineOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: 'venta' | 'cliente' | 'producto'
  data: any
  timestamp: number
  retryCount: number
  maxRetries: number
  status: 'pending' | 'syncing' | 'completed' | 'failed'
  error?: string
}

export interface OfflineVenta {
  id: string
  cliente_id?: string
  empleado_id: string
  items: Array<{
    producto_id: string
    cantidad: number
    precio_unitario: number
    subtotal: number
    tipo_precio: 'minorista' | 'mayorista'
  }>
  total: number
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cuenta_corriente'
  tipo_precio: 'minorista' | 'mayorista'
  fecha: string
  timestamp: number
  synced: boolean
}

export interface OfflineState {
  isOnline: boolean
  lastSync: number
  pendingOperations: OfflineOperation[]
  offlineVentas: OfflineVenta[]
  syncInProgress: boolean
}

// Clase principal del gestor offline
class OfflineManager {
  private state: OfflineState = {
    isOnline: navigator.onLine,
    lastSync: 0,
    pendingOperations: [],
    offlineVentas: [],
    syncInProgress: false
  }

  private listeners: Array<(state: OfflineState) => void> = []
  private syncInterval: number | null = null

  constructor() {
    this.initializeOfflineSupport()
    this.loadOfflineData()
    this.setupEventListeners()
    this.startPeriodicSync()
  }

  // ================================================
  // INICIALIZACIÓN Y CONFIGURACIÓN
  // ================================================

  private initializeOfflineSupport(): void {
    if (!config.offlineEnabled) return

    // Registrar Service Worker para cache offline
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          if (config.debug) {
            console.log('📱 [Offline] Service Worker registrado:', registration)
          }
        })
        .catch(error => {
          console.error('📱 [Offline] Error registrando Service Worker:', error)
        })
    }

    // Cache crítico para funcionalidad offline
    this.cacheEssentialData()
  }

  private setupEventListeners(): void {
    // Detectar cambios de conectividad
    window.addEventListener('online', () => {
      this.updateOnlineStatus(true)
      this.syncPendingOperations()
    })

    window.addEventListener('offline', () => {
      this.updateOnlineStatus(false)
    })

    // Detectar antes de cerrar la página
    window.addEventListener('beforeunload', () => {
      this.saveOfflineData()
    })

    // Sync cada 30 segundos cuando está online
    this.startPeriodicSync()
  }

  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = window.setInterval(() => {
      if (this.state.isOnline && this.state.pendingOperations.length > 0) {
        this.syncPendingOperations()
      }
    }, 30000) // 30 segundos
  }

  // ================================================
  // GESTIÓN DE ESTADO OFFLINE
  // ================================================

  private updateOnlineStatus(isOnline: boolean): void {
    this.state.isOnline = isOnline
    
    if (config.debug) {
      console.log(`📱 [Offline] Estado de conexión: ${isOnline ? 'ONLINE' : 'OFFLINE'}`)
    }

    this.notifyListeners()

    // Log del cambio de estado
    AuditLogger.logAction('connection_status_change', {
      isOnline,
      pendingOperations: this.state.pendingOperations.length,
      offlineVentas: this.state.offlineVentas.length
    })
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.state })
      } catch (error) {
        console.error('📱 [Offline] Error notificando listener:', error)
      }
    })
  }

  // ================================================
  // OPERACIONES OFFLINE DE VENTAS
  // ================================================

  /**
   * Registrar venta offline
   */
  async registrarVentaOffline(ventaData: Omit<OfflineVenta, 'id' | 'timestamp' | 'synced'>): Promise<string> {
    const ventaOffline: OfflineVenta = {
      ...ventaData,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      synced: false
    }

    // Agregar a ventas offline
    this.state.offlineVentas.push(ventaOffline)

    // Crear operación de sincronización
    const operation: OfflineOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'create',
      entity: 'venta',
      data: ventaOffline,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3,
      status: 'pending'
    }

    this.state.pendingOperations.push(operation)

    // Guardar en localStorage
    this.saveOfflineData()

    // Intentar sincronizar inmediatamente si está online
    if (this.state.isOnline) {
      this.syncPendingOperations()
    }

    this.notifyListeners()

    if (config.debug) {
      console.log('📱 [Offline] Venta registrada offline:', ventaOffline.id)
    }

    AuditLogger.logAction('venta_offline_created', {
      ventaId: ventaOffline.id,
      total: ventaOffline.total,
      items: ventaOffline.items.length
    })

    return ventaOffline.id
  }

  /**
   * Obtener ventas offline pendientes
   */
  getVentasOfflinePendientes(): OfflineVenta[] {
    return this.state.offlineVentas.filter(venta => !venta.synced)
  }

  /**
   * Obtener todas las ventas offline
   */
  getTodasVentasOffline(): OfflineVenta[] {
    return [...this.state.offlineVentas]
  }

  // ================================================
  // SINCRONIZACIÓN
  // ================================================

  /**
   * Sincronizar operaciones pendientes
   */
  async syncPendingOperations(): Promise<void> {
    if (!this.state.isOnline || this.state.syncInProgress) {
      return
    }

    if (this.state.pendingOperations.length === 0) {
      return
    }

    this.state.syncInProgress = true
    this.notifyListeners()

    const startTime = Date.now()
    let successCount = 0
    let errorCount = 0

    if (config.debug) {
      console.log(`📱 [Offline] Iniciando sincronización de ${this.state.pendingOperations.length} operaciones`)
    }

    for (const operation of [...this.state.pendingOperations]) {
      if (operation.status === 'completed') continue

      try {
        operation.status = 'syncing'
        await this.syncSingleOperation(operation)
        
        operation.status = 'completed'
        successCount++
        
        // Remover operación completada
        this.state.pendingOperations = this.state.pendingOperations.filter(op => op.id !== operation.id)
        
      } catch (error) {
        operation.retryCount++
        operation.error = error instanceof Error ? error.message : 'Error desconocido'
        errorCount++

        if (operation.retryCount >= operation.maxRetries) {
          operation.status = 'failed'
          console.error(`📱 [Offline] Operación fallida después de ${operation.maxRetries} intentos:`, operation)
        } else {
          operation.status = 'pending'
          if (config.debug) {
            console.log(`📱 [Offline] Reintentando operación ${operation.id} (${operation.retryCount}/${operation.maxRetries})`)
          }
        }
      }
    }

    this.state.syncInProgress = false
    this.state.lastSync = Date.now()
    
    // Guardar estado actualizado
    this.saveOfflineData()
    this.notifyListeners()

    const duration = Date.now() - startTime

    if (config.debug) {
      console.log(`📱 [Offline] Sincronización completada en ${duration}ms: ${successCount} éxitos, ${errorCount} errores`)
    }

    // Log de auditoría
    AuditLogger.logAction('offline_sync_completed', {
      duration,
      successCount,
      errorCount,
      pendingOperations: this.state.pendingOperations.length
    })
  }

  /**
   * Sincronizar una operación individual
   */
  private async syncSingleOperation(operation: OfflineOperation): Promise<void> {
    switch (operation.entity) {
      case 'venta':
        await this.syncVenta(operation)
        break
      case 'cliente':
        await this.syncCliente(operation)
        break
      case 'producto':
        await this.syncProducto(operation)
        break
      default:
        throw new Error(`Tipo de entidad no soportado: ${operation.entity}`)
    }
  }

  /**
   * Sincronizar venta offline
   */
  private async syncVenta(operation: OfflineOperation): Promise<void> {
    const ventaOffline = operation.data as OfflineVenta

    try {
      // Preparar datos para Supabase (sin el ID offline)
      const ventaData = {
        cliente_id: ventaOffline.cliente_id,
        empleado_id: ventaOffline.empleado_id,
        total: ventaOffline.total,
        metodo_pago: ventaOffline.metodo_pago,
        tipo_precio: ventaOffline.tipo_precio,
        fecha: ventaOffline.fecha,
        estado: 'completada'
      }

      // Crear venta en Supabase
      const { data: venta, error: ventaError } = await supabase
        .from('ventas')
        .insert([ventaData])
        .select()
        .single()

      if (ventaError) throw ventaError

      // Crear items de venta
      const itemsData = ventaOffline.items.map(item => ({
        venta_id: venta.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal,
        tipo_precio: item.tipo_precio
      }))

      const { error: itemsError } = await supabase
        .from('venta_items')
        .insert(itemsData)

      if (itemsError) throw itemsError

      // Actualizar stock de productos
      for (const item of ventaOffline.items) {
        const { error: stockError } = await supabase.rpc('decrement_stock', {
          producto_id: item.producto_id,
          cantidad: item.cantidad
        })

        if (stockError) {
          console.warn(`📱 [Offline] Warning: No se pudo actualizar stock para ${item.producto_id}:`, stockError)
        }
      }

      // Marcar como sincronizada
      const ventaIndex = this.state.offlineVentas.findIndex(v => v.id === ventaOffline.id)
      if (ventaIndex !== -1) {
        this.state.offlineVentas[ventaIndex].synced = true
      }

      if (config.debug) {
        console.log(`📱 [Offline] Venta sincronizada: ${ventaOffline.id} -> ${venta.id}`)
      }

      AuditLogger.logSuccess('venta_offline_synced', {
        offlineId: ventaOffline.id,
        onlineId: venta.id,
        total: ventaOffline.total
      })

    } catch (error) {
      AuditLogger.logError('venta_offline_sync_error', error as Error, {
        ventaId: ventaOffline.id,
        retryCount: operation.retryCount
      })
      throw error
    }
  }

  private async syncCliente(operation: OfflineOperation): Promise<void> {
    // Implementar sincronización de clientes offline
    throw new Error('Sincronización de clientes offline no implementada')
  }

  private async syncProducto(operation: OfflineOperation): Promise<void> {
    // Implementar sincronización de productos offline
    throw new Error('Sincronización de productos offline no implementada')
  }

  // ================================================
  // CACHE Y PERSISTENCIA
  // ================================================

  private async cacheEssentialData(): Promise<void> {
    if (!this.state.isOnline) return

    try {
      // Cache productos esenciales
      const productos = businessCache.productos.getAll()
      if (!productos) {
        // Si no hay cache, intentar cargar productos
        const { data } = await supabase
          .from('productos')
          .select('*')
          .eq('activo', true)
          .limit(100)

        if (data) {
          businessCache.productos.setAll(data)
        }
      }

      // Cache clientes frecuentes
      const { data: clientes } = await supabase
        .from('clientes')
        .select('*')
        .eq('activo', true)
        .limit(50)

      if (clientes) {
        businessCache.clientes.setAll(clientes)
      }

      if (config.debug) {
        console.log('📱 [Offline] Datos esenciales cacheados para uso offline')
      }

    } catch (error) {
      console.warn('📱 [Offline] Error cacheando datos esenciales:', error)
    }
  }

  private saveOfflineData(): void {
    try {
      const offlineData = {
        pendingOperations: this.state.pendingOperations,
        offlineVentas: this.state.offlineVentas,
        lastSync: this.state.lastSync
      }

      localStorage.setItem('offline_data', JSON.stringify(offlineData))
    } catch (error) {
      console.error('📱 [Offline] Error guardando datos offline:', error)
    }
  }

  private loadOfflineData(): void {
    try {
      const savedData = localStorage.getItem('offline_data')
      if (savedData) {
        const offlineData = JSON.parse(savedData)
        
        this.state.pendingOperations = offlineData.pendingOperations || []
        this.state.offlineVentas = offlineData.offlineVentas || []
        this.state.lastSync = offlineData.lastSync || 0

        if (config.debug) {
          console.log(`📱 [Offline] Datos offline cargados: ${this.state.pendingOperations.length} operaciones pendientes, ${this.state.offlineVentas.length} ventas offline`)
        }
      }
    } catch (error) {
      console.error('📱 [Offline] Error cargando datos offline:', error)
    }
  }

  // ================================================
  // API PÚBLICA
  // ================================================

  getState(): OfflineState {
    return { ...this.state }
  }

  isOnline(): boolean {
    return this.state.isOnline
  }

  subscribe(listener: (state: OfflineState) => void): () => void {
    this.listeners.push(listener)
    
    // Retornar función para desuscribirse
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  async forcSync(): Promise<void> {
    if (!this.state.isOnline) {
      throw new Error('No hay conexión a internet')
    }

    await this.syncPendingOperations()
  }

  clearOfflineData(): void {
    this.state.pendingOperations = []
    this.state.offlineVentas = []
    this.saveOfflineData()
    this.notifyListeners()
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    
    this.saveOfflineData()
    this.listeners = []
  }
}

// Instancia singleton
export const offlineManager = new OfflineManager()

// Hook para React (se debe usar desde un archivo separado con import de React)
export function createOfflineHook() {
  return function useOfflineManager() {
    // Este hook debe implementarse en el componente React
    // usando useState y useEffect con offlineManager.subscribe
    throw new Error('useOfflineManager debe implementarse en componente React')
  }
}



export default offlineManager
