import React, { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { 
  Plus, 
  Trash2, 
  ShoppingCart, 
  DollarSign, 
  Package,
  X,
  CreditCard,
  Receipt,
  Search,
  Users,
  CheckCircle,
  ArrowDown,
  ArrowUp
} from 'lucide-react'
import { useSearchFilter } from '../../hooks/useSearchFilter'

interface CartItem {
  producto: any
  cantidad: number
  precio_unitario: number
  subtotal: number
  tipo_precio: 'minorista' | 'mayorista'
}

export const VentasTable: React.FC = () => {
  console.log('🚀 [VentasTable] COMPONENTE MONTADO')
  
  // Estados del store
  const productos = useAppStore((state) => state.productos)
  const clientes = useAppStore((state) => state.clientes.clientes)
  const arqueoCompletadoHoy = useAppStore((state) => state.arqueoCompletadoHoy)
  const fetchProductos = useAppStore((state) => state.fetchProductos)
  const fetchClientes = useAppStore((state) => state.fetchClientes)
  const registrarVenta = useAppStore((state) => state.registrarVenta)
  const addNotification = useAppStore((state) => state.addNotification)
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState('')
  const [showProductSuggestions, setShowProductSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedCliente, setSelectedCliente] = useState<any>(null)
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia' | 'cuenta_corriente'>('efectivo')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showClientSearch, setShowClientSearch] = useState(false)
  const [searchClientTerm, setSearchClientTerm] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null)

  console.log('🔍 [VentasTable] Estado:', { 
    productos: productos?.length,
    clientes: clientes?.length,
    cartItems: cartItems.length,
    selectedCliente: selectedCliente?.nombre,
    arqueoCompletadoHoy
  })

  // Cargar datos al montar
  useEffect(() => {
    console.log('🔍 [VentasTable] Cargando datos...')
    fetchProductos()
    fetchClientes()
  }, [fetchProductos, fetchClientes])

  // Mostrar advertencia si el arqueo está completado
  useEffect(() => {
    if (arqueoCompletadoHoy) {
      addNotification({
        id: Date.now().toString(),
        type: 'warning',
        title: 'Sistema bloqueado',
        message: 'El arqueo de caja ha sido completado. No se pueden registrar nuevas ventas hasta mañana.',
      })
    }
  }, [arqueoCompletadoHoy, addNotification])

  // Filtrar productos para autocompletado
  const filteredProductos = useSearchFilter({
    data: productos || [],
    searchTerm,
    searchFields: ['nombre', 'codigo_sku', 'categoria'],
    searchFunction: (producto, term) => {
      return (
        producto.nombre.toLowerCase().includes(term.toLowerCase()) ||
        producto.codigo_sku.toLowerCase().includes(term.toLowerCase()) ||
        producto.categoria.toLowerCase().includes(term.toLowerCase())
      )
    }
  }).slice(0, 12) // Aumentar a 12 sugerencias

  // Filtrar clientes para búsqueda
  const filteredClientes = useSearchFilter({
    data: clientes || [],
    searchTerm: searchClientTerm,
    searchFields: ['nombre', 'email', 'telefono'],
    searchFunction: (cliente, term) => {
      return (
        cliente.nombre.toLowerCase().includes(term) ||
        cliente.email.toLowerCase().includes(term) ||
        (cliente.telefono && cliente.telefono.includes(term))
      )
    }
  })

  // Funciones de manejo de productos
  const handleProductSelect = (producto: any, cantidad: number = 1, tipoPrecio: 'minorista' | 'mayorista' = 'minorista') => {
    const precio = tipoPrecio === 'mayorista' ? producto.precio_mayorista : producto.precio_minorista
    const subtotal = precio * cantidad

    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cartItems.findIndex(item => 
      item.producto.id === producto.id && item.tipo_precio === tipoPrecio
    )
    
         if (existingItemIndex >= 0) {
       // Actualizar cantidad del item existente
       const updatedItems = [...cartItems]
       const existingItem = updatedItems[existingItemIndex]
       const newCantidad = existingItem.cantidad + cantidad
       
       // Permitir stock negativo - mostrar advertencia pero continuar
       if (newCantidad > producto.stock) {
         addNotification({
           id: Date.now().toString(),
           type: 'warning',
           title: 'Stock bajo',
           message: `${producto.nombre}: Stock ${producto.stock}, agregando ${cantidad} (total: ${newCantidad})`
         })
       }
       
       existingItem.cantidad = newCantidad
       existingItem.subtotal = precio * newCantidad
       setCartItems(updatedItems)
     } else {
      // Agregar nuevo item
      const newItem: CartItem = {
        producto,
        cantidad,
        precio_unitario: precio,
        subtotal,
        tipo_precio: tipoPrecio
      }
      setCartItems([...cartItems, newItem])
    }

    // Limpiar búsqueda
    setSearchTerm('')
    setShowProductSuggestions(false)
    setSelectedSuggestionIndex(-1)
    
    // Enfocar el input de búsqueda para continuar
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }

  const handleRemoveItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index))
  }

     const handleUpdateQuantity = (index: number, newCantidad: number) => {
     if (newCantidad <= 0) {
       handleRemoveItem(index)
       return
     }

     const item = cartItems[index]
     
     // Permitir stock negativo - mostrar advertencia pero continuar
     if (newCantidad > item.producto.stock) {
       addNotification({
         id: Date.now().toString(),
         type: 'warning',
         title: 'Stock bajo',
         message: `${item.producto.nombre}: Stock ${item.producto.stock}, solicitando ${newCantidad}`
       })
     }

     const updatedItems = [...cartItems]
     updatedItems[index] = {
       ...item,
       cantidad: newCantidad,
       subtotal: item.precio_unitario * newCantidad
     }
     setCartItems(updatedItems)
   }

  // Funciones de manejo de clientes
  const handleClientSelect = (cliente: any) => {
    setSelectedCliente(cliente)
    setShowClientSearch(false)
    setSearchClientTerm('')
  }

  const handleRemoveClient = () => {
    setSelectedCliente(null)
  }

  // Manejo de teclado para búsqueda
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
      setShowProductSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }
  }

  // Funciones de venta
  const handleSubmit = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (cartItems.length === 0) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Carrito vacío',
        message: 'Debes agregar al menos un producto'
      })
      return
    }

    // Mostrar modal de método de pago
    setShowConfig(true)
  }

  const handleFinalizarVenta = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    console.log('🚀 [VentasTable] Iniciando finalización de venta...')
    setIsSubmitting(true)

    try {
      const ventaData = {
        cliente_id: selectedCliente?.id || null,
        metodo_pago: metodoPago,
        items: cartItems.map(item => ({
          producto_id: item.producto.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal,
          tipo_precio: item.tipo_precio
        }))
      }

      console.log('🚀 [VentasTable] Llamando registrarVenta...')
      await registrarVenta(ventaData)
      console.log('✅ [VentasTable] Venta registrada exitosamente')
      
      // Nota: registrarVenta ya maneja el registro de ingreso en caja automáticamente
      // No es necesario llamar registrarIngreso aquí para evitar duplicación

      // Limpiar formulario
      setCartItems([])
      setSelectedCliente(null)
      setMetodoPago('efectivo')
      setShowConfig(false)
      console.log('✅ [VentasTable] Formulario limpiado, venta completada')
    } catch (error: any) {
      console.error('❌ [VentasTable] Error en finalización de venta:', error)
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al registrar venta',
        message: error.message || 'Ocurrió un error inesperado'
      })
    } finally {
      setIsSubmitting(false)
      console.log('🏁 [VentasTable] Finalización de venta completada')
    }
  }

  const handleFacturarAFIP = () => {
    addNotification({
      id: Date.now().toString(),
      type: 'info',
      title: 'Facturación AFIP',
      message: 'Funcionalidad de facturación AFIP será implementada próximamente'
    })
  }

  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Venta Rápida</h1>
          <p className="text-gray-600">Agrega productos y finaliza la venta</p>
        </div>
      </div>

      {/* Alerta de arqueo completado */}
      {arqueoCompletadoHoy && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Sistema Bloqueado - Arqueo Completado
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  El arqueo de caja ha sido completado para el día de hoy. 
                  No se pueden registrar nuevas ventas hasta mañana.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel izquierdo - Búsqueda y Carrito */}
        <div className="space-y-6">
          {/* Búsqueda rápida de productos */}
          <Card className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2 text-blue-600" />
              Búsqueda Rápida
            </h3>
            
            <div className="relative">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Escribe el nombre o SKU del producto..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowProductSuggestions(e.target.value.length > 0)
                  setSelectedSuggestionIndex(-1)
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowProductSuggestions(searchTerm.length > 0)}
                className="w-full"
              />
              
              {/* Sugerencias de productos */}
              {showProductSuggestions && filteredProductos.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {filteredProductos.map((producto, index) => (
                    <div
                      key={producto.id}
                      className={`p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                        index === selectedSuggestionIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => handleProductSelect(producto)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                              <Package className="w-3 h-3 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm leading-tight">{producto.nombre}</h4>
                              <p className="text-xs text-gray-500">{producto.codigo_sku}</p>
                            </div>
                          </div>
                        </div>
                                                 <div className="text-right">
                           <p className="font-bold text-green-600 text-sm">
                             ${producto.precio_minorista?.toFixed(2)}
                           </p>
                           <div className="flex items-center justify-end gap-1 mt-1">
                             <span className={`text-xs px-1 py-0.5 rounded ${
                               producto.stock <= 0 ? 'text-red-600 bg-red-100' :
                               producto.stock <= 5 ? 'text-orange-600 bg-orange-100' :
                               producto.stock <= 10 ? 'text-yellow-600 bg-yellow-100' :
                               'text-gray-500'
                             }`}>
                               Stock: {producto.stock}
                             </span>
                             {producto.stock <= 10 && (
                               <span className="text-xs text-red-500">⚠️</span>
                             )}
                           </div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              Presiona Enter para agregar el primer producto, o usa las flechas para navegar
            </p>
          </Card>

          {/* Carrito en tiempo real */}
          <Card className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Carrito ({cartItems.length} productos)
            </h3>

            {cartItems.length > 0 ? (
              <div className="space-y-3">
                {/* Lista de productos */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{item.producto.nombre}</h4>
                        <p className="text-xs text-gray-500">{item.producto.codigo_sku}</p>
                        <p className="text-xs text-blue-600 font-medium">
                          {item.tipo_precio === 'mayorista' ? 'Mayorista' : 'Minorista'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateQuantity(index, item.cantidad - 1)}
                          disabled={item.cantidad <= 1}
                          className="w-6 h-6 p-0"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.cantidad}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateQuantity(index, item.cantidad + 1)}
                          disabled={item.cantidad >= item.producto.stock}
                          className="w-6 h-6 p-0"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-green-600 text-sm">
                          ${item.subtotal.toFixed(2)}
                        </p>
                      </div>
                      
                      <Button
                        onClick={() => handleRemoveItem(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 w-6 h-6 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span className="text-green-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">Busca y agrega productos para comenzar</p>
              </div>
            )}
          </Card>
        </div>

        {/* Panel derecho - Configuración */}
        <div className="space-y-6">
          {/* Botón para mostrar configuración */}
          <Card className="p-4">
            <Button
              onClick={() => setShowConfig(!showConfig)}
              variant="outline"
              className="w-full"
            >
              {showConfig ? 'Ocultar' : 'Mostrar'} Configuración
            </Button>
          </Card>

          {showConfig && (
            <>
              {/* Cliente */}
              <Card className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Cliente (Opcional)
                </h3>
                
                {selectedCliente ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{selectedCliente.nombre}</p>
                        <p className="text-sm text-gray-500">{selectedCliente.email}</p>
                        {selectedCliente.telefono && (
                          <p className="text-sm text-gray-500">{selectedCliente.telefono}</p>
                        )}
                      </div>
                      <Button
                        onClick={handleRemoveClient}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowClientSearch(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Buscar Cliente
                    </Button>
                    <p className="text-sm text-gray-500 text-center">
                      O continúa sin cliente
                    </p>
                  </div>
                )}
              </Card>

              {/* Método de pago */}
              <Card className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                  Método de Pago
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={metodoPago === 'efectivo' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMetodoPago('efectivo')}
                    className="justify-start"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Efectivo
                  </Button>
                  <Button
                    variant={metodoPago === 'tarjeta' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMetodoPago('tarjeta')}
                    className="justify-start"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Tarjeta
                  </Button>
                  <Button
                    variant={metodoPago === 'transferencia' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMetodoPago('transferencia')}
                    className="justify-start"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Transferencia
                  </Button>
                  <Button
                    variant={metodoPago === 'cuenta_corriente' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMetodoPago('cuenta_corriente')}
                    className="justify-start"
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Cuenta Corriente
                  </Button>
                </div>
              </Card>

              {/* Botón confirmar venta */}
              <Card className="p-4">
                <div className="space-y-3">
                  <Button
                    type="button"
                    onClick={(e) => handleFinalizarVenta(e)}
                    disabled={isSubmitting}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirmar Venta (${total.toFixed(2)})
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => setShowConfig(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                </div>
              </Card>
            </>
          )}

          {/* Botones de acción */}
          <Card className="p-4">
            <div className="space-y-3">
              <Button
                type="button"
                onClick={(e) => handleSubmit(e)}
                disabled={cartItems.length === 0 || arqueoCompletadoHoy || isSubmitting}
                className={`w-full ${
                  arqueoCompletadoHoy 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {arqueoCompletadoHoy 
                  ? 'Sistema Bloqueado (Arqueo Completado)' 
                  : `Finalizar Venta (${total.toFixed(2)})`
                }
              </Button>
              
              <Button
                onClick={handleFacturarAFIP}
                variant="outline"
                className="w-full bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Receipt className="w-4 h-4 mr-2" />
                Facturar AFIP
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de búsqueda de clientes */}
      {showClientSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Buscar Cliente
                </h2>
                <Button
                  onClick={() => setShowClientSearch(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Buscador */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar clientes por nombre, email, teléfono..."
                    value={searchClientTerm}
                    onChange={(e) => setSearchClientTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Lista de clientes */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredClientes.length > 0 ? (
                  filteredClientes.map((cliente) => (
                    <div
                      key={cliente.id}
                      className="p-4 border rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      onClick={() => handleClientSelect(cliente)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{cliente.nombre}</h4>
                          <p className="text-sm text-gray-500">{cliente.email}</p>
                          {cliente.telefono && (
                            <p className="text-sm text-gray-500">{cliente.telefono}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {cliente.activo ? 'Activo' : 'Inactivo'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No se encontraron clientes</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
