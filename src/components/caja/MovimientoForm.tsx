import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { X, DollarSign } from 'lucide-react'

const movimientoSchema = z.object({
  monto: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  concepto: z.string().min(1, 'El concepto es requerido'),
})

type MovimientoFormData = z.infer<typeof movimientoSchema>

interface MovimientoFormProps {
  tipo: 'ingreso' | 'egreso'
  onClose: () => void
}

export const MovimientoForm: React.FC<MovimientoFormProps> = ({ tipo, onClose }) => {
  const registrarIngreso = useAppStore((state) => state.registrarIngreso)
  const registrarEgreso = useAppStore((state) => state.registrarEgreso)
  const addNotification = useAppStore((state) => state.addNotification)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<MovimientoFormData>({
    resolver: zodResolver(movimientoSchema),
    defaultValues: {
      monto: 0,
      concepto: '',
    }
  })

  const onSubmit = async (data: MovimientoFormData) => {
    try {
      if (tipo === 'ingreso') {
        await registrarIngreso(data.monto, data.concepto)
        addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Ingreso registrado',
          message: 'El ingreso se registró correctamente'
        })
      } else {
        await registrarEgreso(data.monto, data.concepto)
        addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Egreso registrado',
          message: 'El egreso se registró correctamente'
        })
      }
      reset()
      onClose()
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: `No se pudo registrar el ${tipo}`
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header con gradiente */}
        <div className={`px-6 py-4 ${
          tipo === 'ingreso' 
            ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
            : 'bg-gradient-to-r from-red-600 to-pink-600'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">
                {tipo === 'ingreso' ? '💰 Nuevo Ingreso' : '💸 Nuevo Egreso'}
              </h2>
              <p className={`text-sm mt-1 ${
                tipo === 'ingreso' ? 'text-green-100' : 'text-red-100'
              }`}>
                {tipo === 'ingreso' ? 'Registra un nuevo ingreso en caja' : 'Registra un nuevo egreso de caja'}
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
            {/* Campo Monto */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                💵 Monto *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                <Input
                  type="number"
                  step="0.01"
                  {...register('monto', { valueAsNumber: true })}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-4 py-3 border-2 rounded-lg text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent ${
                    tipo === 'ingreso' ? 'focus:ring-green-500' : 'focus:ring-red-500'
                  } ${
                    errors.monto ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
              </div>
              {errors.monto && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <span className="mr-1">⚠️</span>
                  {errors.monto.message}
                </p>
              )}
            </div>

            {/* Campo Concepto */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                📝 Concepto *
              </label>
              <textarea
                {...register('concepto')}
                placeholder={`Describe el motivo del ${tipo}...`}
                className={`w-full px-4 py-3 border-2 rounded-lg text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent resize-none ${
                  tipo === 'ingreso' ? 'focus:ring-green-500' : 'focus:ring-red-500'
                } ${
                  errors.concepto ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                rows={3}
              />
              {errors.concepto && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <span className="mr-1">⚠️</span>
                  {errors.concepto.message}
                </p>
              )}
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
                className={`flex-1 py-3 px-6 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
                  tipo === 'ingreso' 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </span>
                ) : (
                  <span>
                    {tipo === 'ingreso' ? '💰 Registrar Ingreso' : '💸 Registrar Egreso'}
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
