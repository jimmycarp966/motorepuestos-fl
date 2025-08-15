import React from 'react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { X, User, Calendar, DollarSign, Package } from 'lucide-react'

interface VentaDetailsProps {
  venta: any
  onClose: () => void
}

export const VentaDetails: React.FC<VentaDetailsProps> = ({ venta, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Detalles de Venta</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Información general */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm text-gray-600">Fecha:</span>
              </div>
              <p className="font-medium">
                {new Date(venta.fecha).toLocaleDateString()} {new Date(venta.fecha).toLocaleTimeString()}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm text-gray-600">Total:</span>
              </div>
              <p className="font-medium text-green-600">${venta.total.toFixed(2)}</p>
            </div>
          </div>

          {/* Cliente */}
          <div className="space-y-2">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-sm text-gray-600">Cliente:</span>
            </div>
            <p className="font-medium">
              {venta.cliente ? venta.cliente.nombre : 'Sin cliente'}
            </p>
          </div>

          {/* Empleado */}
          <div className="space-y-2">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-sm text-gray-600">Empleado:</span>
            </div>
            <p className="font-medium">{venta.empleado?.nombre}</p>
          </div>

          {/* Productos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Productos
            </h3>
            
            {venta.items && venta.items.length > 0 ? (
              <div className="space-y-3">
                {venta.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.producto?.nombre}</p>
                      <p className="text-sm text-gray-600">
                        {item.cantidad} x ${item.precio_unitario}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay productos en esta venta</p>
            )}
          </div>

          {/* Resumen */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span className="text-green-600">${venta.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Botón cerrar */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={onClose}
              variant="outline"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
