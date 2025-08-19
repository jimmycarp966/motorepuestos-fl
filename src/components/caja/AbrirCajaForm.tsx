import React, { useState } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { X, DollarSign, Lock } from 'lucide-react'

interface AbrirCajaFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const AbrirCajaForm: React.FC<AbrirCajaFormProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [montoInicial, setMontoInicial] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const abrirCaja = useAppStore((state) => state.abrirCaja)
  const addNotification = useAppStore((state) => state.addNotification)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!montoInicial || parseFloat(montoInicial) <= 0) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Monto inválido',
        message: 'Debes ingresar un monto inicial válido'
      })
      return
    }

    setIsSubmitting(true)

    try {
      await abrirCaja(parseFloat(montoInicial))
      
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Caja abierta',
        message: `Caja abierta con $${parseFloat(montoInicial).toFixed(2)} en efectivo`
      })

      setMontoInicial('')
      onSuccess()
      onClose()
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al abrir caja',
        message: error.message || 'Ocurrió un error inesperado'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setMontoInicial('')
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
              <Lock className="w-5 h-5 mr-2 text-green-600" />
              Abrir Caja
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
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-2">
                Monto Inicial (Efectivo)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-secondary w-4 h-4" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={montoInicial}
                  onChange={(e) => setMontoInicial(e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <p className="text-xs text-dark-text-secondary mt-1">
                Ingresa el monto en efectivo con el que inicias la caja
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || !montoInicial}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Abriendo...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Abrir Caja
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
