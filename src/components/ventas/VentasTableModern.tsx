import React, { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../../store'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  DollarSign,
  Package,
  User,
  Receipt,
  CreditCard,
  Scan,
  Filter,
  CheckCircle,
  AlertCircle,
  Wrench,
  Fuel,
  Settings,
  Car,
  X
} from 'lucide-react'
import { useSearchFilter } from '../../hooks/useSearchFilter'

interface CartItem {
  producto: any
  cantidad: number
  precio_unitario: number
  subtotal: number
  tipo_precio: 'minorista' | 'mayorista'
}

export const VentasTableModern: React.FC = () => {
  // Estados del store
  const productos = useAppStore((state) => state.productos)
  const clientes = useAppStore((state) => state.clientes.clientes)
  const registrarVenta = useAppStore((state) => state.registrarVenta)
  const addNotification = useAppStore((state) => state.addNotification)
  const fetchProductos = useAppStore((state) => state.fetchProductos)
  const fetchClientes = useAppStore((state) => state.fetchClientes)

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedCliente, setSelectedCliente] = useState<any>(null)
  const [tipoPrecio, setTipoPrecio] = useState<'minorista' | 'mayorista'>('minorista')
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia' | 'cuenta_corriente'>('efectivo')
  const [selectedCategory, setSelectedCategory] = useState<string>('todas')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showClientSearch, setShowClientSearch] = useState(false)
  const [clientSearchTerm, setClientSearchTerm] = useState('')

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Cargar datos
  useEffect(() => {
    fetchProductos()
    fetchClientes()
  }, [fetchProductos, fetchClientes])

  // Enfocar búsqueda al cargar
  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  // Filtrar productos
  const filteredProductos = useSearchFilter({
    data: productos || [],
    searchTerm,
    searchFields: ['nombre', 'codigo_sku', 'categoria', 'descripcion'],
    searchFunction: (producto, term) => {
      const matchesSearch = 
        producto.nombre.toLowerCase().includes(term) ||
        producto.codigo_sku.toLowerCase().includes(term) ||
        producto.categoria.toLowerCase().includes(term) ||
        (producto.descripcion && producto.descripcion.toLowerCase().includes(term))
      
      const matchesCategory = selectedCategory === 'todas' || producto.categoria === selectedCategory
      
      return matchesSearch && matchesCategory
    }
  })

  // Obtener categorías únicas
  const categorias = ['todas', ...Array.from(new Set(productos?.map(p => p.categoria) || []))]

  // Funciones del carrito
  const handleProductSelect = (producto: any, cantidad: number = 1) => {
    const precio = tipoPrecio === 'mayorista' ? producto.precio_mayorista : producto.precio_minorista
    const subtotal = precio * cantidad

    const existingItemIndex = cartItems.findIndex(item => item.producto.id === producto.id)
    
    if (existingItemIndex !== -1) {
      const updatedItems = [...cartItems]
      const newCantidad = updatedItems[existingItemIndex].cantidad + cantidad
      updatedItems[existingItemIndex].cantidad = newCantidad
      updatedItems[existingItemIndex].subtotal = precio * newCantidad
      setCartItems(updatedItems)
    } else {
      const newItem: CartItem = {
        producto,
        cantidad,
        precio_unitario: precio,
        subtotal,
        tipo_precio: tipoPrecio
      }
      setCartItems([...cartItems, newItem])
    }

    // Notification
    addNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Producto agregado',
      message: `${producto.nombre} x${cantidad}`,
      duration: 2000
    })
  }

  const handleUpdateQuantity = (index: number, newCantidad: number) => {
    if (newCantidad <= 0) {
      handleRemoveItem(index)
      return
    }

    const updatedItems = [...cartItems]
    const item = updatedItems[index]
    item.cantidad = newCantidad
    item.subtotal = item.precio_unitario * newCantidad
    setCartItems(updatedItems)
  }

  const handleRemoveItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index))
  }

  const handleClientSelect = (cliente: any) => {
    setSelectedCliente(cliente)
    setShowClientSearch(false)
    setClientSearchTerm('')
  }

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const handleFinalizarVenta = async () => {
    if (cartItems.length === 0) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Carrito vacío',
        message: 'Agrega productos al carrito antes de finalizar'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const ventaData = {
        cliente_id: selectedCliente?.id,
        tipo_precio: tipoPrecio,
        metodo_pago: metodoPago,
        items: cartItems.map(item => ({
          producto_id: item.producto.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario
        }))
      }

      await registrarVenta(ventaData)
      
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Venta completada',
        message: `Venta por $${calculateTotal().toFixed(2)} registrada exitosamente`
      })

      // Limpiar carrito
      setCartItems([])
      setSelectedCliente(null)
      setSearchTerm('')
      searchInputRef.current?.focus()

    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error en la venta',
        message: 'No se pudo completar la venta'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCategoryIcon = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'lubricantes':
      case 'aceites':
        return <Fuel className="w-4 h-4" />
      case 'repuestos':
      case 'autopartes':
        return <Settings className="w-4 h-4" />
      case 'herramientas':
        return <Wrench className="w-4 h-4" />
      case 'accesorios':
        return <Car className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header con título */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#0ea5e9' }}>
          🏪 Punto de Venta - Motorepuestos
        </h1>
        <p className="text-slate-600">Sistema optimizado para venta rápida de repuestos automotrices</p>
      </div>

      {/* Barra de búsqueda sola - Como en la imagen */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda principal */}
          <div className="md:col-span-2">
            <Label>Buscar Productos</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ingrese el código de barras o el nombre del producto"
                className="pl-10"
                style={{
                  borderColor: '#cbd5e1',
                  fontSize: '0.95rem'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0ea5e9'
                  e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>
          
          {/* Filtro de categoría */}
          <div>
            <Label>Categoría</Label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select pl-10"
                style={{
                  borderColor: '#cbd5e1',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem 0.75rem 2.5rem'
                }}
              >
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>
                    {categoria === 'todas' ? 'Todas las categorías' : categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Configuración de precios y cliente */}
        <div className="flex items-center justify-between mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)' }}>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium">Tipo de Precio:</Label>
              <select
                value={tipoPrecio}
                onChange={(e) => setTipoPrecio(e.target.value as 'minorista' | 'mayorista')}
                className="px-3 py-1 rounded-md border border-slate-300 text-sm"
              >
                <option value="minorista">Minorista</option>
                <option value="mayorista">Mayorista</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium">Cliente:</Label>
              {selectedCliente ? (
                <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                  <User className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">{selectedCliente.nombre}</span>
                  <button
                    onClick={() => setSelectedCliente(null)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowClientSearch(true)}
                  variant="outline"
                  size="sm"
                >
                  <User className="w-4 h-4 mr-1" />
                  Seleccionar
                </Button>
              )}
            </div>
          </div>
          
          <div className="text-sm text-slate-600">
            {filteredProductos?.length || 0} productos • {cartItems.length} en carrito
          </div>
        </div>
      </div>

      {/* Card principal único - Como en la imagen */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header del card */}
        <div className="border-b border-slate-200 p-4" style={{ backgroundColor: '#f8fafc' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center">
              <Package className="w-5 h-5 mr-2" style={{ color: '#0ea5e9' }} />
              Productos Disponibles
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Total Venta:</span>
              <span className="text-xl font-bold" style={{ color: '#0ea5e9' }}>
                S/. {calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Productos - 2/3 del espacio */}
          <div className="lg:col-span-2 border-r border-slate-200">
            {/* Tabla de productos */}
            <div className="overflow-hidden">
              <table className="w-full">
                <thead style={{ backgroundColor: '#f1f5f9' }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Acción
                    </th>
                  </tr>
                </thead>
              </table>
              
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <tbody className="divide-y divide-slate-200">
                    {filteredProductos?.map((producto) => {
                      const precio = tipoPrecio === 'mayorista' ? producto.precio_mayorista : producto.precio_minorista
                      const enCarrito = cartItems.find(item => item.producto.id === producto.id)
                      const stockDisponible = producto.stock - (enCarrito?.cantidad || 0)
                      
                      return (
                        <tr
                          key={producto.id}
                          className="hover:bg-slate-50 transition-colors duration-150"
                        >
                          <td className="px-4 py-3 text-sm font-mono text-slate-600">
                            {producto.codigo_sku}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              {getCategoryIcon(producto.categoria)}
                              <div>
                                <div className="text-sm font-medium text-slate-900">
                                  {producto.nombre}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {producto.categoria}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              stockDisponible > 10 
                                ? 'bg-green-100 text-green-800' 
                                : stockDisponible > 0 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {stockDisponible} {producto.unidad_medida}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-lg font-semibold" style={{ color: '#0ea5e9' }}>
                              S/. {precio.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              {enCarrito && (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                  {enCarrito.cantidad}
                                </span>
                              )}
                              <Button
                                onClick={() => handleProductSelect(producto)}
                                disabled={stockDisponible <= 0}
                                size="sm"
                                className="flex items-center space-x-1"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Agregar</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {filteredProductos?.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No se encontraron productos</h3>
                  <p className="text-slate-500">Intenta cambiar los términos de búsqueda</p>
                </div>
              )}
            </div>
          </div>

          {/* Carrito - 1/3 del espacio */}
          <div className="lg:col-span-1 bg-slate-50">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" style={{ color: '#0ea5e9' }} />
                Carrito de Compras ({cartItems.length})
              </h3>

              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Carrito vacío</p>
                  <p className="text-slate-400 text-xs">Agrega productos para comenzar</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {cartItems.map((item, index) => (
                    <div
                      key={`${item.producto.id}-${index}`}
                      className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800 text-sm">
                            {item.producto.nombre}
                          </h4>
                          <p className="text-xs text-slate-500 font-mono">
                            {item.producto.codigo_sku}
                          </p>
                          <p className="text-sm font-semibold" style={{ color: '#0ea5e9' }}>
                            S/. {item.precio_unitario.toFixed(2)} c/u
                          </p>
                        </div>
                        <Button
                          onClick={() => handleRemoveItem(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 ml-2 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleUpdateQuantity(index, item.cantidad - 1)}
                            size="sm"
                            variant="outline"
                            className="w-7 h-7 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          
                          <span className="text-base font-semibold text-slate-800 w-8 text-center">
                            {item.cantidad}
                          </span>
                          
                          <Button
                            onClick={() => handleUpdateQuantity(index, item.cantidad + 1)}
                            size="sm"
                            variant="outline"
                            className="w-7 h-7 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-base font-bold text-slate-800">
                            S/. {item.subtotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Método de pago */}
              {cartItems.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <Label className="text-sm font-medium">Método de Pago</Label>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="efectivo">💵 Efectivo</option>
                    <option value="tarjeta">💳 Tarjeta</option>
                    <option value="transferencia">🏦 Transferencia</option>
                    <option value="cuenta_corriente">📋 Cuenta Corriente</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botón finalizar venta - Abajo del card principal */}
      {cartItems.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm text-slate-600">Total Items</div>
                <div className="text-2xl font-bold text-slate-800">
                  {cartItems.reduce((sum, item) => sum + item.cantidad, 0)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-600">Total Venta</div>
                <div className="text-3xl font-bold" style={{ color: '#0ea5e9' }}>
                  S/. {calculateTotal().toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button
                onClick={() => setCartItems([])}
                variant="outline"
                size="lg"
                className="flex items-center space-x-2"
              >
                <Trash2 className="w-5 h-5" />
                <span>Vaciar Carrito</span>
              </Button>
              
              <Button
                onClick={handleFinalizarVenta}
                disabled={isSubmitting}
                size="lg"
                className="flex items-center space-x-2 text-white font-bold px-8 py-3"
                style={{ 
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #ff6b35 100%)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <Receipt className="w-5 h-5" />
                    <span>Finalizar Venta</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de selección de cliente */}
      {showClientSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Seleccionar Cliente</h3>
              <Input
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                placeholder="Buscar cliente por nombre..."
                helperText="Deja vacío para venta sin cliente"
              />
            </div>
            
            <div className="max-h-64 overflow-y-auto p-6">
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setSelectedCliente(null)
                    setShowClientSearch(false)
                  }}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sin cliente (Venta general)
                </Button>
                
                {clientes
                  ?.filter(cliente => 
                    cliente.nombre.toLowerCase().includes(clientSearchTerm.toLowerCase())
                  )
                  .map(cliente => (
                    <Button
                      key={cliente.id}
                      onClick={() => handleClientSelect(cliente)}
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      <User className="w-4 h-4 mr-2" />
                      {cliente.nombre}
                    </Button>
                  ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-200">
              <Button
                onClick={() => setShowClientSearch(false)}
                variant="outline"
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
