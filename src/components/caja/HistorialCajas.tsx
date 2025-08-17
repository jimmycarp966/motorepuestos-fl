import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart,
  Clock,
  User,
  Eye,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { DateUtils } from '../../lib/dateUtils'

interface ResumenCaja {
  cajaDiaria: any
  movimientos: any[]
  ventas: any[]
  resumen: {
    totalIngresos: number
    totalEgresos: number
    totalVentas: number
    ventasCount: number
    saldoCalculado: number
  }
}

export const HistorialCajas: React.FC = () => {
  const cajaHistorial = useAppStore((state) => state.cajaHistorial)
  const fetchHistorialCajas = useAppStore((state) => state.fetchHistorialCajas)
  const obtenerResumenCaja = useAppStore((state) => state.obtenerResumenCaja)
  const addNotification = useAppStore((state) => state.addNotification)
  
  const [selectedCaja, setSelectedCaja] = useState<string | null>(null)
  const [resumenCaja, setResumenCaja] = useState<ResumenCaja | null>(null)
  const [showResumen, setShowResumen] = useState(false)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  useEffect(() => {
    fetchHistorialCajas()
  }, [fetchHistorialCajas])

  const handleVerResumen = async (fecha: string) => {
    try {
      const resumen = await obtenerResumenCaja(fecha)
      setResumenCaja(resumen)
      setSelectedCaja(fecha)
      setShowResumen(true)
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: error.message
      })
    }
  }

  const handleFiltrar = () => {
    fetchHistorialCajas(fechaInicio, fechaFin)
  }

  const handleLimpiarFiltros = () => {
    setFechaInicio('')
    setFechaFin('')
    fetchHistorialCajas()
  }

  const getEstadoColor = (estado: string) => {
    return estado === 'abierta' 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100'
  }

  const getEstadoIcon = (estado: string) => {
    return estado === 'abierta' ? <Clock className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial de Cajas Diarias</h1>
          <p className="text-gray-600">Resumen completo de todas las cajas diarias</p>
        </div>
        <Button
          onClick={() => setShowResumen(false)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrar por fecha:</span>
          </div>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Fecha inicio"
          />
          <span className="text-gray-500">hasta</span>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Fecha fin"
          />
          <Button onClick={handleFiltrar} size="sm">
            Filtrar
          </Button>
          <Button onClick={handleLimpiarFiltros} variant="outline" size="sm">
            Limpiar
          </Button>
        </div>
      </Card>

      {showResumen && resumenCaja ? (
        /* Vista de Resumen Detallado */
        <div className="space-y-6">
          {/* Header del Resumen */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Resumen de Caja - {DateUtils.formatDate(resumenCaja.cajaDiaria?.fecha || '', 'long')}
                </h2>
                <p className="text-gray-600">
                  {resumenCaja.cajaDiaria?.empleado_nombre || 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${resumenCaja.resumen.saldoCalculado.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-500">Saldo Final</div>
              </div>
            </div>

            {/* KPIs del Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Apertura</span>
                </div>
                <div className="text-xl font-bold text-blue-600">
                  ${resumenCaja.cajaDiaria?.apertura?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Ingresos</span>
                </div>
                <div className="text-xl font-bold text-green-600">
                  ${resumenCaja.resumen.totalIngresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Egresos</span>
                </div>
                <div className="text-xl font-bold text-red-600">
                  ${resumenCaja.resumen.totalEgresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Ventas</span>
                </div>
                <div className="text-xl font-bold text-purple-600">
                  ${resumenCaja.resumen.totalVentas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-purple-600">
                  {resumenCaja.resumen.ventasCount} ventas
                </div>
              </div>
            </div>

            {/* Movimientos del Día */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Movimientos del Día</h3>
              <div className="max-h-64 overflow-y-auto">
                {resumenCaja.movimientos.length > 0 ? (
                  <div className="space-y-2">
                    {resumenCaja.movimientos.map((movimiento, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            movimiento.tipo === 'ingreso' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {movimiento.tipo === 'ingreso' ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{movimiento.concepto}</p>
                            <p className="text-sm text-gray-500">
                              {DateUtils.formatDate(movimiento.fecha, 'time')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            movimiento.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {movimiento.tipo === 'ingreso' ? '+' : '-'}${movimiento.monto.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay movimientos registrados</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* Vista de Lista de Cajas */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Apertura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cierre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ventas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cajaHistorial.cajasDiarias.length > 0 ? (
                  cajaHistorial.cajasDiarias.map((caja) => (
                    <tr key={caja.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {DateUtils.formatDate(caja.fecha, 'short')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {DateUtils.getDayName(caja.fecha)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{caja.empleado_nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${caja.apertura?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${caja.cierre?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${caja.ventas_total?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {caja.ventas_count || 0} ventas
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(caja.estado)}`}>
                          {getEstadoIcon(caja.estado)}
                          <span className="ml-1 capitalize">{caja.estado}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          onClick={() => handleVerResumen(caja.fecha)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Resumen
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium">
                          {cajaHistorial.loading ? 'Cargando historial...' : 'No hay cajas registradas'}
                        </p>
                        <p className="text-sm">
                          {cajaHistorial.loading ? 'Obteniendo datos...' : 'Comienza registrando cajas diarias'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
