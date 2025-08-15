/**
 * Utilidad para verificar que no hay exportaciones duplicadas
 * Se ejecuta para detectar problemas de exportación
 */

export const validateExports = async () => {
  console.log('🔍 Verificando exportaciones...')
  
  const issues: string[] = []
  
  // Verificar que las funciones principales están disponibles usando import dinámico
  try {
    const checkConfigModule = await import('./checkConfig')
    if (checkConfigModule.checkSupabaseConfig && checkConfigModule.validateSupabaseConnection) {
      console.log('✅ checkConfig.ts: Exportaciones válidas')
    } else {
      issues.push('checkConfig.ts: Funciones faltantes')
    }
  } catch (error) {
    issues.push('checkConfig.ts: Error en importación')
    console.error('❌ checkConfig.ts:', error)
  }
  
  try {
    const checkImportsModule = await import('./checkImports')
    if (checkImportsModule.checkSupabaseImports && checkImportsModule.validateStoreStructure) {
      console.log('✅ checkImports.ts: Exportaciones válidas')
    } else {
      issues.push('checkImports.ts: Funciones faltantes')
    }
  } catch (error) {
    issues.push('checkImports.ts: Error en importación')
    console.error('❌ checkImports.ts:', error)
  }

  if (issues.length > 0) {
    console.error('❌ Problemas de exportación detectados:')
    issues.forEach(issue => console.error('  -', issue))
    return {
      isValid: false,
      issues,
      message: 'Problemas de exportación detectados'
    }
  }

  console.log('✅ Todas las exportaciones son válidas')
  return {
    isValid: true,
    issues: [],
    message: 'Exportaciones correctas'
  }
}

export const checkFunctionAvailability = () => {
  console.log('🔍 Verificando disponibilidad de funciones...')
  
  const requiredFunctions = [
    'checkSupabaseConfig',
    'validateSupabaseConnection',
    'checkSupabaseImports',
    'validateStoreStructure',
    'performHealthCheck'
  ]
  
  const availableFunctions: string[] = []
  const missingFunctions: string[] = []
  
  // Verificar cada función
  requiredFunctions.forEach(funcName => {
    try {
      // Intentar importar dinámicamente
      const module = require('./checkConfig')
      if (module[funcName]) {
        availableFunctions.push(funcName)
      } else {
        missingFunctions.push(funcName)
      }
    } catch (error) {
      missingFunctions.push(funcName)
    }
  })
  
  console.log('✅ Funciones disponibles:', availableFunctions.length)
  console.log('❌ Funciones faltantes:', missingFunctions.length)
  
  if (missingFunctions.length > 0) {
    console.error('  Funciones faltantes:', missingFunctions)
    return {
      isValid: false,
      available: availableFunctions,
      missing: missingFunctions,
      message: `Faltan ${missingFunctions.length} funciones`
    }
  }
  
  return {
    isValid: true,
    available: availableFunctions,
    missing: [],
    message: 'Todas las funciones están disponibles'
  }
}
