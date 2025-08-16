import React, { useState, useEffect } from 'react';
import { supabase, testConnection } from '../lib/supabase-config.js';

const SupabaseDiagnostic = () => {
  const [diagnostic, setDiagnostic] = useState({
    connection: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const runDiagnostic = async () => {
      try {
        console.log('🔍 Iniciando diagnóstico de Supabase...');
        
        // Probar conexión
        const result = await testConnection();
        
        setDiagnostic({
          connection: result.success,
          loading: false,
          error: result.error
        });
      } catch (error) {
        console.error('Error en diagnóstico:', error);
        setDiagnostic({
          connection: false,
          loading: false,
          error: error.message
        });
      }
    };

    runDiagnostic();
  }, []);

  if (diagnostic.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner-lg mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Diagnóstico de Supabase
          </h2>
          <p className="text-gray-500">
            Verificando conexión...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔍 Diagnóstico de Conexión Supabase
          </h1>

          {/* Configuración */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              ⚙️ Configuración
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">✅</span>
                  <span className="font-mono text-sm">
                    URL: https://hsajhnxtlgfpkpzcrjyb.supabase.co
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">✅</span>
                  <span className="font-mono text-sm">
                    Clave Anónima: Configurada
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Conexión */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              🔌 Conexión con Supabase
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              {diagnostic.connection ? (
                <div className="flex items-center text-green-600">
                  <span className="w-4 h-4 mr-2">✅</span>
                  <span>Conexión exitosa con Supabase</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <span className="w-4 h-4 mr-2">❌</span>
                  <span>Error de conexión con Supabase</span>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {diagnostic.error && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                🚨 Error Detallado
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-mono text-sm">{diagnostic.error}</p>
              </div>
            </div>
          )}

          {/* Soluciones */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              🛠️ Soluciones
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>
                  <strong>Problema de red:</strong> Verificar conectividad a internet y firewall
                </li>
                <li>
                  <strong>Proyecto inactivo:</strong> Verificar que el proyecto de Supabase esté activo
                </li>
                <li>
                  <strong>Credenciales incorrectas:</strong> Verificar URL y clave anónima
                </li>
                <li>
                  <strong>Problema de CORS:</strong> Verificar configuración de dominios en Supabase
                </li>
              </ul>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="text-center space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              🔄 Recargar Diagnóstico
            </button>
            <button
              onClick={() => window.open('https://supabase.com/dashboard/project/hsajhnxtlgfpkpzcrjyb', '_blank')}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              🔗 Ir a Supabase Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseDiagnostic;
