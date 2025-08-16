import React, { useState, useEffect } from 'react';
import { supabase, testConnection } from '../lib/supabase-config.js';

const SupabaseDiagnostic = () => {
  const [diagnostic, setDiagnostic] = useState({
    connection: null,
    loading: true,
    error: null,
    details: null
  });

  useEffect(() => {
    const runDiagnostic = async () => {
      try {
        console.log('🔍 Iniciando diagnóstico de Supabase...');
        
        // Probar conexión
        const result = await testConnection();
        
        // Obtener detalles adicionales
        let details = null;
        if (result.success) {
          try {
            const { data: empleados } = await supabase
              .from('empleados')
              .select('count')
              .limit(1);
            details = `Empleados en BD: ${empleados?.length || 0}`;
          } catch (detailError) {
            details = `Error obteniendo detalles: ${detailError.message}`;
          }
        }
        
        setDiagnostic({
          connection: result.success,
          loading: false,
          error: result.error,
          details
        });
      } catch (error) {
        console.error('Error en diagnóstico:', error);
        setDiagnostic({
          connection: false,
          loading: false,
          error: error.message,
          details: null
        });
      }
    };

    runDiagnostic();
  }, []);

  const handleRetry = () => {
    setDiagnostic({ connection: null, loading: true, error: null, details: null });
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (diagnostic.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
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

          {/* Detalles del error */}
          {diagnostic.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-red-800 text-sm font-mono">
                <strong>Error:</strong> {diagnostic.error}
              </p>
              {diagnostic.details && (
                <p className="text-red-700 text-sm mt-2">
                  <strong>Detalles:</strong> {diagnostic.details}
                </p>
              )}
            </div>
          )}

          {/* Información de configuración */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-800 mb-2">Configuración:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>URL: https://hsajhnxtlgfpkpzcrjyb.supabase.co</p>
              <p>Clave: Configurada</p>
              <p>Estado: {diagnostic.connection ? '✅ Conectado' : '❌ Error'}</p>
            </div>
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
          </div>

          {/* Información adicional */}
          <div className="mt-6 text-xs text-gray-500">
            <p>Si el problema persiste, verifica:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Tu conexión a internet</li>
              <li>Que el proyecto de Supabase esté activo</li>
              <li>Las credenciales en la configuración</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseDiagnostic;
