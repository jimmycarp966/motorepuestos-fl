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
  codigo_sku: z.string().min(1, 'El código SKU es requerido'),
  precio_minorista: z.number().min(0, 'El precio minorista debe ser mayor a 0'),
  precio_mayorista: z.number().min(0, 'El precio mayorista debe ser mayor a 0'),
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">
                {producto ? '✏️ Editar Producto' : '📦 Nuevo Producto'}
              </h2>
              <p className="text-green-100 text-sm mt-1">
                {producto ? 'Modifica los datos del producto' : 'Agrega un nuevo producto al inventario'}
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
              <label className="block text-sm font-semibold text-gray-700">
                📝 Nombre del Producto *
              </label>
              <Input
                {...register('nombre')}
                placeholder="Ej: Filtro de aceite premium"
                className={`w-full px-4 py-3 border-2 rounded-lg text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <span className="mr-1">⚠️</span>
                  {errors.nombre.message}
                </p>
              )}
            </div>

                         {/* Campo Código SKU */}
             <div className="space-y-2">
               <label className="block text-sm font-semibold text-gray-700">
                 🏷️ Código SKU *
               </label>
               <Input
                 {...register('codigo_sku')}
                 placeholder="Ej: PROD-001"
                 className={`w-full px-4 py-3 border-2 rounded-lg text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                   errors.codigo_sku ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                 }`}
               />
               {errors.codigo_sku && (
                 <p className="text-red-500 text-sm flex items-center mt-1">
                   <span className="mr-1">⚠️</span>
                   {errors.codigo_sku.message}
                 </p>
               )}
             </div>

             {/* Campo Descripción */}
             <div className="space-y-2">
               <label className="block text-sm font-semibold text-gray-700">
                 📄 Descripción
               </label>
               <textarea
                 {...register('descripcion')}
                 placeholder="Describe las características del producto..."
                 className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-300 resize-none"
                 rows={3}
               />
             </div>

                         {/* Campos Precios */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="block text-sm font-semibold text-gray-700">
                   💰 Precio Minorista *
                 </label>
                 <div className="relative">
                   <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                   <Input
                     type="number"
                     step="0.01"
                     {...register('precio_minorista', { valueAsNumber: true })}
                     placeholder="0.00"
                     className={`w-full pl-8 pr-4 py-3 border-2 rounded-lg text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                       errors.precio_minorista ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                     }`}
                   />
                 </div>
                 {errors.precio_minorista && (
                   <p className="text-red-500 text-sm flex items-center mt-1">
                     <span className="mr-1">⚠️</span>
                     {errors.precio_minorista.message}
                   </p>
                 )}
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-semibold text-gray-700">
                   🏢 Precio Mayorista *
                 </label>
                 <div className="relative">
                   <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                   <Input
                     type="number"
                     step="0.01"
                     {...register('precio_mayorista', { valueAsNumber: true })}
                     placeholder="0.00"
                     className={`w-full pl-8 pr-4 py-3 border-2 rounded-lg text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                       errors.precio_mayorista ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                     }`}
                   />
                 </div>
                 {errors.precio_mayorista && (
                   <p className="text-red-500 text-sm flex items-center mt-1">
                     <span className="mr-1">⚠️</span>
                     {errors.precio_mayorista.message}
                   </p>
                 )}
               </div>
             </div>

             {/* Campo Stock */}
             <div className="space-y-2">
               <label className="block text-sm font-semibold text-gray-700">
                 📊 Stock Inicial *
               </label>
               <Input
                 type="number"
                 {...register('stock', { valueAsNumber: true })}
                 placeholder="0"
                 className={`w-full px-4 py-3 border-2 rounded-lg text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                   errors.stock ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                 }`}
               />
               {errors.stock && (
                 <p className="text-red-500 text-sm flex items-center mt-1">
                   <span className="mr-1">⚠️</span>
                   {errors.stock.message}
                 </p>
               )}
             </div>

            {/* Campos Categoría y Unidad de Medida */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  🏷️ Categoría *
                </label>
                <select
                  {...register('categoria')}
                  className={`w-full px-4 py-3 border-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-300 transition-all duration-200 ${
                    errors.categoria ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="Filtros">🔧 Filtros</option>
                  <option value="Aceites">🛢️ Aceites</option>
                  <option value="Frenos">🛑 Frenos</option>
                  <option value="Suspensión">🚗 Suspensión</option>
                  <option value="Motor">⚙️ Motor</option>
                  <option value="Eléctrico">⚡ Eléctrico</option>
                  <option value="Herramientas">🔨 Herramientas</option>
                  <option value="Otros">📦 Otros</option>
                </select>
                {errors.categoria && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <span className="mr-1">⚠️</span>
                    {errors.categoria.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  📏 Unidad de Medida *
                </label>
                <select
                  {...register('unidad_medida')}
                  className={`w-full px-4 py-3 border-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-300 transition-all duration-200 ${
                    errors.unidad_medida ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <option value="">Selecciona unidad</option>
                  <option value="pcs">📦 Piezas (pcs)</option>
                  <option value="kg">⚖️ Kilogramos (kg)</option>
                  <option value="l">🛢️ Litros (l)</option>
                  <option value="m">📏 Metros (m)</option>
                  <option value="par">👥 Pares (par)</option>
                  <option value="set">📦 Sets (set)</option>
                </select>
                {errors.unidad_medida && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <span className="mr-1">⚠️</span>
                    {errors.unidad_medida.message}
                  </p>
                )}
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </span>
                ) : (
                  <span>{producto ? '💾 Actualizar' : '✨ Crear Producto'}</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
