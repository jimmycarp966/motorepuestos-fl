// ================================================
// SISTEMA DE CACHE INTELIGENTE CON TTL Y DEPENDENCIAS
// ================================================
// Cache avanzado con invalidación por dependencias y TTL inteligente

import { config } from './config'

// Tipos para el sistema de cache mejorado
export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  expiresAt: number
  dependencies: string[]
  accessCount: number
  lastAccessed: number
}

export interface CacheOptions {
  ttl?: number // Time to live en milisegundos
  dependencies?: string[] // Claves de las que depende esta entrada
  priority?: 'low' | 'medium' | 'high' // Prioridad para LRU
}

// Clase avanzada del gestor de cache
class SmartCacheManager {
  private cache = new Map<string, CacheEntry>()
  private dependencies = new Map<string, Set<string>>() // dep -> [keys que dependen]
  private timers = new Map<string, NodeJS.Timeout>()
  private maxSize = 200 // Máximo de entradas en memoria
  private defaultTTL = 5 * 60 * 1000 // 5 minutos por defecto

  constructor() {
    if (config.debug) {
      console.log('🗄️ [SmartCache] Sistema de cache inteligente inicializado')
    }
    
    // Limpieza periódica cada 10 minutos
    setInterval(() => this.cleanup(), 10 * 60 * 1000)
  }

