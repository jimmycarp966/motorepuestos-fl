// ================================================
// CONFIGURACIÓN CENTRALIZADA DEL SISTEMA
// ================================================
// Configuración robusta con validación y fallbacks seguros

// Tipos para configuración
export interface AppConfig {
  // Supabase
  supabase: {
    url: string
    anonKey: string
    serviceRoleKey?: string
  }
  
  // Aplicación
  app: {
    name: string
    version: string
    environment: 'development' | 'production' | 'test'
    debug: boolean
  }
  
  // UI/UX
  ui: {
    itemsPerPage: number
    autoRefreshInterval: number
    notificationDuration: number
    maxNotifications: number
  }
  
  // Performance
  performance: {
    cacheEnabled: boolean
    cacheTTL: number
    paginationEnabled: boolean
  }
  
  // Seguridad
  security: {
    sessionTimeout: number
    maxLoginAttempts: number
    auditEnabled: boolean
    strictRoles: boolean
  }
  
  // Funcionalidades
  features: {
    analytics: boolean
    reporting: boolean
    multiLanguage: boolean
    darkMode: boolean
    printing: boolean
  }
}

// Validación de variables de entorno
function validateEnvVar(key: string, value: string | undefined, required = true): string {
  if (!value) {
    if (required) {
      console.error(`❌ Variable de entorno requerida faltante: ${key}`)
      throw new Error(`Missing required environment variable: ${key}`)
    }
    return ''
  }
  return value
}

