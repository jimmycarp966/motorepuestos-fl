// ================================================
// SISTEMA DE CACHE INTELIGENTE
// ================================================
// Sistema robusto de cache con invalidación automática e inteligente

import { config } from './config'
import { AuditLogger } from './auditLogger'

// Tipos para el sistema de cache
export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  expiresAt: number
  version: string
  dependencies: string[]
  tags: string[]
}

export interface CacheOptions {
  ttl?: number // Time to live en milisegundos
  dependencies?: string[] // Claves que invalidan este cache
  tags?: string[] // Tags para invalidación grupal
  serialize?: boolean // Si serializar los datos
  persistent?: boolean // Si persistir en localStorage
}

export interface CacheStats {
  hits: number
  misses: number
  size: number
  hitRate: number
  entries: Record<string, Omit<CacheEntry, 'data'>>
}

// Clase principal del gestor de cache
class CacheManager {
  private cache = new Map<string, CacheEntry>()
  private stats = { hits: 0, misses: 0 }
  private maxSize = 1000 // Máximo de entradas en memoria
  private version = '1.0.0'
  
  // Dependencias: qué claves se invalidan cuando otra cambia
  private dependencyMap = new Map<string, Set<string>>()
  
  // Tags: agrupaciones lógicas para invalidación masiva
  private tagMap = new Map<string, Set<string>>()

  constructor() {
    // Cargar cache persistente al inicializar
    this.loadPersistentCache()
    
    // Log de inicialización
    if (config.debug) {
      console.log('🗄️ [Cache] Sistema de cache inicializado')
    }
  }

  // ================================================
  // OPERACIONES BÁSICAS
  // ================================================

