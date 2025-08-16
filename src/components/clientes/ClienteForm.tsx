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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
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
              Nombre *
            </label>
            <Input
              {...register('nombre')}
              placeholder="Nombre completo del cliente"
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              {...register('email')}
              placeholder="cliente@ejemplo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <Input
              {...register('telefono')}
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <Input
              {...register('direccion')}
              placeholder="Dirección completa"
            />
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
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isSubmitting ? 'Guardando...' : (cliente ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
