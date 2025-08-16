import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { X, DollarSign } from 'lucide-react'

const abrirCajaSchema = z.object({
  saldoInicial: z.number().min(0, 'El saldo inicial debe ser mayor o igual a 0'),
})

type AbrirCajaFormData = z.infer<typeof abrirCajaSchema>

interface AbrirCajaFormProps {
  onClose: () => void
}

export const AbrirCajaForm: React.FC<AbrirCajaFormProps> = ({ onClose }) => {
  const abrirCaja = useAppStore((state) => state.abrirCaja)
  const loading = useAppStore((state) => state.caja.loading)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AbrirCajaFormData>({
    resolver: zodResolver(abrirCajaSchema),
    defaultValues: {
      saldoInicial: 0,
    },
  })

  const onSubmit = async (data: AbrirCajaFormData) => {
    try {
      await abrirCaja(data.saldoInicial)
      onClose()
    } catch (error: any) {
      console.error('Error al abrir caja:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Abrir Caja
              </h2>
              <p className="text-green-100 text-sm mt-1">
                Inicia una nueva sesión de caja
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido del formulario */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo Saldo Inicial */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                💰 Saldo Inicial *
              </label>
              <Input
                {...register('saldoInicial', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className={`w-full px-4 py-3 border-2 rounded-lg text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.saldoInicial ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              />
              {errors.saldoInicial && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <span className="mr-1">⚠️</span>
                  {errors.saldoInicial.message}
                </p>
              )}
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Información importante
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>El saldo inicial será el punto de partida para el día</li>
                      <li>Se registrará automáticamente la fecha y hora de apertura</li>
                      <li>Podrás realizar arqueos durante el día</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 py-3 px-6 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
              >
                ❌ Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Abriendo...
                  </span>
                ) : (
                  <span>🚀 Abrir Caja</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
