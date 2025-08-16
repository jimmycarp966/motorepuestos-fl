import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { X, Plus, Trash2, Package, User, Search, AlertTriangle, CheckCircle } from 'lucide-react'

interface VentaFormProps {
  onClose: () => void
}

interface VentaItem {
  producto_id: string
  cantidad: number
  producto?: any
  error?: string
}

export const VentaForm: React.FC<VentaFormProps> = ({ onClose }) => {
  const productos = useAppStore((state) => state.productos.productos)
  const clientes = useAppStore((state) => state.clientes.clientes)
  const registrarVenta = useAppStore((state) => state.registrarVenta)
  const addNotification = useAppStore((state) => state.addNotification)
  
  const [selectedCliente, setSelectedCliente] = useState<string>('')
  const [items, setItems] = useState<VentaItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProductos, setFilteredProductos] = useState(productos)

  // Filtrar productos por búsqueda
  useEffect(() => {
    const filtered = productos.filter(producto =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProductos(filtered)
  }, [searchTerm, productos])

  const addItem = () => {
    setItems([...items, { producto_id: '', cantidad: 1 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof VentaItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value, error: undefined }
    
    // Validar stock en tiempo real
    if (field === 'cantidad' || field === 'producto_id') {
      const producto = getProductoById(newItems[index].producto_id)
      if (producto && value > producto.stock) {
        newItems[index].error = `Stock insuficiente. Disponible: ${producto.stock}`
      }
    }
    
    setItems(newItems)
  }

  const getProductoById = (id: string) => {
    return productos.find(p => p.id === id)
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const producto = getProductoById(item.producto_id)
      return total + (producto?.precio || 0) * item.cantidad
    }, 0)
  }

  const validateForm = () => {
    if (items.length === 0) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: 'Debe agregar al menos un producto'
      })
      return false
    }

    if (items.some(item => !item.producto_id)) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: 'Todos los productos deben estar seleccionados'
      })
      return false
    }

    // Validar stock
    for (const item of items) {
      const producto = getProductoById(item.producto_id)
      if (producto && item.cantidad > producto.stock) {
        addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Error',
          message: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`
        })
        return false
      }
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await registrarVenta({
        cliente_id: selectedCliente || undefined,
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
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: error.message || 'No se pudo registrar la venta'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const total = calculateTotal()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nueva Venta</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cliente */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Cliente
            </h3>
            <select
              value={selectedCliente}
              onChange={(e) => setSelectedCliente(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sin cliente (Venta general)</option>
              {clientes.filter(c => c.activo).map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} - {cliente.email}
                </option>
              ))}
            </select>
          </Card>

          {/* Resumen */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Resumen</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total de productos:</span>
                <span className="font-semibold">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total a pagar:</span>
                <span className="font-bold text-xl text-green-600">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Productos */}
        <Card className="mt-6 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Productos
            </h3>
            <Button
              onClick={addItem}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Producto
            </Button>
          </div>

          {/* Búsqueda de productos */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de productos */}
          <div className="space-y-4">
            {items.map((item, index) => {
              const producto = getProductoById(item.producto_id)
              const subtotal = producto ? producto.precio * item.cantidad : 0
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Producto {index + 1}</h4>
                    <Button
                      onClick={() => removeItem(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Selección de producto */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Producto
                      </label>
                      <select
                        value={item.producto_id}
                        onChange={(e) => updateItem(index, 'producto_id', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar producto</option>
                        {filteredProductos.filter(p => p.activo && p.stock > 0).map((producto) => (
                          <option key={producto.id} value={producto.id}>
                            {producto.nombre} - Stock: {producto.stock} - ${producto.precio}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cantidad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max={producto?.stock || 1}
                        value={item.cantidad}
                        onChange={(e) => updateItem(index, 'cantidad', parseInt(e.target.value) || 1)}
                        className="w-full"
                      />
                    </div>

                    {/* Subtotal */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subtotal
                      </label>
                      <div className="p-2 bg-gray-50 border border-gray-200 rounded-md">
                        <span className="font-semibold">${subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Información del producto */}
                  {producto && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Precio:</span> ${producto.precio}
                        </div>
                        <div>
                          <span className="font-medium">Stock:</span> {producto.stock}
                        </div>
                        <div>
                          <span className="font-medium">Categoría:</span> {producto.categoria}
                        </div>
                        <div>
                          <span className="font-medium">Unidad:</span> {producto.unidad_medida}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error de validación */}
                  {item.error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-red-700 text-sm">{item.error}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {items.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay productos agregados</p>
              <p className="text-sm">Haz clic en "Agregar Producto" para comenzar</p>
            </div>
          )}
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || items.length === 0}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            {isSubmitting ? 'Registrando...' : 'Registrar Venta'}
          </Button>
        </div>
      </div>
    </div>
  )
}
