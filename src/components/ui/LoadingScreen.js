import React from 'react';
import SiriusLogo from './SiriusLogo';

const LoadingScreen = ({ message = 'Cargando Sistema de Motorepuestos' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      {/* Logo principal */}
      <div className="mb-8">
        <SiriusLogo size="xl" showText={true} />
      </div>

      {/* Spinner de carga */}
      <div className="mb-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      {/* Mensaje de carga */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          {message}
        </h2>
        <p className="text-gray-500">
          Inicializando componentes...
        </p>
      </div>

      {/* Créditos en la parte inferior */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>Powered by</span>
          <SiriusLogo size="sm" showText={false} />
          <span className="font-medium text-blue-600">SIRIUS</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
