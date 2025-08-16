import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { X } from 'lucide-react'

const productoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  precio: z.number().min(0, 'El precio debe ser mayor a 0'),
  stock: z.number().min(0, 'El stock debe ser mayor o igual a 0'),
  categoria: z.string().min(1, 'La categoría es requerida'),
  unidad_medida: z.string().min(1, 'La unidad de medida es requerida'),
})

type ProductoFormData = z.infer<typeof productoSchema>

interface ProductoFormProps {
  producto?: any
  onClose: () => void
}

export const ProductoForm: React.FC<ProductoFormProps> = ({ producto, onClose }) => {
  const createProducto = useAppStore((state) => state.createProducto)
  const updateProducto = useAppStore((state) => state.updateProducto)
  const addNotification = useAppStore((state) => state.addNotification)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ProductoFormData>({
    resolver: zodResolver(productoSchema),
    defaultValues: producto ? {
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      stock: producto.stock,
      categoria: producto.categoria,
      unidad_medida: producto.unidad_medida,
    } : {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      categoria: '',
      unidad_medida: '',
    }
  })

  const onSubmit = async (data: ProductoFormData) => {
    try {
      if (producto) {
        await updateProducto(producto.id, data)
        addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Producto actualizado',
          message: 'El producto se actualizó correctamente'
        })
      } else {
        await createProducto(data)
        addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Producto creado',
          message: 'El producto se creó correctamente'
        })
      }
      reset()
      onClose()
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: producto ? 'No se pudo actualizar el producto' : 'No se pudo crear el producto'
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {producto ? 'Editar Producto' : 'Nuevo Producto'}
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
              placeholder="Nombre del producto"
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <Input
              {...register('descripcion')}
              placeholder="Descripción del producto"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <Input
                type="number"
                step="0.01"
                {...register('precio', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.precio && (
                <p className="text-red-500 text-sm mt-1">{errors.precio.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock *
              </label>
              <Input
                type="number"
                {...register('stock', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <Input
                {...register('categoria')}
                placeholder="Categoría"
              />
              {errors.categoria && (
                <p className="text-red-500 text-sm mt-1">{errors.categoria.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidad de Medida *
              </label>
              <Input
                {...register('unidad_medida')}
                placeholder="pcs, kg, etc."
              />
              {errors.unidad_medida && (
                <p className="text-red-500 text-sm mt-1">{errors.unidad_medida.message}</p>
              )}
            </div>
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? 'Guardando...' : (producto ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
