import type { StateCreator } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { AppStore } from '../index';

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

const initialState: ReportesState = {
  filtros: {
    fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
  },
  reporteVentas: [],
  reporteProductos: [],
  reporteCaja: [],
  loading: false,
  error: null,
};

export const reportesSlice: StateCreator<AppStore> = (set, get) => {
  const addNotification = (type: 'success' | 'error' | 'warning', message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      title: 'Reportes',
      message,
      duration: 5000,
    };
    // Las notificaciones se manejarán desde el componente principal
    console.log(`[Reportes] ${type.toUpperCase()}: ${message}`);
  };

  return {
  ...initialState,

  setFiltros: (nuevosFiltros) => {
    set((state) => ({
      filtros: { ...state.filtros, ...nuevosFiltros }
    }));
    console.log('Filtros actualizados:', { ...get().filtros, ...nuevosFiltros });
  },

  generarReporteVentas: async () => {
    const { filtros } = get();
    set({ loading: true, error: null });

    try {
      let query = supabase
        .from('ventas')
        .select(`
          id,
          fecha,
          total,
          metodo_pago,
          empleados (
            nombre,
            email
          ),
          clientes (
            nombre,
            email
          ),
          venta_items (
            cantidad,
            precio_unitario,
            subtotal,
            productos (
              nombre,
              codigo_sku
            )
          )
        `)
        .gte('fecha', filtros.fechaInicio + 'T00:00:00')
        .lte('fecha', filtros.fechaFin + 'T23:59:59')
        .order('fecha', { ascending: false });

      if (filtros.empleadoId) {
        query = query.eq('empleado_id', filtros.empleadoId);
      }

      if (filtros.clienteId) {
        query = query.eq('cliente_id', filtros.clienteId);
      }

      if (filtros.metodoPago) {
        query = query.eq('metodo_pago', filtros.metodoPago);
      }

      const { data, error } = await query;

      if (error) throw error;

      const reporteVentas: ReporteVentas[] = data?.map(venta => ({
        id: venta.id,
        fecha: venta.fecha,
        total: venta.total,
        metodoPago: venta.metodo_pago || 'efectivo',
        tipoPrecio: 'minorista', // Valor por defecto ya que no existe en la tabla
        empleado: {
          nombre: venta.empleados?.nombre || 'N/A',
          email: venta.empleados?.email || 'N/A',
        },
        cliente: venta.clientes ? {
          nombre: venta.clientes.nombre,
          email: venta.clientes.email,
        } : undefined,
        items: venta.venta_items?.map(item => ({
          producto: {
            nombre: item.productos?.nombre || 'N/A',
            codigo: item.productos?.codigo_sku || 'N/A',
          },
          cantidad: item.cantidad,
          precioUnitario: item.precio_unitario,
          subtotal: item.subtotal,
        })) || [],
      })) || [];

      set({ reporteVentas, loading: false });
      addNotification('success', 'Reporte de ventas generado exitosamente');

    } catch (error) {
      console.error('Error generando reporte de ventas:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error generando reporte de ventas',
        loading: false 
      });
      addNotification('error', 'Error generando reporte de ventas');
    }
  },

  generarReporteProductos: async () => {
    const { filtros } = get();
    set({ loading: true, error: null });

    try {
      // Consulta para obtener productos con estadísticas de ventas
      const { data, error } = await supabase
        .from('productos')
        .select(`
          id,
          nombre,
          codigo_sku,
          categoria,
          stock,
          precio_minorista,
          precio_mayorista,
          venta_items (
            cantidad,
            precio_unitario,
            subtotal,
            ventas (
              fecha
            )
          )
        `)
        .order('nombre');

      if (error) throw error;

      const reporteProductos: ReporteProductos[] = data?.map(producto => {
        const items = producto.venta_items || [];
        const itemsEnRango = items.filter(item => {
          const fechaVenta = item.ventas?.fecha;
          if (!fechaVenta) return false;
          
          const fechaInicio = new Date(filtros.fechaInicio + 'T00:00:00');
          const fechaFin = new Date(filtros.fechaFin + 'T23:59:59');
          const fechaVentaDate = new Date(fechaVenta);
          
          return fechaVentaDate >= fechaInicio && fechaVentaDate <= fechaFin;
        });

        const totalVentas = itemsEnRango.length;
        const cantidadVendida = itemsEnRango.reduce((sum, item) => sum + item.cantidad, 0);
        const ingresosGenerados = itemsEnRango.reduce((sum, item) => sum + item.subtotal, 0);

        return {
          id: producto.id,
          nombre: producto.nombre,
          codigo: producto.codigo_sku,
          categoria: producto.categoria,
          stock: producto.stock,
          precioMinorista: producto.precio_minorista,
          precioMayorista: producto.precio_mayorista,
          totalVentas,
          cantidadVendida,
          ingresosGenerados,
        };
      }) || [];

      set({ reporteProductos, loading: false });
      addNotification('success', 'Reporte de productos generado exitosamente');

    } catch (error) {
      console.error('Error generando reporte de productos:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error generando reporte de productos',
        loading: false 
      });
      addNotification('error', 'Error generando reporte de productos');
    }
  },

  generarReporteCaja: async () => {
    const { filtros } = get();
    set({ loading: true, error: null });

    try {
      // Consulta para obtener movimientos de caja por fecha
      const { data, error } = await supabase
        .from('movimientos_caja')
        .select(`
          id,
          tipo,
          concepto,
          monto,
          metodo_pago,
          fecha,
          empleados (
            nombre
          )
        `)
        .gte('fecha', filtros.fechaInicio + 'T00:00:00')
        .lte('fecha', filtros.fechaFin + 'T23:59:59')
        .order('fecha', { ascending: false });

      if (error) throw error;

      // Agrupar por fecha
      const movimientosPorFecha = data?.reduce((acc, movimiento) => {
        const fecha = movimiento.fecha.split('T')[0];
        if (!acc[fecha]) {
          acc[fecha] = [];
        }
        acc[fecha].push(movimiento);
        return acc;
      }, {} as Record<string, typeof data>) || {};

      const reporteCaja: ReporteCaja[] = Object.entries(movimientosPorFecha).map(([fecha, movimientos]) => {
        const ingresos = movimientos
          .filter(m => m.tipo === 'ingreso')
          .reduce((sum, m) => sum + m.monto, 0);

        const egresos = movimientos
          .filter(m => m.tipo === 'egreso')
          .reduce((sum, m) => sum + m.monto, 0);

        const ventas = movimientos
          .filter(m => m.concepto?.includes('Venta'))
          .reduce((sum, m) => sum + m.monto, 0);

        const apertura = 0; // Por ahora asumimos apertura en 0
        const saldoFinal = apertura + ingresos - egresos;

        return {
          fecha,
          empleado: movimientos[0]?.empleados?.nombre || 'N/A',
          apertura,
          ingresos,
          egresos,
          ventas,
          saldoFinal,
          movimientos: movimientos.map(m => ({
            tipo: m.tipo as 'ingreso' | 'egreso',
            concepto: m.concepto,
            monto: m.monto,
            metodoPago: m.metodo_pago || 'efectivo',
            fecha: m.fecha,
          })),
        };
      });

      set({ reporteCaja, loading: false });
      addNotification('success', 'Reporte de caja generado exitosamente');

    } catch (error) {
      console.error('Error generando reporte de caja:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error generando reporte de caja',
        loading: false 
      });
      addNotification('error', 'Error generando reporte de caja');
    }
  },

  exportarCSV: async (tipo) => {
    const { reporteVentas, reporteProductos, reporteCaja } = get();

    try {
      let csvContent = '';
      let filename = '';

      switch (tipo) {
        case 'ventas':
          filename = `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`;
          csvContent = 'ID,Fecha,Total,Método Pago,Tipo Precio,Empleado,Cliente\n';
          reporteVentas.forEach(venta => {
            csvContent += `${venta.id},${venta.fecha},${venta.total},${venta.metodoPago},${venta.tipoPrecio},"${venta.empleado.nombre.replace(/"/g, '""')}","${(venta.cliente?.nombre || 'Sin cliente').replace(/"/g, '""')}"\n`;
          });
          break;

        case 'productos':
          filename = `reporte_productos_${new Date().toISOString().split('T')[0]}.csv`;
          csvContent = 'ID,Nombre,SKU,Categoría,Stock,Precio Minorista,Precio Mayorista,Total Ventas,Cantidad Vendida,Ingresos Generados\n';
          reporteProductos.forEach(producto => {
            csvContent += `${producto.id},"${producto.nombre.replace(/"/g, '""')}",${producto.codigo},${producto.categoria},${producto.stock},${producto.precioMinorista},${producto.precioMayorista},${producto.totalVentas},${producto.cantidadVendida},${producto.ingresosGenerados}\n`;
          });
          break;

        case 'caja':
          filename = `reporte_caja_${new Date().toISOString().split('T')[0]}.csv`;
          csvContent = 'Fecha,Empleado,Apertura,Ingresos,Egresos,Ventas,Saldo Final\n';
          reporteCaja.forEach(caja => {
            csvContent += `${caja.fecha},"${caja.empleado.replace(/"/g, '""')}",${caja.apertura},${caja.ingresos},${caja.egresos},${caja.ventas},${caja.saldoFinal}\n`;
          });
          break;
      }

      // Crear y descargar archivo
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification('success', `Reporte ${tipo} exportado exitosamente`);

    } catch (error) {
      console.error('Error exportando CSV:', error);
      addNotification('error', 'Error exportando reporte');
    }
  },

  limpiarReportes: () => {
    set({
      reporteVentas: [],
      reporteProductos: [],
      reporteCaja: [],
      error: null,
    });
  },
  };
};
