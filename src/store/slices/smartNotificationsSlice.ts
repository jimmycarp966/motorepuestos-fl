import { StateCreator } from 'zustand'
import { AppStore } from '../types'
import { supabase } from '../../lib/supabase'

// ================================
// TIPOS AVANZADOS PARA NOTIFICACIONES
// ================================

export interface NotificationAction {
  label: string
  action: string
  variant?: 'primary' | 'secondary' | 'danger'
  payload?: any
}

export interface SmartNotification {
  id: string
  titulo: string
  mensaje: string
  tipo: 'success' | 'error' | 'warning' | 'info' | 'critico' | 'sistema'
  categoria: 'ventas' | 'inventario' | 'caja' | 'clientes' | 'empleados' | 'sistema' | 'seguridad'
  prioridad: 'baja' | 'media' | 'alta' | 'critica'
  timestamp: number
  leida: boolean
  persistente: boolean
  archivada: boolean
  
  // Acciones disponibles
  acciones?: NotificationAction[]
  
  // Metadatos para el contexto
  contexto?: {
    modulo?: string
    entidad_id?: string
    entidad_tipo?: string
    usuario_id?: string
    datos_adicionales?: Record<string, any>
  }
  
  // Configuración de visualización
  duracion?: number // 0 = permanente hasta que se lea
  silenciable: boolean
  requiere_accion: boolean
  
  // Programación
  programada?: {
    mostrar_en: Date
    repetir?: 'diario' | 'semanal' | 'mensual'
    condicion?: string
  }
  
  // Historial
  created_at: Date
  updated_at: Date
  expires_at?: Date
}

export interface NotificationSettings {
  habilitadas: boolean
  sonido: boolean
  vibrar: boolean
  push_browser: boolean
  email: boolean
  
  // Configuración por tipo
  tipos: {
    [key in SmartNotification['tipo']]: boolean
  }
  
  // Configuración por categoría
  categorias: {
    [key in SmartNotification['categoria']]: boolean
  }
  
  // Horarios de silencio
  horario_silencio: {
    habilitado: boolean
    inicio: string // HH:mm
    fin: string // HH:mm
    dias: number[] // 0-6 (domingo a sábado)
  }
}

export interface NotificationTemplate {
  id: string
  nombre: string
  titulo: string
  mensaje: string
  tipo: SmartNotification['tipo']
  categoria: SmartNotification['categoria']
  prioridad: SmartNotification['prioridad']
  condicion: string // Expresión para evaluar cuándo mostrar
  acciones: NotificationAction[]
  activa: boolean
}

export interface SmartNotificationsState {
  // Notificaciones actuales
  notificaciones: SmartNotification[]
  
  // Configuración del usuario
  configuracion: NotificationSettings
  
  // Plantillas disponibles
  plantillas: NotificationTemplate[]
  
  // Estados de carga
  loading: {
    fetching: boolean
    updating: boolean
    configuring: boolean
  }
  
  // Filtros y vista
  filtros: {
    categoria?: SmartNotification['categoria']
    tipo?: SmartNotification['tipo']
    leidas: boolean
    archivadas: boolean
  }
  
  // Estadísticas
  stats: {
    total: number
    no_leidas: number
    criticas: number
    archivadas: number
  }
  
  error: string | null
}

const configuracionDefault: NotificationSettings = {
  habilitadas: true,
  sonido: true,
  vibrar: true,
  push_browser: true,
  email: false,
  
  tipos: {
    success: true,
    error: true,
    warning: true,
    info: true,
    critico: true,
    sistema: true
  },
  
  categorias: {
    ventas: true,
    inventario: true,
    caja: true,
    clientes: true,
    empleados: true,
    sistema: true,
    seguridad: true
  },
  
  horario_silencio: {
    habilitado: false,
    inicio: '22:00',
    fin: '08:00',
    dias: [0, 6] // Weekends
  }
}

const initialState: SmartNotificationsState = {
  notificaciones: [],
  configuracion: configuracionDefault,
  plantillas: [],
  
  loading: {
    fetching: false,
    updating: false,
    configuring: false
  },
  
  filtros: {
    leidas: false,
    archivadas: false
  },
  
  stats: {
    total: 0,
    no_leidas: 0,
    criticas: 0,
    archivadas: 0
  },
  
  error: null
}

