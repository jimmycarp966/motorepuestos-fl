import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { authSlice } from './slices/authSlice'
import { empleadosSlice } from './slices/empleadosSlice'
import { productosSlice } from './slices/productosSlice'
import { clientesSlice } from './slices/clientesSlice'
import { ventasSlice } from './slices/ventasSlice'
import { cajaSlice } from './slices/cajaSlice'
import { dashboardSlice, DashboardKPI } from './slices/dashboardSlice'
import { uiSlice, DebugLog } from './slices/uiSlice'
import { notificationsSlice } from './slices/notificationsSlice'

// Store principal que combina todos los slices
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (...a) => ({
        ...authSlice(...a),
        ...empleadosSlice(...a),
        ...productosSlice(...a),
        ...clientesSlice(...a),
        ...ventasSlice(...a),
        ...cajaSlice(...a),
        ...dashboardSlice(...a),
        ...uiSlice(...a),
        ...notificationsSlice(...a),
      }),
      {
        name: 'motorepuestos-fl-store',
        partialize: (state) => ({
          auth: state.auth,
          ui: state.ui,
        }),
      }
    ),
    {
      name: 'motorepuestos-fl-store',
    }
  )
)

// Selectores útiles para optimizar renders
export const useAuth = () => useAppStore((state) => state.auth)
export const useUser = () => useAppStore((state) => state.auth.user)
export const useSession = () => useAppStore((state) => state.auth.session)
export const useAuthLoading = () => useAppStore((state) => state.auth.loading)

export const useEmpleados = () => useAppStore((state) => state.empleados)
export const useProductos = () => useAppStore((state) => state.productos)
export const useClientes = () => useAppStore((state) => state.clientes)
export const useVentas = () => useAppStore((state) => state.ventas)
export const useCaja = () => useAppStore((state) => state.caja)
export const useDashboard = () => useAppStore((state) => state.dashboard)
export const useUI = () => useAppStore((state) => state.ui)
export const useNotifications = () => useAppStore((state) => state.notifications)

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
  canAccessModule: (userRole: string, moduleId: string) => boolean
  getUserPermissions: (userRole: string) => any

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

  // Ventas
  ventas: VentasState
  fetchVentas: () => Promise<void>
  registrarVenta: (venta: CreateVentaData) => Promise<void>

  // Caja
  caja: CajaState
  fetchMovimientos: () => Promise<void>
  registrarIngreso: (monto: number, concepto: string) => Promise<void>
  registrarEgreso: (monto: number, concepto: string) => Promise<void>
  arqueoCaja: (saldoEsperado: number, observaciones?: string) => Promise<any>
  fetchMovimientosPorPeriodo: (fechaInicio: string, fechaFin: string) => Promise<any>

  // Dashboard
  dashboard: DashboardState
  fetchDashboardKPIs: () => Promise<void>
  fetchVentasPorPeriodo: (fechaInicio: string, fechaFin: string) => Promise<void>
  fetchProductosMasVendidos: (limite?: number) => Promise<void>

  // UI
  ui: UIState
  setTheme: (theme: 'light' | 'dark') => void
  setSidebarOpen: (open: boolean) => void
  setCurrentModule: (module: string) => void
  toggleDebugPanel: () => void
  addDebugLog: (log: Omit<DebugLog, 'id' | 'timestamp'>) => void
  clearDebugLogs: () => void

  // Notifications
  notifications: NotificationsState
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

// Tipos de datos
export interface Empleado {
  id: string
  nombre: string
  email: string
  rol: 'admin' | 'cajero' | 'vendedor' | 'consulta'
  activo: boolean
  created_at: string
  updated_at: string
}

export interface CreateEmpleadoData {
  nombre: string
  email: string
  rol: 'admin' | 'cajero' | 'vendedor' | 'consulta'
}

export interface UpdateEmpleadoData {
  nombre?: string
  email?: string
  rol?: 'admin' | 'cajero' | 'vendedor' | 'consulta'
  activo?: boolean
}

export interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria: string
  unidad_medida: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface CreateProductoData {
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria: string
  unidad_medida: string
}

export interface UpdateProductoData {
  nombre?: string
  descripcion?: string
  precio?: number
  stock?: number
  categoria?: string
  unidad_medida?: string
  activo?: boolean
}

export interface Cliente {
  id: string
  nombre: string
  email: string
  telefono: string
  direccion: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface CreateClienteData {
  nombre: string
  email: string
  telefono: string
  direccion: string
}

export interface UpdateClienteData {
  nombre?: string
  email?: string
  telefono?: string
  direccion?: string
  activo?: boolean
}

export interface Venta {
  id: string
  cliente_id: string | null
  empleado_id: string
  total: number
  fecha: string
  created_at: string
  cliente?: Cliente
  empleado?: Empleado
  items?: VentaItem[]
}

export interface VentaItem {
  id: string
  venta_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  producto?: Producto
}

export interface CreateVentaData {
  cliente_id?: string
  items: Array<{
    producto_id: string
    cantidad: number
  }>
}

export interface MovimientoCaja {
  id: string
  tipo: 'ingreso' | 'egreso'
  monto: number
  concepto: string
  empleado_id: string
  fecha: string
  created_at: string
  empleado?: Empleado
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

// Tipos para el usuario autenticado
export interface AuthenticatedUser {
  id: string
  nombre: string
  email: string
  rol: 'admin' | 'cajero' | 'vendedor' | 'consulta'
  activo: boolean
  created_at: string
  updated_at: string
}

// Estados de los slices
export interface AuthState {
  session: unknown | null
  user: AuthenticatedUser | null
  loading: boolean
}

export interface EmpleadosState {
  empleados: Empleado[]
  loading: boolean
  error: string | null
}

export interface ProductosState {
  productos: Producto[]
  loading: boolean
  error: string | null
}

export interface ClientesState {
  clientes: Cliente[]
  loading: boolean
  error: string | null
}

export interface VentasState {
  ventas: Venta[]
  loading: boolean
  error: string | null
}

export interface CajaState {
  movimientos: MovimientoCaja[]
  saldo: number
  loading: boolean
  error: string | null
}

export interface DashboardState {
  kpis: DashboardKPI | null
  ventasPorPeriodo: any[]
  productosMasVendidos: any[]
  loading: boolean
  error: string | null
}

export interface NotificationsState {
  notifications: Notification[]
}

export interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  currentModule: string
  debugPanel: {
    isOpen: boolean
    logs: DebugLog[]
    maxLogs: number
  }
}

// Re-exportar tipos del dashboard
export type { DashboardKPI } from './slices/dashboardSlice'
export type { DebugLog } from './slices/uiSlice'
