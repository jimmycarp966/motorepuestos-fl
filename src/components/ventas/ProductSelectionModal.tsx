import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { 
  X, 
  Search, 
  ShoppingCart, 
  Package, 
  Plus, 
  Minus, 
  Trash2,
  User,
  DollarSign,
  CheckCircle
} from 'lucide-react'
import { useSearchFilter } from '../../hooks/useSearchFilter'

interface CartItem {
  producto: any
  cantidad: number
  precio: number
}

interface ProductSelectionModalProps {
  onClose: () => void
}

export const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({ onClose }) => {
  const productos = useAppStore((state) => state.productos)
  const clientes = useAppStore((state) => state.clientes?.clientes || [])
  const empleados = useAppStore((state) => state.empleados?.empleados || [])
  const registrarVenta = useAppStore((state) => state.registrarVenta)
  const addNotification = useAppStore((state) => state.addNotification)
  const fetchProductos = useAppStore((state) => state.fetchProductos)
  const fetchClientes = useAppStore((state) => state.clientes?.fetchClientes)
  const fetchEmpleados = useAppStore((state) => state.empleados?.fetchEmpleados)

  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCliente, setSelectedCliente] = useState<string>('')
  const [selectedEmpleado, setSelectedEmpleado] = useState<string>('')
  const [tipoPrecio, setTipoPrecio] = useState<'minorista' | 'mayorista'>('minorista')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Actualizar precios cuando cambie el tipo de precio
  useEffect(() => {
    setCart(cart.map(item => ({
      ...item,
      precio: tipoPrecio === 'mayorista' ? item.producto.precio_mayorista : item.producto.precio_minorista
    })))
  }, [tipoPrecio])

  // Cargar datos necesarios
  useEffect(() => {
    fetchProductos()
    if (fetchClientes) fetchClientes()
    if (fetchEmpleados) fetchEmpleados()
  }, [fetchProductos, fetchClientes, fetchEmpleados])

  // Filtrar productos
  const filteredProductos = useSearchFilter({
    data: productos || [],
    searchTerm,
    searchFields: ['nombre', 'codigo_sku', 'categoria'],
    searchFunction: (producto, term) => {
      return (
        producto.nombre.toLowerCase().includes(term) ||
        producto.codigo_sku.toLowerCase().includes(term) ||
        producto.categoria.toLowerCase().includes(term)
      )
    }
  })

  const addToCart = (producto: any) => {
    const existingItem = cart.find(item => item.producto.id === producto.id)
    const precio = tipoPrecio === 'mayorista' ? producto.precio_mayorista : producto.precio_minorista
    
    if (existingItem) {
      // Verificar stock disponible
      if (existingItem.cantidad >= producto.stock) {
        addNotification({
          id: Date.now().toString(),
          type: 'warning',
          title: 'Stock insuficiente',
          message: `Solo hay ${producto.stock} unidades disponibles de ${producto.nombre}`
        })
        return
      }
      
      setCart(cart.map(item => 
        item.producto.id === producto.id 
          ? { ...item, cantidad: item.cantidad + 1, precio }
          : item
      ))
    } else {
      setCart([...cart, {
        producto,
        cantidad: 1,
        precio
      }])
    }
  }

  const removeFromCart = (productoId: string) => {
    setCart(cart.filter(item => item.producto.id !== productoId))
  }

  const updateQuantity = (productoId: string, cantidad: number) => {
    const item = cart.find(item => item.producto.id === productoId)
    if (!item) return

    if (cantidad <= 0) {
      removeFromCart(productoId)
      return
    }

    if (cantidad > item.producto.stock) {
      addNotification({
        id: Date.now().toString(),
        type: 'warning',
        title: 'Stock insuficiente',
        message: `Solo hay ${item.producto.stock} unidades disponibles`
      })
      return
    }

    setCart(cart.map(item => 
      item.producto.id === productoId 
        ? { ...item, cantidad }
        : item
    ))
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() // Por ahora sin impuestos ni descuentos
  }

  const handleSubmit = async () => {
    if (cart.length === 0) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Carrito vacío',
        message: 'Debes agregar al menos un producto'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const ventaData = {
        cliente_id: selectedCliente || undefined,
        tipo_precio: tipoPrecio,
        items: cart.map(item => ({
          producto_id: item.producto.id,
          cantidad: item.cantidad
        }))
      }

      await registrarVenta(ventaData)
      
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Venta creada',
        message: 'La venta se ha registrado correctamente'
      })

      onClose()
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: 'No se pudo crear la venta'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nueva Venta</h2>
            <p className="text-gray-600">Selecciona productos y completa la venta</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Panel izquierdo - Productos */}
          <div className="w-2/3 border-r border-gray-200 flex flex-col">
            {/* Buscador */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar productos por nombre, código, categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Lista de productos */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProductos?.map((producto) => {
                  const inCart = cart.find(item => item.producto.id === producto.id)
                  const stockDisponible = producto.stock - (inCart?.cantidad || 0)
                  
                  return (
                    <Card key={producto.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">{producto.nombre}</h3>
                          <p className="text-sm text-gray-500 font-mono">{producto.codigo_sku}</p>
                          <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block mt-1">
                            {producto.categoria}
                          </p>
                        </div>
                        <Package className="h-8 w-8 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                      
                      <div className="space-y-2">
                                                 <div className="flex justify-between text-sm">
                           <span className="text-gray-600">Precio {tipoPrecio}:</span>
                           <span className="font-semibold text-green-600">
                             ${(tipoPrecio === 'mayorista' ? producto.precio_mayorista : producto.precio_minorista).toFixed(2)}
                           </span>
                         </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Stock:</span>
                          <span className={`font-semibold ${
                            stockDisponible > 10 ? 'text-green-600' : 
                            stockDisponible > 0 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {stockDisponible} {producto.unidad_medida}
                          </span>
                        </div>

                        {inCart && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-green-700">En carrito: {inCart.cantidad}</span>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => addToCart(producto)}
                        disabled={stockDisponible <= 0}
                        className={`w-full mt-3 ${
                          stockDisponible <= 0 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-orange-600 hover:bg-orange-700 text-white'
                        }`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {stockDisponible <= 0 ? 'Sin stock' : 'Agregar'}
                      </Button>
                    </Card>
                  )
                })}
              </div>
              
              {filteredProductos?.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron productos</p>
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho - Carrito */}
          <div className="w-1/3 flex flex-col">
            {/* Información de cliente y empleado */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Información de la Venta</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente (opcional)
                  </label>
                  <select
                    value={selectedCliente}
                    onChange={(e) => setSelectedCliente(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Sin cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Precio
                  </label>
                  <select
                    value={tipoPrecio}
                    onChange={(e) => setTipoPrecio(e.target.value as 'minorista' | 'mayorista')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="minorista">Precio Minorista</option>
                    <option value="mayorista">Precio Mayorista</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Carrito */}
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Carrito ({cart.length} productos)
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">El carrito está vacío</p>
                    <p className="text-sm text-gray-400">Agrega productos desde la lista</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <Card key={item.producto.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {item.producto.nombre}
                            </h4>
                            <p className="text-xs text-gray-500 font-mono">
                              {item.producto.codigo_sku}
                            </p>
                            <p className="text-sm text-green-600 font-semibold">
                              ${item.precio.toFixed(2)} c/u
                            </p>
                          </div>
                          
                          <Button
                            onClick={() => removeFromCart(item.producto.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                              size="sm"
                              variant="outline"
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            
                            <span className="text-sm font-medium w-8 text-center">
                              {item.cantidad}
                            </span>
                            
                            <Button
                              onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                              size="sm"
                              variant="outline"
                              className="w-8 h-8 p-0"
                              disabled={item.cantidad >= item.producto.stock}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <span className="text-sm font-bold text-gray-900">
                            ${(item.precio * item.cantidad).toFixed(2)}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Resumen y botones */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={cart.length === 0 || isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Completar Venta
                      </div>
                    )}
                  </Button>
                  
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