// ================================
// SLICE DE NOTIFICACIONES INTELIGENTES
// ================================

export const smartNotificationsSlice: StateCreator<
  AppStore,
  [],
  [],
  Pick<AppStore, 
    | 'smartNotifications' 
    | 'addSmartNotification'
    | 'markNotificationAsRead'
    | 'markNotificationAsArchived'
    | 'removeSmartNotification'
    | 'clearSmartNotifications'
    | 'executeNotificationAction'
    | 'updateNotificationSettings'
    | 'fetchSmartNotifications'
    | 'generateSystemNotifications'
    | 'setSmartNotificationFilter'
  >
> = (set, get) => ({
  smartNotifications: initialState,

  // ================================
  // AGREGAR NOTIFICACIÓN INTELIGENTE
  // ================================
  addSmartNotification: async (notification: Partial<SmartNotification>) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()

    const newNotification: SmartNotification = {
      id,
      titulo: notification.titulo || 'Notificación',
      mensaje: notification.mensaje || '',
      tipo: notification.tipo || 'info',
      categoria: notification.categoria || 'sistema',
      prioridad: notification.prioridad || 'media',
      timestamp: Date.now(),
      leida: false,
      persistente: notification.persistente || false,
      archivada: false,
      acciones: notification.acciones || [],
      contexto: notification.contexto,
      duracion: notification.duracion,
      silenciable: notification.silenciable !== false,
      requiere_accion: notification.requiere_accion || false,
      programada: notification.programada,
      created_at: now,
      updated_at: now,
      expires_at: notification.duracion ? new Date(now.getTime() + notification.duracion) : undefined
    }

    // Verificar si debe mostrarse según configuración
    const { configuracion } = get().smartNotifications
    if (!shouldShowNotification(newNotification, configuracion)) {
      return // No mostrar si está filtrada
    }

    // Guardar en base de datos si es persistente
    if (newNotification.persistente) {
      try {
        await supabase
          .from('notificaciones')
          .insert({
            id: newNotification.id,
            titulo: newNotification.titulo,
            mensaje: newNotification.mensaje,
            tipo: newNotification.tipo,
            categoria: newNotification.categoria,
            prioridad: newNotification.prioridad,
            contexto: newNotification.contexto,
            acciones: newNotification.acciones,
            empleado_id: get().auth?.user?.id
          })
      } catch (error) {
        console.error('❌ Error al guardar notificación persistente:', error)
      }
    }

    // Agregar al estado local
    set((state) => {
      const updatedNotifications = [...state.smartNotifications.notificaciones, newNotification]
      return {
        smartNotifications: {
          ...state.smartNotifications,
          notificaciones: updatedNotifications,
          stats: calculateStats(updatedNotifications)
        }
      }
    })

    // Reproducir sonido/vibración
    playNotificationFeedback(newNotification, configuracion)

    // Auto-remove si tiene duración y no es persistente
    if (newNotification.duracion && newNotification.duracion > 0 && !newNotification.persistente) {
      setTimeout(() => {
        get().removeSmartNotification(id)
      }, newNotification.duracion)
    }

    return id
  },

  // ================================
  // MARCAR COMO LEÍDA
  // ================================
  markNotificationAsRead: async (id: string) => {
    set((state) => {
      const updatedNotifications = state.smartNotifications.notificaciones.map(notif =>
        notif.id === id ? { ...notif, leida: true, updated_at: new Date() } : notif
      )
      return {
        smartNotifications: {
          ...state.smartNotifications,
          notificaciones: updatedNotifications,
          stats: calculateStats(updatedNotifications)
        }
      }
    })

    // Actualizar en BD si es persistente
    const notification = get().smartNotifications.notificaciones.find(n => n.id === id)
    if (notification?.persistente) {
      try {
        await supabase
          .from('notificaciones')
          .update({ leida: true, updated_at: new Date() })
          .eq('id', id)
      } catch (error) {
        console.error('❌ Error al marcar notificación como leída:', error)
      }
    }
  },

  // ================================
  // MARCAR COMO ARCHIVADA
  // ================================
  markNotificationAsArchived: async (id: string) => {
    set((state) => {
      const updatedNotifications = state.smartNotifications.notificaciones.map(notif =>
        notif.id === id ? { ...notif, archivada: true, updated_at: new Date() } : notif
      )
      return {
        smartNotifications: {
          ...state.smartNotifications,
          notificaciones: updatedNotifications,
          stats: calculateStats(updatedNotifications)
        }
      }
    })

    // Actualizar en BD si es persistente
    const notification = get().smartNotifications.notificaciones.find(n => n.id === id)
    if (notification?.persistente) {
      try {
        await supabase
          .from('notificaciones')
          .update({ archivada: true, updated_at: new Date() })
          .eq('id', id)
      } catch (error) {
        console.error('❌ Error al archivar notificación:', error)
      }
    }
  },

  // ================================
  // REMOVER NOTIFICACIÓN
  // ================================
  removeSmartNotification: (id: string) => {
    set((state) => {
      const updatedNotifications = state.smartNotifications.notificaciones.filter(n => n.id !== id)
      return {
        smartNotifications: {
          ...state.smartNotifications,
          notificaciones: updatedNotifications,
          stats: calculateStats(updatedNotifications)
        }
      }
    })
  },

  // ================================
  // LIMPIAR TODAS LAS NOTIFICACIONES
  // ================================
  clearSmartNotifications: () => {
    set((state) => ({
      smartNotifications: {
        ...state.smartNotifications,
        notificaciones: [],
        stats: { total: 0, no_leidas: 0, criticas: 0, archivadas: 0 }
      }
    }))
  },

  // ================================
  // EJECUTAR ACCIÓN DE NOTIFICACIÓN
  // ================================
  executeNotificationAction: async (notificationId: string, actionKey: string) => {
    const notification = get().smartNotifications.notificaciones.find(n => n.id === notificationId)
    if (!notification) return

    const action = notification.acciones?.find(a => a.action === actionKey)
    if (!action) return

    try {
      // Ejecutar lógica según el tipo de acción
      switch (action.action) {
        case 'navigate':
          // Navegar a un módulo específico
          if (action.payload?.module) {
            get().setCurrentModule(action.payload.module)
          }
          break

        case 'refresh_data':
          // Refrescar datos específicos
          if (action.payload?.entity === 'productos') {
            await get().fetchProductos()
          } else if (action.payload?.entity === 'ventas') {
            await get().fetchVentas()
          }
          break

        case 'open_form':
          // Abrir formulario específico
          // Esto requeriría integración con el sistema de modales
          break

        case 'mark_resolved':
          // Marcar como resuelto y archivar
          await get().markNotificationAsArchived(notificationId)
          break

        default:
          console.warn('❌ Acción de notificación no reconocida:', action.action)
      }

      // Marcar notificación como leída después de ejecutar acción
      await get().markNotificationAsRead(notificationId)

    } catch (error) {
      console.error('❌ Error al ejecutar acción de notificación:', error)
    }
  },

  // ================================
  // ACTUALIZAR CONFIGURACIÓN
  // ================================
  updateNotificationSettings: async (newSettings: Partial<NotificationSettings>) => {
    set((state) => ({
      smartNotifications: {
        ...state.smartNotifications,
        configuracion: {
          ...state.smartNotifications.configuracion,
          ...newSettings
        }
      }
    }))

    // Guardar configuración en localStorage
    try {
      localStorage.setItem('smart_notification_settings', JSON.stringify({
        ...get().smartNotifications.configuracion,
        ...newSettings
      }))
    } catch (error) {
      console.error('❌ Error al guardar configuración de notificaciones:', error)
    }
  },

  // ================================
  // CARGAR NOTIFICACIONES PERSISTENTES
  // ================================
  fetchSmartNotifications: async () => {
    set((state) => ({
      smartNotifications: {
        ...state.smartNotifications,
        loading: { ...state.smartNotifications.loading, fetching: true },
        error: null
      }
    }))

    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('empleado_id', get().auth?.user?.id)
        .eq('archivada', false)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      const notificaciones: SmartNotification[] = data.map((item: any) => ({
        id: item.id,
        titulo: item.titulo,
        mensaje: item.mensaje,
        tipo: item.tipo,
        categoria: item.categoria,
        prioridad: item.prioridad,
        timestamp: new Date(item.created_at).getTime(),
        leida: item.leida,
        persistente: true,
        archivada: item.archivada,
        acciones: item.acciones || [],
        contexto: item.contexto,
        silenciable: true,
        requiere_accion: item.requiere_accion || false,
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at)
      }))

      set((state) => ({
        smartNotifications: {
          ...state.smartNotifications,
          notificaciones,
          stats: calculateStats(notificaciones),
          loading: { ...state.smartNotifications.loading, fetching: false }
        }
      }))

    } catch (error: any) {
      console.error('❌ Error al cargar notificaciones:', error)
      set((state) => ({
        smartNotifications: {
          ...state.smartNotifications,
          loading: { ...state.smartNotifications.loading, fetching: false },
          error: error.message || 'Error al cargar notificaciones'
        }
      }))
    }
  },

  // ================================
  // GENERAR NOTIFICACIONES DEL SISTEMA
  // ================================
  generateSystemNotifications: async () => {
    const { productos, caja } = get()

    // Verificar stock bajo
    if (productos?.length) {
      const stockBajo = productos.filter(p => p.stock <= p.stock_minimo)
      if (stockBajo.length > 0) {
        get().addSmartNotification({
          titulo: '⚠️ Stock Bajo',
          mensaje: `${stockBajo.length} productos con stock crítico`,
          tipo: 'warning',
          categoria: 'inventario',
          prioridad: 'alta',
          persistente: true,
          acciones: [
            {
              label: 'Ver productos',
              action: 'navigate',
              variant: 'primary',
              payload: { module: 'productos' }
            },
            {
              label: 'Marcar como visto',
              action: 'mark_resolved',
              variant: 'secondary'
            }
          ]
        })
      }
    }

    // Verificar caja sin abrir
    if (caja && !caja.cajaAbierta) {
      get().addSmartNotification({
        titulo: '💰 Caja sin abrir',
        mensaje: 'Recuerda abrir la caja antes de iniciar ventas',
        tipo: 'info',
        categoria: 'caja',
        prioridad: 'media',
        acciones: [
          {
            label: 'Abrir caja',
            action: 'navigate',
            variant: 'primary',
            payload: { module: 'caja' }
          }
        ]
      })
    }

    // Otras verificaciones automáticas...
  },

  // ================================
  // FILTROS
  // ================================
  setSmartNotificationFilter: (filtros: Partial<SmartNotificationsState['filtros']>) => {
    set((state) => ({
      smartNotifications: {
        ...state.smartNotifications,
        filtros: {
          ...state.smartNotifications.filtros,
          ...filtros
        }
      }
    }))
  }
})

