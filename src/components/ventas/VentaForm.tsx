import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { X, Plus, Trash2, Package, User } from 'lucide-react'

interface VentaFormProps {
  onClose: () => void
}

interface VentaItem {
  producto_id: string
  cantidad: number
  producto?: any
}

export const VentaForm: React.FC<VentaFormProps> = ({ onClose }) => {
  const productos = useAppStore((state) => state.productos.productos)
  const clientes = useAppStore((state) => state.clientes.clientes)
  const registrarVenta = useAppStore((state) => state.registrarVenta)
  const addNotification = useAppStore((state) => state.addNotification)
  
  const [selectedCliente, setSelectedCliente] = useState<string>('')
  const [items, setItems] = useState<VentaItem[]>([])
  const [tipoPrecio, setTipoPrecio] = useState<'minorista' | 'mayorista'>('minorista')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addItem = () => {
    setItems([...items, { producto_id: '', cantidad: 1 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof VentaItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const getProductoById = (id: string) => {
    return productos.find(p => p.id === id)
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const producto = getProductoById(item.producto_id)
      if (!producto) return total
      
      const precio = tipoPrecio === 'mayorista' 
        ? producto.precio_mayorista 
        : producto.precio_minorista
      
      return total + precio * item.cantidad
    }, 0)
  }

  const handleSubmit = async () => {
    if (items.length === 0) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: 'Debe agregar al menos un producto'
      })
      return
    }

    if (items.some(item => !item.producto_id)) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: 'Todos los productos deben estar seleccionados'
      })
      return
    }

    setIsSubmitting(true)
    try {
      await registrarVenta({
        cliente_id: selectedCliente || undefined,
        tipo_precio: tipoPrecio,
        items: items.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad
        }))
      })
      
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Venta registrada',
        message: 'La venta se registró correctamente'
      })
      
      onClose()
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: 'No se pudo registrar la venta'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh]">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">
                🛒 Nueva Venta
              </h2>
              <p className="text-orange-100 text-sm mt-1">
                Registra una nueva venta en el sistema
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Cliente */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                👤 Cliente (Opcional)
              </label>
              <select
                value={selectedCliente}
                onChange={(e) => setSelectedCliente(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent hover:border-gray-300 transition-all duration-200"
              >
                <option value="">Sin cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Campo Tipo de Precio */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                💰 Tipo de Precio
              </label>
              <select
                value={tipoPrecio}
                onChange={(e) => setTipoPrecio(e.target.value as 'minorista' | 'mayorista')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent hover:border-gray-300 transition-all duration-200"
              >
                <option value="minorista">🛒 Precio Minorista</option>
                <option value="mayorista">🏢 Precio Mayorista</option>
              </select>
            </div>

            {/* Productos */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-700">📦 Productos</h3>
                <Button
                  type="button"
                  onClick={addItem}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No hay productos agregados</p>
                  <p className="text-sm">Haz clic en "Agregar Producto" para comenzar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200">
                      <div className="flex-1">
                        <select
                          value={item.producto_id}
                          onChange={(e) => updateItem(index, 'producto_id', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent hover:border-gray-300 transition-all duration-200"
                        >
                          <option value="">Seleccionar producto</option>
                          {productos.map((producto) => (
                            <option key={producto.id} value={producto.id}>
                              {producto.nombre} - ${producto.precio} (Stock: {producto.stock})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="w-24">
                        <Input
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => updateItem(index, 'cantidad', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center"
                        />
                      </div>
                      
                      <div className="w-32 text-right">
                        <span className="font-bold text-lg text-orange-600">
                          ${((getProductoById(item.producto_id)?.precio || 0) * item.cantidad).toFixed(2)}
                        </span>
                      </div>
                      
                      <Button
                        type="button"
                        onClick={() => removeItem(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total */}
            <div className="border-t-2 border-gray-200 pt-6">
              <div className="flex justify-between items-center bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl">
                <span className="text-xl font-bold text-gray-700">💰 Total:</span>
                <span className="text-3xl font-bold text-orange-600">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botones */}
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
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || items.length === 0}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </span>
                ) : (
                  <span>🛒 Registrar Venta</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
