import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hsajhnxtlgfpkpzcrjyb.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4'

const supabase = createClient(supabaseUrl, supabaseKey)

// Mapeo de roles a permisos granulares (copiado del frontend)
const ROLE_PERMISSIONS = {
  Administrador: {
    dashboard: ['read'],
    empleados: ['read', 'create', 'update', 'delete', 'manage'],
    productos: ['read', 'create', 'update', 'delete', 'manage'],
    clientes: ['read', 'create', 'update', 'delete', 'manage'],
    ventas: ['read', 'create', 'update', 'delete', 'manage'],
    caja: ['read', 'create', 'update', 'delete', 'manage'],
    calendario: ['read', 'create', 'update', 'delete'],
    reportes: ['read', 'create', 'manage']
  },
  Gerente: {
    dashboard: ['read'],
    empleados: ['read', 'create', 'update'],
    productos: ['read', 'create', 'update', 'delete'],
    clientes: ['read', 'create', 'update', 'delete'],
    ventas: ['read', 'create', 'update', 'delete'],
    caja: ['read', 'create', 'update', 'manage'],
    calendario: ['read', 'create', 'update'],
    reportes: ['read', 'create']
  },
  Vendedor: {
    dashboard: ['read'],
    empleados: [],
    productos: ['read'],
    clientes: ['read', 'create', 'update'],
    ventas: ['read', 'create'],
    caja: ['read'],
    calendario: ['read', 'create'],
    reportes: []
  },
  Técnico: {
    dashboard: ['read'],
    empleados: [],
    productos: ['read', 'create', 'update'],
    clientes: ['read'],
    ventas: [],
    caja: [],
    calendario: ['read'],
    reportes: []
  },
  Almacén: {
    dashboard: ['read'],
    empleados: [],
    productos: ['read', 'create', 'update'],
    clientes: [],
    ventas: [],
    caja: [],
    calendario: ['read'],
    reportes: []
  },
  Cajero: {
    dashboard: ['read'],
    empleados: [],
    productos: ['read'],
    clientes: ['read'],
    ventas: ['read', 'create'],
    caja: ['read', 'create', 'update'],
    calendario: ['read'],
    reportes: []
  }
}

// Función de permisos (copiada del frontend corregida)
function canAccess(user, module) {
  if (!user || !user.activo) return false
  
  // Si el usuario es administrador, tiene acceso a todo
  if (user.rol === 'Administrador') {
    return true
  }
  
  // Verificar permisos específicos del usuario
  const hasModuleInPermissions = user.permisos_modulos?.includes(module) || false
  
  // Si el usuario tiene permisos específicos definidos, SOLO usar esos
  if (user.permisos_modulos && user.permisos_modulos.length > 0) {
    return hasModuleInPermissions
  }
  
  // Si no tiene permisos específicos definidos, usar permisos del rol
  const rolePermissions = ROLE_PERMISSIONS[user.rol] || {}
  const hasRolePermissions = (rolePermissions[module] || []).length > 0
  
  return hasRolePermissions
}

// Función para obtener el primer módulo disponible
function getFirstAvailableModule(user) {
  if (!user || !user.activo) return 'dashboard'
  
  const priorityModules = [
    'ventas', 'clientes', 'caja', 'productos', 'empleados', 'reportes', 'dashboard'
  ]
  
  for (const module of priorityModules) {
    if (canAccess(user, module)) {
      return module
    }
  }
  
  return 'dashboard' // Fallback
}

async function testFirstModule() {
  console.log('🧪 Probando lógica del primer módulo disponible...')
  
  try {
    // Obtener todos los empleados activos
    const { data: empleados, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('activo', true)

    if (error) {
      throw new Error(`Error obteniendo empleados: ${error.message}`)
    }

    if (!empleados || empleados.length === 0) {
      console.log('❌ No se encontraron empleados activos')
      return
    }

    console.log(`\n📋 Probando ${empleados.length} empleados:`)
    console.log('='.repeat(80))
    
    empleados.forEach((user, index) => {
      const firstModule = getFirstAvailableModule(user)
      const accessibleModules = ['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'reportes']
        .filter(module => canAccess(user, module))
      
      console.log(`${index + 1}. 👤 ${user.nombre} (${user.email})`)
      console.log(`   🏷️  Rol: ${user.rol}`)
      console.log(`   🔐 Permisos específicos: [${user.permisos_modulos?.join(', ') || 'ninguno'}]`)
      console.log(`   📋 Módulos accesibles: [${accessibleModules.join(', ')}]`)
      console.log(`   🎯 Primer módulo disponible: ${firstModule}`)
      console.log('')
    })

    // Caso especial: Usuario Mateo
    const mateo = empleados.find(e => e.email === 'mateo@fl.com')
    if (mateo) {
      console.log('🎯 CASO ESPECIAL - Usuario Mateo:')
      console.log('='.repeat(50))
      console.log(`👤 Usuario: ${mateo.nombre} (${mateo.email})`)
      console.log(`🏷️  Rol: ${mateo.rol}`)
      console.log(`🔐 Permisos específicos: [${mateo.permisos_modulos?.join(', ') || 'ninguno'}]`)
      
      const firstModule = getFirstAvailableModule(mateo)
      console.log(`🎯 Primer módulo disponible: ${firstModule}`)
      
      if (firstModule === 'ventas') {
        console.log('✅ CORRECTO: Mateo debería ir a VENTAS como primer módulo')
      } else {
        console.log('❌ INCORRECTO: Mateo debería ir a VENTAS, no a', firstModule)
      }
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message)
  }
}

// Ejecutar prueba
testFirstModule()
