/**
 * Health Check simplificado
 * Evita problemas de importación circular y verifica solo lo esencial
 */

export interface SimpleHealthCheckResult {
  overall: 'healthy' | 'warning' | 'error'
  config: { status: 'pass' | 'fail' | 'warning'; message: string }
  connection: { status: 'pass' | 'fail' | 'warning'; message: string }
  issues: string[]
  canContinue: boolean
}

export const performSimpleHealthCheck = async (): Promise<SimpleHealthCheckResult> => {
  console.log('🏥 Iniciando health check simplificado...')
  
  const result: SimpleHealthCheckResult = {
    overall: 'healthy',
    config: { status: 'fail', message: 'No verificado' },
    connection: { status: 'fail', message: 'No verificado' },
    issues: [],
    canContinue: true
  }

  // 1. Verificar configuración básica
  console.log('📋 Verificando configuración...')
  const configCheck = await checkBasicConfig()
  result.config = {
    status: configCheck.isValid ? 'pass' : (configCheck.canContinue ? 'warning' : 'fail'),
    message: configCheck.message
  }
  
  if (!configCheck.isValid) {
    result.issues.push(`Configuración: ${configCheck.message}`)
    if (!configCheck.canContinue) {
      result.canContinue = false
    }
  }

  // 2. Verificar conexión (solo si la configuración está bien)
  if (result.canContinue) {
    console.log('🔌 Verificando conexión...')
    const connectionCheck = await checkBasicConnection()
    result.connection = {
      status: connectionCheck.connected ? 'pass' : 'fail',
      message: connectionCheck.message
    }
    
    if (!connectionCheck.connected) {
      result.issues.push(`Conexión: ${connectionCheck.message}`)
      result.canContinue = false
    }
  } else {
    result.connection = {
      status: 'fail',
      message: 'No verificado - configuración falló'
    }
  }

  // Determinar estado general
  const failedChecks = [result.config, result.connection].filter(check => check.status === 'fail').length
  const warningChecks = [result.config, result.connection].filter(check => check.status === 'warning').length

  if (failedChecks > 0) {
    result.overall = 'error'
  } else if (warningChecks > 0) {
    result.overall = 'warning'
  } else {
    result.overall = 'healthy'
  }

  // Log del resultado
  console.log('🏥 Resultado de health check simplificado:')
  console.log('  Estado general:', result.overall)
  console.log('  Configuración:', result.config.status, '-', result.config.message)
  console.log('  Conexión:', result.connection.status, '-', result.connection.message)
  
  if (result.issues.length > 0) {
    console.log('  Problemas detectados:')
    result.issues.forEach(issue => console.log('    -', issue))
  }

  console.log('  ¿Puede continuar?', result.canContinue ? '✅ Sí' : '❌ No')

  return result
}

const checkBasicConfig = async () => {
  const config = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    nodeEnv: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD
  }

  console.log('🔧 Verificando configuración básica:')
  console.log('  URL:', config.supabaseUrl ? '✅' : '❌', config.supabaseUrl || 'No definida')
  console.log('  Key:', config.supabaseAnonKey ? '✅' : '❌', config.supabaseAnonKey ? 'Definida' : 'No definida')
  console.log('  Mode:', config.nodeEnv)

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

const checkBasicConnection = async () => {
  try {
    // Importar dinámicamente para evitar errores de inicialización
    const { supabase } = await import('../lib/supabase')
    
    console.log('🔍 Probando conexión básica con Supabase...')
    
    // Verificar solo la conexión básica sin acceder a tablas
    // Esto evita problemas de permisos y roles
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Error de conexión:', sessionError)
      return {
        connected: false,
        error: sessionError.message,
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

