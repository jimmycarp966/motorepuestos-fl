import React from 'react'
import { useAppStore } from '../store'
import { DateUtils } from './dateUtils'

// Tipos para el sistema de sincronización de calendario
export interface CalendarSyncState {
  currentDate: string
  lastSyncDate: string | null
  isDayChanged: boolean
  syncInProgress: boolean
  lastSyncTimestamp: number
}

export interface DayChangeEvent {
  previousDate: string
  currentDate: string
  timestamp: number
}

// Clase principal para manejo de sincronización de calendario
export class CalendarSyncManager {
  private static instance: CalendarSyncManager
  private currentDate: string
  private lastSyncDate: string | null = null
  private syncInProgress: boolean = false
  private listeners: Set<(event: DayChangeEvent) => void> = new Set()
  private intervalId: NodeJS.Timeout | null = null
  private store: any = null

  private constructor() {
    this.currentDate = DateUtils.getCurrentDate()
    this.startMonitoring()
  }

  static getInstance(): CalendarSyncManager {
    if (!CalendarSyncManager.instance) {
      CalendarSyncManager.instance = new CalendarSyncManager()
    }
    return CalendarSyncManager.instance
  }

  // Inicializar con el store
  initialize(store: any) {
    this.store = store
    this.checkDayChange()
  }

  // Monitorear cambios de día
  private startMonitoring() {
    // Verificar cada 30 segundos si cambió el día (más frecuente para mayor precisión)
    this.intervalId = setInterval(() => {
      this.checkDayChange()
    }, 30000) // 30 segundos

    // También verificar cuando la ventana se vuelve activa
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        this.checkDayChange()
      })

      window.addEventListener('online', () => {
        this.checkDayChange()
      })

      // Verificar cuando el usuario regresa a la pestaña
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.checkDayChange()
        }
      })
    }
  }

  // Verificar si cambió el día
  private checkDayChange() {
    const newDate = DateUtils.getCurrentDate()
    
    if (newDate !== this.currentDate) {
      const previousDate = this.currentDate
      this.currentDate = newDate
      
      console.log(`🔄 [CalendarSync] Cambio de día detectado: ${previousDate} → ${newDate}`)
      
      // Notificar a todos los listeners
      const event: DayChangeEvent = {
        previousDate,
        currentDate: newDate,
        timestamp: Date.now()
      }
      
      this.notifyListeners(event)
      
      // Sincronizar datos si hay store disponible
      if (this.store) {
        this.syncDataOnDayChange(event)
      }
    }
  }

  // Sincronizar datos cuando cambia el día
  private async syncDataOnDayChange(event: DayChangeEvent) {
    if (this.syncInProgress) {
      console.log('⚠️ [CalendarSync] Sincronización ya en progreso, saltando...')
      return
    }

    this.syncInProgress = true
    console.log('🔄 [CalendarSync] Iniciando sincronización de datos...')

    try {
      // Refrescar todos los datos críticos
      await Promise.allSettled([
        this.store.getState().fetchVentas(),
        this.store.getState().fetchMovimientos(),
        this.store.getState().fetchProductos(),
        this.store.getState().fetchClientes(),
        this.store.getState().fetchCajasDiarias(),
        this.store.getState().fetchArqueos()
      ])

      // Notificar cambio de día
      this.store.getState().addNotification({
        id: `day-change-${Date.now()}`,
        type: 'info',
        title: 'Nuevo Día',
        message: `Datos actualizados para ${event.currentDate}`,
        duration: 3000
      })

      console.log('✅ [CalendarSync] Sincronización completada exitosamente')
    } catch (error) {
      console.error('❌ [CalendarSync] Error en sincronización:', error)
      
      this.store.getState().addNotification({
        id: `day-change-error-${Date.now()}`,
        type: 'error',
        title: 'Error de Sincronización',
        message: 'Hubo un problema actualizando los datos del nuevo día',
        duration: 5000
      })
    } finally {
      this.syncInProgress = false
      this.lastSyncDate = event.currentDate
    }
  }

  // Agregar listener para cambios de día
  addListener(callback: (event: DayChangeEvent) => void) {
    this.listeners.add(callback)
    
    // Retornar función para remover listener
    return () => {
      this.listeners.delete(callback)
    }
  }

  // Notificar a todos los listeners
  private notifyListeners(event: DayChangeEvent) {
    this.listeners.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('❌ [CalendarSync] Error en listener:', error)
      }
    })
  }

  // Obtener estado actual
  getState(): CalendarSyncState {
    return {
      currentDate: this.currentDate,
      lastSyncDate: this.lastSyncDate,
      isDayChanged: this.lastSyncDate !== this.currentDate,
      syncInProgress: this.syncInProgress,
      lastSyncTimestamp: Date.now()
    }
  }

  // Forzar sincronización manual
  async forceSync() {
    const event: DayChangeEvent = {
      previousDate: this.lastSyncDate || this.currentDate,
      currentDate: this.currentDate,
      timestamp: Date.now()
    }
    
    await this.syncDataOnDayChange(event)
  }

  // Limpiar recursos
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    
    this.listeners.clear()
  }
}

// Hook para usar el sistema de sincronización
export const useCalendarSync = () => {
  const [syncState, setSyncState] = React.useState<CalendarSyncState>({
    currentDate: DateUtils.getCurrentDate(),
    lastSyncDate: null,
    isDayChanged: false,
    syncInProgress: false,
    lastSyncTimestamp: Date.now()
  })

  const store = useAppStore()

  React.useEffect(() => {
    const manager = CalendarSyncManager.getInstance()
    
    // Inicializar con el store
    manager.initialize(store)
    
    // Actualizar estado inicial
    setSyncState(manager.getState())
    
    // Agregar listener para cambios
    const removeListener = manager.addListener((event) => {
      setSyncState(manager.getState())
    })

    return () => {
      removeListener()
    }
  }, [store])

  return {
    ...syncState,
    forceSync: () => CalendarSyncManager.getInstance().forceSync()
  }
}

// Función para inicializar el sistema globalmente
export const initializeCalendarSync = (store: any) => {
  const manager = CalendarSyncManager.getInstance()
  manager.initialize(store)
  return manager
}
