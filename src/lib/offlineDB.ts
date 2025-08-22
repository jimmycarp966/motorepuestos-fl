// Sistema de base de datos offline usando IndexedDB
export interface OfflineData {
  id: string;
  table: string;
  data: any;
  timestamp: number;
  synced: boolean;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
}

export interface OfflineProduct {
  id: string;
  codigo: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  marca: string;
  modelo: string;
  anio: string;
  created_at: string;
  updated_at: string;
}

export interface OfflineSale {
  id: string;
  fecha: string;
  total: number;
  productos: any[];
  cliente_id?: string;
  empleado_id: string;
  metodo_pago: string;
  created_at: string;
  updated_at: string;
}

export interface OfflineCustomer {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  created_at: string;
  updated_at: string;
}

export interface OfflineEmployee {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  created_at: string;
  updated_at: string;
}

class OfflineDatabase {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'MotorepuestosOfflineDB';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('Error al abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB inicializada correctamente');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Tabla para datos offline pendientes de sincronización
        if (!db.objectStoreNames.contains('offlineData')) {
          const offlineStore = db.createObjectStore('offlineData', { keyPath: 'id' });
          offlineStore.createIndex('table', 'table', { unique: false });
          offlineStore.createIndex('synced', 'synced', { unique: false });
          offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Tabla para productos
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('codigo', 'codigo', { unique: true });
          productStore.createIndex('descripcion', 'descripcion', { unique: false });
          productStore.createIndex('categoria', 'categoria', { unique: false });
        }

        // Tabla para ventas
        if (!db.objectStoreNames.contains('sales')) {
          const saleStore = db.createObjectStore('sales', { keyPath: 'id' });
          saleStore.createIndex('fecha', 'fecha', { unique: false });
          saleStore.createIndex('empleado_id', 'empleado_id', { unique: false });
        }

        // Tabla para clientes
        if (!db.objectStoreNames.contains('customers')) {
          const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
          customerStore.createIndex('nombre', 'nombre', { unique: false });
          customerStore.createIndex('email', 'email', { unique: false });
        }

        // Tabla para empleados
        if (!db.objectStoreNames.contains('employees')) {
          const employeeStore = db.createObjectStore('employees', { keyPath: 'id' });
          employeeStore.createIndex('email', 'email', { unique: true });
          employeeStore.createIndex('rol', 'rol', { unique: false });
        }

        // Tabla para inventario
        if (!db.objectStoreNames.contains('inventory')) {
          const inventoryStore = db.createObjectStore('inventory', { keyPath: 'id' });
          inventoryStore.createIndex('producto_id', 'producto_id', { unique: true });
          inventoryStore.createIndex('stock', 'stock', { unique: false });
        }

