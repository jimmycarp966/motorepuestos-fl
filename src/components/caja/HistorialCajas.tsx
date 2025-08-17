import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Calendar, DollarSign, TrendingUp, TrendingDown, Users, Receipt } from 'lucide-react'
import { DateUtils } from '../../lib/dateUtils'

interface CajaHistorial {
  fecha: string
  ingresos: number
  egresos: number
  saldo: number
  ventas: number
  arqueoCompletado: boolean
  empleados: string[]
}

export const HistorialCajas: React.FC = () => {
  const [historial, setHistorial] = useState<CajaHistorial[]>([])
  const [loading, setLoading] = useState(false)
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null)
  const [detalleDia, setDetalleDia] = useState<any>(null)
  
  const { supabase } = useAppStore()

  // Cargar historial de cajas
  const cargarHistorial = async () => {
    setLoading(true)
    try {
      // Obtener todas las fechas con actividad
      const { data: fechasActividad, error } = await supabase
        .from('movimientos_caja')
        .select('fecha')
        .order('fecha', { ascending: false })

      if (error) throw error

      // Procesar cada fecha
      const historialData: CajaHistorial[] = []
      
      for (const fecha of fechasActividad || []) {
        const fechaStr = DateUtils.formatDate(fecha.fecha)
        
        // Obtener movimientos del día
        const { data: movimientos } = await supabase
          .from('movimientos_caja')
          .select('*')
          .eq('fecha', fechaStr)

        // Obtener ventas del día
        const { data: ventas } = await supabase
          .from('ventas')
          .select('*')
          .eq('fecha', fechaStr)

        // Obtener arqueo del día
        const { data: arqueo } = await supabase
          .from('arqueos_caja')
          .select('*')
          .eq('fecha', fechaStr)

        const ingresos = movimientos?.filter(m => m.tipo === 'ingreso').reduce((sum, m) => sum + m.monto, 0) || 0
        const egresos = movimientos?.filter(m => m.tipo === 'egreso').reduce((sum, m) => sum + m.monto, 0) || 0
        const saldo = ingresos - egresos

        historialData.push({
          fecha: fechaStr,
          ingresos,
          egresos,
          saldo,
          ventas: ventas?.length || 0,
          arqueoCompletado: arqueo?.[0]?.completado || false,
          empleados: [...new Set(movimientos?.map(m => m.empleado_id) || [])]
        })
      }

      setHistorial(historialData)
    } catch (error) {
      console.error('Error cargando historial:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar detalle de un día específico
  const cargarDetalleDia = async (fecha: string) => {
    try {
      const [movimientos, ventas, arqueo] = await Promise.all([
        supabase.from('movimientos_caja').select('*, empleado:empleados(nombre)').eq('fecha', fecha),
        supabase.from('ventas').select('*, cliente:clientes(nombre), empleado:empleados(nombre)').eq('fecha', fecha),
        supabase.from('arqueos_caja').select('*').eq('fecha', fecha)
      ])

      setDetalleDia({
        fecha,
        movimientos: movimientos.data || [],
        ventas: ventas.data || [],
        arqueo: arqueo.data?.[0] || null
      })
    } catch (error) {
      console.error('Error cargando detalle:', error)
    }
  }

  useEffect(() => {
    cargarHistorial()
  }, [])

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
        <Button onClick={cargarHistorial} disabled={loading}>
          <Receipt className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando historial...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {historial.map((caja) => (
            <Card key={caja.fecha} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {DateUtils.formatDate(caja.fecha, 'dd/MM/yyyy')}
                    </CardTitle>
                    <CardDescription>
                      {caja.empleados.length} empleado(s) trabajaron este día
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={caja.arqueoCompletado ? "default" : "secondary"}>
                      {caja.arqueoCompletado ? 'Arqueo Completado' : 'Sin Arqueo'}
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
                    <p className="text-lg font-bold">{formatCurrency(caja.ingresos)}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-red-600">
                      <TrendingDown className="w-4 h-4" />
                      <span className="font-semibold">Egresos</span>
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(caja.egresos)}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">Saldo</span>
                    </div>
                    <p className={`text-lg font-bold ${getSaldoColor(caja.saldo)}`}>
                      {formatCurrency(caja.saldo)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Receipt className="w-4 h-4" />
                      <span className="font-semibold">Ventas</span>
                    </div>
                    <p className="text-lg font-bold">{caja.ventas}</p>
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
