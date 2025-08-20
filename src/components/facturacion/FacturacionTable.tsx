import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useAppStore } from '../../store'
import { useComponentShortcuts, createShortcut } from '../../hooks/useKeyboardShortcuts'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { 
  Plus, 
  Trash2, 
    FileText,
  DollarSign, 
  Package,
  X,
  CreditCard,
  Receipt,
  Search,
  Users,
  CheckCircle,
  ArrowDown,
  ArrowUp,
  Keyboard,
  FileCheck,
  AlertCircle,
  Download
} from 'lucide-react'
import { useSearchFilter } from '../../hooks/useSearchFilter'

interface CartItem {
  producto: any
  cantidad: number
  precio_unitario: number
  subtotal: number
  tipo_precio: 'minorista' | 'mayorista'
}

export const FacturacionTable: React.FC = () => {
  
  // Estados del store
  const productos = useAppStore((state) => state.productos)
  const clientes = useAppStore((state) => state.clientes.clientes)
  const arqueoCompletadoHoy = useAppStore((state) => state.arqueoCompletadoHoy)
  const fetchProductos = useAppStore((state) => state.fetchProductos)
  const fetchClientes = useAppStore((state) => state.fetchClientes)
  const registrarFactura = useAppStore((state) => state.registrarFactura)
  const addNotification = useAppStore((state) => state.addNotification)
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState('')
  const [showProductSuggestions, setShowProductSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedCliente, setSelectedCliente] = useState<any>(null)
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia' | 'cuenta_corriente'>('efectivo')
  const [tipoComprobante, setTipoComprobante] = useState<'A' | 'B' | 'C'>('B')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showClientSearch, setShowClientSearch] = useState(false)
  const [searchClientTerm, setSearchClientTerm] = useState('')
  const [showConfig, setShowConfig] = useState(false)

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Shortcuts específicos para Facturación
  const facturacionShortcuts = [
    createShortcut('F10', () => {
      // Enfocar el campo de búsqueda
      if (searchInputRef.current) {
        searchInputRef.current.focus()
        addNotification({
          id: `shortcut-${Date.now()}`,
          type: 'info',
          title: 'Atajo F10',
          message: 'Campo de búsqueda enfocado',
          duration: 1500
        })
      }
    }, 'Enfocar buscador de productos'),
    
    createShortcut('F11', () => {
      // Finalizar facturación si hay items en el carrito
      if (cartItems.length > 0) {
        handleFinalizarFactura()
        addNotification({
          id: `shortcut-${Date.now()}`,
          type: 'info',
          title: 'Atajo F11',
          message: 'Finalizando facturación...',
          duration: 1500
        })
      }
    }, 'Finalizar facturación'),
    
    createShortcut('F12', () => {
      // Limpiar carrito
      setCartItems([])
      addNotification({
        id: `shortcut-${Date.now()}`,
        type: 'info',
        title: 'Atajo F12',
        message: 'Carrito limpiado',
        duration: 1500
      })
    }, 'Limpiar carrito')
  ]

  // Registrar shortcuts
  useComponentShortcuts(facturacionShortcuts)

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchProductos()
    fetchClientes()
  }, [fetchProductos, fetchClientes])

  // Filtrar productos basado en el término de búsqueda
  const filteredProductos = useSearchFilter(productos.productos, searchTerm, ['nombre', 'codigo_sku'])

  // Calcular total del carrito
  const totalCarrito = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0)
  }, [cartItems])

  // Manejar búsqueda de productos
  const handleProductSearch = (term: string) => {
    setSearchTerm(term)
    setShowProductSuggestions(term.length > 0)
    setSelectedSuggestionIndex(-1)
  }

  // Manejar selección de producto
  const handleProductSelect = (producto: any) => {
    const existingItem = cartItems.find(item => item.producto.id === producto.id)
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.producto.id === producto.id 
          ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio_unitario }
          : item
      ))
    } else {
      const precio = tipoComprobante === 'A' ? producto.precio_mayorista : producto.precio_minorista
      const newItem: CartItem = {
        producto,
        cantidad: 1,
        precio_unitario: precio,
        subtotal: precio,
        tipo_precio: tipoComprobante === 'A' ? 'mayorista' : 'minorista'
      }
      setCartItems([...cartItems, newItem])
    }
    
    setSearchTerm('')
    setShowProductSuggestions(false)
    setSelectedSuggestionIndex(-1)
  }

  // Manejar cambio de cantidad
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter((_, i) => i !== index))
    } else {
      setCartItems(cartItems.map((item, i) => 
        i === index 
          ? { ...item, cantidad: newQuantity, subtotal: newQuantity * item.precio_unitario }
          : item
      ))
    }
  }

  // Manejar cambio de precio
  const handlePriceChange = (index: number, newPrice: number) => {
    setCartItems(cartItems.map((item, i) => 
      i === index 
        ? { ...item, precio_unitario: newPrice, subtotal: item.cantidad * newPrice }
        : item
    ))
  }

  // Manejar cambio de tipo de precio
  const handlePriceTypeChange = (index: number, newType: 'minorista' | 'mayorista') => {
    const producto = cartItems[index].producto
    const newPrice = newType === 'mayorista' ? producto.precio_mayorista : producto.precio_minorista
    
    setCartItems(cartItems.map((item, i) => 
      i === index 
        ? { ...item, tipo_precio: newType, precio_unitario: newPrice, subtotal: item.cantidad * newPrice }
        : item
    ))
  }

  // Manejar búsqueda de cliente
  const handleClientSearch = (term: string) => {
    setSearchClientTerm(term)
    setShowClientSearch(term.length > 0)
  }

  // Manejar selección de cliente
  const handleClientSelect = (cliente: any) => {
    setSelectedCliente(cliente)
    setSearchClientTerm('')
    setShowClientSearch(false)
  }

  // Finalizar facturación
  const handleFinalizarFactura = async () => {
    if (cartItems.length === 0) {
      addNotification({
        id: `error-${Date.now()}`,
        type: 'error',
        title: 'Error',
        message: 'El carrito está vacío',
        duration: 3000
      })
      return
    }

    if (!selectedCliente) {
      addNotification({
        id: `error-${Date.now()}`,
        type: 'error',
        title: 'Error',
        message: 'Debe seleccionar un cliente',
        duration: 3000
      })
      return
    }

    setIsSubmitting(true)

    try {
      const facturaData = {
        cliente_id: selectedCliente.id,
        metodo_pago: metodoPago,
        tipo_precio: tipoComprobante === 'A' ? 'mayorista' : 'minorista',
        tipo_comprobante: tipoComprobante,
        items: cartItems.map(item => ({
          producto_id: item.producto.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal,
          tipo_precio: item.tipo_precio
        }))
      }

      await registrarFactura(facturaData)

      // Limpiar formulario
      setCartItems([])
      setSelectedCliente(null)
      setSearchTerm('')
      setShowProductSuggestions(false)

      addNotification({
        id: `success-${Date.now()}`,
        type: 'success',
        title: 'Factura Creada',
        message: `Factura ${tipoComprobante} registrada exitosamente`,
        duration: 5000
      })

    } catch (error: any) {
      addNotification({
        id: `error-${Date.now()}`,
        type: 'error',
        title: 'Error',
        message: error.message || 'Error al crear la factura',
        duration: 5000
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark-text-primary">Facturación AFIP</h1>
          <p className="text-dark-text-secondary">Genera facturas electrónicas para ARCA</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm">
            <FileCheck className="w-4 h-4" />
            <span>ARCA AFIP</span>
          </div>
          <Button
            onClick={() => setShowConfig(!showConfig)}
            variant="outline"
            size="sm"
          >
            <Keyboard className="w-4 h-4 mr-2" />
            Atajos
          </Button>
        </div>
      </div>

      {/* Configuración de Facturación */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-text-primary mb-2">
              Tipo de Comprobante
            </label>
            <select
              value={tipoComprobante}
              onChange={(e) => setTipoComprobante(e.target.value as 'A' | 'B' | 'C')}
              className="w-full px-3 py-2 border border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="A">Factura A (Responsable Inscripto)</option>
              <option value="B">Factura B (Consumidor Final)</option>
              <option value="C">Factura C (Exento)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-text-primary mb-2">
              Método de Pago
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value as any)}
              className="w-full px-3 py-2 border border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="cuenta_corriente">Cuenta Corriente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-primary mb-2">
              Cliente
            </label>
            <div className="relative">
              <Input
                placeholder="Buscar cliente..."
                value={searchClientTerm}
                onChange={(e) => handleClientSearch(e.target.value)}
                onFocus={() => setShowClientSearch(true)}
              />
              {showClientSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-dark-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {clientes
                    .filter(cliente => 
                      cliente.nombre.toLowerCase().includes(searchClientTerm.toLowerCase()) ||
                      cliente.email?.toLowerCase().includes(searchClientTerm.toLowerCase())
                    )
                    .map(cliente => (
                      <div
                        key={cliente.id}
                        onClick={() => handleClientSelect(cliente)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <div className="font-medium">{cliente.nombre}</div>
                        {cliente.email && (
                          <div className="text-sm text-gray-600">{cliente.email}</div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
            {selectedCliente && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">
                    {selectedCliente.nombre}
                  </span>
                  <Button
                    onClick={() => setSelectedCliente(null)}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Búsqueda de Productos */}
      <Card className="p-4">
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-dark-text-secondary" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar productos por nombre o código..."
              value={searchTerm}
              onChange={(e) => handleProductSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
                  handleProductSelect(filteredProductos[selectedSuggestionIndex])
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setSelectedSuggestionIndex(prev => 
                    prev < filteredProductos.length - 1 ? prev + 1 : prev
                  )
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
                }
              }}
            />
          </div>

          {/* Sugerencias de productos */}
          {showProductSuggestions && filteredProductos.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-dark-border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredProductos.map((producto, index) => (
                <div
                  key={producto.id}
                  onClick={() => handleProductSelect(producto)}
                  className={`px-4 py-2 cursor-pointer ${
                    index === selectedSuggestionIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{producto.nombre}</div>
                      <div className="text-sm text-gray-600">
                        Código: {producto.codigo_sku} | Stock: {producto.stock}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${tipoComprobante === 'A' ? producto.precio_mayorista : producto.precio_minorista}
                      </div>
                      <div className="text-xs text-gray-500">
                        {tipoComprobante === 'A' ? 'Mayorista' : 'Minorista'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Carrito */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-dark-text-primary">Carrito de Facturación</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-dark-text-secondary">
              {cartItems.length} productos
            </span>
            <Button
              onClick={() => setCartItems([])}
              variant="outline"
              size="sm"
              disabled={cartItems.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto text-dark-border mb-4" />
            <p className="text-dark-text-secondary">No hay productos en el carrito</p>
            <p className="text-sm text-dark-text-secondary">Busca productos para comenzar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border border-dark-border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{item.producto.nombre}</div>
                  <div className="text-sm text-dark-text-secondary">
                    Código: {item.producto.codigo_sku}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleQuantityChange(index, item.cantidad - 1)}
                    variant="outline"
                    size="sm"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center">{item.cantidad}</span>
                  <Button
                    onClick={() => handleQuantityChange(index, item.cantidad + 1)}
                    variant="outline"
                    size="sm"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={item.tipo_precio}
                    onChange={(e) => handlePriceTypeChange(index, e.target.value as 'minorista' | 'mayorista')}
                    className="px-2 py-1 border border-dark-border rounded text-sm"
                  >
                    <option value="minorista">Minorista</option>
                    <option value="mayorista">Mayorista</option>
                  </select>
                  <Input
                    type="number"
                    value={item.precio_unitario}
                    onChange={(e) => handlePriceChange(index, parseFloat(e.target.value) || 0)}
                    className="w-20 text-sm"
                  />
                </div>

                <div className="text-right">
                  <div className="font-medium text-green-600">
                    ${item.subtotal.toLocaleString()}
                  </div>
                </div>

                <Button
                  onClick={() => handleQuantityChange(index, 0)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {/* Total */}
            <div className="border-t border-dark-border pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  ${totalCarrito.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Botón Finalizar */}
            <Button
              onClick={handleFinalizarFactura}
              disabled={isSubmitting || cartItems.length === 0 || !selectedCliente}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Procesando...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
                  Finalizar Facturación
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* Atajos de teclado */}
      {showConfig && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Atajos de Teclado</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-sm">F10</kbd>
              <span className="text-sm">Enfocar buscador</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-sm">F11</kbd>
              <span className="text-sm">Finalizar facturación</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-sm">F12</kbd>
              <span className="text-sm">Limpiar carrito</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
