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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Nuevo {tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="number"
                step="0.01"
                {...register('monto', { valueAsNumber: true })}
                placeholder="0.00"
                className="pl-10"
              />
            </div>
            {errors.monto && (
              <p className="text-red-500 text-sm mt-1">{errors.monto.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Concepto *
            </label>
            <Input
              {...register('concepto')}
              placeholder={`Concepto del ${tipo}`}
            />
            {errors.concepto && (
              <p className="text-red-500 text-sm mt-1">{errors.concepto.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`${
                tipo === 'ingreso' 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
              }`}
            >
              {isSubmitting ? 'Registrando...' : `Registrar ${tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}`}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