// ================================
// FUNCIONES AUXILIARES
// ================================

function shouldShowNotification(
  notification: SmartNotification, 
  settings: NotificationSettings
): boolean {
  if (!settings.habilitadas) return false
  if (!settings.tipos[notification.tipo]) return false
  if (!settings.categorias[notification.categoria]) return false

  // Verificar horario de silencio
  if (settings.horario_silencio.habilitado) {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = currentHour * 60 + currentMinute

    const [startHour, startMinute] = settings.horario_silencio.inicio.split(':').map(Number)
    const [endHour, endMinute] = settings.horario_silencio.fin.split(':').map(Number)
    
    const startTime = startHour * 60 + startMinute
    const endTime = endHour * 60 + endMinute

    const currentDay = now.getDay()
    
    if (settings.horario_silencio.dias.includes(currentDay)) {
      if (startTime <= endTime) {
        if (currentTime >= startTime && currentTime <= endTime) {
          return notification.prioridad === 'critica' // Solo críticas en horario silencio
        }
      } else {
        // Caso de medianoche (ej: 22:00 a 08:00)
        if (currentTime >= startTime || currentTime <= endTime) {
          return notification.prioridad === 'critica'
        }
      }
    }
  }

  return true
}

function playNotificationFeedback(
  notification: SmartNotification, 
  settings: NotificationSettings
) {
  // Sonido
  if (settings.sonido) {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = notification.prioridad === 'critica' ? 800 : 600
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.warn('⚠️ No se pudo reproducir sonido de notificación:', error)
    }
  }

  // Vibración
  if (settings.vibrar && 'vibrate' in navigator) {
    const pattern = notification.prioridad === 'critica' ? [200, 100, 200] : [100]
    navigator.vibrate(pattern)
  }
}

function calculateStats(notifications: SmartNotification[]) {
  return {
    total: notifications.length,
    no_leidas: notifications.filter(n => !n.leida).length,
    criticas: notifications.filter(n => n.prioridad === 'critica').length,
    archivadas: notifications.filter(n => n.archivada).length
  }
}
