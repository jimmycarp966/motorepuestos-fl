// Script de prueba para verificar conexión a Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hsajhnxtlgfpkpzcrjyb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4'

console.log('🔍 Iniciando prueba de conexión a Supabase...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Faltante')

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'motorepuestos-fl'
    }
  }
})

async function testConnection() {
  try {
    console.log('🔄 Probando conexión...')
    
    // Prueba 1: Verificar que el cliente se creó
    console.log('✅ Cliente de Supabase creado')
    
    // Prueba 2: Intentar una consulta simple sin RLS
    const { data, error } = await supabase
      .from('empleados')
      .select('id, nombre, email')
      .limit(1)
    
    if (error) {
      console.error('❌ Error en consulta:', error)
      return false
    }
    
    console.log('✅ Consulta exitosa:', data?.length || 0, 'empleados encontrados')
    
    // Prueba 3: Verificar usuario dani
    const { data: daniData, error: daniError } = await supabase
      .from('empleados')
      .select('*')
      .eq('email', 'dani@fl.com')
      .eq('activo', true)
      .single()
    
    if (daniError) {
      console.error('❌ Error verificando dani:', daniError)
    } else {
      console.log('✅ Usuario dani encontrado:', daniData?.rol)
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error de conexión:', error)
    return false
  }
}

// Ejecutar prueba
testConnection().then(success => {
  console.log(success ? '✅ Conexión exitosa' : '❌ Conexión fallida')
  process.exit(success ? 0 : 1)
})
