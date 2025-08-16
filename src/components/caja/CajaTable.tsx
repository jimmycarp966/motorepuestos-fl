import React, { useState } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  Plus,
  Calendar,
  Filter
} from 'lucide-react'
import { MovimientoForm } from './MovimientoForm'
import { ArqueoForm } from './ArqueoForm'

export const CajaTable: React.FC = () => {
  const caja = useAppStore((state) => state.caja)
  const loading = useAppStore((state) => state.caja.loading)
  const addNotification = useAppStore((state) => state.addNotification)
  
  const [showMovimientoForm, setShowMovimientoForm] = useState(false)
  const [showArqueoForm, setShowArqueoForm] = useState(false)
  const [tipoMovimiento, setTipoMovimiento] = useState<'ingreso' | 'egreso'>('ingreso')

  // Calcular estadísticas
  const totalIngresos = caja.movimientos
    .filter(m => m.tipo === 'ingreso')
    .reduce((sum, m) => sum + m.monto, 0)

  const totalEgresos = caja.movimientos
    .filter(m => m.tipo === 'egreso')
    .reduce((sum, m) => sum + m.monto, 0)

  const movimientosHoy = caja.movimientos.filter(m => {
    const hoy = new Date().toDateString()
    const fechaMovimiento = new Date(m.fecha).toDateString()
    return fechaMovimiento === hoy
  })

  const ingresosHoy = movimientosHoy
    .filter(m => m.tipo === 'ingreso')
    .reduce((sum, m) => sum + m.monto, 0)

  const egresosHoy = movimientosHoy
    .filter(m => m.tipo === 'egreso')
    .reduce((sum, m) => sum + m.monto, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control de Caja</h1>
          <p className="text-gray-600">Gestiona los movimientos de caja y realiza arqueos</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setTipoMovimiento('ingreso')
              setShowMovimientoForm(true)
            }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Registrar Ingreso
          </Button>
          <Button
            onClick={() => {
              setTipoMovimiento('egreso')
              setShowMovimientoForm(true)
            }}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            Registrar Egreso
          </Button>
          <Button
            onClick={() => setShowArqueoForm(true)}
            variant="outline"
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Arqueo
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Actual</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${caja.saldo.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Balance disponible
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${ingresosHoy.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {movimientosHoy.filter(m => m.tipo === 'ingreso').length} movimientos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egresos Hoy</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${egresosHoy.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {movimientosHoy.filter(m => m.tipo === 'egreso').length} movimientos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movimientos</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {caja.movimientos.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Historial completo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de totales */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Totales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-700">Total Ingresos</div>
              <div className="text-2xl font-bold text-green-600">
                ${totalIngresos.toFixed(2)}
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-lg font-semibold text-red-700">Total Egresos</div>
              <div className="text-2xl font-bold text-red-600">
                ${totalEgresos.toFixed(2)}
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-700">Balance Neto</div>
              <div className={`text-2xl font-bold ${caja.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ${caja.saldo.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de movimientos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Concepto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {caja.movimientos.map((movimiento) => (
                  <tr key={movimiento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(movimiento.fecha).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        movimiento.tipo === 'ingreso' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {movimiento.tipo === 'ingreso' ? (
                          <>
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Ingreso
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Egreso
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movimiento.concepto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={movimiento.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}>
                        ${movimiento.monto.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movimiento.empleado?.nombre || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {caja.movimientos.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay movimientos registrados
              </h3>
              <p className="text-gray-500">
                Comienza registrando tu primer ingreso o egreso
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formularios */}
      {showMovimientoForm && (
        <MovimientoForm
          tipo={tipoMovimiento}
          onClose={() => setShowMovimientoForm(false)}
        />
      )}

      {showArqueoForm && (
        <ArqueoForm
          onClose={() => setShowArqueoForm(false)}
        />
      )}
    </div>
  )
}
