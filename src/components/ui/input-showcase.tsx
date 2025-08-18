import React from 'react'
import { Input } from './input'
import { Textarea } from './textarea'
import { Label } from './label'

/**
 * Componente de demostración para mostrar las mejoras de inputs
 * Diseñado específicamente para motorepuestos con excelente contraste
 */
export const InputShowcase: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            🔧 Inputs Mejorados para Motorepuestos
          </h1>
          <p className="text-slate-600">
            Contraste optimizado y colores profesionales para mejor visibilidad
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna 1: Estados básicos */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-700 border-b-2 border-moto-blue pb-2">
              📋 Estados Básicos
            </h2>

            {/* Input normal */}
            <div>
              <Label>Nombre del Producto</Label>
              <Input 
                placeholder="Ej: Aceite 20W-50 Shell"
                helperText="Ingresa el nombre completo del producto"
              />
            </div>

            {/* Input con éxito */}
            <div>
              <Label>Código de Barras</Label>
              <Input 
                variant="success"
                defaultValue="7891234567890"
                placeholder="Código de barras"
                showIcon
                helperText="Código válido y registrado"
              />
            </div>

            {/* Input con error */}
            <div>
              <Label>Stock Mínimo</Label>
              <Input 
                variant="error"
                defaultValue="-5"
                placeholder="Cantidad mínima"
                showIcon
                helperText="El stock mínimo no puede ser negativo"
              />
            </div>

            {/* Input con advertencia */}
            <div>
              <Label>Precio de Venta</Label>
              <Input 
                variant="warning"
                defaultValue="150.00"
                placeholder="0.00"
                showIcon
                helperText="Precio por debajo del costo promedio"
              />
            </div>
          </div>

          {/* Columna 2: Diferentes tipos */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-700 border-b-2 border-moto-orange pb-2">
              🔧 Tipos de Input
            </h2>

            {/* Input de búsqueda */}
            <div>
              <Label>Buscar Producto</Label>
              <Input 
                type="search"
                placeholder="Buscar por nombre, código o marca..."
                helperText="Escribe para buscar en el inventario"
              />
            </div>

            {/* Input numérico */}
            <div>
              <Label>Cantidad en Stock</Label>
              <Input 
                type="number"
                placeholder="0"
                min="0"
                helperText="Cantidad actual disponible"
              />
            </div>

            {/* Input de fecha */}
            <div>
              <Label>Fecha de Vencimiento</Label>
              <Input 
                type="date"
                helperText="Para productos con fecha de caducidad"
              />
            </div>

            {/* Textarea */}
            <div>
              <Label>Descripción del Producto</Label>
              <Textarea 
                placeholder="Describe las características principales del producto..."
                helperText="Información detallada para el cliente"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Sección de formulario completo */}
        <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-700 mb-6 flex items-center">
            <span className="bg-moto-blue text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
              🏪
            </span>
            Formulario de Producto Completo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Marca del Producto</Label>
              <Input 
                placeholder="Ej: Shell, Mobil, Castrol"
                helperText="Selecciona la marca correspondiente"
              />
            </div>

            <div>
              <Label>Categoría</Label>
              <Input 
                placeholder="Ej: Lubricantes, Filtros, Repuestos"
                helperText="Categoría principal del producto"
              />
            </div>

            <div>
              <Label>Precio de Compra</Label>
              <Input 
                type="number"
                step="0.01"
                placeholder="0.00"
                helperText="Precio al que compras el producto"
              />
            </div>

            <div>
              <Label>Margen de Ganancia (%)</Label>
              <Input 
                type="number"
                min="0"
                max="100"
                placeholder="30"
                helperText="Porcentaje de ganancia deseado"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Observaciones Especiales</Label>
              <Textarea 
                placeholder="Notas importantes sobre almacenamiento, compatibilidad, etc."
                helperText="Información adicional para el manejo del producto"
                rows={3}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-moto font-medium hover:border-slate-400 transition-colors">
              Cancelar
            </button>
            <button className="px-6 py-3 bg-moto-blue text-white rounded-moto font-medium hover:bg-blue-600 transition-colors shadow-md">
              Guardar Producto
            </button>
          </div>
        </div>

        {/* Información sobre las mejoras */}
        <div className="mt-8 p-6 bg-gradient-to-r from-moto-blue/10 to-moto-orange/10 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">✨ Mejoras Implementadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-slate-700 mb-2">🎨 Colores y Contraste:</h4>
              <ul className="space-y-1 text-slate-600">
                <li>• Bordes más gruesos (2px) para mejor visibilidad</li>
                <li>• Colores apropiados para motorepuestos</li>
                <li>• Fondos sutiles para estados de error/éxito</li>
                <li>• Placeholders más legibles</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-700 mb-2">🔧 Funcionalidad:</h4>
              <ul className="space-y-1 text-slate-600">
                <li>• Estados visuales claros (error, éxito, advertencia)</li>
                <li>• Iconos integrados opcionales</li>
                <li>• Texto de ayuda contextual</li>
                <li>• Transiciones suaves y profesionales</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