// Obtener configuración desde variables de entorno
function getEnvironmentConfig(): Partial<AppConfig> {
  try {
    // Variables de entorno con validación
    const supabaseUrl = validateEnvVar('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL)
    const supabaseAnonKey = validateEnvVar('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY)
    const appName = validateEnvVar('VITE_APP_NAME', import.meta.env.VITE_APP_NAME, false) || 'Motorepuestos F.L.'
    const appVersion = validateEnvVar('VITE_APP_VERSION', import.meta.env.VITE_APP_VERSION, false) || '1.0.0'
    const environment = validateEnvVar('NODE_ENV', import.meta.env.NODE_ENV, false) || 'development'

    return {
      supabase: {
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
        serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
      },
      app: {
        name: appName,
        version: appVersion,
        environment: environment as 'development' | 'production' | 'test',
        debug: environment === 'development'
      }
    }
  } catch (error) {
    console.error('❌ Error cargando configuración desde environment:', error)
    return {}
  }
}

// Configuración por defecto (fallback seguro)
const defaultConfig: AppConfig = {
  supabase: {
    url: 'https://hsajhnxtlgfpkpzcrjyb.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4'
  },
  
  app: {
    name: 'Motorepuestos F.L.',
    version: '1.0.1',
    environment: 'development',
    debug: true
  },
  
  ui: {
    itemsPerPage: 50,
    autoRefreshInterval: 30000, // 30 segundos
    notificationDuration: 5000, // 5 segundos
    maxNotifications: 5
  },
  
  performance: {
    cacheEnabled: true,
    cacheTTL: 300000, // 5 minutos
    paginationEnabled: true
  },
  
  security: {
    sessionTimeout: 3600000, // 1 hora
    maxLoginAttempts: 3,
    auditEnabled: true,
    strictRoles: true
  },
  
  features: {
    analytics: true,
    reporting: true,
    multiLanguage: false,
    darkMode: false,
    printing: true
  }
}

// Configuración específica por entorno
const environmentConfig: Record<string, Partial<AppConfig>> = {
  development: {
    app: {
      debug: true
    },
    ui: {
      itemsPerPage: 10, // Menos items para desarrollo
      autoRefreshInterval: 10000 // Más frecuente en desarrollo
    },
    performance: {
      cacheTTL: 60000 // Cache más corto en desarrollo
    }
  },
  
  production: {
    app: {
      debug: false
    },
    ui: {
      itemsPerPage: 50,
      autoRefreshInterval: 60000 // Menos frecuente en producción
    },
    performance: {
      cacheTTL: 600000 // Cache más largo en producción
    },
    security: {
      sessionTimeout: 1800000, // 30 minutos en producción
      auditEnabled: true,
      strictRoles: true
    }
  },
  
  test: {
    app: {
      debug: true
    },
    ui: {
      itemsPerPage: 5, // Pocos items para tests
      notificationDuration: 1000 // Notificaciones rápidas en tests
    },
    performance: {
      cacheEnabled: false // Sin cache en tests
    }
  }
}

// Función para merger configuraciones
function mergeConfig(...configs: Array<Partial<AppConfig>>): AppConfig {
  const merged = { ...defaultConfig }
  
  for (const config of configs) {
    Object.keys(config).forEach(key => {
      const configKey = key as keyof AppConfig
      if (typeof config[configKey] === 'object' && !Array.isArray(config[configKey])) {
        merged[configKey] = { ...merged[configKey], ...config[configKey] }
      } else {
        ;(merged as any)[configKey] = config[configKey]
      }
    })
  }
  
  return merged
}

// Obtener configuración final
function createAppConfig(): AppConfig {
  try {
    const envConfig = getEnvironmentConfig()
    const currentEnv = envConfig.app?.environment || 'development'
    const envSpecificConfig = environmentConfig[currentEnv] || {}
    
    const finalConfig = mergeConfig(defaultConfig, envConfig, envSpecificConfig)
    
    // Log de configuración en desarrollo
    if (finalConfig.app.debug) {
      console.log('🔧 [Config] Configuración cargada:', {
        environment: finalConfig.app.environment,
        supabaseUrl: finalConfig.supabase.url ? '✅' : '❌',
        cacheEnabled: finalConfig.performance.cacheEnabled,
        auditEnabled: finalConfig.security.auditEnabled
      })
    }
    
    return finalConfig
  } catch (error) {
    console.error('❌ [Config] Error creando configuración, usando fallback:', error)
    return defaultConfig
  }
}

// Configuración global de la aplicación
export const appConfig = createAppConfig()

// Helpers para acceso rápido a configuración común
export const config = {
  // Supabase
  supabaseUrl: appConfig.supabase.url,
  supabaseKey: appConfig.supabase.anonKey,
  supabaseServiceKey: appConfig.supabase.serviceRoleKey,
  
  // App
  appName: appConfig.app.name,
  appVersion: appConfig.app.version,
  isDevelopment: appConfig.app.environment === 'development',
  isProduction: appConfig.app.environment === 'production',
  isTest: appConfig.app.environment === 'test',
  debug: appConfig.app.debug,
  
  // UI
  itemsPerPage: appConfig.ui.itemsPerPage,
  autoRefresh: appConfig.ui.autoRefreshInterval,
  notificationDuration: appConfig.ui.notificationDuration,
  
  // Performance
  cacheEnabled: appConfig.performance.cacheEnabled,
  cacheTTL: appConfig.performance.cacheTTL,
  
  // Security
  sessionTimeout: appConfig.security.sessionTimeout,
  auditEnabled: appConfig.security.auditEnabled,
  strictRoles: appConfig.security.strictRoles,
  
  // Features
  features: appConfig.features
}

// Función para actualizar configuración en runtime (para tests)
export function updateConfig(newConfig: Partial<AppConfig>): void {
  Object.assign(appConfig, mergeConfig(appConfig, newConfig))
}

// Función para validar configuración
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validaciones críticas
  if (!appConfig.supabase.url) {
    errors.push('URL de Supabase es requerida')
  }
  
  if (!appConfig.supabase.anonKey) {
    errors.push('Clave anónima de Supabase es requerida')
  }
  
  if (!appConfig.app.name) {
    errors.push('Nombre de la aplicación es requerido')
  }
  
  if (appConfig.ui.itemsPerPage <= 0) {
    errors.push('Items per page debe ser mayor a 0')
  }
  
  if (appConfig.security.sessionTimeout <= 0) {
    errors.push('Session timeout debe ser mayor a 0')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Configuración de desarrollo para debugging
if (config.debug) {
  ;(window as any).__APP_CONFIG__ = appConfig
  console.log('🔧 [Config] Configuración disponible en window.__APP_CONFIG__')
}

export default appConfig
