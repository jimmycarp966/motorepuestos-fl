import { useState, useEffect, useCallback } from 'react';
import { syncManager, SyncStatus, SyncResult } from '../lib/syncManager';
import { offlineDB } from '../lib/offlineDB';
import toast from 'react-hot-toast';

export interface UseOfflineReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingChanges: number;
  lastSync: Date | null;
  syncData: () => Promise<void>;
  forceSync: () => Promise<void>;
  getOfflineStats: () => Promise<{ [key: string]: number }>;
  clearOfflineData: () => Promise<void>;
  registerOfflineSale: (saleData: any) => Promise<void>;
  registerOfflineProduct: (productData: any) => Promise<void>;
  registerOfflineCustomer: (customerData: any) => Promise<void>;
  searchOfflineProducts: (query: string) => Promise<any[]>;
  getOfflineSales: () => Promise<any[]>;
  getOfflineCustomers: () => Promise<any[]>;
  getOfflineEmployees: () => Promise<any[]>;
  updateOfflineStock: (productId: string, newStock: number) => Promise<void>;
  hasPendingSync: () => Promise<boolean>;
  getPendingCount: () => Promise<number>;
}

export function useOffline(): UseOfflineReturn {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingChanges: 0,
    isSyncing: false
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar IndexedDB
  useEffect(() => {
    const initOfflineDB = async () => {
      try {
        await offlineDB.init();
        setIsInitialized(true);
        console.log('IndexedDB inicializada');
      } catch (error) {
        console.error('Error inicializando IndexedDB:', error);
        toast.error('Error inicializando almacenamiento offline');
      }
    };

    initOfflineDB();
  }, []);

  // Actualizar estado de sincronización
  const updateSyncStatus = useCallback(async () => {
    if (!isInitialized) return;

    try {
      const status = await syncManager.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Error obteniendo estado de sincronización:', error);
    }
  }, [isInitialized]);

  // Escuchar cambios de conectividad
  useEffect(() => {
    const handleOnline = () => {
      console.log('Conexión restaurada');
      updateSyncStatus();
      toast.success('Conexión restaurada. Sincronizando datos...');
    };

    const handleOffline = () => {
      console.log('Conexión perdida');
      updateSyncStatus();
      toast.error('Sin conexión a internet. Trabajando en modo offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateSyncStatus]);

  // Actualizar estado periódicamente
  useEffect(() => {
    if (!isInitialized) return;

    updateSyncStatus();

    const interval = setInterval(updateSyncStatus, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [isInitialized, updateSyncStatus]);

  // Función para sincronizar datos
  const syncData = useCallback(async () => {
    if (!isInitialized) {
      toast.error('Sistema offline no inicializado');
      return;
    }

    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true }));
      
      const result = await syncManager.syncData();
      
      if (result.success) {
        toast.success(`Sincronización completada: ${result.syncedItems} items sincronizados`);
      } else {
        toast.error(`Error en sincronización: ${result.errors.join(', ')}`);
      }

      await updateSyncStatus();
    } catch (error) {
      console.error('Error en sincronización:', error);
      toast.error('Error durante la sincronización');
    } finally {
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
    }
  }, [isInitialized, updateSyncStatus]);

  // Función para sincronización forzada
  const forceSync = useCallback(async () => {
    if (!isInitialized) {
      toast.error('Sistema offline no inicializado');
      return;
    }

    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true }));
      
      const result = await syncManager.forceSync();
      
      if (result.success) {
        toast.success(`Sincronización forzada completada: ${result.syncedItems} items sincronizados`);
      } else {
        toast.error(`Error en sincronización forzada: ${result.errors.join(', ')}`);
      }

      await updateSyncStatus();
    } catch (error) {
      console.error('Error en sincronización forzada:', error);
      toast.error('Error durante la sincronización forzada');
    } finally {
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
    }
  }, [isInitialized, updateSyncStatus]);

  // Función para obtener estadísticas offline
  const getOfflineStats = useCallback(async () => {
    if (!isInitialized) {
      throw new Error('Sistema offline no inicializado');
    }
    return syncManager.getOfflineStats();
  }, [isInitialized]);

  // Función para limpiar datos offline
  const clearOfflineData = useCallback(async () => {
    if (!isInitialized) {
      toast.error('Sistema offline no inicializado');
      return;
    }

    try {
      await syncManager.clearOfflineData();
      toast.success('Datos offline limpiados');
      await updateSyncStatus();
    } catch (error) {
      console.error('Error limpiando datos offline:', error);
      toast.error('Error limpiando datos offline');
    }
  }, [isInitialized, updateSyncStatus]);

  // Función para registrar venta offline
  const registerOfflineSale = useCallback(async (saleData: any) => {
    if (!isInitialized) {
      throw new Error('Sistema offline no inicializado');
    }

    try {
      await syncManager.registerOfflineSale(saleData);
      await updateSyncStatus();
      toast.success('Venta registrada offline');
    } catch (error) {
      console.error('Error registrando venta offline:', error);
      toast.error('Error registrando venta offline');
      throw error;
    }
  }, [isInitialized, updateSyncStatus]);

  // Función para registrar producto offline
  const registerOfflineProduct = useCallback(async (productData: any) => {
    if (!isInitialized) {
      throw new Error('Sistema offline no inicializado');
    }

    try {
      await syncManager.registerOfflineProduct(productData);
      await updateSyncStatus();
      toast.success('Producto registrado offline');
    } catch (error) {
      console.error('Error registrando producto offline:', error);
      toast.error('Error registrando producto offline');
      throw error;
    }
  }, [isInitialized, updateSyncStatus]);

  // Función para registrar cliente offline
  const registerOfflineCustomer = useCallback(async (customerData: any) => {
    if (!isInitialized) {
      throw new Error('Sistema offline no inicializado');
    }

    try {
      await syncManager.registerOfflineCustomer(customerData);
      await updateSyncStatus();
      toast.success('Cliente registrado offline');
    } catch (error) {
      console.error('Error registrando cliente offline:', error);
      toast.error('Error registrando cliente offline');
      throw error;
    }
  }, [isInitialized, updateSyncStatus]);

  // Función para buscar productos offline
  const searchOfflineProducts = useCallback(async (query: string) => {
    if (!isInitialized) {
      throw new Error('Sistema offline no inicializado');
    }
    return syncManager.searchOfflineProducts(query);
  }, [isInitialized]);

  // Función para obtener ventas offline
  const getOfflineSales = useCallback(async () => {
    if (!isInitialized) {
      throw new Error('Sistema offline no inicializado');
    }
    return syncManager.getOfflineSales();
  }, [isInitialized]);

  // Función para obtener clientes offline
  const getOfflineCustomers = useCallback(async () => {
    if (!isInitialized) {
      throw new Error('Sistema offline no inicializado');
    }
    return syncManager.getOfflineCustomers();
  }, [isInitialized]);

  // Función para obtener empleados offline
  const getOfflineEmployees = useCallback(async () => {
    if (!isInitialized) {
      throw new Error('Sistema offline no inicializado');
    }
    return syncManager.getOfflineEmployees();
  }, [isInitialized]);

  // Función para actualizar stock offline
  const updateOfflineStock = useCallback(async (productId: string, newStock: number) => {
    if (!isInitialized) {
      throw new Error('Sistema offline no inicializado');
    }

    try {
      await syncManager.updateOfflineStock(productId, newStock);
      await updateSyncStatus();
      toast.success('Stock actualizado offline');
    } catch (error) {
      console.error('Error actualizando stock offline:', error);
      toast.error('Error actualizando stock offline');
      throw error;
    }
  }, [isInitialized, updateSyncStatus]);

  // Función para verificar si hay datos pendientes
  const hasPendingSync = useCallback(async () => {
    if (!isInitialized) {
      return false;
    }
    return syncManager.hasPendingSync();
  }, [isInitialized]);

  // Función para obtener número de items pendientes
  const getPendingCount = useCallback(async () => {
    if (!isInitialized) {
      return 0;
    }
    return syncManager.getPendingCount();
  }, [isInitialized]);

  return {
    isOnline: syncStatus.isOnline,
    isSyncing: syncStatus.isSyncing,
    pendingChanges: syncStatus.pendingChanges,
    lastSync: syncStatus.lastSync,
    syncData,
    forceSync,
    getOfflineStats,
    clearOfflineData,
    registerOfflineSale,
    registerOfflineProduct,
    registerOfflineCustomer,
    searchOfflineProducts,
    getOfflineSales,
    getOfflineCustomers,
    getOfflineEmployees,
    updateOfflineStock,
    hasPendingSync,
    getPendingCount
  };
}
