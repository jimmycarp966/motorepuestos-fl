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
  isOpen: boolean
  tipo: 'ingreso' | 'egreso'
  onClose: () => void
  onSuccess: () => void
}

export const MovimientoForm: React.FC<MovimientoFormProps> = ({ 
  isOpen, 
  tipo, 
  onClose, 
  onSuccess 
}) => {
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
      onSuccess()
      onClose()
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: error.message || `No se pudo registrar el ${tipo}`
      })
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      onClose()
    }
  }

  if (!isOpen) return null

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
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 disabled:opacity-50"
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
                💰 Monto *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                <Input
                  {...register('monto', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-10"
                  variant={errors.monto ? 'error' : 'default'}
                  helperText={errors.monto?.message || "Ingresa el monto del movimiento"}
                  showIcon={!!errors.monto}
                />
              </div>
            </div>

            {/* Campo Concepto */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                📝 Concepto *
              </label>
              <Input
                {...register('concepto')}
                type="text"
                placeholder="Descripción del movimiento..."
                variant={errors.concepto ? 'error' : 'default'}
                helperText={errors.concepto?.message || "Explica brevemente el motivo del movimiento"}
                showIcon={!!errors.concepto}
              />
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
                      <li>El movimiento se registrará con la fecha y hora actual</li>
                      <li>Se asociará automáticamente a tu usuario</li>
                      <li>El saldo de caja se actualizará inmediatamente</li>
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
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 py-3 px-6 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
              >
                ❌ Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 py-3 px-6 ${
                  tipo === 'ingreso'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
                } text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </span>
                ) : (
                  <span>{tipo === 'ingreso' ? '🚀 Registrar Ingreso' : '💸 Registrar Egreso'}</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
