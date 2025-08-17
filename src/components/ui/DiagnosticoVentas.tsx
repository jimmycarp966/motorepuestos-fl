import React, { useState } from 'react'
import { Button } from './button'
import { Card } from './card'
import { supabase } from '../../lib/supabase'
import { Bug, X, RefreshCw, Database, AlertTriangle, CheckCircle, Info } from 'lucide-react'

export const DiagnosticoVentas: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [diagnostico, setDiagnostico] = useState<any>(null)

  const ejecutarDiagnostico = async () => {
    setIsLoading(true)
    setDiagnostico(null)
    
    try {
      console.log('🔍 [DiagnosticoVentas] Iniciando diagnóstico...')
      
      const resultados = {
        tabla: null,
        estructura: null,
        datos: null,
        relaciones: null,
        politicas: null,
        error: null
      }

      // 1. Verificar si la tabla existe
      try {
        const { data: tabla, error: tablaError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_name', 'ventas')
          .eq('table_schema', 'public')
        
        resultados.tabla = { data: tabla, error: tablaError }
        console.log('🔍 [DiagnosticoVentas] Tabla:', { tabla, tablaError })
      } catch (error) {
        resultados.tabla = { error }
      }

      // 2. Verificar estructura
      try {
        const { data: estructura, error: estructuraError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_name', 'ventas')
          .eq('table_schema', 'public')
        
        resultados.estructura = { data: estructura, error: estructuraError }
        console.log('🔍 [DiagnosticoVentas] Estructura:', { estructura, estructuraError })
      } catch (error) {
        resultados.estructura = { error }
      }

      // 3. Verificar datos
      try {
        const { data: datos, error: datosError, count } = await supabase
          .from('ventas')
          .select('*', { count: 'exact' })
          .limit(5)
        
        resultados.datos = { data: datos, error: datosError, count }
        console.log('🔍 [DiagnosticoVentas] Datos:', { datos: datos?.length, datosError, count })
      } catch (error) {
        resultados.datos = { error }
      }

      // 4. Verificar relaciones
      try {
        const { data: relaciones, error: relacionesError } = await supabase
          .from('ventas')
          .select(`
            *,
            cliente:clientes(*),
            empleado:empleados(*),
            items:venta_items(*)
          `)
          .limit(1)
        
        resultados.relaciones = { data: relaciones, error: relacionesError }
        console.log('🔍 [DiagnosticoVentas] Relaciones:', { relaciones: relaciones?.length, relacionesError })
      } catch (error) {
        resultados.relaciones = { error }
      }

      // 5. Verificar políticas RLS
      try {
        const { data: politicas, error: politicasError } = await supabase
          .from('pg_policies')
          .select('*')
          .eq('tablename', 'ventas')
        
        resultados.politicas = { data: politicas, error: politicasError }
        console.log('🔍 [DiagnosticoVentas] Políticas:', { politicas: politicas?.length, politicasError })
      } catch (error) {
        resultados.politicas = { error }
      }

      setDiagnostico(resultados)
      console.log('✅ [DiagnosticoVentas] Diagnóstico completado')
      
    } catch (error) {
      console.error('❌ [DiagnosticoVentas] Error en diagnóstico:', error)
      setDiagnostico({ error: error.message })
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
        className="fixed bottom-4 left-4 z-50 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
      >
        <Bug className="w-4 h-4 mr-2" />
        Diagnóstico Ventas
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Bug className="w-5 h-5 mr-2 text-blue-600" />
              Diagnóstico Rápido de Ventas
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
                onClick={ejecutarDiagnostico}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Database className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Diagnosticando...' : 'Ejecutar Diagnóstico'}
              </Button>
              
              <Button
                onClick={() => setDiagnostico(null)}
                variant="outline"
                disabled={isLoading}
              >
                Limpiar
              </Button>
            </div>

            {diagnostico && (
              <div className="space-y-4">
                {diagnostico.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                      <h3 className="font-medium text-red-800">Error en diagnóstico</h3>
                    </div>
                    <p className="text-red-700 mt-2">{diagnostico.error}</p>
                  </div>
                ) : (
                  <>
                    {/* Tabla */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                        <Database className="w-4 h-4 mr-2" />
                        Tabla Ventas
                      </h3>
                      <div className="text-sm text-blue-700">
                        <p><strong>Existe:</strong> {diagnostico.tabla?.data?.length > 0 ? '✅ Sí' : '❌ No'}</p>
                        <p><strong>Error:</strong> {diagnostico.tabla?.error?.message || 'Ninguno'}</p>
                      </div>
                    </div>

                    {/* Estructura */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-medium text-green-800 mb-2 flex items-center">
                        <Info className="w-4 h-4 mr-2" />
                        Estructura
                      </h3>
                      <div className="text-sm text-green-700">
                        <p><strong>Columnas:</strong> {diagnostico.estructura?.data?.length || 0}</p>
                        <p><strong>Error:</strong> {diagnostico.estructura?.error?.message || 'Ninguno'}</p>
                        {diagnostico.estructura?.data && (
                          <details className="mt-2">
                            <summary className="cursor-pointer">Ver columnas</summary>
                            <div className="mt-2 space-y-1">
                              {diagnostico.estructura.data.map((col: any, index: number) => (
                                <div key={index} className="bg-green-100 p-2 rounded text-xs">
                                  <p><strong>{col.column_name}</strong> ({col.data_type}) - {col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}</p>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    </div>

                    {/* Datos */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h3 className="font-medium text-purple-800 mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Datos
                      </h3>
                      <div className="text-sm text-purple-700">
                        <p><strong>Total ventas:</strong> {diagnostico.datos?.count || 0}</p>
                        <p><strong>Error:</strong> {diagnostico.datos?.error?.message || 'Ninguno'}</p>
                        {diagnostico.datos?.data?.[0] && (
                          <details className="mt-2">
                            <summary className="cursor-pointer">Ver muestra</summary>
                            <pre className="mt-2 text-xs bg-purple-100 p-2 rounded overflow-auto">
                              {JSON.stringify(diagnostico.datos.data[0], null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>

                    {/* Relaciones */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h3 className="font-medium text-orange-800 mb-2 flex items-center">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Relaciones
                      </h3>
                      <div className="text-sm text-orange-700">
                        <p><strong>Funciona:</strong> {diagnostico.relaciones?.data?.length > 0 ? '✅ Sí' : '❌ No'}</p>
                        <p><strong>Error:</strong> {diagnostico.relaciones?.error?.message || 'Ninguno'}</p>
                        {diagnostico.relaciones?.data?.[0] && (
                          <details className="mt-2">
                            <summary className="cursor-pointer">Ver con relaciones</summary>
                            <pre className="mt-2 text-xs bg-orange-100 p-2 rounded overflow-auto">
                              {JSON.stringify(diagnostico.relaciones.data[0], null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>

                    {/* Políticas RLS */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-medium text-yellow-800 mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Políticas RLS
                      </h3>
                      <div className="text-sm text-yellow-700">
                        <p><strong>Políticas:</strong> {diagnostico.politicas?.data?.length || 0}</p>
                        <p><strong>Error:</strong> {diagnostico.politicas?.error?.message || 'Ninguno'}</p>
                      </div>
                    </div>

                    {/* Resumen */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-800 mb-2">Resumen del Diagnóstico</h3>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div className="flex items-center">
                          {diagnostico.tabla?.data?.length > 0 ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                          )}
                          <span>Tabla ventas: {diagnostico.tabla?.data?.length > 0 ? 'OK' : 'No existe'}</span>
                        </div>
                        <div className="flex items-center">
                          {diagnostico.datos?.count > 0 ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                          )}
                          <span>Datos: {diagnostico.datos?.count || 0} ventas</span>
                        </div>
                        <div className="flex items-center">
                          {diagnostico.relaciones?.data?.length > 0 ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                          )}
                          <span>Relaciones: {diagnostico.relaciones?.data?.length > 0 ? 'OK' : 'Problema'}</span>
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
