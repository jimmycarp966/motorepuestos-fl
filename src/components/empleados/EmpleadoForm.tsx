import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppStore } from '../../store'
import type { AuthenticatedUser } from '../../store'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { X } from 'lucide-react'

const empleadoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  rol: z.enum(['admin', 'cajero', 'vendedor', 'consulta']),
})

type EmpleadoFormData = z.infer<typeof empleadoSchema>

interface EmpleadoFormProps {
  empleado?: AuthenticatedUser | null
  onClose: () => void
}

export const EmpleadoForm: React.FC<EmpleadoFormProps> = ({ empleado, onClose }) => {
  const createEmpleado = useAppStore((state) => state.createEmpleado)
  const updateEmpleado = useAppStore((state) => state.updateEmpleado)
  const loading = useAppStore((state) => state.empleados.loading)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmpleadoFormData>({
    resolver: zodResolver(empleadoSchema),
    defaultValues: empleado ? {
      nombre: empleado.nombre,
      email: empleado.email,
      rol: empleado.rol,
    } : undefined,
  })

  const onSubmit = async (data: EmpleadoFormData) => {
    try {
      if (empleado) {
        await updateEmpleado(empleado.id, data)
      } else {
        await createEmpleado(data)
      }
      onClose()
    } catch {
      // Error ya manejado en el store
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                {empleado ? 'Editar Empleado' : 'Nuevo Empleado'}
              </CardTitle>
              <CardDescription>
                {empleado ? 'Modifica los datos del empleado' : 'Agrega un nuevo empleado al sistema'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <Input
                {...register('nombre')}
                placeholder="Nombre completo"
                className={errors.nombre ? 'border-red-500' : ''}
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                {...register('email')}
                type="email"
                placeholder="email@ejemplo.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rol</label>
              <select
                {...register('rol')}
                className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="admin">Administrador</option>
                <option value="cajero">Cajero</option>
                <option value="vendedor">Vendedor</option>
                <option value="consulta">Consulta</option>
              </select>
              {errors.rol && (
                <p className="text-red-500 text-sm mt-1">{errors.rol.message}</p>
              )}
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Guardando...' : (empleado ? 'Actualizar' : 'Crear')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
