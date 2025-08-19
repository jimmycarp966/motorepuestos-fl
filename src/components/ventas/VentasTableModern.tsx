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
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)

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

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F10 - Enfocar búsqueda de productos
      if (e.key === 'F10') {
        e.preventDefault()
        searchInputRef.current?.focus()
        addNotification({
          id: Date.now().toString(),
          type: 'info',
          title: '🔍 Búsqueda activada',
          message: 'Campo de búsqueda enfocado',
          duration: 1500
        })
      }
      
      // F12 - Finalizar venta (solo si hay productos en el carrito)
      if (e.key === 'F12' && cartItems.length > 0) {
        e.preventDefault()
        handleFinalizarVenta()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cartItems.length])

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

    // Limpiar búsqueda y ocultar sugerencias
    setSearchTerm('')
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)

    // Notification
    addNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Producto agregado',
      message: `${producto.nombre} x${cantidad}`,
      duration: 2000
    })

    // Volver a enfocar el input
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }

  // Manejar teclas en el buscador
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedSuggestionIndex >= 0 && filteredProductos[selectedSuggestionIndex]) {
        handleProductSelect(filteredProductos[selectedSuggestionIndex])
      } else if (filteredProductos.length > 0) {
        handleProductSelect(filteredProductos[0])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => 
        prev < filteredProductos.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
      setSearchTerm('')
    }
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
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal
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
    <div className="p-6 bg-dark-bg-primary min-h-screen">
      {/* Header con título */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gradient-moto">
          🏪 Punto de Venta - Motorepuestos
        </h1>
        <p className="text-dark-text-secondary">Sistema optimizado para venta rápida de repuestos automotrices</p>
      </div>

      {/* Barra de búsqueda sola - Como en la imagen */}
      <div className="bg-dark-bg-secondary rounded-xl shadow-dark-lg border border-dark-border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda principal */}
          <div className="md:col-span-2">
            <Label>Buscar Productos</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500 w-5 h-5" />
              <Input
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowSuggestions(e.target.value.length > 0)
                  setSelectedSuggestionIndex(-1)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ingrese el código de barras o el nombre del producto"
                className="pl-10"
                style={{
                  borderColor: '#2C2C2C',
                  fontSize: '0.95rem'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2979FF'
                  e.target.style.boxShadow = '0 0 0 3px rgba(41, 121, 255, 0.1)'
                  if (searchTerm.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#2C2C2C'
                  e.target.style.boxShadow = 'none'
                  // Delay para permitir clicks en sugerencias
                  setTimeout(() => setShowSuggestions(false), 200)
                }}
              />
              
              {/* Dropdown de sugerencias */}
              {showSuggestions && searchTerm.length > 0 && filteredProductos.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-dark-bg-tertiary border border-dark-border rounded-lg shadow-dark-lg z-50 max-h-64 overflow-y-auto mt-1">
                  {filteredProductos.slice(0, 8).map((producto, index) => {
                    const precio = tipoPrecio === 'mayorista' ? producto.precio_mayorista : producto.precio_minorista
                    const enCarrito = cartItems.find(item => item.producto.id === producto.id)
                    
                    return (
                      <div
                        key={producto.id}
                        className={`p-3 cursor-pointer border-b border-dark-border last:border-b-0 hover:bg-dark-bg-secondary transition-colors ${
                          index === selectedSuggestionIndex ? 'bg-primary-500/20 border-primary-500/30' : ''
                        }`}
                        onClick={() => handleProductSelect(producto)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-primary-500">
                              {getCategoryIcon(producto.categoria)}
                            </div>
                            <div>
                              <div className="font-medium text-dark-text-primary">{producto.nombre}</div>
                              <div className="text-sm text-dark-text-secondary">{producto.codigo_sku} • {producto.categoria}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-primary-500">
                              S/. {precio.toFixed(2)}
                            </div>
                            <div className="text-sm text-dark-text-secondary">
                              Stock: {producto.stock}
                              {enCarrito && (
                                <span className="ml-2 bg-success-500/20 text-success-500 px-2 py-1 rounded-full text-xs border border-success-500/30">
                                  En carrito: {enCarrito.cantidad}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Filtro de categoría */}
          <div>
            <Label>Categoría</Label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-secondary w-4 h-4 z-10" />
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
                className="px-3 py-1 rounded-md border border-dark-border text-sm"
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
          
          <div className="text-sm text-dark-text-secondary">
            {filteredProductos?.length || 0} productos • {cartItems.length} en carrito
          </div>
        </div>
      </div>

      {/* Card principal único - Como en la imagen */}
      <div className="bg-dark-bg-secondary rounded-xl shadow-dark-lg border border-dark-border overflow-hidden">
        {/* Header del card */}
        <div className="border-b border-dark-border p-4 bg-dark-bg-tertiary">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark-text-primary flex items-center">
              <Package className="w-5 h-5 mr-2 text-primary-500" />
              Productos Disponibles
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-dark-text-secondary">Total Venta:</span>
              <span className="text-xl font-bold text-primary-500">
                S/. {calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Todo el espacio para el carrito - amplio como una tabla */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-dark-text-primary flex items-center">
              <ShoppingCart className="w-6 h-6 mr-3" style={{ color: '#0ea5e9' }} />
              Carrito de Compras ({cartItems.length} productos)
            </h3>
            {cartItems.length > 0 && (
              <Button
                onClick={() => setCartItems([])}
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Vaciar Carrito
              </Button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-20 h-20 text-dark-border mx-auto mb-4" />
              <h3 className="text-xl font-medium text-dark-text-secondary mb-2">Carrito vacío</h3>
              <p className="text-dark-text-secondary">Usa el buscador de arriba para agregar productos</p>
              <p className="text-dark-text-secondary text-sm mt-2">Escribe el código de barras o nombre del producto</p>
            </div>
          ) : (
            <>
              {/* Tabla del carrito - estilo amplio */}
              <div className="overflow-hidden rounded-lg border border-dark-border">
                <table className="w-full">
                  <thead className="bg-dark-bg-tertiary">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-dark-text-secondary">Código</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-dark-text-secondary">Producto</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-dark-text-secondary">Cantidad</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-dark-text-secondary">Precio Unit.</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-dark-text-secondary">Total</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-dark-text-secondary">Opciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border bg-dark-bg-secondary">
                    {cartItems.map((item, index) => (
                      <tr key={`${item.producto.id}-${index}`} className="hover:bg-dark-bg-tertiary transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-dark-text-secondary">
                            {item.producto.codigo_sku}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {getCategoryIcon(item.producto.categoria)}
                            <div>
                              <div className="font-medium text-dark-text-primary">
                                {item.producto.nombre}
                              </div>
                              <div className="text-sm text-dark-text-secondary">
                                {item.producto.categoria}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-3">
                            <Button
                              onClick={() => handleUpdateQuantity(index, item.cantidad - 1)}
                              size="sm"
                              variant="outline"
                              className="w-8 h-8 p-0 rounded-full"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            
                            <span className="text-lg font-semibold text-dark-text-primary w-12 text-center">
                              {item.cantidad}
                            </span>
                            
                            <Button
                              onClick={() => handleUpdateQuantity(index, item.cantidad + 1)}
                              size="sm"
                              variant="outline"
                              className="w-8 h-8 p-0 rounded-full"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-lg font-semibold text-primary-500">
                            S/. {item.precio_unitario.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-lg font-bold text-dark-text-primary">
                            S/. {item.subtotal.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            onClick={() => handleRemoveItem(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Método de pago dentro del carrito */}
              <div className="mt-6 bg-dark-bg-secondary rounded-xl shadow-dark-lg border border-dark-border p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Método de Pago</Label>
                    <select
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value as any)}
                      className="w-full mt-1 px-3 py-2 border border-dark-border rounded-lg"
                    >
                      <option value="efectivo">💵 Efectivo</option>
                      <option value="tarjeta">💳 Tarjeta</option>
                      <option value="transferencia">🏦 Transferencia</option>
                      <option value="cuenta_corriente">📋 Cuenta Corriente</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <div className="text-right w-full">
                      <div className="text-sm text-dark-text-secondary">Total de la Venta</div>
                      <div className="text-2xl font-bold" style={{ color: '#0ea5e9' }}>
                        S/. {calculateTotal().toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Botón finalizar venta - Abajo del card principal */}
      {cartItems.length > 0 && (
        <div className="mt-6 bg-dark-bg-secondary rounded-xl shadow-dark-lg border border-dark-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm text-dark-text-secondary">Total Items</div>
                <div className="text-2xl font-bold text-dark-text-primary">
                  {cartItems.reduce((sum, item) => sum + item.cantidad, 0)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-dark-text-secondary">Total Venta</div>
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
          <div className="bg-dark-bg-secondary rounded-xl shadow-dark-xl w-full max-w-md">
            <div className="p-6 border-b border-dark-border">
              <h3 className="text-lg font-semibold text-dark-text-primary mb-4">Seleccionar Cliente</h3>
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
            
            <div className="p-6 border-t border-dark-border">
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
