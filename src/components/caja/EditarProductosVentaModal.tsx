import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { 
  X, 
  Save, 
  Plus,
  Minus,
  Package,
  DollarSign,
  ShoppingCart,
  Trash2
} from 'lucide-react'
import type { Venta, VentaItem } from '../../store/types'

interface EditarProductosVentaModalProps {
  venta: Venta | null
  isOpen: boolean
  onClose: () => void
  onSave: (ventaActualizada: Venta) => void
}

interface ProductoEnCarrito {
  id: string
  producto: any
  cantidad: number
  precio_unitario: number
  subtotal: number
  tipo_precio: 'minorista' | 'mayorista'
}

export const EditarProductosVentaModal: React.FC<EditarProductosVentaModalProps> = ({
  venta,
  isOpen,
  onClose,
  onSave
}) => {
  const productos = useAppStore((state) => state.productos)
  const [productosEnCarrito, setProductosEnCarrito] = useState<ProductoEnCarrito[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null)
  const [cantidad, setCantidad] = useState('1')
  const [tipoPrecio, setTipoPrecio] = useState<'minorista' | 'mayorista'>('minorista')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Inicializar productos del carrito cuando se abre el modal
  useEffect(() => {
    if (venta && venta.items) {
      const productosCarrito = venta.items.map((item: VentaItem) => ({
        id: item.id,
        producto: item.producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal,
        tipo_precio: item.tipo_precio
      }))
      setProductosEnCarrito(productosCarrito)
    }
  }, [venta])

  // Filtrar productos por búsqueda
  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.codigo_sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAgregarProducto = () => {
    if (!productoSeleccionado || !cantidad || parseInt(cantidad) <= 0) return

    const cantidadNum = parseInt(cantidad)
    const precio = tipoPrecio === 'minorista' 
      ? productoSeleccionado.precio_minorista 
      : productoSeleccionado.precio_mayorista
    const subtotal = precio * cantidadNum

    const nuevoProducto: ProductoEnCarrito = {
      id: `temp-${Date.now()}`,
      producto: productoSeleccionado,
      cantidad: cantidadNum,
      precio_unitario: precio,
      subtotal,
      tipo_precio: tipoPrecio
    }

    setProductosEnCarrito([...productosEnCarrito, nuevoProducto])
    setProductoSeleccionado(null)
    setCantidad('1')
    setSearchTerm('')
  }

  const handleQuitarProducto = (productoId: string) => {
    setProductosEnCarrito(productosEnCarrito.filter(p => p.id !== productoId))
  }

  const handleModificarCantidad = (productoId: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      handleQuitarProducto(productoId)
      return
    }

    setProductosEnCarrito(productosEnCarrito.map(p => {
      if (p.id === productoId) {
        return {
          ...p,
          cantidad: nuevaCantidad,
          subtotal: p.precio_unitario * nuevaCantidad
        }
      }
      return p
    }))
  }

  const handleModificarPrecio = (productoId: string, nuevoPrecio: number) => {
    setProductosEnCarrito(productosEnCarrito.map(p => {
      if (p.id === productoId) {
        return {
          ...p,
          precio_unitario: nuevoPrecio,
          subtotal: nuevoPrecio * p.cantidad
        }
      }
      return p
    }))
  }

  const calcularTotal = () => {
    return productosEnCarrito.reduce((sum, p) => sum + p.subtotal, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!venta) return

    setIsSubmitting(true)
    try {
      const ventaActualizada = {
        ...venta,
        total: calcularTotal(),
        items: productosEnCarrito
      }
      await onSave(ventaActualizada)
      onClose()
    } catch (error) {
      console.error('Error al actualizar venta:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !venta) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-dark-bg-secondary rounded-xl shadow-dark-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-text-primary">
              Editar Productos - Venta #{venta.id.slice(0, 8)}
            </h3>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-dark-text-secondary hover:text-dark-text-primary"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Panel izquierdo - Agregar productos */}
          <div className="w-1/2 p-6 border-r border-dark-border overflow-y-auto">
            <h4 className="text-md font-semibold text-dark-text-primary mb-4">
              Agregar Productos
            </h4>
            
            {/* Búsqueda */}
            <div className="mb-4">
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
            </div>

            {/* Lista de productos */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {productosFiltrados.map((producto) => (
                <div
                  key={producto.id}
                  onClick={() => setProductoSeleccionado(producto)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    productoSeleccionado?.id === producto.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-dark-text-primary">{producto.nombre}</h5>
                      <p className="text-sm text-dark-text-secondary">SKU: {producto.codigo_sku}</p>
                      <div className="flex gap-4 mt-1">
                        <span className="text-sm text-green-600">
                          Minorista: ${producto.precio_minorista}
                        </span>
                        <span className="text-sm text-blue-600">
                          Mayorista: ${producto.precio_mayorista}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-dark-text-secondary">
                      Stock: {producto.stock}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Configuración del producto seleccionado */}
            {productoSeleccionado && (
              <div className="mt-4 p-4 border border-gray-300 rounded-lg">
                <h5 className="font-medium text-dark-text-primary mb-3">
                  Agregar: {productoSeleccionado.nombre}
                </h5>
                
                <div className="space-y-3">
                  <div>
                    <Label>Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Tipo de Precio</Label>
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setTipoPrecio('minorista')}
                        className={`px-3 py-2 rounded border ${
                          tipoPrecio === 'minorista'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300'
                        }`}
                      >
                        Minorista (${productoSeleccionado.precio_minorista})
                      </button>
                      <button
                        type="button"
                        onClick={() => setTipoPrecio('mayorista')}
                        className={`px-3 py-2 rounded border ${
                          tipoPrecio === 'mayorista'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300'
                        }`}
                      >
                        Mayorista (${productoSeleccionado.precio_mayorista})
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleAgregarProducto}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar al Carrito
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Panel derecho - Productos en carrito */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <h4 className="text-md font-semibold text-dark-text-primary mb-4">
              Productos en Venta
            </h4>

            {productosEnCarrito.length === 0 ? (
              <div className="text-center py-8 text-dark-text-secondary">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay productos en la venta</p>
              </div>
            ) : (
              <div className="space-y-3">
                {productosEnCarrito.map((item) => (
                  <div key={item.id} className="p-4 border border-gray-300 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium text-dark-text-primary">
                          {item.producto.nombre}
                        </h5>
                        <p className="text-sm text-dark-text-secondary">
                          SKU: {item.producto.codigo_sku}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleQuitarProducto(item.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Cantidad</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => handleModificarCantidad(item.id, parseInt(e.target.value) || 0)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Precio Unit.</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.precio_unitario}
                          onChange={(e) => handleModificarPrecio(item.id, parseFloat(e.target.value) || 0)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Subtotal</Label>
                        <div className="text-sm font-medium text-green-600">
                          ${item.subtotal.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-dark-text-secondary">
                      Tipo: {item.tipo_precio === 'minorista' ? 'Minorista' : 'Mayorista'}
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-green-600">${calcularTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-dark-border">
          <div className="flex items-center justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || productosEnCarrito.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