        console.log('Estructura de IndexedDB creada');
      };
    });
  }

  // Métodos para productos
  async saveProduct(product: OfflineProduct): Promise<void> {
    await this.addOfflineData('products', product, 'INSERT');
    await this.saveToStore('products', product);
  }

  async updateProduct(product: OfflineProduct): Promise<void> {
    await this.addOfflineData('products', product, 'UPDATE');
    await this.saveToStore('products', product);
  }

  async deleteProduct(productId: string): Promise<void> {
    await this.addOfflineData('products', { id: productId }, 'DELETE');
    await this.deleteFromStore('products', productId);
  }

  async getProducts(): Promise<OfflineProduct[]> {
    return this.getAllFromStore('products');
  }

  async getProductById(id: string): Promise<OfflineProduct | null> {
    return this.getFromStore('products', id);
  }

  async searchProducts(query: string): Promise<OfflineProduct[]> {
    const products = await this.getAllFromStore('products');
    return products.filter(product => 
      product.descripcion.toLowerCase().includes(query.toLowerCase()) ||
      product.codigo.toLowerCase().includes(query.toLowerCase()) ||
      product.marca.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Métodos para ventas
  async saveSale(sale: OfflineSale): Promise<void> {
    await this.addOfflineData('sales', sale, 'INSERT');
    await this.saveToStore('sales', sale);
  }

  async getSales(): Promise<OfflineSale[]> {
    return this.getAllFromStore('sales');
  }

  async getSaleById(id: string): Promise<OfflineSale | null> {
    return this.getFromStore('sales', id);
  }

  // Métodos para clientes
  async saveCustomer(customer: OfflineCustomer): Promise<void> {
    await this.addOfflineData('customers', customer, 'INSERT');
    await this.saveToStore('customers', customer);
  }

  async updateCustomer(customer: OfflineCustomer): Promise<void> {
    await this.addOfflineData('customers', customer, 'UPDATE');
    await this.saveToStore('customers', customer);
  }

  async getCustomers(): Promise<OfflineCustomer[]> {
    return this.getAllFromStore('customers');
  }

  async getCustomerById(id: string): Promise<OfflineCustomer | null> {
    return this.getFromStore('customers', id);
  }

  // Métodos para empleados
  async saveEmployee(employee: OfflineEmployee): Promise<void> {
    await this.addOfflineData('employees', employee, 'INSERT');
    await this.saveToStore('employees', employee);
  }

  async getEmployees(): Promise<OfflineEmployee[]> {
    return this.getAllFromStore('employees');
  }

  async getEmployeeById(id: string): Promise<OfflineEmployee | null> {
    return this.getFromStore('employees', id);
  }

  // Métodos para datos offline
  async addOfflineData(table: string, data: any, action: 'INSERT' | 'UPDATE' | 'DELETE'): Promise<void> {
    if (!this.db) throw new Error('IndexedDB no inicializada');

    const offlineData: OfflineData = {
      id: `${table}_${Date.now()}_${Math.random()}`,
      table,
      data,
      timestamp: Date.now(),
      synced: false,
      action
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.add(offlineData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineData(): Promise<OfflineData[]> {
    if (!this.db) throw new Error('IndexedDB no inicializada');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markAsSynced(id: string): Promise<void> {
    if (!this.db) throw new Error('IndexedDB no inicializada');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          const putRequest = store.put(data);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async clearSyncedData(): Promise<void> {
    if (!this.db) throw new Error('IndexedDB no inicializada');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const index = store.index('synced');
      const request = index.openCursor(IDBKeyRange.only(true));

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Métodos auxiliares para operaciones con stores
  private async saveToStore(storeName: string, data: any): Promise<void> {
    if (!this.db) throw new Error('IndexedDB no inicializada');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getFromStore(storeName: string, id: string): Promise<any> {
    if (!this.db) throw new Error('IndexedDB no inicializada');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAllFromStore(storeName: string): Promise<any[]> {
    if (!this.db) throw new Error('IndexedDB no inicializada');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFromStore(storeName: string, id: string): Promise<void> {
    if (!this.db) throw new Error('IndexedDB no inicializada');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Método para limpiar toda la base de datos
  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('IndexedDB no inicializada');

    const storeNames = ['offlineData', 'products', 'sales', 'customers', 'employees', 'inventory'];
    
    return Promise.all(
      storeNames.map(storeName => 
        new Promise<void>((resolve, reject) => {
          const transaction = this.db!.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.clear();
          
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
      )
    ).then(() => {});
  }

  // Método para obtener estadísticas de la base de datos
  async getStats(): Promise<{ [key: string]: number }> {
    if (!this.db) throw new Error('IndexedDB no inicializada');

    const storeNames = ['offlineData', 'products', 'sales', 'customers', 'employees', 'inventory'];
    const stats: { [key: string]: number } = {};

    await Promise.all(
      storeNames.map(async storeName => {
        const count = await new Promise<number>((resolve, reject) => {
          const transaction = this.db!.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.count();
          
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        
        stats[storeName] = count;
      })
    );

    return stats;
  }
}

// Instancia singleton
export const offlineDB = new OfflineDatabase();
