// Auth
export { LoginForm } from './auth/LoginForm'

// Dashboard
export { Dashboard } from './dashboard/Dashboard'

// Empleados
export { EmpleadosTable } from './empleados/EmpleadosTable'
export { EmpleadoForm } from './empleados/EmpleadoForm'

// Productos
export { ProductosTable } from './productos/ProductosTable'
export { ProductoForm } from './productos/ProductoForm'

// Clientes
export { ClientesTable } from './clientes/ClientesTable'
export { ClienteForm } from './clientes/ClienteForm'

// Ventas
export { VentasTable } from './ventas/VentasTable'
export { VentasModernView } from './ventas/VentasModernView'

// Caja
export { CajaTable } from './caja/CajaTable'
export { MovimientoForm } from './caja/MovimientoForm'
export { AbrirCajaForm } from './caja/AbrirCajaForm'
export { GastosForm } from './caja/GastosForm'

// Reportes
export { default as ReportesTable } from './reportes/ReportesTable';

// Layout
export { Sidebar } from './layout/Sidebar'

// UI
export { Button } from './ui/button'
export { Card } from './ui/card'
export { Input } from './ui/input'
export { Textarea } from './ui/textarea'
export { NotificationsContainer } from './ui/notifications'

// Nuevos componentes UI mejorados
export { MotorCard } from './ui/motor-card'
export { ActionButton, useActionFeedback } from './ui/action-button'
export { KPICard } from './ui/kpi-card'

// Iconografía específica de motorepuestos
export { 
  MotorIcon, 
  BrakesIcon, 
  TransmissionIcon, 
  ElectricIcon, 
  TireIcon, 
  OilIcon, 
  ToolsIcon, 
  BatteryIcon, 
  SpeedometerIcon,
  CategoriaIcon,
  InteractiveIcon,
  categoriaIcons,
  getCategoriaIcon 
} from './ui/motor-icons'

// Estados de carga y feedback visual
export {
  Skeleton,
  KPICardSkeleton,
  TableSkeleton,
  ContextualLoader,
  EmptyState,
  LoadingOverlay,
  ProgressBar,
  useLoadingState
} from './ui/loading-states'

// Componentes responsive y búsqueda
export { default as ResponsiveTable } from './ui/responsive-table'
export { default as GlobalSearch } from './ui/global-search'

// Ayuda y shortcuts
export { ShortcutsHelp } from './ui/ShortcutsHelp'