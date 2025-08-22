import { offlineDB, OfflineData } from './offlineDB';
import { supabase } from './supabase';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  isSyncing: boolean;
}

export interface SyncResult {
  success: boolean;
  syncedItems: number;
  errors: string[];
  timestamp: Date;
}

class SyncManager {
  private isOnline = typeof window !== 'undefined' ? navigator.onLine : true;
  private isSyncing = false;
  private lastSync: Date | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupEventListeners();
      this.startAutoSync();
    }
  }

  private setupEventListeners() {
    // Escuchar cambios de conectividad
    window.addEventListener('online', () => {
      console.log('Conexión restaurada');
      this.isOnline = true;
      this.syncData();
    });

    window.addEventListener('offline', () => {
      console.log('Conexión perdida');
      this.isOnline = false;
    });

    // Escuchar mensajes del Service Worker
    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data.type === 'SYNC_COMPLETED') {
        console.log('Sincronización completada desde SW');
        this.lastSync = new Date();
      }
    });
  }

  private startAutoSync() {
    // Sincronizar cada 5 minutos si hay internet
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncData();
      }
    }, 5 * 60 * 1000); // 5 minutos
  }

  async syncData(): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        syncedItems: 0,
        errors: ['Sincronización ya en progreso'],
        timestamp: new Date()
      };
    }

    if (!this.isOnline) {
      return {
        success: false,
        syncedItems: 0,
        errors: ['Sin conexión a internet'],
        timestamp: new Date()
      };
    }

    this.isSyncing = true;
    const errors: string[] = [];
    let syncedItems = 0;

    try {
      console.log('Iniciando sincronización...');

      // Obtener datos offline pendientes
      const offlineData = await offlineDB.getOfflineData();
      const unsyncedData = offlineData.filter(item => !item.synced);

      console.log(`Datos pendientes de sincronización: ${unsyncedData.length}`);

      // Procesar cada item offline
      for (const item of unsyncedData) {
        try {
          await this.processOfflineItem(item);
          await offlineDB.markAsSynced(item.id);
          syncedItems++;
        } catch (error) {
          const errorMsg = `Error procesando ${item.table}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      // Sincronizar datos del servidor a local
      await this.syncFromServer();

      this.lastSync = new Date();
      
      // Limpiar datos sincronizados
      await offlineDB.clearSyncedData();

      console.log(`Sincronización completada: ${syncedItems} items sincronizados`);

      return {
        success: errors.length === 0,
        syncedItems,
        errors,
        timestamp: this.lastSync
      };

    } catch (error) {
      const errorMsg = `Error general en sincronización: ${error}`;
      console.error(errorMsg);
      errors.push(errorMsg);

      return {
        success: false,
        syncedItems,
        errors,
        timestamp: new Date()
      };
    } finally {
      this.isSyncing = false;
    }
  }

  private async processOfflineItem(item: OfflineData): Promise<void> {
    const { table, data, action } = item;

    switch (table) {
      case 'products':
        await this.syncProduct(data, action);
        break;
      case 'sales':
        await this.syncSale(data, action);
        break;
      case 'customers':
        await this.syncCustomer(data, action);
        break;
      case 'employees':
        await this.syncEmployee(data, action);
        break;
      default:
        throw new Error(`Tabla no soportada: ${table}`);
    }
  }

  private async syncProduct(data: any, action: string): Promise<void> {
    switch (action) {
      case 'INSERT':
        const { data: newProduct, error } = await supabase
          .from('productos')
          .insert([data])
          .select()
          .single();
        
        if (error) throw error;
        break;

      case 'UPDATE':
        const { error: updateError } = await supabase
          .from('productos')
          .update(data)
          .eq('id', data.id);
        
        if (updateError) throw updateError;
        break;

      case 'DELETE':
        const { error: deleteError } = await supabase
          .from('productos')
          .delete()
          .eq('id', data.id);
        
        if (deleteError) throw deleteError;
        break;
    }
  }

  private async syncSale(data: any, action: string): Promise<void> {
    switch (action) {
      case 'INSERT':
        const { data: newSale, error } = await supabase
          .from('ventas')
          .insert([data])
          .select()
          .single();
        
        if (error) throw error;
        break;

      case 'UPDATE':
        const { error: updateError } = await supabase
          .from('ventas')
          .update(data)
          .eq('id', data.id);
        
        if (updateError) throw updateError;
        break;

      case 'DELETE':
        const { error: deleteError } = await supabase
          .from('ventas')
          .delete()
          .eq('id', data.id);
        
        if (deleteError) throw deleteError;
        break;
    }
  }

  private async syncCustomer(data: any, action: string): Promise<void> {
    switch (action) {
      case 'INSERT':
        const { data: newCustomer, error } = await supabase
          .from('clientes')
          .insert([data])
          .select()
          .single();
        
        if (error) throw error;
        break;

      case 'UPDATE':
        const { error: updateError } = await supabase
          .from('clientes')
          .update(data)
          .eq('id', data.id);
        
        if (updateError) throw updateError;
        break;

      case 'DELETE':
        const { error: deleteError } = await supabase
          .from('clientes')
          .delete()
          .eq('id', data.id);
        
        if (deleteError) throw deleteError;
        break;
    }
  }

  private async syncEmployee(data: any, action: string): Promise<void> {
    switch (action) {
      case 'INSERT':
        const { data: newEmployee, error } = await supabase
          .from('empleados')
          .insert([data])
          .select()
          .single();
        
        if (error) throw error;
        break;

      case 'UPDATE':
        const { error: updateError } = await supabase
          .from('empleados')
          .update(data)
          .eq('id', data.id);
        
        if (updateError) throw updateError;
        break;

      case 'DELETE':
        const { error: deleteError } = await supabase
          .from('empleados')
          .delete()
          .eq('id', data.id);
        
        if (deleteError) throw deleteError;
        break;
    }
  }

  private async syncFromServer(): Promise<void> {
    try {
      // Sincronizar productos
      const { data: products, error: productsError } = await supabase
        .from('productos')
        .select('*');

      if (productsError) throw productsError;

      for (const product of products || []) {
        await offlineDB.saveToStore('products', product);
      }

      // Sincronizar clientes
      const { data: customers, error: customersError } = await supabase
        .from('clientes')
        .select('*');

      if (customersError) throw customersError;

      for (const customer of customers || []) {
        await offlineDB.saveToStore('customers', customer);
      }

      // Sincronizar empleados
      const { data: employees, error: employeesError } = await supabase
        .from('empleados')
        .select('*');

      if (employeesError) throw employeesError;

      for (const employee of employees || []) {
        await offlineDB.saveToStore('employees', employee);
      }

      console.log('Datos del servidor sincronizados localmente');

    } catch (error) {
      console.error('Error sincronizando desde servidor:', error);
      throw error;
    }
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const offlineData = await offlineDB.getOfflineData();
    const pendingChanges = offlineData.filter(item => !item.synced).length;

    return {
      isOnline: this.isOnline,
      lastSync: this.lastSync,
      pendingChanges,
      isSyncing: this.isSyncing
    };
  }

  async forceSync(): Promise<SyncResult> {
    console.log('Sincronización forzada iniciada');
    return this.syncData();
  }

  async clearOfflineData(): Promise<void> {
    await offlineDB.clearAll();
    console.log('Datos offline limpiados');
  }

  async getOfflineStats(): Promise<{ [key: string]: number }> {
    return offlineDB.getStats();
  }

  // Método para registrar una nueva venta offline
  async registerOfflineSale(saleData: any): Promise<void> {
    await offlineDB.saveSale(saleData);
    console.log('Venta registrada offline');
  }

  // Método para registrar un nuevo producto offline
  async registerOfflineProduct(productData: any): Promise<void> {
    await offlineDB.saveProduct(productData);
    console.log('Producto registrado offline');
  }

  // Método para registrar un nuevo cliente offline
  async registerOfflineCustomer(customerData: any): Promise<void> {
    await offlineDB.saveCustomer(customerData);
    console.log('Cliente registrado offline');
  }

  // Método para actualizar stock offline
  async updateOfflineStock(productId: string, newStock: number): Promise<void> {
    const product = await offlineDB.getProductById(productId);
    if (product) {
      product.stock = newStock;
      await offlineDB.updateProduct(product);
      console.log('Stock actualizado offline');
    }
  }

  // Método para buscar productos offline
  async searchOfflineProducts(query: string): Promise<any[]> {
    return offlineDB.searchProducts(query);
  }

  // Método para obtener ventas offline
  async getOfflineSales(): Promise<any[]> {
    return offlineDB.getSales();
  }

  // Método para obtener clientes offline
  async getOfflineCustomers(): Promise<any[]> {
    return offlineDB.getCustomers();
  }

  // Método para obtener empleados offline
  async getOfflineEmployees(): Promise<any[]> {
    return offlineDB.getEmployees();
  }

  // Método para verificar si hay datos pendientes de sincronización
  async hasPendingSync(): Promise<boolean> {
    const offlineData = await offlineDB.getOfflineData();
    return offlineData.some(item => !item.synced);
  }

  // Método para obtener el número de items pendientes
  async getPendingCount(): Promise<number> {
    const offlineData = await offlineDB.getOfflineData();
    return offlineData.filter(item => !item.synced).length;
  }

  // Método para limpiar el intervalo de sincronización
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

// Instancia singleton
export const syncManager = new SyncManager();
