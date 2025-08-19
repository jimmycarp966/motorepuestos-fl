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
  Grid3X3,
  List,
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

export const VentasModernView: React.FC = () => {
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
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
    <div className="flex h-screen bg-dark-bg-primary">
      {/* Panel Principal - Productos */}
      <div className="flex-1 flex flex-col">
        {/* Header de búsqueda y filtros */}
        <div className="bg-dark-bg-secondary shadow-dark-sm border-b border-dark-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-primary-500">
              🏪 Punto de Venta - Motorepuestos
            </h1>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Búsqueda y filtros */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Label>Buscar Productos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  ref={searchInputRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, código SKU, descripción..."
                  className="pl-10"
                  helperText="Usa F10 para enfocar rápidamente"
                />
              </div>
            </div>
            
            <div>
              <Label>Categoría</Label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="form-select pl-10"
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

          {/* Configuración de precios */}
          <div className="flex items-center justify-between mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)' }}>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label className="text-sm">Tipo de Precio:</Label>
                <select
                  value={tipoPrecio}
                  onChange={(e) => setTipoPrecio(e.target.value as 'minorista' | 'mayorista')}
                  className="px-3 py-1 rounded-md border border-slate-300 text-sm"
                >
                  <option value="minorista">Minorista</option>
                  <option value="mayorista">Mayorista</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-slate-600">
              {filteredProductos?.length || 0} productos encontrados
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProductos?.map((producto) => {
                const precio = tipoPrecio === 'mayorista' ? producto.precio_mayorista : producto.precio_minorista
                const enCarrito = cartItems.find(item => item.producto.id === producto.id)
                const stockDisponible = producto.stock - (enCarrito?.cantidad || 0)
                
                return (
                  <div
                    key={producto.id}
                    className="ventas-product-card bg-dark-bg-secondary rounded-xl border border-dark-border hover:border-primary-500 p-5"
                  >
                    {/* Header del producto */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(producto.categoria)}
                        <span className="text-xs bg-dark-bg-tertiary text-dark-text-secondary px-2 py-1 rounded-full font-medium">
                          {producto.categoria}
                        </span>
                      </div>
                      {enCarrito && (
                        <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>{enCarrito.cantidad}</span>
                        </div>
                      )}
                    </div>

                    {/* Información del producto */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-slate-800 text-lg mb-1 line-clamp-2">
                        {producto.nombre}
                      </h3>
                      <p className="text-sm text-slate-500 font-mono mb-2">
                        SKU: {producto.codigo_sku}
                      </p>
                      {producto.descripcion && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {producto.descripcion}
                        </p>
                      )}
                    </div>

                    {/* Precios y stock */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Precio:</span>
                        <span className="text-lg font-bold" style={{ color: '#0ea5e9' }}>
                          ${precio.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Stock:</span>
                        <span className={`text-sm font-medium ${
                          stockDisponible > 10 ? 'text-green-600' : 
                          stockDisponible > 0 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {stockDisponible} {producto.unidad_medida}
                        </span>
                      </div>
                    </div>

                    {/* Botón de agregar */}
                    <Button
                      onClick={() => handleProductSelect(producto)}
                      disabled={stockDisponible <= 0}
                      className="w-full"
                      variant={stockDisponible <= 0 ? 'outline' : 'default'}
                    >
                      {stockDisponible <= 0 ? (
                        <>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Sin Stock
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar al Carrito
                        </>
                      )}
                    </Button>
                  </div>
                )
              })}
            </div>
          ) : (
            // Vista de lista
            <div className="space-y-3">
              {filteredProductos?.map((producto) => {
                const precio = tipoPrecio === 'mayorista' ? producto.precio_mayorista : producto.precio_minorista
                const enCarrito = cartItems.find(item => item.producto.id === producto.id)
                const stockDisponible = producto.stock - (enCarrito?.cantidad || 0)
                
                return (
                  <div
                    key={producto.id}
                    className="bg-dark-bg-secondary rounded-lg border border-dark-border hover:border-primary-500 hover:shadow-dark-md transition-all duration-200 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(producto.categoria)}
                          <span className="text-xs bg-dark-bg-tertiary text-dark-text-secondary px-2 py-1 rounded-full">
                            {producto.categoria}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800">{producto.nombre}</h3>
                          <p className="text-sm text-slate-500">SKU: {producto.codigo_sku}</p>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-moto-blue">${precio.toFixed(2)}</div>
                          <div className={`text-sm ${
                            stockDisponible > 10 ? 'text-green-600' : 
                            stockDisponible > 0 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            Stock: {stockDisponible}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {enCarrito && (
                          <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full mb-2 text-center">
                            En carrito: {enCarrito.cantidad}
                          </div>
                        )}
                        <Button
                          onClick={() => handleProductSelect(producto)}
                          disabled={stockDisponible <= 0}
                          size="sm"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {filteredProductos?.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No se encontraron productos</h3>
              <p className="text-slate-500">Intenta cambiar los términos de búsqueda o filtros</p>
            </div>
          )}
        </div>
      </div>

      {/* Panel Lateral - Carrito */}
      <div className="w-96 bg-dark-bg-secondary border-l border-dark-border flex flex-col">
        {/* Header del carrito */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              <ShoppingCart className="w-6 h-6 mr-2 text-moto-blue" />
              Carrito ({cartItems.length})
            </h2>
            {cartItems.length > 0 && (
              <Button
                onClick={() => setCartItems([])}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>

          {/* Cliente seleccionado */}
          <div className="space-y-3">
            <div>
              <Label>Cliente (Opcional)</Label>
              {selectedCliente ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-moto">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {selectedCliente.nombre}
                    </span>
                  </div>
                  <Button
                    onClick={() => setSelectedCliente(null)}
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowClientSearch(true)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <User className="w-4 h-4 mr-2" />
                  Seleccionar Cliente
                </Button>
              )}
            </div>

            {/* Método de pago */}
            <div>
              <Label>Método de Pago</Label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as any)}
                className="form-select"
              >
                <option value="efectivo">💵 Efectivo</option>
                <option value="tarjeta">💳 Tarjeta</option>
                <option value="transferencia">🏦 Transferencia</option>
                <option value="cuenta_corriente">📋 Cuenta Corriente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items del carrito */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">Carrito vacío</h3>
              <p className="text-slate-500 text-sm">Agrega productos para comenzar una venta</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={`${item.producto.id}-${index}`}
                  className="ventas-cart-item ventas-cart-item-enter rounded-lg p-4 border border-slate-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800 text-sm line-clamp-2">
                        {item.producto.nombre}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        {item.producto.codigo_sku}
                      </p>
                      <p className="text-sm text-moto-blue font-semibold">
                        ${item.precio_unitario.toFixed(2)} c/u
                      </p>
                    </div>
                    <Button
                      onClick={() => handleRemoveItem(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => handleUpdateQuantity(index, item.cantidad - 1)}
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      
                      <span className="text-lg font-semibold text-slate-800 w-12 text-center">
                        {item.cantidad}
                      </span>
                      
                      <Button
                        onClick={() => handleUpdateQuantity(index, item.cantidad + 1)}
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-800">
                        ${item.subtotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total y botón finalizar */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-dark-border bg-dark-bg-tertiary">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-lg">
                <span className="font-medium text-slate-700">Subtotal:</span>
                <span className="font-semibold text-slate-800">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-2xl font-bold">
                <span className="text-slate-800">Total:</span>
                <span className="ventas-total-display ventas-total-updated">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleFinalizarVenta}
                disabled={isSubmitting}
                className="w-full py-4 text-lg font-bold text-white"
                style={{ 
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #ff6b35 100%)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Procesando Venta...
                  </>
                ) : (
                  <>
                    <Receipt className="w-5 h-5 mr-3" />
                    Finalizar Venta
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                size="lg"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Generar Factura
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de selección de cliente */}
      {showClientSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-bg-secondary rounded-xl shadow-dark-xl w-full max-w-md">
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
