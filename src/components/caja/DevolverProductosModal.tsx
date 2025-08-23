import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card } from '../ui/card'
import { 
  X, 
  Save, 
  RotateCcw,
  Package,
  AlertTriangle,
  CheckCircle,
  Minus,
  Plus
} from 'lucide-react'
import type { Venta, VentaItem, Producto } from '../../store/types'
import { supabase } from '../../lib/supabase'
import { DateUtils } from '../../lib/dateUtils'

interface DevolverProductosModalProps {
  venta: Venta | null
  isOpen: boolean
  onClose: () => void
  onSave: (ventaActualizada: Venta) => void
}

interface ProductoDevolucion {
  producto: Producto
  item: VentaItem
  cantidadOriginal: number
  cantidadDevolver: number
  precioUnitario: number
  subtotalDevolver: number
}

export const DevolverProductosModal: React.FC<DevolverProductosModalProps> = ({
  venta,
  isOpen,
  onClose,
  onSave
}) => {
  const productos = useAppStore((state) => state.productos)
  const [productosDevolucion, setProductosDevolucion] = useState<ProductoDevolucion[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [totalDevolver, setTotalDevolver] = useState(0)

  // Cargar productos de la venta cuando se abre el modal
  useEffect(() => {
    if (isOpen && venta && venta.items) {
      const productosConInfo = venta.items.map(item => {
        const producto = productos.find(p => p.id === item.producto_id)
        return {
          producto: producto!,
          item,
          cantidadOriginal: item.cantidad,
          cantidadDevolver: 0,
          precioUnitario: item.precio_unitario,
          subtotalDevolver: 0
        }
      }).filter(p => p.producto) // Solo productos que existen

      setProductosDevolucion(productosConInfo)
      setTotalDevolver(0)
    }
  }, [isOpen, venta, productos])

  // Calcular total cuando cambian las cantidades
  useEffect(() => {
    const total = productosDevolucion.reduce((sum, p) => sum + p.subtotalDevolver, 0)
    setTotalDevolver(total)
  }, [productosDevolucion])

  const handleCantidadChange = (index: number, cantidad: number) => {
    const producto = productosDevolucion[index]
    const cantidadMaxima = producto.cantidadOriginal
    
    // Validar que no exceda la cantidad original
    const cantidadValida = Math.max(0, Math.min(cantidad, cantidadMaxima))
    
    const productosActualizados = [...productosDevolucion]
    productosActualizados[index] = {
      ...producto,
      cantidadDevolver: cantidadValida,
      subtotalDevolver: cantidadValida * producto.precioUnitario
    }
    
    setProductosDevolucion(productosActualizados)
  }

  const handleIncrementar = (index: number) => {
    const producto = productosDevolucion[index]
    if (producto.cantidadDevolver < producto.cantidadOriginal) {
      handleCantidadChange(index, producto.cantidadDevolver + 1)
    }
  }

  const handleDecrementar = (index: number) => {
    const producto = productosDevolucion[index]
    if (producto.cantidadDevolver > 0) {
      handleCantidadChange(index, producto.cantidadDevolver - 1)
    }
  }

  const handleDevolverTodo = () => {
    const productosActualizados = productosDevolucion.map(producto => ({
      ...producto,
      cantidadDevolver: producto.cantidadOriginal,
      subtotalDevolver: producto.cantidadOriginal * producto.precioUnitario
    }))
    setProductosDevolucion(productosActualizados)
  }

  const handleLimpiar = () => {
    const productosActualizados = productosDevolucion.map(producto => ({
      ...producto,
      cantidadDevolver: 0,
      subtotalDevolver: 0
    }))
    setProductosDevolucion(productosActualizados)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar que hay productos para devolver
    const productosADevolver = productosDevolucion.filter(p => p.cantidadDevolver > 0)
    if (productosADevolver.length === 0) {
      alert('Selecciona al menos un producto para devolver')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Actualizar items de venta (reducir cantidades)
      const itemsActualizados = venta!.items!.map(item => {
        const productoDevolucion = productosDevolucion.find(p => p.item.producto_id === item.producto_id)
        if (productoDevolucion) {
          const nuevaCantidad = item.cantidad - productoDevolucion.cantidadDevolver
          return {
            ...item,
            cantidad: nuevaCantidad,
            subtotal: nuevaCantidad * item.precio_unitario
          }
        }
        return item
      }).filter(item => item.cantidad > 0) // Solo items con cantidad > 0

      // 2. Calcular nuevo total de la venta
      const nuevoTotal = itemsActualizados.reduce((sum, item) => sum + item.subtotal, 0)

      // 3. Actualizar venta en la base de datos
      const { error: errorVenta } = await supabase
        .from('ventas')
        .update({
          total: nuevoTotal,
          updated_at: DateUtils.getCurrentLocalDateTime()
        })
        .eq('id', venta!.id)

      if (errorVenta) throw errorVenta

      // 4. Eliminar items de venta existentes
      const { error: errorDeleteItems } = await supabase
        .from('venta_items')
        .delete()
        .eq('venta_id', venta!.id)

      if (errorDeleteItems) throw errorDeleteItems

      // 5. Insertar items actualizados
      if (itemsActualizados.length > 0) {
        const itemsToInsert = itemsActualizados.map(item => ({
          venta_id: venta!.id,
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal
        }))

        const { error: errorInsertItems } = await supabase
          .from('venta_items')
          .insert(itemsToInsert)

        if (errorInsertItems) throw errorInsertItems
      }

      // 6. Restaurar stock de productos devueltos
      for (const productoDevolucion of productosADevolver) {
        const { error: errorStock } = await supabase
          .from('productos')
          .update({
            stock: supabase.raw(`stock + ${productoDevolucion.cantidadDevolver}`),
            updated_at: DateUtils.getCurrentLocalDateTime()
          })
          .eq('id', productoDevolucion.producto.id)

        if (errorStock) {
          console.warn(`Error al restaurar stock de ${productoDevolucion.producto.nombre}:`, errorStock)
        }
      }

      // 7. Crear venta actualizada
      const ventaActualizada: Venta = {
        ...venta!,
        total: nuevoTotal,
        items: itemsActualizados
      }

      // 8. Actualizar estado local
      await onSave(ventaActualizada)

      // 9. Recargar productos para actualizar stock en UI
      const fetchProductos = useAppStore.getState().fetchProductos
      if (fetchProductos) {
        fetchProductos()
      }

      onClose()
    } catch (error: any) {
      console.error('Error al procesar devolución:', error)
      alert(`Error al procesar la devolución: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setProductosDevolucion([])
    setTotalDevolver(0)
    onClose()
  }

  if (!isOpen || !venta) return null

  const productosADevolver = productosDevolucion.filter(p => p.cantidadDevolver > 0)
  const totalOriginal = venta.total

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-dark-bg-secondary rounded-xl shadow-dark-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-dark-text-primary">
                Devolver Productos
              </h3>
              <p className="text-sm text-dark-text-secondary">
                Venta #{venta.id.slice(0, 8)} - Total original: ${totalOriginal.toFixed(2)}
              </p>
            </div>
            <Button
              onClick={handleCancel}
              variant="ghost"
              size="sm"
              className="text-dark-text-secondary hover:text-dark-text-primary"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Botones de acción rápida */}
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDevolverTodo}
              className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Devolver Todo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLimpiar}
            >
              <X className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[60vh]">
          <div className="p-6 space-y-4">
            {productosDevolucion.map((producto, index) => (
              <Card key={producto.producto.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-dark-text-primary">
                      {producto.producto.nombre}
                    </h4>
                    <p className="text-sm text-dark-text-secondary">
                      Precio: ${producto.precioUnitario.toFixed(2)} | 
                      Vendidos: {producto.cantidadOriginal} | 
                      Stock actual: {producto.producto.stock}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-dark-text-primary">
                        ${producto.subtotalDevolver.toFixed(2)}
                      </p>
                      <p className="text-xs text-dark-text-secondary">
                        {producto.cantidadDevolver} de {producto.cantidadOriginal}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDecrementar(index)}
                        disabled={producto.cantidadDevolver === 0}
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <Input
                        type="number"
                        min="0"
                        max={producto.cantidadOriginal}
                        value={producto.cantidadDevolver}
                        onChange={(e) => handleCantidadChange(index, parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                      />
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleIncrementar(index)}
                        disabled={producto.cantidadDevolver === producto.cantidadOriginal}
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {productosDevolucion.length === 0 && (
              <div className="text-center py-8 text-dark-text-secondary">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay productos en esta venta</p>
              </div>
            )}
          </div>

          {/* Resumen de devolución */}
          {productosADevolver.length > 0 && (
            <div className="p-6 border-t border-dark-border bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-dark-text-primary">
                  Resumen de Devolución
                </h4>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    {productosADevolver.length} producto{productosADevolver.length > 1 ? 's' : ''} seleccionado{productosADevolver.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-dark-text-secondary">Total original:</p>
                  <p className="font-medium text-dark-text-primary">${totalOriginal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-dark-text-secondary">Total a devolver:</p>
                  <p className="font-medium text-red-600">-${totalDevolver.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-dark-text-secondary">Nuevo total:</p>
                  <p className="font-medium text-green-600">${(totalOriginal - totalDevolver).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-dark-text-secondary">Stock a restaurar:</p>
                  <p className="font-medium text-blue-600">
                    {productosADevolver.reduce((sum, p) => sum + p.cantidadDevolver, 0)} unidades
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="p-6 border-t border-dark-border flex items-center justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || productosADevolver.length === 0}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Procesar Devolución
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
