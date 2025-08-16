import React, { useState, useEffect } from 'react';
import { supabase, testSupabaseConnection, checkEnvironmentVariables } from '../lib/supabase.js';

const SupabaseDiagnostic = () => {
  const [diagnostic, setDiagnostic] = useState({
    envVars: null,
    connection: null,
    loading: true
  });

  useEffect(() => {
    const runDiagnostic = async () => {
      try {
        // Verificar variables de entorno
        const envVars = checkEnvironmentVariables();
        
        // Probar conexión
        const connection = await testSupabaseConnection();
        
        setDiagnostic({
          envVars,
          connection,
          loading: false
        });
      } catch (error) {
        console.error('Error en diagnóstico:', error);
        setDiagnostic({
          envVars: null,
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

          {/* Variables de Entorno */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              📋 Variables de Entorno
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              {diagnostic.envVars ? (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">
                      {diagnostic.envVars.url ? '✅' : '❌'}
                    </span>
                    <span className="font-mono text-sm">
                      VITE_SUPABASE_URL: {diagnostic.envVars.url ? 'Presente' : 'Faltante'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">
                      {diagnostic.envVars.key ? '✅' : '❌'}
                    </span>
                    <span className="font-mono text-sm">
                      VITE_SUPABASE_ANON_KEY: {diagnostic.envVars.key ? 'Presente' : 'Faltante'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">
                      {diagnostic.envVars.both ? '✅' : '❌'}
                    </span>
                    <span className="font-mono text-sm">
                      Estado General: {diagnostic.envVars.both ? 'Configuración Completa' : 'Configuración Incompleta'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-red-600">❌ No se pudieron verificar las variables de entorno</p>
              )}
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
                  <strong>Variables de entorno faltantes:</strong> Verificar que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas en Vercel
                </li>
                <li>
                  <strong>Error de conexión:</strong> Verificar que el proyecto de Supabase esté activo y las credenciales sean correctas
                </li>
                <li>
                  <strong>Problema de red:</strong> Verificar conectividad a internet y firewall
                </li>
                <li>
                  <strong>Credenciales incorrectas:</strong> Verificar URL y clave anónima en el dashboard de Supabase
                </li>
              </ul>
            </div>
          </div>

          {/* Botón de recarga */}
          <div className="text-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              🔄 Recargar Diagnóstico
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseDiagnostic;
