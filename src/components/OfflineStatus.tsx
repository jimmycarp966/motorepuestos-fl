import React from 'react';
import { useOffline } from '../hooks/useOffline';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, Database } from 'lucide-react';
import toast from 'react-hot-toast';

export const OfflineStatus: React.FC = () => {
  const {
    isOnline,
    isSyncing,
    pendingChanges,
    lastSync,
    syncData,
    forceSync,
    getOfflineStats
  } = useOffline();

  const handleSync = async () => {
    try {
      await syncData();
    } catch (error) {
      console.error('Error en sincronización:', error);
    }
  };

  const handleForceSync = async () => {
    try {
      await forceSync();
    } catch (error) {
      console.error('Error en sincronización forzada:', error);
    }
  };

  const handleShowStats = async () => {
    try {
      const stats = await getOfflineStats();
      const statsText = Object.entries(stats)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      
      toast.success(`Estadísticas offline:\n${statsText}`, {
        duration: 5000,
        style: {
          whiteSpace: 'pre-line'
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      toast.error('Error obteniendo estadísticas offline');
    }
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[280px]">
        {/* Estado de conectividad */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {isOnline ? 'Conectado' : 'Sin conexión'}
            </span>
          </div>
          
          {isSyncing && (
            <div className="flex items-center space-x-1">
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="text-xs text-gray-500">Sincronizando...</span>
            </div>
          )}
        </div>

        {/* Información de sincronización */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Última sincronización:</span>
            <span className="font-medium">{formatLastSync(lastSync)}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Cambios pendientes:</span>
            <div className="flex items-center space-x-1">
              {pendingChanges > 0 ? (
                <AlertCircle className="w-3 h-3 text-orange-500" />
              ) : (
                <CheckCircle className="w-3 h-3 text-green-500" />
              )}
              <span className={`font-medium ${pendingChanges > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {pendingChanges}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-2">
          <button
            onClick={handleSync}
            disabled={isSyncing || !isOnline}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs px-3 py-2 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sincronizar</span>
          </button>
          
          <button
            onClick={handleForceSync}
            disabled={isSyncing || !isOnline}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs px-3 py-2 rounded-md transition-colors duration-200"
          >
            Forzar
          </button>
          
          <button
            onClick={handleShowStats}
            className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded-md transition-colors duration-200 flex items-center justify-center"
            title="Ver estadísticas offline"
          >
            <Database className="w-3 h-3" />
          </button>
        </div>

        {/* Indicador de modo offline */}
        {!isOnline && (
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-xs text-yellow-800 dark:text-yellow-200">
                Trabajando en modo offline
              </span>
            </div>
          </div>
        )}

        {/* Indicador de cambios pendientes */}
        {pendingChanges > 0 && isOnline && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-800 dark:text-blue-200">
                {pendingChanges} cambio{pendingChanges !== 1 ? 's' : ''} pendiente{pendingChanges !== 1 ? 's' : ''} de sincronización
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineStatus;
