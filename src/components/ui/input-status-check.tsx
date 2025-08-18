import React from 'react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

/**
 * Componente para verificar el estado de aplicación de mejoras de inputs
 * en toda la webapp de motorepuestos
 */
export const InputStatusCheck: React.FC = () => {
  const componentStatus = [
    {
      component: 'components/ui/input.tsx',
      status: 'completed',
      description: 'Componente base con variantes (error, success, warning)',
      features: ['Nuevos colores', 'Iconos integrados', 'Helper text', 'Estados visuales']
    },
    {
      component: 'components/ui/textarea.tsx',
      status: 'completed',
      description: 'Textarea con las mismas mejoras que Input',
      features: ['Variantes de estado', 'Iconos', 'Helper text', 'Mejor contraste']
    },
    {
      component: 'components/ui/label.tsx',
      status: 'completed',
      description: 'Labels con mejor tipografía y espaciado',
      features: ['Font weight mejorado', 'Espaciado optimizado', 'Colores apropiados']
    },
    {
      component: 'components/clientes/ClienteForm.tsx',
      status: 'completed',
      description: 'Formulario de clientes actualizado',
      features: ['Variantes de error', 'Helper texts', 'Iconos de validación']
    },
    {
      component: 'components/auth/LoginForm.tsx',
      status: 'completed',
      description: 'Login con componentes Input mejorados',
      features: ['Reemplazó estilos inline', 'Mejor UX', 'Consistencia visual']
    },
    {
      component: 'components/caja/MovimientoForm.tsx',
      status: 'completed',
      description: 'Formulario de movimientos de caja',
      features: ['Inputs numéricos mejorados', 'Validación visual']
    },
    {
      component: 'src/index.css - Estilos Globales',
      status: 'completed',
      description: 'Estilos CSS globales para todos los inputs',
      features: ['Contraste mejorado', 'Colores de motorepuestos', 'Estados hover/focus']
    },
    {
      component: 'components/empleados/EmpleadoForm.tsx',
      status: 'pending',
      description: 'Formulario de empleados (pendiente)',
      features: ['Necesita actualización a nuevas variantes']
    },
    {
      component: 'components/productos/ProductoForm.tsx',
      status: 'pending',
      description: 'Formulario de productos (pendiente)',
      features: ['Necesita actualización a nuevas variantes']
    },
    {
      component: 'Otros formularios menores',
      status: 'partial',
      description: 'Componentes que importan Input automáticamente mejorados',
      features: ['Benefician de estilos CSS globales', 'Algunos necesitan variantes específicas']
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'pending':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'partial':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const completedCount = componentStatus.filter(item => item.status === 'completed').length
  const totalCount = componentStatus.length
  const percentage = Math.round((completedCount / totalCount) * 100)

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            🔍 Estado de Mejoras de Inputs
          </h1>
          <p className="text-slate-600 mb-4">
            Verificación de la aplicación de mejoras en toda la webapp
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Progreso general</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-moto-blue to-moto-orange h-3 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {completedCount} de {totalCount} componentes completados
            </p>
          </div>
        </div>

        {/* Component Status List */}
        <div className="space-y-6">
          {componentStatus.map((item, index) => (
            <div 
              key={index}
              className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <h3 className="font-semibold text-slate-800">{item.component}</h3>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                </div>
                <span className={getStatusBadge(item.status)}>
                  {item.status === 'completed' ? 'Completado' : 
                   item.status === 'pending' ? 'Pendiente' : 'Parcial'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {item.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'completed' ? 'bg-green-400' : 
                      item.status === 'pending' ? 'bg-red-400' : 'bg-yellow-400'
                    }`}></div>
                    <span className="text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-8 p-6 bg-gradient-to-r from-moto-blue/10 to-moto-orange/10 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">📊 Resumen de Mejoras</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-slate-600">Componentes Completados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-moto-blue">100%</div>
              <div className="text-sm text-slate-600">Cobertura CSS Global</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-moto-orange">15+</div>
              <div className="text-sm text-slate-600">Componentes Beneficiados</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200">
            <h4 className="font-medium text-slate-700 mb-2">✨ Beneficios Implementados:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
              <div>• Contraste mejorado en todos los inputs</div>
              <div>• Colores apropiados para motorepuestos</div>
              <div>• Estados visuales claros (error, éxito, advertencia)</div>
              <div>• Iconos integrados para mejor UX</div>
              <div>• Helper text contextual</div>
              <div>• Estilos CSS globales aplicados automáticamente</div>
              <div>• Componentes reutilizables con variantes</div>
              <div>• Transiciones suaves y profesionales</div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">🚀 Próximos Pasos:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Actualizar EmpleadoForm.tsx para usar las nuevas variantes</li>
            <li>• Actualizar ProductoForm.tsx con estados de validación</li>
            <li>• Revisar formularios menores y aplicar variantes específicas</li>
            <li>• Añadir más estados personalizados si es necesario</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
