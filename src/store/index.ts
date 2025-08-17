import { create } from 'zustand';
import { authSlice } from './slices/authSlice';
import { uiSlice } from './slices/uiSlice';
import { productosSlice } from './slices/productosSlice';
import { ventasSlice } from './slices/ventasSlice';
import { clientesSlice } from './slices/clientesSlice';
import { empleadosSlice } from './slices/empleadosSlice';
import { cajaSlice } from './slices/cajaSlice';
import { notificationsSlice } from './slices/notificationsSlice';
import { cajaHistorialSlice } from './slices/cajaHistorialSlice';
import { reportesSlice } from './slices/reportesSlice';

export interface AppStore {
  // Auth
  auth: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;

  // UI
  ui: any;
  setTheme: (theme: 'light' | 'dark') => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentModule: (module: string) => void;

  // Productos
  productos: any[];
  productosLoading: boolean;
  productosError: string | null;
  fetchProductos: () => Promise<void>;
  createProducto: (producto: any) => Promise<void>;
  updateProducto: (id: string, producto: any) => Promise<void>;
  deleteProducto: (id: string) => Promise<void>;

  // Ventas
  ventas: any[];
  ventasLoading: boolean;
  ventasError: string | null;
  fetchVentas: () => Promise<void>;
  registrarVenta: (venta: any) => Promise<void>;

  // Clientes
  clientes: any;
  fetchClientes: () => Promise<void>;
  createCliente: (cliente: any) => Promise<void>;
  updateCliente: (id: string, cliente: any) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;

  // Empleados
  empleados: any;
  fetchEmpleados: () => Promise<void>;
  createEmpleado: (empleado: any) => Promise<void>;
  updateEmpleado: (id: string, empleado: any) => Promise<void>;
  deleteEmpleado: (id: string) => Promise<void>;

  // Caja
  caja: any;
  fetchMovimientos: () => Promise<void>;
  registrarIngreso: (monto: number, concepto: string) => Promise<void>;
  registrarEgreso: (monto: number, concepto: string, metodo_pago?: string) => Promise<void>;
  abrirCaja: (saldoInicial: number) => Promise<void>;

  // Notifications
  notifications: any;
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;

  // Caja Historial
  cajaHistorial: any;
  fetchHistorialCajas: (fechaInicio?: string, fechaFin?: string) => Promise<void>;
  obtenerResumenCaja: (fecha: string) => Promise<any>;

  // Reportes
  filtros: any;
  reporteVentas: any[];
  reporteProductos: any[];
  reporteCaja: any[];
  loading: boolean;
  error: string | null;
  setFiltros: (filtros: any) => void;
  generarReporteVentas: () => Promise<void>;
  generarReporteProductos: () => Promise<void>;
  generarReporteCaja: () => Promise<void>;
  exportarCSV: (tipo: 'ventas' | 'productos' | 'caja') => Promise<void>;
  limpiarReportes: () => void;
}

export const useAppStore = create<AppStore>((...a) => ({
  ...authSlice(...a),
  ...uiSlice(...a),
  ...productosSlice(...a),
  ...ventasSlice(...a),
  ...clientesSlice(...a),
  ...empleadosSlice(...a),
  ...cajaSlice(...a),
  ...notificationsSlice(...a),
  ...cajaHistorialSlice(...a),
  ...reportesSlice(...a),
}));
