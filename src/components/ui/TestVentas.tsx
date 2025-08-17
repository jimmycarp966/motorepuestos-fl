import React, { useState } from 'react'
import { Button } from './button'
import { Card } from './card'
import { useAppStore } from '../../store'
import { supabase } from '../../lib/supabase'
import { Bug, RefreshCw, Database, CheckCircle, AlertTriangle } from 'lucide-react'

export const TestVentas: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  
  const ventas = useAppStore((state) => state.ventas.ventas)
  const loading = useAppStore((state) => state.ventas.loading)
  const error = useAppStore((state) => state.ventas.error)
  const fetchVentas = useAppStore((state) => state.ventas.fetchVentas)

  const ejecutarTest = async () => {
    setIsLoading(true)
    setTestResults(null)
    
    try {
      console.log('🔍 [TestVentas] Iniciando test...')
      
      const resultados = {
        storeState: {
          ventas: ventas?.length || 0,
          loading,
          error
        },
        directQuery: null,
        sliceQuery: null
      }

      // Test 1: Consulta directa a Supabase
      try {
        console.log('🔍 [TestVentas] Ejecutando consulta directa...')
        const { data: directData, error: directError } = await supabase
          .from('ventas')
          .select(`
            *,
            cliente:clientes(*),
            empleado:empleados(*),
            items:venta_items(*)
          `)
          .order('created_at', { ascending: false })
        
        resultados.directQuery = { data: directData, error: directError }
        console.log('🔍 [TestVentas] Consulta directa:', { 
          data: directData?.length, 
          error: directError 
        })
      } catch (error) {
        console.error('❌ [TestVentas] Error en consulta directa:', error)
        resultados.directQuery = { error }
      }

      // Test 2: Ejecutar fetchVentas del slice
      try {
        console.log('🔍 [TestVentas] Ejecutando fetchVentas...')
        await fetchVentas()
        
        // Esperar un momento para que se actualice el estado
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Obtener el estado actualizado usando el hook
        const updatedVentas = useAppStore.getState().ventas.ventas
        const updatedLoading = useAppStore.getState().ventas.loading
        const updatedError = useAppStore.getState().ventas.error
        
        resultados.sliceQuery = {
          ventas: updatedVentas?.length || 0,
          loading: updatedLoading,
          error: updatedError
        }
        
        console.log('🔍 [TestVentas] Estado del slice después de fetchVentas:', {
          ventas: updatedVentas?.length,
          loading: updatedLoading,
          error: updatedError
        })
      } catch (error) {
        console.error('❌ [TestVentas] Error en fetchVentas:', error)
        resultados.sliceQuery = { error }
      }

      setTestResults(resultados)
      console.log('✅ [TestVentas] Test completado')
      
    } catch (error) {
      console.error('❌ [TestVentas] Error general en test:', error)
      setTestResults({ error: error.message })
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
        className="fixed bottom-4 right-4 z-50 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
      >
        <Bug className="w-4 h-4 mr-2" />
        Test Ventas
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Bug className="w-5 h-5 mr-2 text-green-600" />
              Test de Ventas
            </h2>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
            >
              ×
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={ejecutarTest}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Database className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Ejecutando...' : 'Ejecutar Test'}
              </Button>
              
              <Button
                onClick={() => setTestResults(null)}
                variant="outline"
                disabled={isLoading}
              >
                Limpiar
              </Button>
            </div>

            {testResults && (
              <div className="space-y-4">
                {testResults.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                      <h3 className="font-medium text-red-800">Error en test</h3>
                    </div>
                    <p className="text-red-700 mt-2">{testResults.error}</p>
                  </div>
                ) : (
                  <>
                    {/* Estado del Store */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-800 mb-2">Estado del Store</h3>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p><strong>Ventas en store:</strong> {testResults.storeState.ventas}</p>
                        <p><strong>Loading:</strong> {testResults.storeState.loading ? 'Sí' : 'No'}</p>
                        <p><strong>Error:</strong> {testResults.storeState.error || 'Ninguno'}</p>
                      </div>
                    </div>

                    {/* Consulta Directa */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-medium text-green-800 mb-2">Consulta Directa a Supabase</h3>
                      <div className="text-sm text-green-700 space-y-1">
                        <p><strong>Datos encontrados:</strong> {testResults.directQuery?.data?.length || 0}</p>
                        <p><strong>Error:</strong> {testResults.directQuery?.error?.message || 'Ninguno'}</p>
                        {testResults.directQuery?.data?.[0] && (
                          <details className="mt-2">
                            <summary className="cursor-pointer">Ver primera venta</summary>
                            <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">
                              {JSON.stringify(testResults.directQuery.data[0], null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>

                    {/* Estado después de fetchVentas */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h3 className="font-medium text-purple-800 mb-2">Después de fetchVentas</h3>
                      <div className="text-sm text-purple-700 space-y-1">
                        <p><strong>Ventas en store:</strong> {testResults.sliceQuery?.ventas || 0}</p>
                        <p><strong>Loading:</strong> {testResults.sliceQuery?.loading ? 'Sí' : 'No'}</p>
                        <p><strong>Error:</strong> {testResults.sliceQuery?.error || 'Ninguno'}</p>
                      </div>
                    </div>

                    {/* Resumen */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-800 mb-2">Resumen del Test</h3>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div className="flex items-center">
                          {testResults.directQuery?.data?.length > 0 ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                          )}
                          <span>Datos en BD: {testResults.directQuery?.data?.length || 0} ventas</span>
                        </div>
                        <div className="flex items-center">
                          {testResults.sliceQuery?.ventas > 0 ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                          )}
                          <span>Slice actualizado: {testResults.sliceQuery?.ventas || 0} ventas</span>
                        </div>
                        <div className="flex items-center">
                          {testResults.directQuery?.data?.length === testResults.sliceQuery?.ventas ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                          )}
                          <span>Sincronización: {testResults.directQuery?.data?.length === testResults.sliceQuery?.ventas ? 'OK' : 'Problema'}</span>
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
