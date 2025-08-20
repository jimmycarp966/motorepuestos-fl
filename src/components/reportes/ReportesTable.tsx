import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  Users, 
  CreditCard, 
  Package,
  TrendingUp,
  DollarSign,
  BarChart3,
  RefreshCw,
  X,
  Eye
} from 'lucide-react';
import { DateUtils } from '../../lib/dateUtils';
import CajaDiariaModal from '../caja/CajaDiariaModal';

const ReportesTable: React.FC = () => {
  const {
    filtros,
    reporteVentas,
    reporteProductos,
    reporteCaja,
    loading,
    error,
    setFiltros,
    generarReporteVentas,
    generarReporteProductos,
    generarReporteCaja,
    exportarCSV,
    limpiarReportes,
    empleados,
    clientes,
    fetchEmpleados,
    fetchClientes
  } = useAppStore();

  const [tipoReporte, setTipoReporte] = useState<'ventas' | 'productos' | 'caja'>('ventas');
  const [showFiltros, setShowFiltros] = useState(false);
  const [cajaDiariaModal, setCajaDiariaModal] = useState<{ isOpen: boolean; fecha: string }>({
    isOpen: false,
    fecha: ''
  });

  useEffect(() => {
    fetchEmpleados();
    fetchClientes();
  }, [fetchEmpleados, fetchClientes]);

  const handleGenerarReporte = async () => {
    switch (tipoReporte) {
      case 'ventas':
        await generarReporteVentas();
        break;
      case 'productos':
        await generarReporteProductos();
        break;
      case 'caja':
        await generarReporteCaja();
        break;
    }
  };

  const handleExportar = () => {
    exportarCSV(tipoReporte);
  };

  const getReporteData = () => {
    switch (tipoReporte) {
      case 'ventas':
        return reporteVentas;
      case 'productos':
        return reporteProductos;
      case 'caja':
        return reporteCaja;
      default:
        return [];
    }
  };

  const getTotalVentas = () => {
    return reporteVentas.reduce((sum, venta) => sum + venta.total, 0);
  };

  const getTotalProductos = () => {
    return reporteProductos.reduce((sum, producto) => sum + producto.ingresosGenerados, 0);
  };

  const getTotalCaja = () => {
    return reporteCaja.reduce((sum, caja) => sum + caja.saldoFinal, 0);
  };

  const getMetodosPagoStats = () => {
    const stats = reporteVentas.reduce((acc, venta) => {
      const metodo = venta.metodoPago;
      if (!acc[metodo]) {
        acc[metodo] = { count: 0, total: 0 };
      }
      acc[metodo].count++;
      acc[metodo].total += venta.total;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    return Object.entries(stats).map(([metodo, data]) => ({
      metodo,
      count: data.count,
      total: data.total,
      porcentaje: ((data.count / reporteVentas.length) * 100).toFixed(1)
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark-text-primary">Reportes</h1>
          <p className="text-dark-text-secondary">Genera y exporta reportes detallados del negocio</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button
            onClick={handleGenerarReporte}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {loading ? 'Generando...' : 'Generar Reporte'}
          </button>
        </div>
      </div>

      {/* Filtros */}
      {showFiltros && (
        <div className="bg-dark-bg-secondary p-6 rounded-lg shadow-dark-md border border-dark-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                className="w-full px-3 py-2 border border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                className="w-full px-3 py-2 border border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-1">
                Empleado
              </label>
              <select
                value={filtros.empleadoId || ''}
                onChange={(e) => setFiltros({ ...filtros, empleadoId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos los empleados</option>
                {empleados.empleados.map((empleado) => (
                  <option key={empleado.id} value={empleado.id}>
                    {empleado.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-1">
                Cliente
              </label>
              <select
                value={filtros.clienteId || ''}
                onChange={(e) => setFiltros({ ...filtros, clienteId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos los clientes</option>
                {clientes.clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-1">
                Método de Pago
              </label>
              <select
                value={filtros.metodoPago || ''}
                onChange={(e) => setFiltros({ ...filtros, metodoPago: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos los métodos</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="cuenta_corriente">Cuenta Corriente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-1">
                Tipo de Precio
              </label>
              <select
                value={filtros.tipoPrecio || ''}
                onChange={(e) => setFiltros({ ...filtros, tipoPrecio: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos los tipos</option>
                <option value="minorista">Minorista</option>
                <option value="mayorista">Mayorista</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Selector de Tipo de Reporte */}
      <div className="bg-dark-bg-secondary p-4 rounded-lg shadow-dark-md border border-dark-border">
        <div className="flex gap-2">
          <button
            onClick={() => setTipoReporte('ventas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              tipoReporte === 'ventas'
                ? 'bg-blue-600 text-white'
                : 'bg-dark-bg-tertiary text-dark-text-primary hover:bg-dark-bg-secondary'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Ventas
          </button>
          <button
            onClick={() => setTipoReporte('productos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              tipoReporte === 'productos'
                ? 'bg-blue-600 text-white'
                : 'bg-dark-bg-tertiary text-dark-text-primary hover:bg-dark-bg-secondary'
            }`}
          >
            <Package className="w-4 h-4" />
            Productos
          </button>
          <button
            onClick={() => setTipoReporte('caja')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              tipoReporte === 'caja'
                ? 'bg-blue-600 text-white'
                : 'bg-dark-bg-tertiary text-dark-text-primary hover:bg-dark-bg-secondary'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Caja
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {tipoReporte === 'ventas' && reporteVentas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-bg-secondary p-4 rounded-lg shadow-dark-md border border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-text-secondary">Total Ventas</p>
                <p className="text-2xl font-bold text-green-600">
                  ${getTotalVentas().toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-dark-bg-secondary p-4 rounded-lg shadow-dark-md border border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-text-secondary">Cantidad de Ventas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reporteVentas.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-dark-bg-secondary p-4 rounded-lg shadow-dark-md border border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-text-secondary">Promedio por Venta</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${(getTotalVentas() / reporteVentas.length).toFixed(2)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Métodos de Pago (solo para reporte de ventas) */}
      {tipoReporte === 'ventas' && reporteVentas.length > 0 && (
        <div className="bg-dark-bg-secondary p-6 rounded-lg shadow-dark-md border border-dark-border">
          <h3 className="text-lg font-semibold mb-4">Ventas por Método de Pago</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getMetodosPagoStats().map((stat) => (
              <div key={stat.metodo} className="bg-dark-bg-tertiary p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-dark-text-primary capitalize">
                    {stat.metodo}
                  </span>
                  <span className="text-xs text-dark-text-secondary">{stat.porcentaje}%</span>
                </div>
                <p className="text-lg font-bold text-green-600">
                  ${stat.total.toLocaleString()}
                </p>
                <p className="text-sm text-dark-text-secondary">{stat.count} ventas</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de Datos */}
      <div className="bg-dark-bg-secondary rounded-lg shadow-dark-md border border-dark-border">
        <div className="p-4 border-b border-dark-border flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {tipoReporte === 'ventas' && 'Reporte de Ventas'}
            {tipoReporte === 'productos' && 'Reporte de Productos'}
            {tipoReporte === 'caja' && 'Reporte de Caja'}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleExportar}
              disabled={getReporteData().length === 0}
              className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
            <button
              onClick={limpiarReportes}
              className="flex items-center gap-2 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-dark-text-secondary">Generando reporte...</p>
          </div>
        ) : getReporteData().length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-dark-border" />
            <p className="mt-2 text-dark-text-secondary">No hay datos para mostrar</p>
            <p className="text-sm text-dark-text-secondary">Genera un reporte para ver los datos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {tipoReporte === 'ventas' && (
              <table className="w-full">
                <thead className="bg-dark-bg-tertiary">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      Método Pago
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-dark-bg-secondary divide-y divide-dark-border">
                  {reporteVentas.map((venta) => (
                    <tr key={venta.id} className="hover:bg-dark-bg-tertiary">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-text-primary">
                        {DateUtils.formatDate(venta.fecha)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-text-primary">
                        {venta.id.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-text-primary">
                        {venta.empleado.nombre}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-text-primary">
                        {venta.cliente?.nombre || 'Sin cliente'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                          venta.metodoPago === 'efectivo' ? 'bg-green-100 text-green-800' :
                          venta.metodoPago === 'tarjeta' ? 'bg-blue-100 text-blue-800' :
                          venta.metodoPago === 'transferencia' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {venta.metodoPago}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${venta.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tipoReporte === 'productos' && (
              <table className="w-full">
                <thead className="bg-dark-bg-tertiary">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      Ventas
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      Cantidad Vendida
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      Ingresos
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-dark-bg-secondary divide-y divide-dark-border">
                  {reporteProductos.map((producto) => (
                    <tr key={producto.id} className="hover:bg-dark-bg-tertiary">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-dark-text-primary">
                        {producto.nombre}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-text-primary">
                        {producto.codigo}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-text-primary">
                        {producto.categoria}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          producto.stock <= 0 ? 'bg-red-100 text-red-800' :
                          producto.stock <= 5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {producto.stock}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-text-primary">
                        {producto.totalVentas}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-text-primary">
                        {producto.cantidadVendida}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${producto.ingresosGenerados.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tipoReporte === 'caja' && (
              <table className="w-full">
                <thead className="bg-dark-bg-tertiary">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      Apertura
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      Ingresos
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      Egresos
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      Ventas
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      Saldo Final
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-dark-bg-secondary divide-y divide-dark-border">
                  {reporteCaja.map((caja, index) => (
                    <tr key={index} className="hover:bg-dark-bg-tertiary">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-text-primary">
                        {DateUtils.formatDate(caja.fecha)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-text-primary">
                        {caja.empleado}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-text-primary">
                        ${caja.apertura.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600">
                        ${caja.ingresos.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600">
                        ${caja.egresos.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600">
                        ${caja.ventas.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-dark-text-primary">
                        ${caja.saldoFinal.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-text-primary">
                        <button
                          onClick={() => setCajaDiariaModal({ isOpen: true, fecha: caja.fecha })}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          Ver Caja
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal de Caja Diaria */}
      <CajaDiariaModal
        isOpen={cajaDiariaModal.isOpen}
        onClose={() => setCajaDiariaModal({ isOpen: false, fecha: '' })}
        fecha={cajaDiariaModal.fecha}
      />
    </div>
  );
};

export default ReportesTable;
