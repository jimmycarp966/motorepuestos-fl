import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { 
  X, 
  Download, 
  Eye, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { DateUtils } from '../../lib/dateUtils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CajaDiariaModalProps {
  isOpen: boolean;
  onClose: () => void;
  fecha: string;
}

const CajaDiariaModal: React.FC<CajaDiariaModalProps> = ({ isOpen, onClose, fecha }) => {
  const { caja, fetchMovimientos } = useAppStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && fecha) {
      fetchMovimientos();
    }
  }, [isOpen, fecha, fetchMovimientos]);

  // Filtrar movimientos por fecha
  const movimientosDelDia = caja.movimientos.filter(mov => {
    if (mov.estado === 'eliminada') return false;
    const movimientoFecha = typeof mov.fecha === 'string' ? mov.fecha.split('T')[0] : mov.fecha;
    return movimientoFecha === fecha;
  });

  // Calcular estadísticas
  const totalIngresos = movimientosDelDia
    .filter(mov => mov.tipo === 'ingreso')
    .reduce((sum, mov) => sum + mov.monto, 0);

  const totalEgresos = movimientosDelDia
    .filter(mov => mov.tipo === 'egreso')
    .reduce((sum, mov) => sum + mov.monto, 0);

  const saldoFinal = totalIngresos - totalEgresos;

  // Agrupar movimientos por tipo
  const ingresos = movimientosDelDia.filter(mov => mov.tipo === 'ingreso');
  const egresos = movimientosDelDia.filter(mov => mov.tipo === 'egreso');

  const exportarPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Reporte de Caja Diaria', 105, 20, { align: 'center' });
    
    // Fecha
    doc.setFontSize(12);
    doc.text(`Fecha: ${DateUtils.formatDate(fecha)}`, 20, 35);
    
    // Estadísticas generales
    doc.setFontSize(14);
    doc.text('Resumen del Día', 20, 50);
    
    doc.setFontSize(10);
    doc.text(`Total Ingresos: $${totalIngresos.toLocaleString()}`, 20, 60);
    doc.text(`Total Egresos: $${totalEgresos.toLocaleString()}`, 20, 70);
    doc.text(`Saldo Final: $${saldoFinal.toLocaleString()}`, 20, 80);
    doc.text(`Cantidad de Movimientos: ${movimientosDelDia.length}`, 20, 90);
    
    // Tabla de ingresos
    if (ingresos.length > 0) {
      doc.setFontSize(12);
      doc.text('Ingresos del Día', 20, 110);
      
      const ingresosData = ingresos.map(mov => [
        DateUtils.formatDateTime(mov.fecha),
        mov.concepto,
        mov.empleado?.nombre || 'N/A',
        mov.metodo_pago,
        `$${mov.monto.toLocaleString()}`
      ]);
      
      autoTable(doc, {
        head: [['Hora', 'Concepto', 'Empleado', 'Método', 'Monto']],
        body: ingresosData,
        startY: 115,
        margin: { left: 20 },
        styles: { fontSize: 8 },
        headStyles: { fillColor: [34, 197, 94] }
      });
    }
    
    // Tabla de egresos
    if (egresos.length > 0) {
      const startY = ingresos.length > 0 ? (doc as any).lastAutoTable.finalY + 10 : 110;
      
      doc.setFontSize(12);
      doc.text('Egresos del Día', 20, startY);
      
      const egresosData = egresos.map(mov => [
        DateUtils.formatDateTime(mov.fecha),
        mov.concepto,
        mov.empleado?.nombre || 'N/A',
        mov.metodo_pago,
        `$${mov.monto.toLocaleString()}`
      ]);
      
      autoTable(doc, {
        head: [['Hora', 'Concepto', 'Empleado', 'Método', 'Monto']],
        body: egresosData,
        startY: startY + 5,
        margin: { left: 20 },
        styles: { fontSize: 8 },
        headStyles: { fillColor: [239, 68, 68] }
      });
    }
    
    // Guardar PDF
    doc.save(`caja-diaria-${fecha}.pdf`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Caja Diaria</h2>
              <p className="text-sm text-gray-600">
                {DateUtils.formatDate(fecha)} - {movimientosDelDia.length} movimientos
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportarPDF}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Cerrar
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando movimientos...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Total Ingresos</p>
                      <p className="text-2xl font-bold text-green-700">
                        ${totalIngresos.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 font-medium">Total Egresos</p>
                      <p className="text-2xl font-bold text-red-700">
                        ${totalEgresos.toLocaleString()}
                      </p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Saldo Final</p>
                      <p className="text-2xl font-bold text-blue-700">
                        ${saldoFinal.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Movimientos</p>
                      <p className="text-2xl font-bold text-gray-700">
                        {movimientosDelDia.length}
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Ingresos */}
              {ingresos.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Ingresos ({ingresos.length})
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-green-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                            Hora
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                            Concepto
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                            Empleado
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                            Método
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                            Monto
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {ingresos.map((mov) => (
                          <tr key={mov.id} className="hover:bg-green-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {DateUtils.formatDateTime(mov.fecha)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {mov.concepto}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {mov.empleado?.nombre || 'N/A'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                                {mov.metodo_pago}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              ${mov.monto.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Egresos */}
              {egresos.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2">
                      <TrendingDown className="w-5 h-5" />
                      Egresos ({egresos.length})
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                            Hora
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                            Concepto
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                            Empleado
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                            Método
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                            Monto
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {egresos.map((mov) => (
                          <tr key={mov.id} className="hover:bg-red-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {DateUtils.formatDateTime(mov.fecha)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {mov.concepto}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {mov.empleado?.nombre || 'N/A'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 capitalize">
                                {mov.metodo_pago}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                              ${mov.monto.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sin movimientos */}
              {movimientosDelDia.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-600">No hay movimientos para esta fecha</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CajaDiariaModal;
