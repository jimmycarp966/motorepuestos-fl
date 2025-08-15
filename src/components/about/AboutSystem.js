import React from 'react';
import SiriusLogo from '../ui/SiriusLogo';
import { 
  Wrench, 
  Database, 
  Shield, 
  Zap, 
  Users, 
  BarChart3,
  CheckCircle,
  Star
} from 'lucide-react';

const AboutSystem = () => {
  const features = [
    {
      icon: <Wrench className="h-6 w-6" />,
      title: 'Gestión de Productos',
      description: 'Control completo del inventario con categorías específicas para motorepuestos'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Gestión de Clientes',
      description: 'Base de datos completa con historial de compras y preferencias'
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Reportes Avanzados',
      description: 'Análisis detallado de ventas, inventario y rendimiento del negocio'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Seguridad Robusta',
      description: 'Autenticación segura y control de acceso por roles de usuario'
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: 'Base de Datos en Tiempo Real',
      description: 'Sincronización automática con Supabase para datos siempre actualizados'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Interfaz Moderna',
      description: 'Diseño responsive y intuitivo optimizado para todos los dispositivos'
    }
  ];

  const techStack = [
    'React 18',
    'Supabase',
    'Zustand',
    'Tailwind CSS',
    'React Hook Form',
    'Recharts'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <SiriusLogo size="xl" showText={true} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Gestión Motorepuestos FL
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Plataforma integral para la gestión empresarial de tiendas de motorepuestos, 
            desarrollada con tecnología de vanguardia para optimizar todos los procesos del negocio.
          </p>
        </div>

        {/* Información del sistema */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Características Principales
              </h2>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Tecnologías Utilizadas
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {techStack.map((tech, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">{tech}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Información del Sistema</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><strong>Versión:</strong> 1.0.0</p>
                  <p><strong>Base de Datos:</strong> Supabase (PostgreSQL)</p>
                  <p><strong>Autenticación:</strong> Supabase Auth</p>
                  <p><strong>Estado Global:</strong> Zustand</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Créditos SIRIUS */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <SiriusLogo size="lg" showText={true} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Desarrollado por SIRIUS
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Sistemas de Gestión Inteligentes
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm opacity-75">
              <Star className="h-4 w-4" />
              <span>Tecnología de vanguardia para el éxito empresarial</span>
              <Star className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm">
            © {new Date().getFullYear()} Motorepuestos FL. Todos los derechos reservados.
          </p>
          <p className="text-xs mt-1">
            Sistema desarrollado con tecnología SIRIUS
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutSystem;
