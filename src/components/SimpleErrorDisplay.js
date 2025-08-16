import React from 'react';

const SimpleErrorDisplay = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
          {/* Icono */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error de Conexión
          </h1>

          {/* Mensaje */}
          <p className="text-gray-600 mb-6">
            Conexión: No se pudo conectar con Supabase
          </p>

          {/* Información de configuración */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-800 mb-2">Configuración:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>URL: https://hsajhnxtlgfpkpzcrjyb.supabase.co</p>
              <p>Clave: Configurada</p>
              <p>Estado: ❌ Error de conexión</p>
            </div>
          </div>

          {/* Soluciones */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-yellow-800 mb-2">Posibles soluciones:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Verificar conexión a internet</li>
              <li>• Comprobar que Supabase esté activo</li>
              <li>• Revisar configuración de CORS</li>
              <li>• Verificar credenciales</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reintentar
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Recargar página
            </button>

            <button
              onClick={() => window.open('https://supabase.com/dashboard/project/hsajhnxtlgfpkpzcrjyb', '_blank')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ir a Supabase Dashboard
            </button>
          </div>

          {/* Información adicional */}
          <div className="mt-6 text-xs text-gray-500">
            <p>Si el problema persiste, contacta al administrador del sistema.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleErrorDisplay;
