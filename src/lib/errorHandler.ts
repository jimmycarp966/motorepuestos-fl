import { AuditLogger, BusinessErrorClass, ERROR_MESSAGES, type ErrorCode } from './auditLogger'
import type { Notification } from '../store/types'

// Tipos para el manejador de errores
export interface ErrorContext {
  action: string
  module: string
  data?: any
  userId?: string
}

export interface ErrorHandlerResult {
  handled: boolean
  notification?: Notification
  shouldRetry?: boolean
  fallbackAction?: () => void
}

// Configuración de recuperación por tipo de error
interface RecoveryConfig {
  retryable: boolean
  maxRetries: number
  retryDelayMs: number
  fallbackMessage: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

const ERROR_RECOVERY_CONFIG: Record<string, RecoveryConfig> = {
  // Errores de conexión - recuperables
  'CONEXION_DB_ERROR': {
    retryable: true,
    maxRetries: 3,
    retryDelayMs: 1000,
    fallbackMessage: 'Problema de conexión. Reintentando...',
    severity: 'high'
  },
  'Network Error': {
    retryable: true,
    maxRetries: 2,
    retryDelayMs: 2000,
    fallbackMessage: 'Error de red. Verificando conexión...',
    severity: 'high'
  },
  
  // Errores de negocio - no recuperables automáticamente
  'VENTA_SIN_PRODUCTOS': {
    retryable: false,
    maxRetries: 0,
    retryDelayMs: 0,
    fallbackMessage: 'Agregue productos antes de continuar',
    severity: 'medium'
  },
  'STOCK_INSUFICIENTE': {
    retryable: false,
    maxRetries: 0,
    retryDelayMs: 0,
    fallbackMessage: 'Verifique el stock disponible',
    severity: 'medium'
  },
  'ARQUEO_COMPLETADO': {
    retryable: false,
    maxRetries: 0,
    retryDelayMs: 0,
    fallbackMessage: 'Sistema bloqueado hasta mañana',
    severity: 'high'
  },
  
  // Errores de autenticación - críticos
  'USUARIO_NO_AUTENTICADO': {
    retryable: false,
    maxRetries: 0,
    retryDelayMs: 0,
    fallbackMessage: 'Inicie sesión para continuar',
    severity: 'critical'
  },
  'SESION_EXPIRADA': {
    retryable: false,
    maxRetries: 0,
    retryDelayMs: 0,
    fallbackMessage: 'Sesión expirada. Redirigiendo...',
    severity: 'critical'
  }
}

// Clase principal para manejo de errores
export class ErrorHandler {
  private static retryAttempts = new Map<string, number>()
  private static addNotification: ((notification: Notification) => void) | null = null

  // Configurar el callback para notificaciones
  static setNotificationHandler(handler: (notification: Notification) => void): void {
    this.addNotification = handler
  }

  // Manejo principal de errores
  static async handle(
    error: Error | BusinessErrorClass,
    context: ErrorContext,
    customConfig?: Partial<RecoveryConfig>
  ): Promise<ErrorHandlerResult> {
    
    const startTime = Date.now()
    
    try {
      // Determinar tipo de error
      const errorCode = this.getErrorCode(error)
      const config = { ...ERROR_RECOVERY_CONFIG[errorCode], ...customConfig }
      
      // Log del error
      await AuditLogger.logError(context.action, context.module, error, {
        ...context.data,
        errorCode,
        severity: config?.severity || 'medium'
      })

      // Generar clave única para tracking de reintentos
      const retryKey = `${context.module}.${context.action}.${errorCode}`
      
      // Obtener mensaje de error para el usuario
      const userMessage = this.getUserMessage(error, errorCode)
      
      // Determinar si se debe reintentar
      const shouldRetry = this.shouldRetry(errorCode, retryKey, config)
      
      // Crear notificación
      const notification = this.createNotification(error, userMessage, config, shouldRetry)
      
      // Mostrar notificación si hay handler configurado
      if (this.addNotification && notification) {
        this.addNotification(notification)
      }

      // Acciones especiales según el error
      const specialActions = this.getSpecialActions(errorCode, context)
      
      return {
        handled: true,
        notification,
        shouldRetry,
        fallbackAction: specialActions
      }
      
    } catch (handlerError) {
      // Error en el propio manejador - fallback básico
      console.error('❌ [ErrorHandler] Error en manejo de errores:', handlerError)
      
      const fallbackNotification: Notification = {
        id: Date.now().toString(),
        type: 'error',
        title: 'Error del sistema',
        message: 'Ha ocurrido un error inesperado. Contacte al administrador.',
        duration: 0 // Persistente para errores críticos del handler
      }
      
      if (this.addNotification) {
        this.addNotification(fallbackNotification)
      }
      
      return {
        handled: false,
        notification: fallbackNotification,
        shouldRetry: false
      }
    }
  }

