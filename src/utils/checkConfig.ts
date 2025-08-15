/**
 * Utilidad para verificar la configuración de Supabase
 * Se ejecuta al inicio de la aplicación para detectar problemas de configuración
 */

export const checkSupabaseConfig = () => {
  const config = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    nodeEnv: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD
  }

  console.log('🔧 Verificando configuración de Supabase:')
  console.log('  URL:', config.supabaseUrl ? '✅' : '❌', config.supabaseUrl || 'No definida')
  console.log('  Key:', config.supabaseAnonKey ? '✅' : '❌', config.supabaseAnonKey ? 'Definida' : 'No definida')
  console.log('  Mode:', config.nodeEnv)
  console.log('  Dev:', config.dev)
  console.log('  Prod:', config.prod)

  const issues: string[] = []

  if (!config.supabaseUrl) {
    issues.push('VITE_SUPABASE_URL no está definida')
  }

  if (!config.supabaseAnonKey) {
    issues.push('VITE_SUPABASE_ANON_KEY no está definida')
  }

  if (issues.length > 0) {
    console.error('❌ Problemas de configuración detectados:')
    issues.forEach(issue => console.error('  -', issue))
    
    if (config.dev) {
      console.warn('⚠️ Modo desarrollo: usando configuración de fallback')
      return {
        isValid: false,
        issues,
        canContinue: true,
        message: 'Usando configuración de fallback para desarrollo'
      }
    } else {
      return {
        isValid: false,
        issues,
        canContinue: false,
        message: 'Configuración inválida para producción'
      }
    }
  }

  console.log('✅ Configuración válida')
  return {
    isValid: true,
    issues: [],
    canContinue: true,
    message: 'Configuración correcta'
  }
}

export const validateSupabaseConnection = async () => {
  try {
    // Importar dinámicamente para evitar errores de inicialización
    const { supabase } = await import('../lib/supabase')
    
    console.log('🔍 Probando conexión con Supabase...')
    
    // Hacer una consulta simple para verificar la conexión
    const { data, error } = await supabase
      .from('empleados')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Error de conexión:', error)
      return {
        connected: false,
        error: error.message,
        message: 'No se pudo conectar con Supabase'
      }
    }

    console.log('✅ Conexión exitosa con Supabase')
    return {
      connected: true,
      error: null,
      message: 'Conexión establecida correctamente'
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      message: 'Error inesperado al conectar con Supabase'
    }
  }
}
