// Tipos de datos
export interface Empleado {
  id: string
  nombre: string
  email: string
  password?: string // Solo para creación/actualización
  rol: 'Administrador' | 'Gerente' | 'Vendedor' | 'Técnico' | 'Almacén' | 'Cajero'
  salario: number
  permisos_modulos: string[] // Array de módulos permitidos
  activo: boolean
  created_at: string
  updated_at: string
}

export interface CreateEmpleadoData {
  nombre: string
  email: string
  password: string
  rol: 'Administrador' | 'Gerente' | 'Vendedor' | 'Técnico' | 'Almacén' | 'Cajero'
  salario: number
  permisos_modulos: string[]
}

export interface UpdateEmpleadoData {
  nombre?: string
  email?: string
  password?: string
  rol?: 'Administrador' | 'Gerente' | 'Vendedor' | 'Técnico' | 'Almacén' | 'Cajero'
  salario?: number
  permisos_modulos?: string[]
  activo?: boolean
}

// Tipos para permisos de módulos
export type ModuloPermitido = 
  | 'dashboard'
  | 'empleados'
  | 'productos'
  | 'clientes'
  | 'ventas'
  | 'caja'
  | 'calendario'

export interface PermisosModulo {
  modulo: ModuloPermitido
  nombre: string
  descripcion: string
  roles_permitidos: string[]
}

export interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  codigo_sku: string
  precio_minorista: number
  precio_mayorista: number
  costo: number
  stock: number
  stock_minimo: number
  categoria: string
  unidad_medida: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface CreateProductoData {
  nombre: string
  descripcion?: string
  codigo_sku: string
  precio_minorista: number
  precio_mayorista: number
  costo: number
  stock: number
  stock_minimo: number
  categoria: string
  unidad_medida: string
}

export interface UpdateProductoData {
  nombre?: string
  descripcion?: string
  codigo_sku?: string
  precio_minorista?: number
  precio_mayorista?: number
  costo?: number
  stock?: number
  stock_minimo?: number
  categoria?: string
  unidad_medida?: string
  activo?: boolean
}