  // Determinar código de error
  private static getErrorCode(error: Error | BusinessErrorClass): string {
    if (error instanceof BusinessErrorClass) {
      return error.code
    }
    
    // Mapear errores comunes
    if (error.message.includes('Network')) return 'Network Error'
    if (error.message.includes('fetch')) return 'CONEXION_DB_ERROR'
    if (error.message.includes('timeout')) return 'CONEXION_DB_ERROR'
    if (error.message.includes('supabase')) return 'CONEXION_DB_ERROR'
    
    return 'UNKNOWN_ERROR'
  }

  // Obtener mensaje para el usuario
  private static getUserMessage(error: Error | BusinessErrorClass, errorCode: string): string {
    // Si es un error de negocio con código conocido
    if (error instanceof BusinessErrorClass && ERROR_MESSAGES[error.code as ErrorCode]) {
      return ERROR_MESSAGES[error.code as ErrorCode]
    }
    
    // Si hay mensaje en la configuración
    const config = ERROR_RECOVERY_CONFIG[errorCode]
    if (config?.fallbackMessage) {
      return config.fallbackMessage
    }
    
    // Fallback genérico
    return 'Ha ocurrido un error. Intente nuevamente.'
  }

  // Determinar si se debe reintentar
  private static shouldRetry(errorCode: string, retryKey: string, config?: RecoveryConfig): boolean {
    if (!config?.retryable) return false
    
    const currentAttempts = this.retryAttempts.get(retryKey) || 0
    
    if (currentAttempts >= config.maxRetries) {
      // Limpiar contador después del máximo
      this.retryAttempts.delete(retryKey)
      return false
    }
    
    // Incrementar contador
    this.retryAttempts.set(retryKey, currentAttempts + 1)
    return true
  }

  // Crear notificación según el error
  private static createNotification(
    error: Error,
    message: string,
    config?: RecoveryConfig,
    shouldRetry?: boolean
  ): Notification {
    
    const severity = config?.severity || 'medium'
    
    // Determinar tipo de notificación
    let type: Notification['type'] = 'error'
    if (severity === 'low') type = 'warning'
    if (severity === 'medium') type = 'error'
    if (severity === 'high' || severity === 'critical') type = 'error'
    
    // Duración según severidad
    let duration = 5000 // 5 segundos por defecto
    if (severity === 'low') duration = 3000
    if (severity === 'high') duration = 8000
    if (severity === 'critical') duration = 0 // Persistente
    
    // Título según contexto
    let title = 'Error'
    if (shouldRetry) title = 'Reintentando...'
    if (severity === 'critical') title = 'Error Crítico'
    if (severity === 'low') title = 'Advertencia'
    
    return {
      id: Date.now().toString(),
      type,
      title,
      message: shouldRetry ? `${message} (Reintentando...)` : message,
      duration
    }
  }

  // Acciones especiales según el tipo de error
  private static getSpecialActions(errorCode: string, context: ErrorContext): (() => void) | undefined {
    switch (errorCode) {
      case 'SESION_EXPIRADA':
      case 'USUARIO_NO_AUTENTICADO':
        return () => {
          // En una implementación completa, redirigir al login
          console.log('🔄 Redirección a login requerida')
          // window.location.href = '/login'
        }
      
      case 'CONEXION_DB_ERROR':
        return () => {
          // Intentar reconectar o refrescar datos
          console.log('🔄 Intentando reconectar...')
        }
      
      case 'ARQUEO_COMPLETADO':
        return () => {
          // Deshabilitar funciones de venta
          console.log('🚫 Sistema de ventas bloqueado')
        }
      
      default:
        return undefined
    }
  }

  // Utilidad para manejar errores async/await
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    config?: Partial<RecoveryConfig>
  ): Promise<T | null> {
    try {
      return await operation()
    } catch (error) {
      const result = await this.handle(error as Error, context, config)
      
      if (result.shouldRetry && config?.retryable) {
        // Esperar antes de reintentar
        const retryDelay = config.retryDelayMs || ERROR_RECOVERY_CONFIG[this.getErrorCode(error as Error)]?.retryDelayMs || 1000
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        
        // Reintentar recursivamente
        return this.withErrorHandling(operation, context, config)
      }
      
      // Ejecutar acción de fallback si existe
      if (result.fallbackAction) {
        result.fallbackAction()
      }
      
      return null
    }
  }

  // Limpiar contadores de reintentos (para llamar en nueva sesión)
  static clearRetryAttempts(): void {
    this.retryAttempts.clear()
  }

  // Crear error de negocio con contexto
  static createBusinessError(
    code: ErrorCode,
    context: ErrorContext,
    message?: string,
    additionalData?: any
  ): BusinessErrorClass {
    return new BusinessErrorClass(code, message, {
      ...context.data,
      ...additionalData,
      action: context.action,
      module: context.module
    })
  }

  // Utilidad para wrappear funciones con manejo de errores
  static withErrorWrapper<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context: ErrorContext,
    config?: Partial<RecoveryConfig>
  ): T {
    return (async (...args: any[]) => {
      return this.withErrorHandling(
        () => fn(...args),
        context,
        config
      )
    }) as T
  }
}

export default ErrorHandler