  /**
   * Obtener valor del cache
   */
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      if (config.debug) {
        console.log(`🗄️ [Cache] MISS: ${key}`)
      }
      return null
    }

    // Verificar expiración
    if (Date.now() > entry.expiresAt) {
      this.delete(key)
      this.stats.misses++
      if (config.debug) {
        console.log(`🗄️ [Cache] EXPIRED: ${key}`)
      }
      return null
    }

    this.stats.hits++
    if (config.debug) {
      console.log(`🗄️ [Cache] HIT: ${key}`)
    }
    
    // Log de auditoría para operaciones sensibles
    AuditLogger.logAction('cache_read', { key, hit: true })
    
    return entry.data as T
  }

  /**
   * Almacenar valor en cache
   */
  set<T = any>(key: string, data: T, options: CacheOptions = {}): void {
    const {
      ttl = config.cacheTTL,
      dependencies = [],
      tags = [],
      serialize = false,
      persistent = false
    } = options

    // Limpiar cache si está lleno
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    const entry: CacheEntry<T> = {
      data: serialize ? JSON.parse(JSON.stringify(data)) : data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      version: this.version,
      dependencies,
      tags
    }

    this.cache.set(key, entry)

    // Registrar dependencias
    dependencies.forEach(dep => {
      if (!this.dependencyMap.has(dep)) {
        this.dependencyMap.set(dep, new Set())
      }
      this.dependencyMap.get(dep)!.add(key)
    })

    // Registrar tags
    tags.forEach(tag => {
      if (!this.tagMap.has(tag)) {
        this.tagMap.set(tag, new Set())
      }
      this.tagMap.get(tag)!.add(key)
    })

    // Persistir si es necesario
    if (persistent) {
      this.persistEntry(key, entry)
    }

    if (config.debug) {
      console.log(`🗄️ [Cache] SET: ${key} (TTL: ${ttl}ms, Deps: [${dependencies.join(', ')}], Tags: [${tags.join(', ')}])`)
    }

    // Auditoría
    AuditLogger.logAction('cache_write', { 
      key, 
      ttl, 
      dependencies, 
      tags, 
      persistent 
    })
  }

  /**
   * Eliminar entrada del cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    this.cache.delete(key)

    // Limpiar dependencias
    entry.dependencies.forEach(dep => {
      const depSet = this.dependencyMap.get(dep)
      if (depSet) {
        depSet.delete(key)
        if (depSet.size === 0) {
          this.dependencyMap.delete(dep)
        }
      }
    })

    // Limpiar tags
    entry.tags.forEach(tag => {
      const tagSet = this.tagMap.get(tag)
      if (tagSet) {
        tagSet.delete(key)
        if (tagSet.size === 0) {
          this.tagMap.delete(tag)
        }
      }
    })

    // Eliminar persistencia
    this.removePersistentEntry(key)

    if (config.debug) {
      console.log(`🗄️ [Cache] DELETE: ${key}`)
    }

    return true
  }

  // ================================================
  // INVALIDACIÓN INTELIGENTE
  // ================================================

  /**
   * Invalidar cache por dependencia
   */
  invalidateByDependency(dependency: string): void {
    const affectedKeys = this.dependencyMap.get(dependency)
    if (!affectedKeys) return

    const keysToInvalidate = Array.from(affectedKeys)
    keysToInvalidate.forEach(key => this.delete(key))

    if (config.debug) {
      console.log(`🗄️ [Cache] INVALIDATE BY DEPENDENCY: ${dependency} -> [${keysToInvalidate.join(', ')}]`)
    }

    AuditLogger.logAction('cache_invalidate_dependency', {
      dependency,
      affectedKeys: keysToInvalidate
    })
  }

  /**
   * Invalidar cache por tag
   */
  invalidateByTag(tag: string): void {
    const affectedKeys = this.tagMap.get(tag)
    if (!affectedKeys) return

    const keysToInvalidate = Array.from(affectedKeys)
    keysToInvalidate.forEach(key => this.delete(key))

    if (config.debug) {
      console.log(`🗄️ [Cache] INVALIDATE BY TAG: ${tag} -> [${keysToInvalidate.join(', ')}]`)
    }

    AuditLogger.logAction('cache_invalidate_tag', {
      tag,
      affectedKeys: keysToInvalidate
    })
  }

  /**
   * Invalidar múltiples patrones
   */
  invalidatePattern(pattern: RegExp): void {
    const keysToInvalidate: string[] = []
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToInvalidate.push(key)
      }
    }

    keysToInvalidate.forEach(key => this.delete(key))

    if (config.debug) {
      console.log(`🗄️ [Cache] INVALIDATE BY PATTERN: ${pattern} -> [${keysToInvalidate.join(', ')}]`)
    }
  }

  // ================================================
  // OPERACIONES AVANZADAS
  // ================================================

  /**
   * Obtener o crear con función
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T> | T,
    options: CacheOptions = {}
  ): Promise<T> {
    let cached = this.get<T>(key)
    
    if (cached !== null) {
      return cached
    }

    try {
      const data = await fetchFn()
      this.set(key, data, options)
      return data
    } catch (error) {
      AuditLogger.logError('cache_fetch_error', error as Error, { key })
      throw error
    }
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

    // Si hay muchas expiradas, limpiar todas
    // Si no, limpiar las más antiguas hasta tener espacio
    if (expiredKeys.length > 0) {
      expiredKeys.forEach(key => this.delete(key))
    } else {
      // Limpiar por LRU (Least Recently Used)
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      const toDelete = Math.floor(this.maxSize * 0.1) // Eliminar 10%
      
      for (let i = 0; i < toDelete; i++) {
        this.delete(entries[i][0])
      }
    }

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
    this.dependencyMap.clear()
    this.tagMap.clear()
    this.clearPersistentCache()

    if (config.debug) {
      console.log(`🗄️ [Cache] CLEAR: Removed ${keysCount} entries`)
    }

    AuditLogger.logAction('cache_clear', { removedCount: keysCount })
  }

  // ================================================
  // PERSISTENCIA
  // ================================================

  private persistEntry(key: string, entry: CacheEntry): void {
    try {
      const serialized = JSON.stringify(entry)
      localStorage.setItem(`cache_${key}`, serialized)
    } catch (error) {
      console.warn('🗄️ [Cache] Failed to persist entry:', key, error)
    }
  }

  private removePersistentEntry(key: string): void {
    try {
      localStorage.removeItem(`cache_${key}`)
    } catch (error) {
      console.warn('🗄️ [Cache] Failed to remove persistent entry:', key, error)
    }
  }

  private loadPersistentCache(): void {
    if (!config.cacheEnabled) return

    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'))
      
      keys.forEach(storageKey => {
        const cacheKey = storageKey.replace('cache_', '')
        const serialized = localStorage.getItem(storageKey)
        
        if (serialized) {
          const entry: CacheEntry = JSON.parse(serialized)
          
          // Verificar si no ha expirado
          if (Date.now() < entry.expiresAt && entry.version === this.version) {
            this.cache.set(cacheKey, entry)
            
            // Reconstruir mapas de dependencias y tags
            entry.dependencies.forEach(dep => {
              if (!this.dependencyMap.has(dep)) {
                this.dependencyMap.set(dep, new Set())
              }
              this.dependencyMap.get(dep)!.add(cacheKey)
            })
            
            entry.tags.forEach(tag => {
              if (!this.tagMap.has(tag)) {
                this.tagMap.set(tag, new Set())
              }
              this.tagMap.get(tag)!.add(cacheKey)
            })
          } else {
            // Eliminar entrada expirada o de versión anterior
            localStorage.removeItem(storageKey)
          }
        }
      })

      if (config.debug) {
        console.log(`🗄️ [Cache] Loaded ${this.cache.size} persistent entries`)
      }
    } catch (error) {
      console.warn('🗄️ [Cache] Failed to load persistent cache:', error)
    }
  }

  private clearPersistentCache(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'))
      keys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.warn('🗄️ [Cache] Failed to clear persistent cache:', error)
    }
  }

  // ================================================
  // ESTADÍSTICAS Y MONITOREO
  // ================================================

  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0

    const entries: Record<string, Omit<CacheEntry, 'data'>> = {}
    for (const [key, entry] of this.cache.entries()) {
      entries[key] = {
        timestamp: entry.timestamp,
        expiresAt: entry.expiresAt,
        version: entry.version,
        dependencies: entry.dependencies,
        tags: entry.tags
      }
    }

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      entries
    }
  }

  resetStats(): void {
    this.stats = { hits: 0, misses: 0 }
  }
}

// ================================================
// INSTANCIA SINGLETON Y HELPERS
// ================================================

export const cacheManager = new CacheManager()

// Helpers específicos para el dominio de negocio
export const businessCache = {
  // Cache de productos
  productos: {
    getAll: () => cacheManager.get<any[]>('productos:all'),
    setAll: (data: any[]) => cacheManager.set('productos:all', data, {
      ttl: config.cacheTTL,
      tags: ['productos'],
      dependencies: ['productos:modified'],
      persistent: true
    }),
    invalidate: () => cacheManager.invalidateByTag('productos')
  },

  // Cache de ventas
  ventas: {
    getRecent: () => cacheManager.get<any[]>('ventas:recent'),
    setRecent: (data: any[]) => cacheManager.set('ventas:recent', data, {
      ttl: config.cacheTTL / 2, // Cache más corto para ventas
      tags: ['ventas'],
      dependencies: ['ventas:modified', 'productos:modified']
    }),
    invalidate: () => cacheManager.invalidateByTag('ventas')
  },

  // Cache de clientes
  clientes: {
    getAll: () => cacheManager.get<any[]>('clientes:all'),
    setAll: (data: any[]) => cacheManager.set('clientes:all', data, {
      ttl: config.cacheTTL,
      tags: ['clientes'],
      dependencies: ['clientes:modified'],
      persistent: true
    }),
    invalidate: () => cacheManager.invalidateByTag('clientes')
  },

  // Cache del dashboard
  dashboard: {
    getKPIs: () => cacheManager.get<any>('dashboard:kpis'),
    setKPIs: (data: any) => cacheManager.set('dashboard:kpis', data, {
      ttl: config.cacheTTL / 6, // 5 minutos para KPIs
      tags: ['dashboard'],
      dependencies: ['ventas:modified', 'productos:modified', 'caja:modified']
    }),
    invalidate: () => cacheManager.invalidateByTag('dashboard')
  }
}

// Función para invalidar cache después de mutaciones
export function invalidateRelatedCache(operation: string, entity: string): void {
  const dependency = `${entity}:modified`
  cacheManager.invalidateByDependency(dependency)
  
  // Invalidaciones específicas
  if (entity === 'productos') {
    businessCache.ventas.invalidate() // Las ventas dependen de productos
    businessCache.dashboard.invalidate()
  }
  
  if (entity === 'ventas') {
    businessCache.dashboard.invalidate()
  }
  
  if (config.debug) {
    console.log(`🗄️ [Cache] Invalidated cache for ${entity} ${operation}`)
  }
}

export default cacheManager
