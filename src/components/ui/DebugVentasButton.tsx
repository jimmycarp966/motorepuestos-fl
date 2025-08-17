import React, { useState } from 'react'
import { Button } from './button'
import { Card } from './card'
import { debugVentas } from '../../lib/debugVentas'
import { testVentasQuery } from '../../lib/testVentasQuery'
import { Bug, X, RefreshCw, Database, AlertTriangle, CheckCircle } from 'lucide-react'

export const DebugVentasButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [debugResults, setDebugResults] = useState<any>(null)

  const handleDebug = async () => {
    setIsLoading(true)
    setDebugResults(null)
    
    try {
      console.log('🔍 [DebugVentasButton] Iniciando diagnóstico...')
      
      // Ejecutar debug
      await debugVentas()
      
      // Ejecutar test de consulta
      const testResults = await testVentasQuery()
      
      setDebugResults(testResults)
      console.log('✅ [DebugVentasButton] Diagnóstico completado')
      
    } catch (error) {
      console.error('❌ [DebugVentasButton] Error en diagnóstico:', error)
      setDebugResults({ error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
      >
        <Bug className="w-4 h-4 mr-2" />
        Debug Ventas
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Bug className="w-5 h-5 mr-2 text-yellow-600" />
              Diagnóstico de Ventas
            </h2>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={handleDebug}
                disabled={isLoading}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Database className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Diagnosticando...' : 'Ejecutar Diagnóstico'}
              </Button>
              
              <Button
                onClick={() => setDebugResults(null)}
                variant="outline"
                disabled={isLoading}
              >
                Limpiar
              </Button>
            </div>

            {debugResults && (
              <div className="space-y-4">
                {debugResults.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                      <h3 className="font-medium text-red-800">Error en diagnóstico</h3>
                    </div>
                    <p className="text-red-700 mt-2">{debugResults.error}</p>
                  </div>
                ) : (
                  <>
                    {/* Resultados de consulta básica */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-800 mb-2">Consulta Básica</h3>
                      <div className="text-sm text-blue-700">
                        <p><strong>Datos encontrados:</strong> {debugResults.basic?.data?.length || 0}</p>
                        <p><strong>Error:</strong> {debugResults.basic?.error?.message || 'Ninguno'}</p>
                        {debugResults.basic?.data?.[0] && (
                          <details className="mt-2">
                            <summary className="cursor-pointer">Ver muestra de datos</summary>
                            <pre className="mt-2 text-xs bg-blue-100 p-2 rounded overflow-auto">
                              {JSON.stringify(debugResults.basic.data[0], null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>

                    {/* Resultados de consulta con relaciones */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-medium text-green-800 mb-2">Consulta con Relaciones</h3>
                      <div className="text-sm text-green-700">
                        <p><strong>Datos encontrados:</strong> {debugResults.relations?.data?.length || 0}</p>
                        <p><strong>Error:</strong> {debugResults.relations?.error?.message || 'Ninguno'}</p>
                        {debugResults.relations?.data?.[0] && (
                          <details className="mt-2">
                            <summary className="cursor-pointer">Ver muestra con relaciones</summary>
                            <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">
                              {JSON.stringify(debugResults.relations.data[0], null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>

                    {/* Información del usuario */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h3 className="font-medium text-purple-800 mb-2">Usuario Actual</h3>
                      <div className="text-sm text-purple-700">
                        <p><strong>ID:</strong> {debugResults.user?.id || 'No disponible'}</p>
                        <p><strong>Email:</strong> {debugResults.user?.email || 'No disponible'}</p>
                      </div>
                    </div>

                    {/* Políticas RLS */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h3 className="font-medium text-orange-800 mb-2">Políticas RLS</h3>
                      <div className="text-sm text-orange-700">
                        <p><strong>Políticas encontradas:</strong> {debugResults.policies?.data?.length || 0}</p>
                        <p><strong>Error:</strong> {debugResults.policies?.error?.message || 'Ninguno'}</p>
                        {debugResults.policies?.data && debugResults.policies.data.length > 0 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer">Ver políticas</summary>
                            <div className="mt-2 space-y-1">
                              {debugResults.policies.data.map((policy: any, index: number) => (
                                <div key={index} className="bg-orange-100 p-2 rounded text-xs">
                                  <p><strong>Política:</strong> {policy.policyname}</p>
                                  <p><strong>Comando:</strong> {policy.cmd}</p>
                                  <p><strong>Roles:</strong> {policy.roles}</p>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    </div>

                    {/* Resumen */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-800 mb-2">Resumen del Diagnóstico</h3>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div className="flex items-center">
                          {debugResults.basic?.data?.length > 0 ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                          )}
                          <span>Tabla ventas: {debugResults.basic?.data?.length > 0 ? 'OK' : 'Sin datos'}</span>
                        </div>
                        <div className="flex items-center">
                          {debugResults.relations?.data?.length > 0 ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                          )}
                          <span>Relaciones: {debugResults.relations?.data?.length > 0 ? 'OK' : 'Problema'}</span>
                        </div>
                        <div className="flex items-center">
                          {debugResults.user?.id ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                          )}
                          <span>Autenticación: {debugResults.user?.id ? 'OK' : 'Problema'}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
