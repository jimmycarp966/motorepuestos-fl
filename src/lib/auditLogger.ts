import { supabase } from './supabase'

// Tipos para el sistema de auditoría
export interface AuditLog {
  id?: string
  timestamp: string
  action: string
  module: string
  user_id: string
  user_email: string
  data?: any
  session_id: string
  ip_address?: string
  user_agent?: string
  success: boolean
  error_message?: string
  execution_time_ms?: number
  created_at?: string
}

export interface BusinessError extends Error {
  code: string
  context?: any
}

// Códigos de error de negocio
export const ERROR_CODES = {
  // Ventas
  VENTA_SIN_PRODUCTOS: 'VENTA_SIN_PRODUCTOS',
  CANTIDAD_INVALIDA: 'CANTIDAD_INVALIDA',
  STOCK_INSUFICIENTE: 'STOCK_INSUFICIENTE',
  ARQUEO_COMPLETADO: 'ARQUEO_COMPLETADO',
  CLIENTE_NO_ENCONTRADO: 'CLIENTE_NO_ENCONTRADO',
  LIMITE_CREDITO_EXCEDIDO: 'LIMITE_CREDITO_EXCEDIDO',
  
  // Productos
  SKU_DUPLICADO: 'SKU_DUPLICADO',
  PRECIO_INVALIDO: 'PRECIO_INVALIDO',
  CATEGORIA_INEXISTENTE: 'CATEGORIA_INEXISTENTE',
  
  // Caja
  CAJA_YA_ABIERTA: 'CAJA_YA_ABIERTA',
  CAJA_NO_ABIERTA: 'CAJA_NO_ABIERTA',
  SALDO_INSUFICIENTE: 'SALDO_INSUFICIENTE',
  
  // Empleados
  EMAIL_DUPLICADO: 'EMAIL_DUPLICADO',
  ROL_INVALIDO: 'ROL_INVALIDO',
  PERMISOS_INSUFICIENTES: 'PERMISOS_INSUFICIENTES',
  
  // Sistema
  USUARIO_NO_AUTENTICADO: 'USUARIO_NO_AUTENTICADO',
  SESION_EXPIRADA: 'SESION_EXPIRADA',
  CONEXION_DB_ERROR: 'CONEXION_DB_ERROR'
} as const

export type ErrorCode = keyof typeof ERROR_CODES

// Clase personalizada para errores de negocio
export class BusinessErrorClass extends Error implements BusinessError {
  public code: string
  public context?: any

  constructor(code: ErrorCode, message?: string, context?: any) {
    super(message || code)
    this.name = 'BusinessError'
    this.code = code
    this.context = context
  }
}

// Sistema de logging centralizado
export class AuditLogger {
  private static sessionId = crypto.randomUUID()
  
  // Obtener información del usuario actual
  private static getCurrentUser() {
    // Implementación simplificada - en producción usar el store
    return {
      id: 'current-user-id',
      email: 'user@example.com'
    }
  }

  // Log genérico
  static async log(
    action: string,
    module: string,
    success: boolean = true,
    data?: any,
    error?: Error,
    executionTime?: number
  ): Promise<void> {
    try {
      const user = this.getCurrentUser()
      const logEntry: AuditLog = {
        timestamp: new Date().toISOString(),
        action,
        module,
        user_id: user.id,
        user_email: user.email,
        data: success ? data : undefined,
        session_id: this.sessionId,
        success,
        error_message: error?.message,
        execution_time_ms: executionTime,
        ip_address: 'unknown', // En producción obtener IP real
        user_agent: navigator.userAgent
      }

      // En desarrollo, log en consola
      if (import.meta.env.DEV) {
        console.log(`🔍 [AUDIT-${success ? 'SUCCESS' : 'ERROR'}] ${module}.${action}:`, logEntry)
      }

      // Enviar a Supabase (tabla audit_logs)
      // Por ahora solo log local, en producción descomentar:
      // await supabase.from('audit_logs').insert(logEntry)
      
    } catch (logError) {
      console.error('❌ [AuditLogger] Error logging audit:', logError)
    }
  }

  // Log de acciones exitosas
  static async logSuccess(action: string, module: string, data?: any, executionTime?: number): Promise<void> {
    await this.log(action, module, true, data, undefined, executionTime)
  }

  // Log de errores
  static async logError(action: string, module: string, error: Error, context?: any): Promise<void> {
    await this.log(action, module, false, context, error)
  }

  // Log específico para acciones de negocio
  static async logBusinessAction(
    action: string,
    module: string,
    data: any,
    startTime: number
  ): Promise<void> {
    const executionTime = Date.now() - startTime
    await this.logSuccess(action, module, data, executionTime)
  }

  // Log específico para errores de negocio
  static async logBusinessError(
    action: string,
    module: string,
    error: BusinessError,
    context?: any
  ): Promise<void> {
    const enhancedContext = {
      ...context,
      errorCode: error.code,
      businessContext: error.context
    }
    await this.logError(action, module, error, enhancedContext)
  }

  // Decorador para funciones con logging automático
  static withLogging<T extends (...args: any[]) => Promise<any>>(
    action: string,
    module: string,
    fn: T
  ): T {
    return (async (...args: any[]) => {
      const startTime = Date.now()
      try {
        const result = await fn(...args)
        await this.logBusinessAction(action, module, { args, result }, startTime)
        return result
      } catch (error) {
        if (error instanceof BusinessErrorClass) {
          await this.logBusinessError(action, module, error, { args })
        } else {
          await this.logError(action, module, error as Error, { args })
        }
        throw error
      }
    }) as T
  }

  // Generar nuevo session ID (para nuevas sesiones)
  static newSession(): void {
    this.sessionId = crypto.randomUUID()
  }
}

// Función helper para crear errores de negocio
export function createBusinessError(
  code: ErrorCode,
  message?: string,
  context?: any
): BusinessErrorClass {
  return new BusinessErrorClass(code, message, context)
}

// Mensajes de error en español para el usuario
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  VENTA_SIN_PRODUCTOS: 'La venta debe tener al menos un producto',
  CANTIDAD_INVALIDA: 'La cantidad debe ser mayor a cero',
  STOCK_INSUFICIENTE: 'Stock insuficiente para el producto solicitado',
  ARQUEO_COMPLETADO: 'No se pueden registrar ventas después del arqueo de caja',
  CLIENTE_NO_ENCONTRADO: 'Cliente no encontrado en el sistema',
  LIMITE_CREDITO_EXCEDIDO: 'El límite de crédito del cliente ha sido excedido',
  
  SKU_DUPLICADO: 'Ya existe un producto con este código SKU',
  PRECIO_INVALIDO: 'El precio debe ser mayor a cero',
  CATEGORIA_INEXISTENTE: 'La categoría especificada no existe',
  
  CAJA_YA_ABIERTA: 'Ya existe una caja abierta para el día de hoy',
  CAJA_NO_ABIERTA: 'No hay caja abierta para registrar movimientos',
  SALDO_INSUFICIENTE: 'Saldo insuficiente en caja',
  
  EMAIL_DUPLICADO: 'Ya existe un empleado con este email',
  ROL_INVALIDO: 'El rol especificado no es válido',
  PERMISOS_INSUFICIENTES: 'No tienes permisos para realizar esta acción',
  
  USUARIO_NO_AUTENTICADO: 'Debes iniciar sesión para continuar',
  SESION_EXPIRADA: 'Tu sesión ha expirado, inicia sesión nuevamente',
  CONEXION_DB_ERROR: 'Error de conexión con la base de datos'
}

export default AuditLogger
