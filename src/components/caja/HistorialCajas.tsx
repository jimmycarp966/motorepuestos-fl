import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Calendar, DollarSign, TrendingUp, TrendingDown, Users, Receipt } from 'lucide-react'
import { DateUtils } from '../../lib/dateUtils'

export const HistorialCajas: React.FC = () => {
  const cajaHistorial = useAppStore((state) => state.cajaHistorial)
  const fetchHistorialCajas = useAppStore((state) => state.fetchHistorialCajas)
  const obtenerResumenCaja = useAppStore((state) => state.obtenerResumenCaja)
  
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null)
  const [detalleDia, setDetalleDia] = useState<any>(null)

  // Cargar detalle de un día específico
  const cargarDetalleDia = async (fecha: string) => {
    try {
      const resumen = await obtenerResumenCaja(fecha)
      setDetalleDia(resumen)
    } catch (error) {
      console.error('Error cargando detalle:', error)
    }
  }

  useEffect(() => {
    fetchHistorialCajas()
  }, [fetchHistorialCajas])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount)
  }

  const getSaldoColor = (saldo: number) => {
    if (saldo > 0) return 'text-green-600'
    if (saldo < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historial de Cajas</h2>
          <p className="text-gray-600">Resumen de todas las cajas cerradas</p>
        </div>
        <Button onClick={() => fetchHistorialCajas()} disabled={cajaHistorial.loading}>
          <Receipt className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {cajaHistorial.loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando historial...</p>
        </div>
      ) : cajaHistorial.cajasDiarias.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay historial de cajas</h3>
          <p className="text-gray-600">Las cajas cerradas aparecerán aquí</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {cajaHistorial.cajasDiarias.map((caja) => (
            <Card key={caja.fecha} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {DateUtils.formatDate(caja.fecha, 'dd/MM/yyyy')}
                    </CardTitle>
                    <CardDescription>
                      Empleado: {caja.empleado_nombre}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={caja.estado === 'cerrada' ? "default" : "secondary"}>
                      {caja.estado === 'cerrada' ? 'Cerrada' : 'Abierta'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFechaSeleccionada(caja.fecha)
                        cargarDetalleDia(caja.fecha)
                      }}
                    >
                      Ver Detalle
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-semibold">Ingresos</span>
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(caja.total_ingresos)}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-red-600">
                      <TrendingDown className="w-4 h-4" />
                      <span className="font-semibold">Egresos</span>
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(caja.total_egresos)}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">Saldo Final</span>
                    </div>
                    <p className={`text-lg font-bold ${getSaldoColor(caja.saldo_final)}`}>
                      {formatCurrency(caja.saldo_final)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Receipt className="w-4 h-4" />
                      <span className="font-semibold">Ventas</span>
                    </div>
                    <p className="text-lg font-bold">{caja.ventas_count}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(caja.total_ventas)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de detalle */}
      {fechaSeleccionada && detalleDia && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Detalle del {DateUtils.formatDate(fechaSeleccionada, 'dd/MM/yyyy')}</h3>
                <Button variant="ghost" onClick={() => setFechaSeleccionada(null)}>
                  ✕
                </Button>
              </div>

              {/* Movimientos */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Movimientos de Caja</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {detalleDia.movimientos.map((mov: any) => (
                      <div key={mov.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <span className={`font-semibold ${mov.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                            {mov.tipo === 'ingreso' ? '+' : '-'} {formatCurrency(mov.monto)}
                          </span>
                          <p className="text-sm text-gray-600">{mov.concepto}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{mov.empleado?.nombre}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(mov.fecha).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ventas */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Ventas del Día</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {detalleDia.ventas.map((venta: any) => (
                      <div key={venta.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-semibold">Venta #{venta.id}</span>
                          <p className="text-sm text-gray-600">
                            {venta.cliente?.nombre || 'Sin cliente'} - {venta.metodo_pago}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(venta.total)}</p>
                          <p className="text-sm">{venta.empleado?.nombre}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Arqueo */}
              {detalleDia.arqueo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Arqueo del Día</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Efectivo Real</p>
                        <p className="font-bold">{formatCurrency(detalleDia.arqueo.efectivo_real)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Tarjeta Real</p>
                        <p className="font-bold">{formatCurrency(detalleDia.arqueo.tarjeta_real)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Transferencia Real</p>
                        <p className="font-bold">{formatCurrency(detalleDia.arqueo.transferencia_real)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Diferencia</p>
                        <p className={`font-bold ${detalleDia.arqueo.total_diferencia === 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(detalleDia.arqueo.total_diferencia)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
