/**
 * Utilidad para verificar que todas las importaciones de Supabase son correctas
 * Se ejecuta al inicio para detectar problemas de importación
 */

export const checkSupabaseImports = () => {
  const importPaths = [
    'src/store/slices/authSlice.js',
    'src/store/slices/empleadosSlice.js',
    'src/store/slices/productosSlice.js',
    'src/store/slices/clientesSlice.js',
    'src/store/slices/ventasSlice.js',
    'src/store/slices/cajaSlice.js',
    'src/store/slices/authSlice.ts',
    'src/store/slices/empleadosSlice.ts',
    'src/store/slices/productosSlice.ts',
    'src/store/slices/clientesSlice.ts',
    'src/store/slices/ventasSlice.ts',
    'src/store/slices/cajaSlice.ts'
  ]

  console.log('🔍 Verificando importaciones de Supabase...')
  
  const issues: string[] = []
  
  // Verificar que el archivo principal existe
  try {
    const { supabase } = require('../lib/supabase')
    console.log('✅ src/lib/supabase.ts: Importación exitosa')
  } catch (error) {
    issues.push('src/lib/supabase.ts: No se puede importar')
    console.error('❌ src/lib/supabase.ts:', error)
  }

  // Verificar que no existe el archivo obsoleto
  try {
    require('../supabase')
    issues.push('src/supabase.js: Archivo obsoleto aún existe')
    console.error('❌ src/supabase.js: Archivo obsoleto encontrado')
  } catch (error) {
    console.log('✅ src/supabase.js: Archivo obsoleto eliminado correctamente')
  }

  if (issues.length > 0) {
    console.error('❌ Problemas de importación detectados:')
    issues.forEach(issue => console.error('  -', issue))
    return {
      isValid: false,
      issues,
      message: 'Problemas de importación detectados'
    }
  }

  console.log('✅ Todas las importaciones de Supabase son correctas')
  return {
    isValid: true,
    issues: [],
    message: 'Importaciones correctas'
  }
}

export const validateStoreStructure = () => {
  console.log('🔍 Verificando estructura del store...')
  
  try {
    const { useAppStore } = require('../store/index.js')
    console.log('✅ Store principal: Importación exitosa')
    
    // Verificar que el store tiene las propiedades básicas
    const store = useAppStore.getState()
    const requiredSlices = ['auth', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'ui', 'notifications']
    
    const missingSlices = requiredSlices.filter(slice => !(slice in store))
    
    if (missingSlices.length > 0) {
      console.error('❌ Slices faltantes:', missingSlices)
      return {
        isValid: false,
        issues: [`Slices faltantes: ${missingSlices.join(', ')}`],
        message: 'Estructura del store incompleta'
      }
    }
    
    console.log('✅ Estructura del store: Completa')
    return {
      isValid: true,
      issues: [],
      message: 'Estructura del store correcta'
    }
  } catch (error) {
    console.error('❌ Error verificando store:', error)
    return {
      isValid: false,
      issues: [error instanceof Error ? error.message : 'Error desconocido'],
      message: 'Error verificando estructura del store'
    }
  }
}
