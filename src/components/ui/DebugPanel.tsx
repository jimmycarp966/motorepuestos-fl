import React, { useState } from 'react'
import { useAppStore } from '../../store'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { 
  Bug, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Download, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

export const DebugPanel: React.FC = () => {
  const debugPanel = useAppStore((state) => state.ui.debugPanel)
  const toggleDebugPanel = useAppStore((state) => state.toggleDebugPanel)
  const clearDebugLogs = useAppStore((state) => state.clearDebugLogs)
  const addDebugLog = useAppStore((state) => state.addDebugLog)
  
  const [showData, setShowData] = useState(false)
  const [filterLevel, setFilterLevel] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all')

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const filteredLogs = debugPanel.logs.filter(log => 
    filterLevel === 'all' || log.level === filterLevel
  )

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info': return <Info className="w-4 h-4 text-blue-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const exportLogs = () => {
    const data = {
      timestamp: new Date().toISOString(),
      logs: debugPanel.logs,
      summary: {
        total: debugPanel.logs.length,
        byLevel: debugPanel.logs.reduce((acc, log) => {
          acc[log.level] = (acc[log.level] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-logs-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)

    addDebugLog({
      level: 'info',
      message: 'Logs exportados exitosamente',
      source: 'DebugPanel'
    })
  }

  const copyLogs = () => {
    const logsText = debugPanel.logs
      .map(log => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message} (${log.source})`)
      .join('\n')

    navigator.clipboard.writeText(logsText).then(() => {
      addDebugLog({
        level: 'success',
        message: 'Logs copiados al portapapeles',
        source: 'DebugPanel'
      })
    })
  }

  const testDebugLog = () => {
    addDebugLog({
      level: 'info',
      message: 'Log de prueba generado',
      source: 'DebugPanel',
      data: { test: true, timestamp: Date.now() }
    })
  }

  return (
    <>
      {/* Botón flotante para abrir/cerrar */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={toggleDebugPanel}
          size="sm"
          className="bg-gray-800 hover:bg-gray-700 text-white rounded-full w-12 h-12 shadow-lg"
          title="Panel de Debug"
        >
          <Bug className="w-5 h-5" />
        </Button>
      </div>

      {/* Panel de debug */}
      {debugPanel.isOpen && (
        <div className="fixed bottom-20 right-4 w-96 max-h-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Debug Panel
                  <span className="text-xs text-gray-500">
                    ({filteredLogs.length}/{debugPanel.logs.length})
                  </span>
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={testDebugLog}
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                  >
                    Test
                  </Button>
                  <Button
                    onClick={copyLogs}
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={exportLogs}
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={clearDebugLogs}
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={toggleDebugPanel}
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex items-center gap-2 mt-2">
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value as any)}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">Todos</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="success">Success</option>
                </select>
                <Button
                  onClick={() => setShowData(!showData)}
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-xs"
                >
                  {showData ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  Data
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No hay logs para mostrar
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2 rounded border text-xs ${getLevelColor(log.level)}`}
                    >
                      <div className="flex items-start gap-2">
                        {getLevelIcon(log.level)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{log.message}</span>
                            <span className="text-gray-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-gray-600 mt-1">
                            <span className="font-mono text-xs">{log.source}</span>
                          </div>
                          {showData && log.data && (
                            <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
                              <pre>{JSON.stringify(log.data, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
