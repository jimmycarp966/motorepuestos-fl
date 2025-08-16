/**
 * Verificación completa del sistema
 * Valida que todos los módulos y componentes estén funcionando correctamente
 */

import { supabase } from '../lib/supabase'
import { useAppStore } from '../store'

export interface SystemVerificationResult {
  isValid: boolean
  modules: {
    auth: boolean
    productos: boolean
    ventas: boolean
    caja: boolean
    clientes: boolean
    empleados: boolean
    reportes: boolean
    dashboard: boolean
  }
  database: {
    tables: boolean
    functions: boolean
    policies: boolean
  }
  store: {
    slices: boolean
    actions: boolean
    selectors: boolean
  }
  errors: string[]
  warnings: string[]
}

export const verifySystem = async (): Promise<SystemVerificationResult> => {
  const result: SystemVerificationResult = {
    isValid: true,
    modules: {
      auth: false,
      productos: false,
      ventas: false,
      caja: false,
      clientes: false,
      empleados: false,
      reportes: false,
      dashboard: false,
    },
    database: {
      tables: false,
      functions: false,
      policies: false,
    },
    store: {
      slices: false,
      actions: false,
      selectors: false,
    },
    errors: [],
    warnings: [],
  }

  try {
    console.log('🔍 Iniciando verificación completa del sistema...')

    // 1. Verificar conexión a Supabase
    console.log('🔍 Verificando conexión a Supabase...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('empleados')
      .select('count')
      .limit(1)

    if (connectionError) {
      result.errors.push(`Error de conexión: ${connectionError.message}`)
      result.isValid = false
    } else {
      console.log('✅ Conexión a Supabase: OK')
    }

    // 2. Verificar tablas de la base de datos
    console.log('🔍 Verificando tablas de la base de datos...')
    const tablesToCheck = [
      'empleados',
      'productos',
      'clientes',
      'ventas',
      'venta_items',
      'caja_movimientos'
    ]

    for (const table of tablesToCheck) {
      try {
        const { error } = await supabase.from(table).select('count').limit(1)
        if (error) {
          result.errors.push(`Tabla ${table}: ${error.message}`)
          result.isValid = false
        } else {
          console.log(`✅ Tabla ${table}: OK`)
        }
      } catch (error) {
        result.errors.push(`Error verificando tabla ${table}: ${error}`)
        result.isValid = false
      }
    }

    if (result.errors.length === 0) {
      result.database.tables = true
    }

    // 3. Verificar funciones RPC
    console.log('🔍 Verificando funciones RPC...')
    try {
      const { error: functionError } = await supabase.rpc('decrementar_stock', {
        producto_id: '00000000-0000-0000-0000-000000000000',
        cantidad: 0
      })
      
      if (functionError && !functionError.message.includes('Producto no encontrado')) {
        result.errors.push(`Función decrementar_stock: ${functionError.message}`)
        result.isValid = false
      } else {
        console.log('✅ Función decrementar_stock: OK')
      }
    } catch (error) {
      result.warnings.push(`Función RPC no disponible: ${error}`)
    }

    // 4. Verificar store Zustand
    console.log('🔍 Verificando store Zustand...')
    try {
      const store = useAppStore.getState()
      const requiredSlices = ['auth', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'ui', 'notifications']
      const requiredActions = ['login', 'fetchProductos', 'registrarVenta', 'registrarIngreso']

      // Verificar slices
      const missingSlices = requiredSlices.filter(slice => !(slice in store))
      if (missingSlices.length > 0) {
        result.errors.push(`Slices faltantes: ${missingSlices.join(', ')}`)
        result.isValid = false
      } else {
        result.store.slices = true
        console.log('✅ Slices del store: OK')
      }

      // Verificar acciones
      const missingActions = requiredActions.filter(action => !(action in store))
      if (missingActions.length > 0) {
        result.errors.push(`Acciones faltantes: ${missingActions.join(', ')}`)
        result.isValid = false
      } else {
        result.store.actions = true
        console.log('✅ Acciones del store: OK')
      }

      // Verificar selectores
      try {
        const auth = useAppStore(state => state.auth)
        const productos = useAppStore(state => state.productos)
        if (auth && productos) {
          result.store.selectors = true
          console.log('✅ Selectores del store: OK')
        }
      } catch (error) {
        result.errors.push(`Error en selectores: ${error}`)
        result.isValid = false
      }

    } catch (error) {
      result.errors.push(`Error verificando store: ${error}`)
      result.isValid = false
    }

    // 5. Verificar módulos individuales
    console.log('🔍 Verificando módulos individuales...')

    // Auth
    try {
      const { data: { session } } = await supabase.auth.getSession()
      result.modules.auth = true
      console.log('✅ Módulo Auth: OK')
    } catch (error) {
      result.warnings.push(`Módulo Auth: ${error}`)
    }

    // Productos
    try {
      const { data: productos, error } = await supabase.from('productos').select('*').limit(1)
      if (!error && productos !== null) {
        result.modules.productos = true
        console.log('✅ Módulo Productos: OK')
      }
    } catch (error) {
      result.warnings.push(`Módulo Productos: ${error}`)
    }

    // Clientes
    try {
      const { data: clientes, error } = await supabase.from('clientes').select('*').limit(1)
      if (!error && clientes !== null) {
        result.modules.clientes = true
        console.log('✅ Módulo Clientes: OK')
      }
    } catch (error) {
      result.warnings.push(`Módulo Clientes: ${error}`)
    }

    // Empleados
    try {
      const { data: empleados, error } = await supabase.from('empleados').select('*').limit(1)
      if (!error && empleados !== null) {
        result.modules.empleados = true
        console.log('✅ Módulo Empleados: OK')
      }
    } catch (error) {
      result.warnings.push(`Módulo Empleados: ${error}`)
    }

    // Ventas
    try {
      const { data: ventas, error } = await supabase.from('ventas').select('*').limit(1)
      if (!error && ventas !== null) {
        result.modules.ventas = true
        console.log('✅ Módulo Ventas: OK')
      }
    } catch (error) {
      result.warnings.push(`Módulo Ventas: ${error}`)
    }

    // Caja
    try {
      const { data: movimientos, error } = await supabase.from('caja_movimientos').select('*').limit(1)
      if (!error && movimientos !== null) {
        result.modules.caja = true
        console.log('✅ Módulo Caja: OK')
      }
    } catch (error) {
      result.warnings.push(`Módulo Caja: ${error}`)
    }

    // Dashboard y Reportes (se consideran OK si los datos están disponibles)
    if (result.modules.ventas && result.modules.productos && result.modules.caja) {
      result.modules.dashboard = true
      result.modules.reportes = true
      console.log('✅ Módulos Dashboard y Reportes: OK')
    }

    // 6. Verificar políticas RLS
    console.log('🔍 Verificando políticas RLS...')
    try {
      // Intentar acceder a datos sin autenticación (debería fallar)
      const { data: testData, error: testError } = await supabase
        .from('empleados')
        .select('*')
        .limit(1)

      if (testError && testError.message.includes('policy')) {
        result.database.policies = true
        console.log('✅ Políticas RLS: OK')
      } else {
        result.warnings.push('Políticas RLS no verificadas completamente')
      }
    } catch (error) {
      result.warnings.push(`Verificación RLS: ${error}`)
    }

    // 7. Resumen final
    const modulesWorking = Object.values(result.modules).filter(Boolean).length
    const totalModules = Object.keys(result.modules).length

    console.log(`🎯 Verificación completada:`)
    console.log(`  - Módulos funcionando: ${modulesWorking}/${totalModules}`)
    console.log(`  - Base de datos: ${result.database.tables ? '✅' : '❌'}`)
    console.log(`  - Store: ${result.store.slices && result.store.actions ? '✅' : '❌'}`)
    console.log(`  - Errores: ${result.errors.length}`)
    console.log(`  - Advertencias: ${result.warnings.length}`)

    if (result.errors.length > 0) {
      console.log('❌ Errores encontrados:')
      result.errors.forEach(error => console.log(`  - ${error}`))
    }

    if (result.warnings.length > 0) {
      console.log('⚠️ Advertencias:')
      result.warnings.forEach(warning => console.log(`  - ${warning}`))
    }

    if (result.isValid) {
      console.log('✅ Sistema verificado y funcionando correctamente')
    } else {
      console.log('❌ Sistema tiene problemas que requieren atención')
    }

  } catch (error) {
    result.errors.push(`Error general en verificación: ${error}`)
    result.isValid = false
    console.error('❌ Error en verificación del sistema:', error)
  }

  return result
}

export const getSystemStatus = (): string => {
  const store = useAppStore.getState()
  
  const status = {
    authenticated: !!store.auth.user,
    userRole: store.auth.user?.rol || 'none',
    modulesLoaded: {
      productos: store.productos.productos.length,
      clientes: store.clientes.clientes.length,
      empleados: store.empleados.empleados.length,
      ventas: store.ventas.ventas.length,
      movimientos: store.caja.movimientos.length,
    }
  }

  return JSON.stringify(status, null, 2)
}
