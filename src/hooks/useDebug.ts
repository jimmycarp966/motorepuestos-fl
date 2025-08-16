import { useAppStore } from '../store'

export const useDebug = () => {
  const addDebugLog = useAppStore((state) => state.addDebugLog)
  const toggleDebugPanel = useAppStore((state) => state.toggleDebugPanel)
  const clearDebugLogs = useAppStore((state) => state.clearDebugLogs)

  const log = {
    info: (message: string, source: string, data?: any) => {
      addDebugLog({
        level: 'info',
        message,
        source,
        data
      })
    },
    warning: (message: string, source: string, data?: any) => {
      addDebugLog({
        level: 'warning',
        message,
        source,
        data
      })
    },
    error: (message: string, source: string, data?: any) => {
      addDebugLog({
        level: 'error',
        message,
        source,
        data
      })
    },
    success: (message: string, source: string, data?: any) => {
      addDebugLog({
        level: 'success',
        message,
        source,
        data
      })
    }
  }

  const debug = {
    show: () => toggleDebugPanel(),
    clear: () => clearDebugLogs(),
    log
  }

  return debug
}
