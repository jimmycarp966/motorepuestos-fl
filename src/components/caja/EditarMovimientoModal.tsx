import React, { useState } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { 
  X, 
  Save, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Package,
  Edit,
  RotateCcw
} from 'lucide-react'
import type { MovimientoCaja, Venta } from '../../store/types'
import { EditarProductosVentaModal } from './EditarProductosVentaModal'
import { DevolverProductosModal } from './DevolverProductosModal'

interface EditarMovimientoModalProps {
  movimiento: MovimientoCaja | null
  isOpen: boolean
  onClose: () => void
  onSave: (datos: Partial<MovimientoCaja>) => void
}

export const EditarMovimientoModal: React.FC<EditarMovimientoModalProps> = ({
  movimiento,
  isOpen,
  onClose,
  onSave
}) => {
  const ventas = useAppStore((state) => state.ventas)
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showProductosModal, setShowProductosModal] = useState(false)
  const [showDevolverModal, setShowDevolverModal] = useState(false)
  const [ventaRelacionada, setVentaRelacionada] = useState<Venta | null>(null)

  // Actualizar estado cuando cambia el movimiento
  React.useEffect(() => {
    if (movimiento) {
      setConcepto(movimiento.concepto)
      setMonto(movimiento.monto.toString())
      setMetodoPago(movimiento.metodo_pago)
      
      // Buscar si es una venta relacionada
      const concepto = movimiento.concepto.toLowerCase()
      if (concepto.includes('venta #') || concepto.includes('venta#')) {
        const ventaMatch = concepto.match(/venta\s*#?([a-f0-9-]+)/i)
        if (ventaMatch) {
          const ventaId = ventaMatch[1]
          const venta = ventas.find(v => v.id === ventaId)
          setVentaRelacionada(venta || null)
        }
      }
    }
  }, [movimiento, ventas])

  // Opciones de método de pago
  const metodosPago = [
    { value: 'efectivo', label: 'Efectivo', icon: DollarSign },
    { value: 'transferencia', label: 'Transferencia', icon: DollarSign },
    { value: 'debito', label: 'Débito', icon: CreditCard },
    { value: 'credito', label: 'Crédito', icon: CreditCard },
    { value: 'cuenta_corriente', label: 'Cuenta Corriente', icon: Receipt }
  ]

  if (!isOpen || !movimiento) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const datosActualizados: Partial<MovimientoCaja> = {
        concepto: concepto.trim(),
        monto: parseFloat(monto),
        metodo_pago: metodoPago
      }

      await onSave(datosActualizados)
      onClose()
    } catch (error) {
      console.error('Error al editar movimiento:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setConcepto(movimiento.concepto)
    setMonto(movimiento.monto.toString())
    setMetodoPago(movimiento.metodo_pago)
    onClose()
  }

  const handleEditarProductos = () => {
    setShowProductosModal(true)
  }

  const handleDevolverProductos = () => {
    setShowDevolverModal(true)
  }

  const handleGuardarProductos = async (ventaActualizada: Venta) => {
    try {
      // Actualizar la venta en el store
      const updateVenta = useAppStore.getState().updateVenta
      if (updateVenta) {
        await updateVenta(ventaActualizada.id, ventaActualizada)
      }
      
      // Actualizar el monto del movimiento
      const nuevoMonto = ventaActualizada.total
      const datosActualizados = {
        monto: nuevoMonto,
        concepto: `Venta #${ventaActualizada.id.slice(0, 8)} - ${ventaActualizada.total.toFixed(2)}`
      }
      
      await onSave(datosActualizados)
      setShowProductosModal(false)
    } catch (error) {
      console.error('Error al actualizar productos:', error)
    }
  }

  const handleGuardarDevolucion = async (ventaActualizada: Venta) => {
    try {
      // Actualizar la venta en el store
      const updateVenta = useAppStore.getState().updateVenta
      if (updateVenta) {
        await updateVenta(ventaActualizada.id, ventaActualizada)
      }
      
      // Actualizar el monto del movimiento
      const nuevoMonto = ventaActualizada.total
      const datosActualizados = {
        monto: nuevoMonto,
        concepto: `Venta #${ventaActualizada.id.slice(0, 8)} - ${ventaActualizada.total.toFixed(2)}`
      }
      
      await onSave(datosActualizados)
      setShowDevolverModal(false)
    } catch (error) {
      console.error('Error al procesar devolución:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-dark-bg-secondary rounded-xl shadow-dark-xl w-full max-w-md">
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-text-primary">
              Editar Movimiento
            </h3>
            <Button
              onClick={handleCancel}
              variant="ghost"
              size="sm"
              className="text-dark-text-secondary hover:text-dark-text-primary"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <div className={`p-2 rounded-full ${
              movimiento.tipo === 'ingreso' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {movimiento.tipo === 'ingreso' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
            <span className={`text-sm font-medium ${
              movimiento.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
            }`}>
              {movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="concepto">Concepto</Label>
            <Input
              id="concepto"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Descripción del movimiento"
              required
            />
          </div>

          <div>
            <Label htmlFor="monto">Monto</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-secondary w-4 h-4" />
              <Input
                id="monto"
                type="number"
                step="0.01"
                min="0"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Botones para productos si es una venta */}
          {ventaRelacionada && (
            <div>
              <Label>Productos de la Venta</Label>
              <div className="mt-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-dark-text-primary">
                      Venta #{ventaRelacionada.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-dark-text-secondary">
                      {ventaRelacionada.items?.length || 0} productos
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleEditarProductos}
                    variant="outline"
                    size="sm"
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 flex-1"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Editar Productos
                  </Button>
                  <Button
                    type="button"
                    onClick={handleDevolverProductos}
                    variant="outline"
                    size="sm"
                    className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 flex-1"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Devolver Productos
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="metodo-pago">Método de Pago</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {metodosPago.map((metodo) => {
                const Icon = metodo.icon
                return (
                  <button
                    key={metodo.value}
                    type="button"
                    onClick={() => setMetodoPago(metodo.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                      metodoPago === metodo.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{metodo.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !concepto.trim() || !monto || !metodoPago}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Modal para editar productos */}
      <EditarProductosVentaModal
        venta={ventaRelacionada}
        isOpen={showProductosModal}
        onClose={() => setShowProductosModal(false)}
        onSave={handleGuardarProductos}
      />

      {/* Modal para devolver productos */}
      <DevolverProductosModal
        venta={ventaRelacionada}
        isOpen={showDevolverModal}
        onClose={() => setShowDevolverModal(false)}
        onSave={handleGuardarDevolucion}
      />
    </div>
  )
}
