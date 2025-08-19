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

async function testPermissions() {
  console.log('🧪 Probando lógica de permisos...')
  
  try {
    // Obtener usuario Mateo
    const { data: empleados, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('email', 'mateo@fl.com')
      .eq('activo', true)

    if (error) {
      throw new Error(`Error obteniendo empleado: ${error.message}`)
    }

    if (!empleados || empleados.length === 0) {
      console.log('❌ No se encontró el usuario Mateo')
      return
    }

    const user = empleados[0]
    console.log(`\n👤 Usuario: ${user.nombre} (${user.email})`)
    console.log(`🏷️  Rol: ${user.rol}`)
    console.log(`🔐 Permisos específicos: [${user.permisos_modulos?.join(', ') || 'ninguno'}]`)

    // Probar acceso a cada módulo
    const modules = ['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'reportes']
    
    console.log('\n📋 Resultados de acceso:')
    console.log('='.repeat(50))
    
    modules.forEach(module => {
      const hasAccess = canAccess(user, module)
      const status = hasAccess ? '✅' : '❌'
      console.log(`${status} ${module}: ${hasAccess ? 'ACCESO' : 'DENEGADO'}`)
    })

    // Mostrar permisos del rol para comparación
    console.log('\n🔍 Permisos del rol "Vendedor":')
    const rolePermissions = ROLE_PERMISSIONS[user.rol] || {}
    Object.entries(rolePermissions).forEach(([module, permissions]) => {
      if (permissions.length > 0) {
        console.log(`  - ${module}: [${permissions.join(', ')}]`)
      }
    })

    console.log('\n🎯 Conclusión:')
    if (user.permisos_modulos && user.permisos_modulos.length > 0) {
      console.log('✅ El usuario tiene permisos específicos definidos, por lo que SOLO puede acceder a esos módulos.')
      console.log('✅ Los permisos del rol se ignoran cuando hay permisos específicos.')
    } else {
      console.log('ℹ️  El usuario no tiene permisos específicos, usa los permisos del rol.')
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message)
  }
}

// Ejecutar prueba
testPermissions()
