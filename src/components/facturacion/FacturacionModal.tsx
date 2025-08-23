import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { getAFIPService } from '../../lib/afipBrowserService';
import { supabase } from '../../lib/supabase';

interface FacturacionModalProps {
  ventaId: string;
  total: number;
  clienteId?: string;
  onClose: () => void;
  onSuccess: (comprobante: any) => void;
}

interface Cliente {
  id: string;
  nombre: string;
  documento?: string;
  email?: string;
}

interface VentaItem {
  id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto: {
    nombre: string;
    precio_minorista: number;
  };
}

export const FacturacionModal: React.FC<FacturacionModalProps> = ({
  ventaId,
  total,
  clienteId,
  onClose,
  onSuccess
}) => {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [items, setItems] = useState<VentaItem[]>([]);
  const [tipoComprobante, setTipoComprobante] = useState('B');
  const [tipoDocumento, setTipoDocumento] = useState('96');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar datos de la venta
  useEffect(() => {
    cargarDatosVenta();
  }, [ventaId]);

  const cargarDatosVenta = async () => {
    try {
      // Cargar cliente si existe
      if (clienteId) {
        const { data: clienteData } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', clienteId)
          .single();
        
        if (clienteData) {
          setCliente(clienteData);
          setNumeroDocumento(clienteData.documento || '');
        }
      }

      // Cargar items de la venta
      const { data: itemsData } = await supabase
        .from('venta_items')
        .select(`
          id,
          cantidad,
          precio_unitario,
          subtotal,
          producto_id
        `)
        .eq('venta_id', ventaId);

      if (itemsData) {
        setItems(itemsData);
      }
    } catch (error) {
      console.error('Error cargando datos de venta:', error);
      setError('Error cargando datos de la venta');
    }
  };

  const generarFactura = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const afipService = getAFIPService();
      
      // Calcular importes
      const impNeto = total / 1.21; // Asumiendo 21% IVA
      const impIVA = total - impNeto;

      const request = {
        tipoComprobante,
        puntoVenta: 1,
        concepto: 1, // Productos
        tipoDoc: parseInt(tipoDocumento),
        nroDoc: numeroDocumento,
        fechaServicio: new Date().toISOString().split('T')[0],
        fechaVtoPago: new Date().toISOString().split('T')[0],
        impTotal: total,
        impTotConc: 0,
        impNeto,
        impOpEx: 0,
        impIVA,
        impTrib: 0,
        items: items.map(item => ({
          descripcion: 'Producto', // Simplificado sin join anidado
          cantidad: item.cantidad,
          precioUnitario: item.precio_unitario,
          bonif: 0,
          impIVA: item.subtotal * 0.21,
          impTotal: item.subtotal
        }))
      };

      // Generar comprobante
      const response = await afipService.generarComprobante(request);

      // Guardar en base de datos
      const { data: comprobante, error: dbError } = await supabase
        .from('comprobantes_electronicos')
        .insert({
          venta_id: ventaId,
          tipo_comprobante: tipoComprobante,
          punto_venta: 1,
          numero_comprobante: 1,
          cae: response.cae,
          cae_vto: response.caeVto,
          resultado: response.resultado,
          observaciones: response.observaciones,
          xml_request: JSON.stringify(request),
          xml_response: JSON.stringify(response)
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      setSuccess(`Factura ${tipoComprobante} generada exitosamente. CAE: ${response.cae}`);
      onSuccess(comprobante);

    } catch (error) {
      console.error('Error generando factura:', error);
      setError('Error generando la factura electrónica');
    } finally {
      setLoading(false);
    }
  };

  const getTipoComprobanteLabel = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      'A': 'Factura A',
      'B': 'Factura B',
      'C': 'Factura C'
    };
    return tipos[tipo] || tipo;
  };

  const getTipoDocumentoLabel = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      '80': 'CUIT',
      '96': 'DNI',
      '99': 'Sin Calificar'
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Generar Factura Electrónica</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Información de la venta */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Venta ID</Label>
              <Input value={ventaId} disabled />
            </div>
            <div>
              <Label>Total</Label>
              <Input value={`$${total.toFixed(2)}`} disabled />
            </div>
          </div>

          {/* Tipo de comprobante */}
          <div>
            <Label>Tipo de Comprobante</Label>
            <div className="flex gap-2 mt-2">
              {['A', 'B', 'C'].map(tipo => (
                <Button
                  key={tipo}
                  variant={tipoComprobante === tipo ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTipoComprobante(tipo)}
                >
                  {getTipoComprobanteLabel(tipo)}
                </Button>
              ))}
            </div>
          </div>

          {/* Información del cliente */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Documento</Label>
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="80">CUIT</option>
                <option value="96">DNI</option>
                <option value="99">Sin Calificar</option>
              </select>
            </div>
            <div>
              <Label>Número de Documento</Label>
              <Input
                value={numeroDocumento}
                onChange={(e) => setNumeroDocumento(e.target.value)}
                placeholder="Ingrese número de documento"
              />
            </div>
          </div>

          {/* Cliente */}
          {cliente && (
            <div className="p-4 bg-dark-bg-tertiary rounded-md">
              <Label>Cliente</Label>
              <div className="mt-2">
                <p className="font-medium">{cliente.nombre}</p>
                {cliente.email && <p className="text-sm text-dark-text-secondary">{cliente.email}</p>}
              </div>
            </div>
          )}

          {/* Items de la venta */}
          <div>
            <Label>Items de la Venta</Label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-dark-bg-tertiary rounded">
                  <div>
                    <p className="font-medium">Producto</p>
                    <p className="text-sm text-dark-text-secondary">
                      {item.cantidad} x ${item.precio_unitario.toFixed(2)}
                    </p>
                  </div>
                  <Badge>${item.subtotal.toFixed(2)}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen de importes */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-md">
            <div>
              <Label className="text-sm">Neto</Label>
              <p className="font-medium">${(total / 1.21).toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-sm">IVA (21%)</Label>
              <p className="font-medium">${(total - total / 1.21).toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-sm">Total</Label>
              <p className="font-medium">${total.toFixed(2)}</p>
            </div>
          </div>

          {/* Mensajes de error/éxito */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={generarFactura} 
              disabled={loading || !numeroDocumento}
            >
              {loading ? 'Generando...' : 'Generar Factura'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
