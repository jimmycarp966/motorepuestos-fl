import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { DateUtils } from '../../lib/dateUtils'
import { usePermissionGuard } from '../../hooks/usePermissionGuard'
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  User, 
  Lock, 
  Unlock,
  Minus,
  RefreshCw,
  BarChart3,
  ShoppingCart,
  CreditCard,
  Receipt,
  History,
  X,
  Calculator,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { MovimientoForm } from './MovimientoForm'
import { AbrirCajaForm } from './AbrirCajaForm'
import { GastosForm } from './GastosForm'
import { HistorialCajas } from './HistorialCajas'
import { ArqueoModal } from './ArqueoModal'
import { EditarMovimientoModal } from './EditarMovimientoModal'
import { obtenerDetallesMovimiento, formatearDetallesMovimiento, obtenerIconoMovimiento } from '../../lib/movimientoDetails'
import type { MovimientoCaja, MovimientoDetalle } from '../../store/types'

export const CajaTable: React.FC = () => {
  const movimientos = useAppStore((state) => state.caja.movimientos)
  const saldo = useAppStore((state) => state.caja.saldo)
  const loading = useAppStore((state) => state.caja.loading)
  const cajaAbierta = useAppStore((state) => state.caja.cajaAbierta)
  const ventas = useAppStore((state) => state.ventas)
  const arqueoCompletadoHoy = useAppStore((state) => state.arqueoCompletadoHoy)
  const fetchMovimientos = useAppStore((state) => state.fetchMovimientos)
  const fetchVentas = useAppStore((state) => state.fetchVentas)
  const iniciarArqueo = useAppStore((state) => state.iniciarArqueo)
  const verificarArqueoCompletado = useAppStore((state) => state.verificarArqueoCompletado)
  const editarMovimiento = useAppStore((state) => state.editarMovimiento)
  const eliminarMovimiento = useAppStore((state) => state.eliminarMovimiento)
  const addNotification = useAppStore((state) => state.addNotification)
  
  const [showIngresoForm, setShowIngresoForm] = useState(false)
  const [showAbrirCaja, setShowAbrirCaja] = useState(false)
  const [showGastosForm, setShowGastosForm] = useState(false)
  const [showHistorial, setShowHistorial] = useState(false)
  const [tipoMovimiento, setTipoMovimiento] = useState<'ingreso' | 'egreso'>('ingreso')
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMovimiento, setSelectedMovimiento] = useState<MovimientoCaja | null>(null)
  const [movimientosDetallados, setMovimientosDetallados] = useState<MovimientoDetalle[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Hook de permisos
  const { isAdmin } = usePermissionGuard()

  // Cargar datos al montar
  useEffect(() => {
    fetchMovimientos()
    fetchVentas()
    verificarArqueoCompletado()
  }, [fetchMovimientos, fetchVentas, verificarArqueoCompletado])

  // Refrescar datos cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMovimientos()
      fetchVentas()
      verificarArqueoCompletado()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchMovimientos, fetchVentas, verificarArqueoCompletado])

  const handleFormClose = () => {
    setShowIngresoForm(false)
  }

  const handleNuevoIngreso = () => {
    setTipoMovimiento('ingreso')
    setShowIngresoForm(true)
  }

  const handleNuevoEgreso = () => {
    setTipoMovimiento('egreso')
    setShowIngresoForm(true)
  }

  const handleAbrirCaja = () => {
    setShowAbrirCaja(true)
  }

  const handleCerrarAbrirCaja = () => {
    setShowAbrirCaja(false)
  }

  const handleNuevoGasto = () => {
    setShowGastosForm(true)
  }

  const handleCerrarGastosForm = () => {
    setShowGastosForm(false)
  }

  const handleVerHistorial = () => {
    setShowHistorial(true)
  }

  // Función para cargar detalles de movimientos
  const cargarDetallesMovimientos = async () => {
    setLoadingDetails(true)
    try {
      const detalles = await Promise.all(
        movimientos.map(mov => obtenerDetallesMovimiento(mov))
      )
      setMovimientosDetallados(detalles)
    } catch (error) {
      console.error('Error al cargar detalles:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  // Cargar detalles cuando cambian los movimientos
  useEffect(() => {
    if (movimientos.length > 0) {
      cargarDetallesMovimientos()
    }
  }, [movimientos])

  // Función para editar movimiento
  const handleEditarMovimiento = async (datos: Partial<MovimientoCaja>) => {
    if (!selectedMovimiento) return
    
    try {
      await editarMovimiento(selectedMovimiento.id, datos)
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Movimiento actualizado',
        message: 'El movimiento se ha actualizado correctamente'
      })
      setShowEditModal(false)
      setSelectedMovimiento(null)
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al actualizar',
        message: error.message || 'No se pudo actualizar el movimiento'
      })
    }
  }

  // Función para eliminar movimiento
  const handleEliminarMovimiento = async (movimientoId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este movimiento? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      await eliminarMovimiento(movimientoId)
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Movimiento eliminado',
        message: 'El movimiento se ha eliminado correctamente'
      })
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al eliminar',
        message: error.message || 'No se pudo eliminar el movimiento'
      })
    }
  }

  // Función para abrir modal de edición
  const abrirModalEdicion = (movimiento: MovimientoCaja) => {
    setSelectedMovimiento(movimiento)
    setShowEditModal(true)
  }

  const handleCerrarHistorial = () => {
    setShowHistorial(false)
  }

  const handleIniciarArqueo = async () => {
    try {
      await iniciarArqueo()
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al iniciar arqueo',
        message: error.message || 'Ocurrió un error inesperado'
      })
    }
  }

  const handleRefresh = () => {
    fetchMovimientos()
    fetchVentas()
    verificarArqueoCompletado()
  }

  // Calcular estadísticas usando DateUtils
  const movimientosHoy = movimientos.filter(m => {
    return DateUtils.isToday(m.fecha)
  })

  const ingresosHoy = movimientosHoy
    .filter(m => m.tipo === 'ingreso')
    .reduce((sum, m) => sum + m.monto, 0)

  const egresosHoy = movimientosHoy
    .filter(m => m.tipo === 'egreso')
    .reduce((sum, m) => sum + m.monto, 0)

  // Calcular estadísticas de ventas
  const ventasHoy = (ventas || []).filter(v => {
    return DateUtils.isToday(v.fecha)
  })

  const totalVentasHoy = ventasHoy.reduce((sum, v) => sum + (v.total || 0), 0)
  const ventasPorMetodo = ventasHoy.reduce((acc, v) => {
    const metodo = v.metodo_pago || 'efectivo'
    acc[metodo] = (acc[metodo] || 0) + (v.total || 0)
    return acc
  }, {} as Record<string, number>)

  // Obtener icono para método de pago
  const getMetodoPagoIcon = (metodo: string) => {
    switch (metodo) {
      case 'efectivo': return <DollarSign className="w-4 h-4" />
      case 'tarjeta': return <CreditCard className="w-4 h-4" />
      case 'transferencia': return <DollarSign className="w-4 h-4" />
      case 'cuenta_corriente': return <Receipt className="w-4 h-4" />
      default: return <DollarSign className="w-4 h-4" />
    }
  }

  // Obtener color para método de pago
  const getMetodoPagoColor = (metodo: string) => {
    switch (metodo) {
      case 'efectivo': return 'text-success-500 bg-success-500/20 border border-success-500/30'
      case 'tarjeta': return 'text-primary-500 bg-primary-500/20 border border-primary-500/30'
      case 'transferencia': return 'text-secondary-500 bg-secondary-500/20 border border-secondary-500/30'
      case 'cuenta_corriente': return 'text-warning-500 bg-warning-500/20 border border-warning-500/30'
      default: return 'text-dark-text-secondary bg-dark-bg-tertiary border border-dark-border'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark-text-primary">Caja</h1>
          <p className="text-dark-text-secondary">Gestión de efectivo y movimientos</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          {cajaAbierta ? (
            <Button
              onClick={handleIniciarArqueo}
              variant="outline"
              size="sm"
              disabled={arqueoCompletadoHoy}
              className={`${
                arqueoCompletadoHoy 
                  ? 'text-dark-text-secondary border-dark-border cursor-not-allowed' 
                  : 'text-red-600 border-red-200 hover:bg-red-50'
              }`}
            >
              <Calculator className="w-4 h-4 mr-2" />
              {arqueoCompletadoHoy ? 'Arqueo Completado' : 'Iniciar Arqueo'}
            </Button>
          ) : (
            <Button
              onClick={handleAbrirCaja}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Abrir Caja
            </Button>
          )}
        </div>
      </div>

      {/* Estado de Caja */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-text-secondary">Saldo Actual</p>
              <p className="text-2xl font-bold text-dark-text-primary">
                ${saldo.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-text-secondary">Ingresos Hoy</p>
              <p className="text-2xl font-bold text-green-600">
                ${ingresosHoy.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-text-secondary">Egresos Hoy</p>
              <p className="text-2xl font-bold text-red-600">
                ${egresosHoy.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-text-secondary">Ventas Hoy</p>
              <p className="text-2xl font-bold text-blue-600">
                ${totalVentasHoy.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Ventas por Método de Pago - Sección Mejorada */}
      {ventasHoy.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-dark-text-primary flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Ventas por Modalidad de Pago
              </h3>
              <p className="text-sm text-dark-text-secondary mt-1">Desglose detallado de ventas del día</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                ${totalVentasHoy.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-dark-text-secondary">{ventasHoy.length} ventas totales</div>
            </div>
          </div>
          
          {/* Grid de métodos de pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Object.entries(ventasPorMetodo).map(([metodo, total]) => {
              const porcentaje = totalVentasHoy > 0 ? ((total / totalVentasHoy) * 100).toFixed(1) : '0'
              return (
                <div key={metodo} className="bg-dark-bg-secondary border border-dark-border rounded-lg p-4 hover:shadow-dark-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${getMetodoPagoColor(metodo)}`}>
                        {getMetodoPagoIcon(metodo)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-semibold text-dark-text-primary capitalize">
                          {metodo.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-dark-text-secondary">
                          {porcentaje}% del total
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      ${total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-dark-text-secondary">
                      {ventasHoy.filter(v => (v.metodo_pago || 'efectivo') === metodo).length} ventas
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Gráfico de barras simple */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-dark-text-primary mb-3">Distribución Visual</h4>
            <div className="flex items-end space-x-2 h-8">
              {Object.entries(ventasPorMetodo).map(([metodo, total]) => {
                const porcentaje = totalVentasHoy > 0 ? (total / totalVentasHoy) * 100 : 0
                return (
                  <div key={metodo} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full rounded-t"
                      style={{
                        height: `${Math.max(porcentaje, 5)}%`,
                        backgroundColor: metodo === 'efectivo' ? '#10b981' :
                                        metodo === 'tarjeta' ? '#3b82f6' :
                                        metodo === 'transferencia' ? '#8b5cf6' :
                                        metodo === 'cuenta_corriente' ? '#f59e0b' : '#6b7280'
                      }}
                    ></div>
                    <div className="text-xs text-dark-text-secondary mt-1 capitalize">
                      {metodo.replace('_', ' '        )}
      </div>

      {/* Modal de edición de movimiento */}
      <EditarMovimientoModal
        movimiento={selectedMovimiento}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedMovimiento(null)
        }}
        onSave={handleEditarMovimiento}
      />
    </div>
  )
})}
            </div>
          </div>
        </Card>
      )}

      {/* Estadísticas Adicionales de Ventas */}
      {ventasHoy.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
            <h3 className="text-lg font-semibold text-dark-text-primary">Estadísticas Adicionales</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Promedio por venta */}
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ${(totalVentasHoy / ventasHoy.length).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-blue-700 font-medium">Promedio por Venta</div>
              <div className="text-xs text-blue-600 mt-1">{ventasHoy.length} ventas</div>
            </div>

            {/* Método más usado */}
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {(() => {
                  const metodoMasUsado = Object.entries(ventasPorMetodo)
                    .sort(([,a], [,b]) => b - a)[0]
                  return metodoMasUsado ? metodoMasUsado[0].replace('_', ' ').toUpperCase() : 'N/A'
                })()}
              </div>
              <div className="text-sm text-green-700 font-medium">Método Más Usado</div>
              <div className="text-xs text-green-600 mt-1">por monto</div>
            </div>

            {/* Ventas por hora */}
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {(() => {
                  const horas = ventasHoy.map(v => new Date(v.fecha).getHours())
                  const horaMasActiva = horas.sort((a,b) => 
                    horas.filter(h => h === a).length - horas.filter(h => h === b).length
                  ).pop()
                  return horaMasActiva !== undefined ? `${horaMasActiva}:00` : 'N/A'
                })()}
              </div>
              <div className="text-sm text-purple-700 font-medium">Hora Más Activa</div>
              <div className="text-xs text-purple-600 mt-1">del día</div>
            </div>
          </div>

          {/* Resumen de métodos de pago */}
          <div className="mt-6 p-4 bg-dark-bg-tertiary rounded-lg">
            <h4 className="text-sm font-medium text-dark-text-primary mb-3">Resumen por Método de Pago</h4>
            <div className="space-y-2">
              {Object.entries(ventasPorMetodo).map(([metodo, total]) => {
                const cantidad = ventasHoy.filter(v => (v.metodo_pago || 'efectivo') === metodo).length
                const porcentaje = totalVentasHoy > 0 ? ((total / totalVentasHoy) * 100).toFixed(1) : '0'
                return (
                  <div key={metodo} className="flex items-center justify-between p-2 bg-dark-bg-secondary rounded border border-dark-border">
                    <div className="flex items-center">
                      <div className={`p-1 rounded ${getMetodoPagoColor(metodo)}`}>
                        {getMetodoPagoIcon(metodo)}
                      </div>
                      <span className="ml-2 text-sm font-medium capitalize">
                        {metodo.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-dark-text-primary">
                        ${total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-dark-text-secondary">
                        {cantidad} ventas ({porcentaje}%)
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Botones de Acción */}
      {cajaAbierta && (
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleNuevoIngreso}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Ingreso
            </Button>
            <Button
              onClick={handleNuevoGasto}
              className="bg-red-600 hover:bg-red-700"
            >
              <Minus className="w-4 h-4 mr-2" />
              Nuevo Gasto
            </Button>
            <Button
              onClick={handleNuevoEgreso}
              variant="outline"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Otro Egreso
            </Button>
            <Button
              onClick={handleVerHistorial}
              variant="outline"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <History className="w-4 h-4 mr-2" />
              Ver Historial
            </Button>
          </div>
        </Card>
      )}

      {/* Estado de Caja */}
      {!cajaAbierta && (
        <Card className="p-6">
          <div className="text-center">
            <Lock className="w-16 h-16 mx-auto mb-4 text-dark-border" />
            <h3 className="text-lg font-medium text-dark-text-primary mb-2">Caja Cerrada</h3>
            <p className="text-dark-text-secondary mb-4">
              Para realizar movimientos, primero debes abrir la caja
            </p>
            <Button
              onClick={handleAbrirCaja}
              className="bg-green-600 hover:bg-green-700"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Abrir Caja
            </Button>
          </div>
        </Card>
      )}

      {/* Tabla de movimientos */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-border">
          <h3 className="text-lg font-medium">Movimientos Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-border">
            <thead className="bg-dark-bg-tertiary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                  Detalles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                  Empleado
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-dark-bg-secondary divide-y divide-dark-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-dark-text-secondary">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Cargando movimientos...
                    </div>
                  </td>
                </tr>
              ) : movimientos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-dark-text-secondary">
                    No hay movimientos registrados
                  </td>
                </tr>
              ) : (
                movimientos.map((movimiento, index) => {
                  const detalles = movimientosDetallados[index]
                  const detallesFormateados = detalles ? formatearDetallesMovimiento(detalles) : movimiento.concepto
                  const icono = detalles ? obtenerIconoMovimiento(detalles) : '💰'
                  
                  return (
                    <tr key={movimiento.id} className={`hover:bg-dark-bg-tertiary ${
                      movimiento.estado === 'eliminada' ? 'opacity-50' : ''
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-primary">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-dark-text-secondary" />
                          {DateUtils.formatDateTimeForDisplay(movimiento.fecha)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            movimiento.tipo === 'ingreso' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {movimiento.tipo === 'ingreso' ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                          </span>
                          {movimiento.estado === 'eliminada' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Eliminada
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-text-primary">
                        <div className="flex items-center">
                          <span className="mr-2 text-lg">{icono}</span>
                          <div className={movimiento.estado === 'eliminada' ? 'line-through' : ''}>
                            <div className="font-medium">{detallesFormateados}</div>
                            {detalles?.detalles?.tipo === 'venta' && detalles.detalles.items && detalles.detalles.items.length > 3 && (
                              <div className="text-xs text-dark-text-secondary mt-1">
                                {detalles.detalles.items.length} productos vendidos
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={`${movimiento.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'} ${
                          movimiento.estado === 'eliminada' ? 'line-through' : ''
                        }`}>
                          {movimiento.tipo === 'ingreso' ? '+' : '-'}${movimiento.monto.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-dark-text-secondary" />
                          {movimiento.empleado?.nombre || 'N/A'}
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => abrirModalEdicion(movimiento)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Editar movimiento"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleEliminarMovimiento(movimiento.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Eliminar movimiento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tabla de ventas recientes */}
      {ventasHoy.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-border">
            <h3 className="text-lg font-medium">Ventas Recientes (Hoy)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-border">
              <thead className="bg-dark-bg-tertiary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Método de Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Empleado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-dark-bg-secondary divide-y divide-dark-border">
                {ventasHoy.slice(0, 10).map((venta) => (
                  <tr key={venta.id} className={`hover:bg-dark-bg-tertiary ${
                    venta.estado === 'eliminada' ? 'opacity-50' : ''
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-primary">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-dark-text-secondary" />
                        {DateUtils.formatTimeForDisplay(venta.fecha)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMetodoPagoColor(venta.metodo_pago || 'efectivo')}`}>
                          {getMetodoPagoIcon(venta.metodo_pago || 'efectivo')}
                          <span className="ml-1 capitalize">
                            {(venta.metodo_pago || 'efectivo').replace('_', ' ')}
                          </span>
                        </span>
                        {venta.estado === 'eliminada' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Eliminada
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      <span className={venta.estado === 'eliminada' ? 'line-through' : ''}>
                        ${(venta.total || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-dark-text-secondary" />
                        {venta.empleado?.nombre || 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modales */}
      {showIngresoForm && (
        <MovimientoForm
          isOpen={showIngresoForm}
          onClose={handleFormClose}
          tipo={tipoMovimiento}
          onSuccess={() => {
            handleFormClose()
            fetchMovimientos()
          }}
        />
      )}

      {showAbrirCaja && (
        <AbrirCajaForm
          isOpen={showAbrirCaja}
          onClose={handleCerrarAbrirCaja}
          onSuccess={() => {
            handleCerrarAbrirCaja()
            fetchMovimientos()
          }}
        />
      )}

      {showGastosForm && (
        <GastosForm
          isOpen={showGastosForm}
          onClose={handleCerrarGastosForm}
          onSuccess={() => {
            handleCerrarGastosForm()
            fetchMovimientos()
          }}
        />
      )}

      {/* Historial de Cajas */}
      {showHistorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-7xl max-h-[90vh] overflow-hidden bg-dark-bg-secondary rounded-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-dark-text-primary">Historial de Cajas Diarias</h2>
                <Button
                  onClick={handleCerrarHistorial}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
                <HistorialCajas />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Arqueo */}
      <ArqueoModal />

      {/* Modal de edición de movimiento */}
      <EditarMovimientoModal
        movimiento={selectedMovimiento}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedMovimiento(null)
        }}
        onSave={handleEditarMovimiento}
      />
    </div>
  )
}
