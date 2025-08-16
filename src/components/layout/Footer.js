import React from 'react';
import SiriusLogo from '../ui/SiriusLogo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          {/* Logo SIRIUS */}
          <div className="flex items-center space-x-4">
            <SiriusLogo size="sm" showText={true} />
            <div className="text-sm text-gray-600">
              <span>Desarrollado por</span>
            </div>
          </div>

          {/* Información del sistema */}
          <div className="flex flex-col items-center md:items-end space-y-1">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">Motorepuestos FL</span>
              <span className="mx-2">•</span>
              <span>v1.0.0</span>
            </div>
            <div className="text-xs text-gray-500">
              © {currentYear} Todos los derechos reservados
            </div>
          </div>
        </div>

        {/* Línea de créditos adicionales */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-center">
            <div className="text-xs text-gray-400 text-center">
              Sistema de Gestión Empresarial • Tecnología SIRIUS
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
