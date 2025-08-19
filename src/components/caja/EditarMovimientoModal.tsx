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
  Receipt
} from 'lucide-react'
import type { MovimientoCaja } from '../../store/types'

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
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Actualizar estado cuando cambia el movimiento
  React.useEffect(() => {
    if (movimiento) {
      setConcepto(movimiento.concepto)
      setMonto(movimiento.monto.toString())
      setMetodoPago(movimiento.metodo_pago)
    }
  }, [movimiento])

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
    </div>
  )
}
