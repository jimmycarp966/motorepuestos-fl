import React, { useState, useEffect } from 'react'
import { Button } from './button'
import { Card } from './card'
import { useAppStore } from '../../store'
import { supabase } from '../../lib/supabase'
import { Bug, RefreshCw, Database, CheckCircle, AlertTriangle, X, Play } from 'lucide-react'

export const DebugVentasCompleto: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [autoFixResults, setAutoFixResults] = useState<any>(null)
  
  const ventas = useAppStore((state) => state.ventas)
  const loading = useAppStore((state) => state.ventasLoading)
  const error = useAppStore((state) => state.ventasError)
  const fetchVentas = useAppStore((state) => state.fetchVentas)
  const addNotification = useAppStore((state) => state.addNotification)

  const ejecutarTestCompleto = async () => {
    setIsLoading(true)
    setTestResults(null)
    
    try {
      const results = {
        timestamp: new Date().toISOString(),
        store: {
          ventas: ventas?.length || 0,
          loading,
          error
        },
        database: {
          ventas: 0,
          venta_items: 0,
          estructura_ventas: [] as any[],
          estructura_venta_items: [] as any[],
          columnas_faltantes: [] as string[]
        },
        tests: {
          venta_simple: false,
          venta_con_items: false
        }
      }

      // 1. Verificar estructura de ventas
      try {
        const { data: estructuraVentas } = await supabase
          .from('ventas')
          .select('*')
          .limit(1)
        
        if (estructuraVentas) {
          results.database.estructura_ventas = Object.keys(estructuraVentas[0] || {})
        }
      } catch (e: any) {
        console.error('Error verificando estructura ventas:', e)
      }

      // 2. Verificar estructura de venta_items
      try {
        const { data: estructuraItems } = await supabase
          .from('venta_items')
          .select('*')
          .limit(1)
        
        if (estructuraItems) {
          results.database.estructura_venta_items = Object.keys(estructuraItems[0] || {})
        }
      } catch (e: any) {
        console.error('Error verificando estructura venta_items:', e)
      }

      // 3. Contar registros
      try {
        const { count: countVentas } = await supabase
          .from('ventas')
          .select('*', { count: 'exact', head: true })
        
        const { count: countItems } = await supabase
          .from('venta_items')
          .select('*', { count: 'exact', head: true })
        
        results.database.ventas = countVentas || 0
        results.database.venta_items = countItems || 0
      } catch (e: any) {
        console.error('Error contando registros:', e)
      }

      // 4. Verificar columnas faltantes
      const columnasEsperadas = ['metodo_pago', 'tipo_precio', 'estado', 'updated_at']
      const columnasVentas = results.database.estructura_ventas
      
      results.database.columnas_faltantes = columnasEsperadas.filter(
        col => !columnasVentas.includes(col)
      )

      // 5. Test de venta simple
      try {
        const { data: testVenta } = await supabase
          .from('ventas')
          .select('metodo_pago, tipo_precio, estado')
          .limit(1)
        
        results.tests.venta_simple = !!testVenta
      } catch (e: any) {
        console.error('Error en test venta simple:', e)
      }

      setTestResults(results)
      
      // Mostrar notificación con resumen
      const problemas = results.database.columnas_faltantes.length
      if (problemas > 0) {
        addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Problemas detectados',
          message: `Faltan ${problemas} columnas en la tabla ventas`
        })
      } else {
        addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Sistema OK',
          message: 'Todas las columnas están presentes'
        })
      }

    } catch (error: any) {
      console.error('Error en test completo:', error)
      setTestResults({
        error: error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const ejecutarAutoFix = async () => {
    setIsLoading(true)
    setAutoFixResults(null)
    
    try {
      const results = {
        timestamp: new Date().toISOString(),
        acciones: [] as string[],
        exitosas: 0,
        fallidas: 0
      }

      // Intentar agregar columnas una por una
      const columnas = [
        { tabla: 'ventas', columna: 'metodo_pago', tipo: 'VARCHAR(50)', default: "'efectivo'" },
        { tabla: 'ventas', columna: 'tipo_precio', tipo: 'VARCHAR(20)', default: "'minorista'" },
        { tabla: 'ventas', columna: 'estado', tipo: 'VARCHAR(50)', default: "'completada'" },
        { tabla: 'ventas', columna: 'updated_at', tipo: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
        { tabla: 'venta_items', columna: 'tipo_precio', tipo: 'VARCHAR(20)', default: "'minorista'" }
      ]

      for (const col of columnas) {
        try {
          const query = `ALTER TABLE ${col.tabla} ADD COLUMN IF NOT EXISTS ${col.columna} ${col.tipo} DEFAULT ${col.default}`
          
          // Nota: No podemos ejecutar ALTER TABLE desde el cliente
          // Solo simulamos la acción
          results.acciones.push(`✅ Simulado: ${query}`)
          results.exitosas++
        } catch (e: any) {
          results.acciones.push(`❌ Error: ${e.message}`)
          results.fallidas++
        }
      }

      setAutoFixResults(results)
      
      addNotification({
        id: Date.now().toString(),
        type: 'info',
        title: 'Auto-fix completado',
        message: `${results.exitosas} acciones exitosas, ${results.fallidas} fallidas`
      })

    } catch (error: any) {
      console.error('Error en auto-fix:', error)
      setAutoFixResults({
        error: error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copiarScriptSQL = () => {
    const script = `-- SCRIPT PARA ARREGLAR VENTAS
-- Copia y pega esto en Supabase SQL Editor

ALTER TABLE ventas ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50) DEFAULT 'efectivo';
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS tipo_precio VARCHAR(20) DEFAULT 'minorista';
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'completada';
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE venta_items ADD COLUMN IF NOT EXISTS tipo_precio VARCHAR(20) DEFAULT 'minorista';

SELECT '✅ COLUMNAS AGREGADAS' as resultado;`
    
    navigator.clipboard.writeText(script).then(() => {
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Script copiado',
        message: 'Script SQL copiado al portapapeles'
      })
    })
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
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
              <Bug className="w-5 h-5 mr-2 text-red-600" />
              Debug Completo - Sistema de Ventas
            </h2>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 mb-6">
            <Button
              onClick={ejecutarTestCompleto}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Ejecutar Test Completo
            </Button>
            
            <Button
              onClick={ejecutarAutoFix}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Auto-Fix (Simulado)
            </Button>
            
            <Button
              onClick={copiarScriptSQL}
              variant="outline"
            >
              <Database className="w-4 h-4 mr-2" />
              Copiar Script SQL
            </Button>
          </div>

          {/* Resultados del test */}
          {testResults && (
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold">📊 Resultados del Test</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">🏪 Estado del Store</h4>
                  <div className="space-y-1 text-sm">
                    <div>Ventas: {testResults.store.ventas}</div>
                    <div>Loading: {testResults.store.loading ? 'Sí' : 'No'}</div>
                    <div>Error: {testResults.store.error || 'Ninguno'}</div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2">🗄️ Base de Datos</h4>
                  <div className="space-y-1 text-sm">
                    <div>Ventas: {testResults.database.ventas}</div>
                    <div>Items: {testResults.database.venta_items}</div>
                    <div>Columnas faltantes: {testResults.database.columnas_faltantes.length}</div>
                  </div>
                </Card>
              </div>

              {/* Columnas faltantes */}
              {testResults.database.columnas_faltantes.length > 0 && (
                <Card className="p-4 border-red-200 bg-red-50">
                  <h4 className="font-medium text-red-800 mb-2">❌ Columnas Faltantes</h4>
                  <div className="text-sm text-red-700">
                    {testResults.database.columnas_faltantes.map((col, i) => (
                      <div key={i} className="flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        {col}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-red-600">
                    💡 Ejecuta el script SQL para agregar estas columnas
                  </div>
                </Card>
              )}

              {/* Estructura actual */}
              <Card className="p-4">
                <h4 className="font-medium mb-2">🏗️ Estructura Actual</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-gray-700">Tabla: ventas</h5>
                    <div className="mt-1 space-y-1">
                      {testResults.database.estructura_ventas.map((col, i) => (
                        <div key={i} className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          {col}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700">Tabla: venta_items</h5>
                    <div className="mt-1 space-y-1">
                      {testResults.database.estructura_venta_items.map((col, i) => (
                        <div key={i} className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          {col}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Resultados del auto-fix */}
          {autoFixResults && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">🔧 Resultados del Auto-Fix</h3>
              <Card className="p-4">
                <div className="space-y-2 text-sm">
                  <div>Exitosas: {autoFixResults.exitosas}</div>
                  <div>Fallidas: {autoFixResults.fallidas}</div>
                  <div className="mt-3">
                    <h5 className="font-medium">Acciones realizadas:</h5>
                    <div className="mt-2 space-y-1">
                      {autoFixResults.acciones.map((accion, i) => (
                        <div key={i} className="text-xs font-mono bg-gray-100 p-2 rounded">
                          {accion}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Instrucciones */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">📋 Instrucciones</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <div>1. Ejecuta el "Test Completo" para diagnosticar</div>
              <div>2. Si hay columnas faltantes, haz clic en "Copiar Script SQL"</div>
              <div>3. Ve a Supabase Dashboard → SQL Editor</div>
              <div>4. Pega y ejecuta el script copiado</div>
              <div>5. Regresa y ejecuta el test nuevamente</div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  )
}
