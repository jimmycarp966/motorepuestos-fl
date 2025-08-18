// ================================================
// SISTEMA DE CACHE SIMPLIFICADO
// ================================================
// Cache básico para productos con TTL simple

import { config } from './config'

// Tipos para el sistema de cache
export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  expiresAt: number
}

export interface CacheOptions {
  ttl?: number // Time to live en milisegundos
}

// Clase simplificada del gestor de cache
class CacheManager {
  private cache = new Map<string, CacheEntry>()
  private maxSize = 100 // Máximo de entradas en memoria

  constructor() {
    if (config.debug) {
      console.log('🗄️ [Cache] Sistema de cache simplificado inicializado')
    }
  }

  /**
   * Obtener valor del cache
   */
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      if (config.debug) {
        console.log(`🗄️ [Cache] MISS: ${key}`)
      }
      return null
    }

    // Verificar expiración
    if (Date.now() > entry.expiresAt) {
      this.delete(key)
      if (config.debug) {
        console.log(`🗄️ [Cache] EXPIRED: ${key}`)
      }
      return null
    }

    if (config.debug) {
      console.log(`🗄️ [Cache] HIT: ${key}`)
    }
    
    return entry.data as T
  }

  /**
   * Almacenar valor en cache
   */
  set<T = any>(key: string, data: T, options: CacheOptions = {}): void {
    const { ttl = config.cacheTTL } = options

    // Limpiar cache si está lleno
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    }

    this.cache.set(key, entry)

    if (config.debug) {
      console.log(`🗄️ [Cache] SET: ${key} (TTL: ${ttl}ms)`)
    }
  }

  /**
   * Eliminar entrada del cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (config.debug && deleted) {
      console.log(`🗄️ [Cache] DELETE: ${key}`)
    }
    return deleted
  }

  /**
   * Limpiar entradas expiradas
   */
  cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => this.delete(key))

    if (config.debug) {
      console.log(`🗄️ [Cache] CLEANUP: Removed ${expiredKeys.length} expired entries`)
    }
  }

  /**
   * Limpiar todo el cache
   */
  clear(): void {
    const keysCount = this.cache.size
    this.cache.clear()

    if (config.debug) {
      console.log(`🗄️ [Cache] CLEAR: Removed ${keysCount} entries`)
    }
  }
}

// ================================================
// INSTANCIA SINGLETON Y HELPERS
// ================================================

export const cacheManager = new CacheManager()

// Helpers específicos para productos
export const businessCache = {
  productos: {
    getAll: () => cacheManager.get<any[]>('productos:all'),
    setAll: (data: any[]) => cacheManager.set('productos:all', data, {
      ttl: config.cacheTTL,
    }),
    invalidate: () => cacheManager.delete('productos:all')
  }
}

// Función para invalidar cache después de mutaciones
export function invalidateRelatedCache(operation: string, entity: string): void {
  if (entity === 'productos') {
    businessCache.productos.invalidate()
  }
  
  if (config.debug) {
    console.log(`🗄️ [Cache] Invalidated cache for ${entity} ${operation}`)
  }
}

export default cacheManager