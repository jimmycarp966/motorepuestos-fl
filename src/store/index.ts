import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { authSlice } from './slices/authSlice'
import { empleadosSlice } from './slices/empleadosSlice'
import { productosSlice } from './slices/productosSlice'
import { clientesSlice } from './slices/clientesSlice'
import { ventasSlice } from './slices/ventasSlice'
import { cajaSlice } from './slices/cajaSlice'
import { calendarioSlice } from './slices/calendarioSlice'
import { uiSlice } from './slices/uiSlice'
import { notificationsSlice } from './slices/notificationsSlice'
import type {
  Empleado,
  CreateEmpleadoData,
  UpdateEmpleadoData,
  Producto,
  CreateProductoData,
  UpdateProductoData,
  Cliente,
  CreateClienteData,
  UpdateClienteData,
  Venta,
  CreateVentaData,
  MovimientoCaja,
  Notification,
  AuthenticatedUser,
  AuthState,
  EmpleadosState,
  ProductosState,
  ClientesState,
  VentasState,
  CajaState,
  CalendarioState,
  CreateEventoData,
  EventoCalendario,
  UIState,
  NotificationsState
} from './types'

// Tipos para el store
export interface AppStore {
  // Auth
  auth: AuthState
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>

  // Empleados
  empleados: EmpleadosState
  fetchEmpleados: () => Promise<void>
  createEmpleado: (empleado: CreateEmpleadoData) => Promise<void>
  updateEmpleado: (id: string, empleado: UpdateEmpleadoData) => Promise<void>
  deleteEmpleado: (id: string) => Promise<void>
  createEmpleadoWithAuth: (empleado: CreateEmpleadoData) => Promise<void>
  updateEmpleadoWithAuth: (id: string, empleado: UpdateEmpleadoData) => Promise<void>
  getEmpleadoPermissions: (rol: string) => string[]

  // Productos
  productos: ProductosState
  fetchProductos: () => Promise<void>
  createProducto: (producto: CreateProductoData) => Promise<void>
  updateProducto: (id: string, producto: UpdateProductoData) => Promise<void>
  deleteProducto: (id: string) => Promise<void>

  // Clientes
  clientes: ClientesState
  fetchClientes: () => Promise<void>
  createCliente: (cliente: CreateClienteData) => Promise<void>
  updateCliente: (id: string, cliente: UpdateClienteData) => Promise<void>
  deleteCliente: (id: string) => Promise<void>
  actualizarCuentaCorriente: (clienteId: string, monto: number, tipo: 'cargo' | 'pago') => Promise<void>

  // Ventas
  ventas: VentasState
  fetchVentas: () => Promise<void>
  registrarVenta: (venta: CreateVentaData) => Promise<void>

  // Caja
  caja: CajaState
  fetchMovimientos: () => Promise<void>
  registrarIngreso: (monto: number, concepto: string) => Promise<void>
  registrarEgreso: (monto: number, concepto: string, metodo_pago?: 'efectivo' | 'transferencia' | 'debito' | 'credito' | 'cuenta_corriente') => Promise<void>
  abrirCaja: (saldoInicial: number) => Promise<void>
  cerrarCaja: (saldoFinal: number) => Promise<void>
  realizarArqueo: (arqueoData: {
    efectivo_real: number
    transferencia_real: number
    debito_real: number
    credito_real: number
    cuenta_corriente_real: number
    observaciones?: string
  }) => Promise<void>
  fetchCajasDiarias: () => Promise<void>
  fetchArqueos: () => Promise<void>

  // Calendario
  calendario: CalendarioState
  fetchEventos: () => Promise<void>
  createEvento: (evento: CreateEventoData) => Promise<void>
  updateEvento: (id: string, evento: Partial<CreateEventoData>) => Promise<void>
  deleteEvento: (id: string) => Promise<void>

  // UI
  ui: UIState
  setTheme: (theme: 'light' | 'dark') => void
  setSidebarOpen: (open: boolean) => void
  setCurrentModule: (module: string) => void