export interface Cliente {
  id: string
  nombre: string
  email: string | null
  telefono: string | null
  direccion: string | null
  limite_credito: number
  saldo_cuenta_corriente: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface CreateClienteData {
  nombre: string
  email?: string
  telefono?: string
  direccion?: string
  limite_credito?: number
}

export interface UpdateClienteData {
  nombre?: string
  email?: string
  telefono?: string
  direccion?: string
  activo?: boolean
}

export interface VentaItem {
  id: string
  venta_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  tipo_precio: 'minorista' | 'mayorista'
  producto?: Producto
}

export interface Venta {
  id: string
  cliente_id: string | null
  empleado_id: string
  total: number
  fecha: string
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cuenta_corriente'
  tipo_precio: 'minorista' | 'mayorista'
  created_at: string
  cliente?: Cliente
  empleado?: Empleado
  items?: VentaItem[]
}

export interface CreateVentaData {
  cliente_id?: string | null
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cuenta_corriente'
  tipo_precio?: 'minorista' | 'mayorista'
  items: Array<{
    producto_id: string
    cantidad: number
    precio_unitario: number
    subtotal: number
    tipo_precio: 'minorista' | 'mayorista'
  }>
}

export interface MovimientoCaja {
  id: string
  tipo: 'ingreso' | 'egreso'
  monto: number
  concepto: string
  empleado_id: string
  fecha: string
  metodo_pago: 'efectivo' | 'transferencia' | 'debito' | 'credito' | 'cuenta_corriente'
  created_at: string
  empleado?: Empleado
}

export interface ArqueoCaja {
  id: string
  fecha: string
  empleado_id: string
  efectivo_real: number
  efectivo_sistema: number
  transferencia_real: number
  transferencia_sistema: number
  debito_real: number
  debito_sistema: number
  credito_real: number
  credito_sistema: number
  cuenta_corriente_real: number
  cuenta_corriente_sistema: number
  diferencia_total: number
  observaciones?: string
  estado: 'abierto' | 'cerrado'
  created_at: string
  empleado?: Empleado
}

export interface CajaDiaria {
  id: string
  fecha: string
  empleado_id: string
  estado: 'abierta' | 'cerrada'
  saldo_inicial: number
  saldo_final?: number
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

export interface EventoCalendario {
  id: string
  titulo: string
  descripcion?: string
  fecha_inicio: string
  fecha_fin: string
  tipo: 'venta' | 'compra' | 'mantenimiento' | 'reunion' | 'otro'
  empleado_id: string
  created_at: string
  empleado?: Empleado
}

export interface CreateEventoData {
  titulo: string
  descripcion?: string
  fecha_inicio: string
  fecha_fin: string
  tipo: 'venta' | 'compra' | 'mantenimiento' | 'reunion' | 'otro'
}

// Tipos para el usuario autenticado
export interface AuthenticatedUser {
  id: string
  nombre: string
  email: string
  rol: 'Administrador' | 'Gerente' | 'Vendedor' | 'Técnico' | 'Almacén' | 'Cajero'
  permisos_modulos: string[] // Permisos específicos del usuario
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

export interface CalendarioState {
  eventos: EventoCalendario[]
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
  arqueos: ArqueoCaja[]
  cajasDiarias: CajaDiaria[]
  cajaActual: CajaDiaria | null
  cajaAbierta: boolean
  saldo: number
  loading: boolean
  error: string | null
}

export interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  currentModule: string
}

export interface NotificationsState {
  notifications: Notification[]
}

// Importar tipos del slice de historial de caja
export type { CajaHistorialState, CajaDiaria } from './slices/cajaHistorialSlice'

// Tipos para Caja Historial
export interface CajaHistorialState {
  cajasDiarias: CajaDiaria[];
  loading: boolean;
  error: string | null;
}

export interface CajaDiaria {
  fecha: string;
  empleado: string;
  apertura: number;
  cierre: number;
  total_ingresos: number;
  total_egresos: number;
  total_ventas: number;
  estado: 'abierta' | 'cerrada';
}

// Tipos para Reportes
export interface FiltrosReporte {
  fechaInicio: string;
  fechaFin: string;
  empleadoId?: string;
  clienteId?: string;
  metodoPago?: string;
  tipoPrecio?: string;
}

export interface ReporteVentas {
  id: string;
  fecha: string;
  total: number;
  metodoPago: string;
  tipoPrecio: string;
  empleado: {
    nombre: string;
    email: string;
  };
  cliente?: {
    nombre: string;
    email: string;
  };
  items: Array<{
    producto: {
      nombre: string;
      codigo: string;
    };
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }>;
}

export interface ReporteProductos {
  id: string;
  nombre: string;
  codigo: string;
  categoria: string;
  stock: number;
  precioMinorista: number;
  precioMayorista: number;
  totalVentas: number;
  cantidadVendida: number;
  ingresosGenerados: number;
}

export interface ReporteCaja {
  fecha: string;
  empleado: string;
  apertura: number;
  ingresos: number;
  egresos: number;
  ventas: number;
  saldoFinal: number;
  movimientos: Array<{
    tipo: 'ingreso' | 'egreso';
    concepto: string;
    monto: number;
    metodoPago: string;
    fecha: string;
  }>;
}

export interface ReportesState {
  filtros: FiltrosReporte;
  reporteVentas: ReporteVentas[];
  reporteProductos: ReporteProductos[];
  reporteCaja: ReporteCaja[];
  loading: boolean;
  error: string | null;
}

export interface ReportesActions {
  setFiltros: (filtros: Partial<FiltrosReporte>) => void;
  generarReporteVentas: () => Promise<void>;
  generarReporteProductos: () => Promise<void>;
  generarReporteCaja: () => Promise<void>;
  exportarCSV: (tipo: 'ventas' | 'productos' | 'caja') => Promise<void>;
  limpiarReportes: () => void;
}

export type ReportesSlice = ReportesState & ReportesActions;