  /**
   * Obtener valor del cache con estadísticas
   */
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      if (config.debug) {
        console.log(`🗄️ [SmartCache] MISS: ${key}`)
      }
      return null
    }

    // Verificar expiración
    if (Date.now() > entry.expiresAt) {
      this.delete(key)
      if (config.debug) {
        console.log(`🗄️ [SmartCache] EXPIRED: ${key}`)
      }
      return null
    }

    // Actualizar estadísticas de acceso
    entry.accessCount++
    entry.lastAccessed = Date.now()

    if (config.debug) {
      console.log(`🗄️ [SmartCache] HIT: ${key} (accesos: ${entry.accessCount})`)
    }
    
    return entry.data as T
  }

  /**
   * Almacenar valor en cache con dependencias
   */
  set<T = any>(key: string, data: T, options: CacheOptions = {}): void {
    const { 
      ttl = this.defaultTTL,
      dependencies = [],
      priority = 'medium'
    } = options

    // Limpiar cache si está lleno (usando LRU)
    if (this.cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed()
    }

    // Limpiar timer anterior si existe
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!)
      this.timers.delete(key)
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      dependencies,
      accessCount: 0,
      lastAccessed: Date.now()
    }

    this.cache.set(key, entry)

    // Registrar dependencias
    dependencies.forEach(dep => {
      if (!this.dependencies.has(dep)) {
        this.dependencies.set(dep, new Set())
      }
      this.dependencies.get(dep)!.add(key)
    })

    // Configurar auto-expiración
    const timer = setTimeout(() => {
      this.delete(key)
    }, ttl)
    this.timers.set(key, timer)

    if (config.debug) {
      console.log(`🗄️ [SmartCache] SET: ${key} (TTL: ${ttl}ms, deps: [${dependencies.join(', ')}])`)
    }
  }

  /**
   * Eliminar entrada del cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (entry) {
      // Limpiar dependencias
      entry.dependencies.forEach(dep => {
        const dependents = this.dependencies.get(dep)
        if (dependents) {
          dependents.delete(key)
          if (dependents.size === 0) {
            this.dependencies.delete(dep)
          }
        }
      })
      
      // Limpiar timer
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key)!)
        this.timers.delete(key)
      }
    }
    
    const deleted = this.cache.delete(key)
    if (config.debug && deleted) {
      console.log(`🗄️ [SmartCache] DELETE: ${key}`)
    }
    return deleted
  }

  /**
   * Invalidar por dependencia
   */
  invalidateByDependency(dependency: string): number {
    const dependents = this.dependencies.get(dependency)
    if (!dependents) return 0
    
    let invalidated = 0
    for (const key of dependents) {
      if (this.delete(key)) {
        invalidated++
      }
    }
    
    if (config.debug && invalidated > 0) {
      console.log(`🗄️ [SmartCache] INVALIDATED ${invalidated} entries by dependency: ${dependency}`)
    }
    
    return invalidated
  }

  /**
   * Expulsar entradas menos usadas (LRU)
   */
  private evictLeastRecentlyUsed(): void {
    if (this.cache.size === 0) return
    
    // Encontrar la entrada menos recientemente accedida
    let oldestKey: string | null = null
    let oldestTime = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey)
      if (config.debug) {
        console.log(`🗄️ [SmartCache] EVICTED (LRU): ${oldestKey}`)
      }
    }
  }

  /**
   * Limpieza de entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now()
    const expired: string[] = []
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expired.push(key)
      }
    }
    
    expired.forEach(key => this.delete(key))
    
    if (config.debug && expired.length > 0) {
      console.log(`🗄️ [SmartCache] CLEANUP: Removed ${expired.length} expired entries`)
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

export const smartCache = new SmartCacheManager()

// Helpers específicos para cada entidad con dependencias
export const businessCache = {
  productos: {
    getAll: () => smartCache.get<any[]>('productos:all'),
    setAll: (data: any[]) => smartCache.set('productos:all', data, {
      ttl: 10 * 60 * 1000, // 10 minutos
      dependencies: ['productos']
    }),
    getByCategory: (categoria: string) => smartCache.get<any[]>(`productos:category:${categoria}`),
    setByCategory: (categoria: string, data: any[]) => smartCache.set(`productos:category:${categoria}`, data, {
      ttl: 5 * 60 * 1000,
      dependencies: ['productos', `productos:${categoria}`]
    }),
    invalidate: () => smartCache.invalidateByDependency('productos')
  },
  
  ventas: {
    getAll: () => smartCache.get<any[]>('ventas:all'),
    setAll: (data: any[]) => smartCache.set('ventas:all', data, {
      ttl: 2 * 60 * 1000, // 2 minutos (más volátil)
      dependencies: ['ventas']
    }),
    getRecent: () => smartCache.get<any[]>('ventas:recent'),
    setRecent: (data: any[]) => smartCache.set('ventas:recent', data, {
      ttl: 1 * 60 * 1000, // 1 minuto
      dependencies: ['ventas', 'dashboard']
    }),
    invalidate: () => smartCache.invalidateByDependency('ventas')
  },
  
  clientes: {
    getAll: () => smartCache.get<any[]>('clientes:all'),
    setAll: (data: any[]) => smartCache.set('clientes:all', data, {
      ttl: 15 * 60 * 1000, // 15 minutos (menos volátil)
      dependencies: ['clientes']
    }),
    invalidate: () => smartCache.invalidateByDependency('clientes')
  },
  
  dashboard: {
    getKPIs: () => smartCache.get<any>('dashboard:kpis'),
    setKPIs: (data: any) => smartCache.set('dashboard:kpis', data, {
      ttl: 5 * 60 * 1000,
      dependencies: ['dashboard', 'ventas', 'productos', 'caja']
    }),
    invalidate: () => smartCache.invalidateByDependency('dashboard')
  }
}

// Función mejorada para invalidar cache después de mutaciones
export function invalidateRelatedCache(operation: string, entity: string): void {
  switch (entity) {
    case 'productos':
      businessCache.productos.invalidate()
      // También invalidar dashboard que depende de productos
      smartCache.invalidateByDependency('dashboard')
      break
      
    case 'ventas':
      businessCache.ventas.invalidate()
      // Invalidar dashboard y caja que dependen de ventas
      smartCache.invalidateByDependency('dashboard')
      smartCache.invalidateByDependency('caja')
      break
      
    case 'clientes':
      businessCache.clientes.invalidate()
      break
      
    case 'caja':
      smartCache.invalidateByDependency('caja')
      smartCache.invalidateByDependency('dashboard')
      break
  }
  
  if (config.debug) {
    console.log(`🗄️ [SmartCache] Invalidated cache for ${entity} ${operation}`)
  }
}

// Mantener retrocompatibilidad
export const cacheManager = smartCache

export default smartCache