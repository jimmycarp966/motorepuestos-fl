import React, { useState } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { 
  X, 
  DollarSign, 
  CreditCard, 
  Receipt,
  Minus,
  AlertTriangle
} from 'lucide-react'

interface GastosFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const GastosForm: React.FC<GastosFormProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [monto, setMonto] = useState('')
  const [concepto, setConcepto] = useState('')
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia' | 'cuenta_corriente'>('efectivo')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const registrarEgreso = useAppStore((state) => state.registrarEgreso)
  const saldo = useAppStore((state) => state.caja.saldo)
  const addNotification = useAppStore((state) => state.addNotification)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!monto || parseFloat(monto) <= 0) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Monto inválido',
        message: 'Debes ingresar un monto válido'
      })
      return
    }

    if (!concepto.trim()) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Concepto requerido',
        message: 'Debes ingresar un concepto para el gasto'
      })
      return
    }

    const montoNum = parseFloat(monto)
    
    // Verificar saldo si es efectivo
    if (metodoPago === 'efectivo' && montoNum > saldo) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Saldo insuficiente',
        message: `No hay suficiente efectivo en caja. Saldo actual: $${saldo.toFixed(2)}`
      })
      return
    }

    setIsSubmitting(true)

    try {
      await registrarEgreso(montoNum, concepto)
      
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Gasto registrado',
        message: `Gasto de $${montoNum.toFixed(2)} registrado exitosamente`
      })

      setMonto('')
      setConcepto('')
      setMetodoPago('efectivo')
      onSuccess()
      onClose()
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al registrar gasto',
        message: error.message || 'Ocurrió un error inesperado'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setMonto('')
      setConcepto('')
      setMetodoPago('efectivo')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-dark-text-primary flex items-center">
              <Minus className="w-5 h-5 mr-2 text-red-600" />
              Registrar Gasto
            </h2>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-2">
                Monto
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-secondary w-4 h-4" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
            </div>

            {/* Concepto */}
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-2">
                Concepto
              </label>
              <Textarea
                placeholder="Descripción del gasto..."
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            {/* Método de pago */}
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-2">
                Método de Pago
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={metodoPago === 'efectivo' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMetodoPago('efectivo')}
                  disabled={isSubmitting}
                  className="justify-start"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Efectivo
                </Button>
                <Button
                  type="button"
                  variant={metodoPago === 'tarjeta' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMetodoPago('tarjeta')}
                  disabled={isSubmitting}
                  className="justify-start"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Tarjeta
                </Button>
                <Button
                  type="button"
                  variant={metodoPago === 'transferencia' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMetodoPago('transferencia')}
                  disabled={isSubmitting}
                  className="justify-start"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Transferencia
                </Button>
                <Button
                  type="button"
                  variant={metodoPago === 'cuenta_corriente' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMetodoPago('cuenta_corriente')}
                  disabled={isSubmitting}
                  className="justify-start"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Cuenta Corriente
                </Button>
              </div>
            </div>

            {/* Advertencia de saldo */}
            {metodoPago === 'efectivo' && monto && parseFloat(monto) > saldo && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                  <p className="text-sm text-red-700">
                    Saldo insuficiente. Saldo actual: <strong>${saldo.toFixed(2)}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || !monto || !concepto.trim() || (metodoPago === 'efectivo' && parseFloat(monto) > saldo)}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </>
                ) : (
                  <>
                    <Minus className="w-4 h-4 mr-2" />
                    Registrar Gasto
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
