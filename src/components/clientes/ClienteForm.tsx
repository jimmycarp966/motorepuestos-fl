import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { X } from 'lucide-react'

const clienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  limite_credito: z.number().min(0, 'El límite debe ser mayor o igual a 0').optional(),
})

type ClienteFormData = z.infer<typeof clienteSchema>

interface ClienteFormProps {
  cliente?: any
  onClose: () => void
}

export const ClienteForm: React.FC<ClienteFormProps> = ({ cliente, onClose }) => {
  const createCliente = useAppStore((state) => state.createCliente)
  const updateCliente = useAppStore((state) => state.updateCliente)
  const addNotification = useAppStore((state) => state.addNotification)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: cliente ? {
      nombre: cliente.nombre,
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
    } : {
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
    }
  })

  const onSubmit = async (data: ClienteFormData) => {
    try {
      // Limpiar campos vacíos
      const cleanData = {
        ...data,
        email: data.email || undefined,
        telefono: data.telefono || undefined,
        direccion: data.direccion || undefined,
      }

      if (cliente) {
        await updateCliente(cliente.id, cleanData)
        addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Cliente actualizado',
          message: 'El cliente se actualizó correctamente'
        })
      } else {
        await createCliente(cleanData)
        addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Cliente creado',
          message: 'El cliente se creó correctamente'
        })
      }
      reset()
      onClose()
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: cliente ? 'No se pudo actualizar el cliente' : 'No se pudo crear el cliente'
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg bg-dark-bg-secondary rounded-2xl shadow-dark-xl border border-dark-border overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">
                {cliente ? '✏️ Editar Cliente' : '👤 Nuevo Cliente'}
              </h2>
              <p className="text-emerald-100 text-sm mt-1">
                {cliente ? 'Modifica los datos del cliente' : 'Agrega un nuevo cliente al sistema'}
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
            {/* Campo Nombre */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-dark-text-primary">
                👤 Nombre Completo *
              </label>
              <Input
                {...register('nombre')}
                placeholder="Ingresa el nombre completo"
                variant={errors.nombre ? 'error' : 'default'}
                helperText={errors.nombre?.message}
                showIcon={!!errors.nombre}
              />
            </div>

            {/* Campo Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-dark-text-primary">
                📧 Correo Electrónico
              </label>
              <Input
                type="email"
                {...register('email')}
                placeholder="cliente@ejemplo.com"
                variant={errors.email ? 'error' : 'default'}
                helperText={errors.email?.message}
                showIcon={!!errors.email}
              />
            </div>

            {/* Campo Teléfono */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-dark-text-primary">
                📞 Teléfono
              </label>
              <Input
                {...register('telefono')}
                placeholder="+1234567890"
                helperText="Número de contacto del cliente"
              />
            </div>

            {/* Campo Dirección */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-dark-text-primary">
                🏠 Dirección
              </label>
              <textarea
                {...register('direccion')}
                placeholder="Ingresa la dirección completa..."
                className="form-textarea"
                rows={3}
              />
            </div>

            {/* Campo Límite de Crédito */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-dark-text-primary">
                💳 Límite de Crédito
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-secondary z-10">$</span>
                <Input
                  type="number"
                  step="0.01"
                  {...register('limite_credito', { valueAsNumber: true })}
                  placeholder="0.00"
                  className="pl-8"
                  variant={errors.limite_credito ? 'error' : 'default'}
                  helperText={errors.limite_credito?.message || "Monto máximo de crédito permitido"}
                  showIcon={!!errors.limite_credito}
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 py-3 px-6 border-2 border-dark-border text-dark-text-primary hover:bg-dark-bg-tertiary hover:border-dark-border-light transition-all duration-200 font-medium"
              >
                ❌ Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </span>
                ) : (
                  <span>{cliente ? '💾 Actualizar' : '✨ Crear Cliente'}</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
