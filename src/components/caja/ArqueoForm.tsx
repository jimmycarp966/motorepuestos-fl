import React, { useState } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { X, Calculator, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react'

interface ArqueoFormProps {
  onClose: () => void
}

export const ArqueoForm: React.FC<ArqueoFormProps> = ({ onClose }) => {
  const caja = useAppStore((state) => state.caja)
  const arqueoCaja = useAppStore((state) => state.arqueoCaja)
  const addNotification = useAppStore((state) => state.addNotification)
  
  const [saldoEsperado, setSaldoEsperado] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resultadoArqueo, setResultadoArqueo] = useState<any>(null)

  const saldoActual = caja.saldo
  const diferencia = parseFloat(saldoEsperado) - saldoActual

  const handleSubmit = async () => {
    if (!saldoEsperado || parseFloat(saldoEsperado) < 0) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: 'El saldo esperado debe ser un número válido'
      })
      return
    }

    setIsSubmitting(true)
    try {
      const resultado = await arqueoCaja(parseFloat(saldoEsperado), observaciones)
      setResultadoArqueo(resultado)
      
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Arqueo completado',
        message: `Arqueo realizado exitosamente. Diferencia: $${resultado.diferencia.toFixed(2)}`
      })
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: error.message || 'No se pudo realizar el arqueo'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDiferenciaColor = () => {
    if (Math.abs(diferencia) < 0.01) return 'text-green-600'
    if (diferencia > 0) return 'text-red-600'
    return 'text-orange-600'
  }

  const getDiferenciaIcon = () => {
    if (Math.abs(diferencia) < 0.01) return <CheckCircle className="h-5 w-5 text-green-600" />
    if (diferencia > 0) return <AlertTriangle className="h-5 w-5 text-red-600" />
    return <AlertTriangle className="h-5 w-5 text-orange-600" />
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Arqueo de Caja
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Resumen actual */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg">Estado Actual de Caja</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ${saldoActual.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Saldo Actual</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-700">
                    {caja.movimientos.length}
                  </div>
                  <div className="text-sm text-gray-600">Movimientos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de arqueo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datos del Arqueo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saldo Esperado *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={saldoEsperado}
                    onChange={(e) => setSaldoEsperado(e.target.value)}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Observaciones sobre el arqueo..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Previsualización de diferencia */}
              {saldoEsperado && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Diferencia:</span>
                    <div className="flex items-center gap-2">
                      {getDiferenciaIcon()}
                      <span className={`font-bold ${getDiferenciaColor()}`}>
                        ${diferencia.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.abs(diferencia) < 0.01 
                      ? 'Arqueo correcto' 
                      : diferencia > 0 
                        ? 'Faltante en caja' 
                        : 'Sobrante en caja'
                    }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resultado del arqueo */}
          {resultadoArqueo && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-lg text-green-700">Arqueo Completado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      ${resultadoArqueo.saldoAnterior.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Saldo Anterior</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      ${resultadoArqueo.saldoEsperado.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Saldo Esperado</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-700">
                      ${resultadoArqueo.saldoActual.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Saldo Actual</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className={`text-lg font-bold ${getDiferenciaColor()}`}>
                      ${resultadoArqueo.diferencia.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Diferencia</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !saldoEsperado}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isSubmitting ? 'Procesando...' : 'Realizar Arqueo'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
