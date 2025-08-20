import React, { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../../store'
// import { useComponentShortcuts, createShortcut } from '../../hooks/useKeyboardShortcuts'
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
// import { useSearchFilter } from '../../hooks/useSearchFilter'

interface CartItem {
  producto: any
  cantidad: number
  precio_unitario: number
  subtotal: number
  tipo_precio: 'minorista' | 'mayorista'
}

export const FacturacionTable: React.FC = () => {
  console.log('🔧 [FacturacionTable] Componente montado')
  
  // Estados del store
  const productos = useAppStore((state) => state.productos)
  const clientes = useAppStore((state) => state.clientes.clientes)
  const arqueoCompletadoHoy = useAppStore((state) => state.arqueoCompletadoHoy)
  const fetchProductos = useAppStore((state) => state.fetchProductos)
  const fetchClientes = useAppStore((state) => state.fetchClientes)
  const registrarFactura = useAppStore((state) => state.registrarFactura)
  const addNotification = useAppStore((state) => state.addNotification)
  
  console.log('🔧 [FacturacionTable] Estados del store:', {
    productos: productos?.productos?.length || 0,
    clientes: clientes?.length || 0,
    registrarFactura: typeof registrarFactura
  })
  
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
  // const facturacionShortcuts = [
  //   createShortcut('F10', () => {
  //     // Enfocar el campo de búsqueda
  //     if (searchInputRef.current) {
  //       searchInputRef.current.focus()
  //       addNotification({
  //       id: `shortcut-${Date.now()}`,
  //       type: 'info',
  //       title: 'Atajo F10',
  //       message: 'Campo de búsqueda enfocado',
  //       duration: 1500
  //     })
  //   }
  // }, 'Enfocar buscador de productos'),
  
  //   createShortcut('F11', () => {
  //     // Finalizar facturación si hay items en el carrito
  //     if (cartItems.length > 0) {
  //       handleFinalizarFactura()
  //       addNotification({
  //       id: `shortcut-${Date.now()}`,
  //       type: 'info',
  //       title: 'Atajo F11',
  //       message: 'Finalizando facturación...',
  //       duration: 1500
  //     })
  //   }
  // }, 'Finalizar facturación'),
  
  //   createShortcut('F12', () => {
  //     // Limpiar carrito
  //     setCartItems([])
  //     addNotification({
  //       id: `shortcut-${Date.now()}`,
  //       type: 'info',
  //       title: 'Atajo F12',
  //       message: 'Carrito limpiado',
  //       duration: 1500
  //     })
  //   }, 'Limpiar carrito')
  // ]

  // Registrar shortcuts
  // useComponentShortcuts(facturacionShortcuts) // Comentado temporalmente para debug

  // Cargar datos al montar el componente
  useEffect(() => {
    console.log('🔧 [FacturacionTable] Cargando datos...')
    // fetchProductos()
    // fetchClientes()
  }, [])

  // Filtrar productos basado en el término de búsqueda
  // const filteredProductos = useSearchFilter({
  //   data: productos.productos || [],
  //   searchTerm,
  //   searchFields: ['nombre', 'codigo_sku']
  // })
  
  const filteredProductos = productos.productos || []
  
  console.log('🔧 [FacturacionTable] Productos filtrados:', filteredProductos.length)

  // Calcular total del carrito
  // const totalCarrito = useMemo(() => {
  //   return cartItems.reduce((sum, item) => sum + item.subtotal, 0)
  // }, [cartItems])
  
  const totalCarrito = cartItems.reduce((sum, item) => sum + item.subtotal, 0)

  // Manejar búsqueda de productos
  const handleProductSearch = (term: string) => {
    setSearchTerm(term)
    setShowProductSuggestions(term.length > 0)
    setSelectedSuggestionIndex(-1)
  }

  // Manejar selección de producto
  const handleProductSelect = (producto: any) => {
    console.log('🔧 [FacturacionTable] Producto seleccionado:', producto)
  }

  // Manejar cambio de cantidad
  const handleQuantityChange = (index: number, newQuantity: number) => {
    console.log('🔧 [FacturacionTable] Cambio cantidad:', index, newQuantity)
  }

  // Manejar cambio de precio
  const handlePriceChange = (index: number, newPrice: number) => {
    console.log('🔧 [FacturacionTable] Cambio precio:', index, newPrice)
  }

  // Manejar cambio de tipo de precio
  const handlePriceTypeChange = (index: number, newType: 'minorista' | 'mayorista') => {
    console.log('🔧 [FacturacionTable] Cambio tipo precio:', index, newType)
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
    console.log('🔧 [FacturacionTable] Finalizar facturación')
  }

  console.log('🔧 [FacturacionTable] Renderizando componente')
  
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
      
      {/* Contenido simplificado para debug */}
      <div className="p-4 bg-dark-bg-secondary rounded-lg">
        <h2 className="text-lg font-semibold text-dark-text-primary mb-4">Debug Info</h2>
        <div className="space-y-2 text-sm text-dark-text-secondary">
          <p>Productos cargados: {productos?.productos?.length || 0}</p>
          <p>Clientes cargados: {clientes?.length || 0}</p>
          <p>Items en carrito: {cartItems.length}</p>
          <p>Total carrito: ${totalCarrito}</p>
          <p>Cliente seleccionado: {selectedCliente?.nombre || 'Ninguno'}</p>
        </div>
      </div>
      
      {/* Botón de prueba */}
      <div className="p-4 bg-dark-bg-secondary rounded-lg">
        <Button
          onClick={() => {
            console.log('🔧 [FacturacionTable] Botón de prueba clickeado')
            addNotification({
              id: `test-${Date.now()}`,
              type: 'info',
              title: 'Prueba',
              message: 'El componente está funcionando correctamente',
              duration: 3000
            })
          }}
          className="w-full"
        >
          Probar Componente
        </Button>
      </div>
    </div>
  )
}
