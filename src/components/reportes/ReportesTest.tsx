import React, { useEffect } from 'react';
import { useAppStore } from '../../store';

const ReportesTest: React.FC = () => {
  const {
    filtros,
    reporteVentas,
    reporteProductos,
    reporteCaja,
    loading,
    error,
    generarReporteVentas,
    generarReporteProductos,
    generarReporteCaja,
    empleados,
    clientes,
    fetchEmpleados,
    fetchClientes
  } = useAppStore();

  useEffect(() => {
    fetchEmpleados();
    fetchClientes();
  }, [fetchEmpleados, fetchClientes]);

  const testReportes = async () => {
    console.log('=== INICIANDO PRUEBAS DE REPORTES ===');
    
    // Test 1: Reporte de Ventas
    console.log('1. Probando reporte de ventas...');
    try {
      await generarReporteVentas();
      console.log('✅ Reporte de ventas generado:', reporteVentas.length, 'ventas');
    } catch (error) {
      console.error('❌ Error en reporte de ventas:', error);
    }

    // Test 2: Reporte de Productos
    console.log('2. Probando reporte de productos...');
    try {
      await generarReporteProductos();
      console.log('✅ Reporte de productos generado:', reporteProductos.length, 'productos');
    } catch (error) {
      console.error('❌ Error en reporte de productos:', error);
    }

    // Test 3: Reporte de Caja
    console.log('3. Probando reporte de caja...');
    try {
      await generarReporteCaja();
      console.log('✅ Reporte de caja generado:', reporteCaja.length, 'registros');
    } catch (error) {
      console.error('❌ Error en reporte de caja:', error);
    }

    console.log('=== FINALIZADAS PRUEBAS DE REPORTES ===');
  };

  return (
    <div className="p-6 bg-dark-bg-primary min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-dark-text-primary mb-6">
          Pruebas de Reportes
        </h1>

        <div className="bg-dark-bg-secondary p-6 rounded-lg shadow-dark-md border border-dark-border mb-6">
          <h2 className="text-lg font-semibold mb-4">Estado Actual</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-dark-text-secondary">Empleados cargados:</p>
              <p className="text-lg font-bold text-blue-600">{empleados.empleados.length}</p>
            </div>
            <div>
              <p className="text-sm text-dark-text-secondary">Clientes cargados:</p>
              <p className="text-lg font-bold text-green-600">{clientes.clientes.length}</p>
            </div>
            <div>
              <p className="text-sm text-dark-text-secondary">Estado:</p>
              <p className={`text-lg font-bold ${loading ? 'text-yellow-600' : 'text-green-600'}`}>
                {loading ? 'Cargando...' : 'Listo'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-dark-bg-secondary p-6 rounded-lg shadow-dark-md border border-dark-border mb-6">
          <h2 className="text-lg font-semibold mb-4">Filtros Actuales</h2>
          <pre className="bg-dark-bg-tertiary p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(filtros, null, 2)}
          </pre>
        </div>

        <div className="bg-dark-bg-secondary p-6 rounded-lg shadow-dark-md border border-dark-border mb-6">
          <h2 className="text-lg font-semibold mb-4">Acciones de Prueba</h2>
          <div className="flex gap-4">
            <button
              onClick={testReportes}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Ejecutar Todas las Pruebas
            </button>
            <button
              onClick={generarReporteVentas}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Probar Reporte Ventas
            </button>
            <button
              onClick={generarReporteProductos}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              Probar Reporte Productos
            </button>
            <button
              onClick={generarReporteCaja}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              Probar Reporte Caja
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-red-700 font-semibold">Error:</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-dark-bg-secondary p-6 rounded-lg shadow-dark-md border border-dark-border">
            <h3 className="text-lg font-semibold mb-4">Reporte de Ventas</h3>
            <p className="text-sm text-dark-text-secondary mb-2">
              Ventas encontradas: {reporteVentas.length}
            </p>
            {reporteVentas.length > 0 && (
              <div className="text-sm">
                <p>Total: ${reporteVentas.reduce((sum, v) => sum + v.total, 0).toLocaleString()}</p>
                <p>Promedio: ${(reporteVentas.reduce((sum, v) => sum + v.total, 0) / reporteVentas.length).toFixed(2)}</p>
              </div>
            )}
          </div>

          <div className="bg-dark-bg-secondary p-6 rounded-lg shadow-dark-md border border-dark-border">
            <h3 className="text-lg font-semibold mb-4">Reporte de Productos</h3>
            <p className="text-sm text-dark-text-secondary mb-2">
              Productos encontrados: {reporteProductos.length}
            </p>
            {reporteProductos.length > 0 && (
              <div className="text-sm">
                <p>Ingresos totales: ${reporteProductos.reduce((sum, p) => sum + p.ingresosGenerados, 0).toLocaleString()}</p>
                <p>Productos vendidos: {reporteProductos.reduce((sum, p) => sum + p.cantidadVendida, 0)}</p>
              </div>
            )}
          </div>

          <div className="bg-dark-bg-secondary p-6 rounded-lg shadow-dark-md border border-dark-border">
            <h3 className="text-lg font-semibold mb-4">Reporte de Caja</h3>
            <p className="text-sm text-dark-text-secondary mb-2">
              Registros encontrados: {reporteCaja.length}
            </p>
            {reporteCaja.length > 0 && (
              <div className="text-sm">
                <p>Ingresos totales: ${reporteCaja.reduce((sum, c) => sum + c.ingresos, 0).toLocaleString()}</p>
                <p>Egresos totales: ${reporteCaja.reduce((sum, c) => sum + c.egresos, 0).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportesTest;

