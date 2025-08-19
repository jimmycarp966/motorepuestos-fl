import React, { useState } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { X, DollarSign, User } from 'lucide-react'
import type { Cliente } from '../../store/types'

interface PagarDeudaModalProps {
  cliente: Cliente
  onClose: () => void
}

export const PagarDeudaModal: React.FC<PagarDeudaModalProps> = ({ cliente, onClose }) => {
  const [monto, setMonto] = useState('')
  const [loading, setLoading] = useState(false)
  const pagarDeudaCliente = useAppStore((state) => state.pagarDeudaCliente)
  const addNotification = useAppStore((state) => state.addNotification)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const montoNum = parseFloat(monto)
    if (isNaN(montoNum) || montoNum <= 0) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Monto inválido',
        message: 'Por favor ingrese un monto válido mayor a 0'
      })
      return
    }

    if (montoNum > cliente.saldo_cuenta_corriente) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Monto excede la deuda',
        message: `El monto excede la deuda pendiente ($${cliente.saldo_cuenta_corriente})`
      })
      return
    }

    setLoading(true)
    try {
      await pagarDeudaCliente(cliente.id, montoNum)
      onClose()
    } catch (error) {
      // El error ya se maneja en la acción
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-dark-bg-secondary rounded-lg shadow-dark-xl border border-dark-border">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-dark-text-primary">Pagar Deuda</h2>
              <p className="text-sm text-dark-text-secondary">Registrar pago de cuenta corriente</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-dark-text-secondary hover:text-dark-text-primary"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del cliente */}
          <div className="bg-dark-bg-tertiary rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-dark-text-primary">{cliente.nombre}</h3>
                <p className="text-sm text-dark-text-secondary">Cliente</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-dark-text-secondary">Deuda actual:</span>
                <span className="font-medium text-red-600">
                  ${cliente.saldo_cuenta_corriente.toLocaleString()}
                </span>
              </div>
              {cliente.limite_credito > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-dark-text-secondary">Límite de crédito:</span>
                  <span className="font-medium text-dark-text-primary">
                    ${cliente.limite_credito.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Campo de monto */}
          <div className="space-y-2">
            <Label htmlFor="monto" className="text-sm font-medium text-dark-text-primary">
              Monto a pagar
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-dark-text-secondary sm:text-sm">$</span>
              </div>
              <Input
                id="monto"
                type="number"
                step="0.01"
                min="0"
                max={cliente.saldo_cuenta_corriente}
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="pl-7"
                placeholder="0.00"
                required
              />
            </div>
            <p className="text-xs text-dark-text-secondary">
              Máximo: ${cliente.saldo_cuenta_corriente.toLocaleString()}
            </p>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              disabled={loading || !monto || parseFloat(monto) <= 0}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Registrar Pago
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
