/**
 * Verificación completa del sistema (Health Check)
 * Valida configuración, importaciones, conexión y estructura del store
 */

import { checkSupabaseConfig, validateSupabaseConnection } from './checkConfig'
import { checkSupabaseImports, validateStoreStructure } from './checkImports'
import { validateExports } from './validateExports'

export interface HealthCheckResult {
  overall: 'healthy' | 'warning' | 'error'
  checks: {
    exports: { status: 'pass' | 'fail' | 'warning'; message: string }
    config: { status: 'pass' | 'fail' | 'warning'; message: string }
    imports: { status: 'pass' | 'fail' | 'warning'; message: string }
    connection: { status: 'pass' | 'fail' | 'warning'; message: string }
    store: { status: 'pass' | 'fail' | 'warning'; message: string }
  }
  issues: string[]
  canContinue: boolean
}

export const performHealthCheck = async (): Promise<HealthCheckResult> => {
  console.log('🏥 Iniciando verificación completa del sistema...')
  
  const result: HealthCheckResult = {
    overall: 'healthy',
    checks: {
      exports: { status: 'fail', message: 'No verificado' },
      config: { status: 'fail', message: 'No verificado' },
      imports: { status: 'fail', message: 'No verificado' },
      connection: { status: 'fail', message: 'No verificado' },
      store: { status: 'fail', message: 'No verificado' }
    },
    issues: [],
    canContinue: true
  }

  // 1. Verificar exportaciones
  console.log('📦 Verificando exportaciones...')
  const exportsCheck = await validateExports()
  result.checks.exports = {
    status: exportsCheck.isValid ? 'pass' : 'fail',
    message: exportsCheck.message
  }
  
  if (!exportsCheck.isValid) {
    result.issues.push(`Exportaciones: ${exportsCheck.message}`)
    result.canContinue = false
  }

  // 2. Verificar configuración (solo si las exportaciones están bien)
  if (result.canContinue) {
    console.log('📋 Verificando configuración...')
    const configCheck = checkSupabaseConfig()
    result.checks.config = {
      status: configCheck.isValid ? 'pass' : (configCheck.canContinue ? 'warning' : 'fail'),
      message: configCheck.message
    }
    
    if (!configCheck.isValid) {
      result.issues.push(`Configuración: ${configCheck.message}`)
      if (!configCheck.canContinue) {
        result.canContinue = false
      }
    }
  } else {
    result.checks.config = {
      status: 'fail',
      message: 'No verificado - exportaciones fallaron'
    }
  }

  // 3. Verificar importaciones (solo si todo lo anterior está bien)
  if (result.canContinue) {
    console.log('📦 Verificando importaciones...')
    const importsCheck = checkSupabaseImports()
    result.checks.imports = {
      status: importsCheck.isValid ? 'pass' : 'fail',
      message: importsCheck.message
    }
    
    if (!importsCheck.isValid) {
      result.issues.push(`Importaciones: ${importsCheck.message}`)
      result.canContinue = false
    }
  } else {
    result.checks.imports = {
      status: 'fail',
      message: 'No verificado - verificaciones anteriores fallaron'
    }
  }

  // 4. Verificar conexión (solo si todo lo anterior está bien)
  if (result.canContinue) {
    console.log('🔌 Verificando conexión...')
    const connectionCheck = await validateSupabaseConnection()
    result.checks.connection = {
      status: connectionCheck.connected ? 'pass' : 'fail',
      message: connectionCheck.message
    }
    
    if (!connectionCheck.connected) {
      result.issues.push(`Conexión: ${connectionCheck.message}`)
      result.canContinue = false
    }
  } else {
    result.checks.connection = {
      status: 'fail',
      message: 'No verificado - verificaciones anteriores fallaron'
    }
  }

  // 5. Verificar estructura del store (solo si todo lo anterior está bien)
  if (result.canContinue) {
    console.log('🏪 Verificando estructura del store...')
    const storeCheck = validateStoreStructure()
    result.checks.store = {
      status: storeCheck.isValid ? 'pass' : 'fail',
      message: storeCheck.message
    }
    
    if (!storeCheck.isValid) {
      result.issues.push(`Store: ${storeCheck.message}`)
      result.canContinue = false
    }
  } else {
    result.checks.store = {
      status: 'fail',
      message: 'No verificado - verificaciones anteriores fallaron'
    }
  }

  // Determinar estado general
  const failedChecks = Object.values(result.checks).filter(check => check.status === 'fail').length
  const warningChecks = Object.values(result.checks).filter(check => check.status === 'warning').length

  if (failedChecks > 0) {
    result.overall = 'error'
  } else if (warningChecks > 0) {
    result.overall = 'warning'
  } else {
    result.overall = 'healthy'
  }

  // Log del resultado
  console.log('🏥 Resultado de verificación completa:')
  console.log('  Estado general:', result.overall)
  console.log('  Exportaciones:', result.checks.exports.status, '-', result.checks.exports.message)
  console.log('  Configuración:', result.checks.config.status, '-', result.checks.config.message)
  console.log('  Importaciones:', result.checks.imports.status, '-', result.checks.imports.message)
  console.log('  Conexión:', result.checks.connection.status, '-', result.checks.connection.message)
  console.log('  Store:', result.checks.store.status, '-', result.checks.store.message)
  
  if (result.issues.length > 0) {
    console.log('  Problemas detectados:')
    result.issues.forEach(issue => console.log('    -', issue))
  }

  console.log('  ¿Puede continuar?', result.canContinue ? '✅ Sí' : '❌ No')

  return result
}

export const getHealthStatusEmoji = (status: 'healthy' | 'warning' | 'error'): string => {
  switch (status) {
    case 'healthy': return '✅'
    case 'warning': return '⚠️'
    case 'error': return '❌'
    default: return '❓'
  }
}

export const getCheckStatusEmoji = (status: 'pass' | 'fail' | 'warning'): string => {
  switch (status) {
    case 'pass': return '✅'
    case 'warning': return '⚠️'
    case 'fail': return '❌'
    default: return '❓'
  }
}