  // Notifications
  notifications: NotificationsState
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
}

// Store principal que combina todos los slices
export const useAppStore = create<AppStore>()((set, get) => {
  // Crear cada slice
  const auth = authSlice(set, get, {})
  const empleados = empleadosSlice(set, get, {})
  const productos = productosSlice(set, get, {})
  const clientes = clientesSlice(set, get, {})
  const ventas = ventasSlice(set, get, {})
  const caja = cajaSlice(set, get, {})
  const calendario = calendarioSlice(set, get, {})
  const ui = uiSlice(set, get, {})
  const notifications = notificationsSlice(set, get, {})
  
  // Combinar todos los slices
  return {
    // Auth slice
    auth: auth.auth,
    login: auth.login,
    logout: auth.logout,
    checkAuth: auth.checkAuth,
    
    // Empleados slice
    empleados: empleados.empleados,
    fetchEmpleados: empleados.fetchEmpleados,
    createEmpleado: empleados.createEmpleado,
    updateEmpleado: empleados.updateEmpleado,
    deleteEmpleado: empleados.deleteEmpleado,
    createEmpleadoWithAuth: empleados.createEmpleadoWithAuth,
    updateEmpleadoWithAuth: empleados.updateEmpleadoWithAuth,
    getEmpleadoPermissions: empleados.getEmpleadoPermissions,
    
    // Productos slice
    productos: productos.productos,
    fetchProductos: productos.fetchProductos,
    createProducto: productos.createProducto,
    updateProducto: productos.updateProducto,
    deleteProducto: productos.deleteProducto,
    
    // Clientes slice
    clientes: clientes.clientes,
    fetchClientes: clientes.fetchClientes,
    createCliente: clientes.createCliente,
    updateCliente: clientes.updateCliente,
    deleteCliente: clientes.deleteCliente,
    actualizarCuentaCorriente: clientes.actualizarCuentaCorriente,
    
    // Ventas slice
    ventas: ventas.ventas,
    fetchVentas: ventas.fetchVentas,
    registrarVenta: ventas.registrarVenta,
    
    // Caja slice
    caja: caja.caja,
    fetchMovimientos: caja.fetchMovimientos,
    registrarIngreso: caja.registrarIngreso,
    registrarEgreso: caja.registrarEgreso,
    abrirCaja: caja.abrirCaja,
    cerrarCaja: caja.cerrarCaja,
    realizarArqueo: caja.realizarArqueo,
    fetchCajasDiarias: caja.fetchCajasDiarias,
    fetchArqueos: caja.fetchArqueos,
    
    // Calendario slice
    calendario: calendario.calendario,
    fetchEventos: calendario.fetchEventos,
    createEvento: calendario.createEvento,
    updateEvento: calendario.updateEvento,
    deleteEvento: calendario.deleteEvento,
    
    // UI slice
    ui: ui.ui,
    setTheme: ui.setTheme,
    setSidebarOpen: ui.setSidebarOpen,
    setCurrentModule: ui.setCurrentModule,
    
    // Notifications slice
    notifications: notifications.notifications,
    addNotification: notifications.addNotification,
    removeNotification: notifications.removeNotification,
  }
})

// Re-exportar tipos desde el archivo de tipos
export type {
  Empleado,
  CreateEmpleadoData,
  UpdateEmpleadoData,
  Producto,
  CreateProductoData,
  UpdateProductoData,
  Cliente,
  CreateClienteData,
  UpdateClienteData,
  Venta,
  VentaItem,
  CreateVentaData,
  MovimientoCaja,
  Notification,
  AuthenticatedUser,
  AuthState,
  EmpleadosState,
  ProductosState,
  ClientesState,
  VentasState,
  CajaState,
  CalendarioState,
  CreateEventoData,
  EventoCalendario,
  UIState,
  NotificationsState
} from './types'
