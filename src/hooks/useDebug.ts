import { useEffect, useCallback } from 'react'
import { useAppStore } from '../store'

interface DebugOptions {
  componentName: string
  logProps?: boolean
  logState?: boolean
  logErrors?: boolean
}

export const useDebug = (options: DebugOptions) => {
  const { componentName, logProps = true, logState = true, logErrors = true } = options
  
  // Obtener estado relevante del store (selectores específicos)
  const user = useAppStore((state) => state.auth.user)
  const authLoading = useAppStore((state) => state.auth.loading)
  const currentModule = useAppStore((state) => state.ui.currentModule)
  const sidebarOpen = useAppStore((state) => state.ui.sidebarOpen)
  const notifications = useAppStore((state) => state.notifications.notifications)

  // Función para registrar errores
  const logError = useCallback((error: any, context?: string) => {
    if (!logErrors) return
    
    console.error(`❌ [${componentName}] ${context || 'Error'}:`, error)
  }, [componentName, logErrors])

  // Función para registrar información
  const logInfo = useCallback((message: string, data?: any) => {
    console.log(`ℹ️ [${componentName}] ${message}`, data)
  }, [componentName])

  // Función para registrar advertencias
  const logWarning = useCallback((message: string, data?: any) => {
    console.warn(`⚠️ [${componentName}] ${message}`, data)
  }, [componentName])

  // Función para registrar estado
  const logStateInfo = useCallback((state: any, label = 'Estado') => {
    if (!logState) return
    
    console.log(`🔍 [${componentName}] ${label}:`, state)
  }, [componentName, logState])

  // Registrar montaje del componente
  useEffect(() => {
    logInfo('Componente montado')
    
    if (logState) {
      logStateInfo({
        auth: { user, loading: authLoading },
        ui: { currentModule, sidebarOpen },
        notifications: notifications.length
      }, 'Estado inicial')
    }
    
    return () => {
      logInfo('Componente desmontado')
    }
  }, [componentName, logState, user, authLoading, currentModule, sidebarOpen, notifications, logInfo, logStateInfo])

  // Capturar errores no manejados
  useEffect(() => {
    if (!logErrors) return

    const handleError = (event: ErrorEvent) => {
      logError(event.error, 'Error no manejado')
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError(event.reason, 'Promise rechazada')
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [logErrors, logError])

  return {
    logError,
    logInfo,
    logWarning,
    logState: logStateInfo,
    componentName
  }
}

// Hook simplificado para debug básico
export const useDebugComponent = (componentName: string) => {
  return useDebug({ componentName })
}
