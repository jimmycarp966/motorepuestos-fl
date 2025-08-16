import { createClient } from '@supabase/supabase-js'

// Configuración directa sin validaciones complejas
const supabaseUrl = 'https://hsajhnxtlgfpkpzcrjyb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4'

// Crear cliente de Supabase con configuración específica
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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

// Función simple de prueba sin RLS
export const testConnection = async () => {
  try {
    console.log('🔄 Probando conexión sin RLS...')
    
    // Intentar una consulta simple que no dependa de RLS
    const { data, error } = await supabase
      .from('empleados')
      .select('id, nombre, email')
      .limit(1)
    
    if (error) {
      console.error('❌ Error en consulta:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Consulta exitosa:', data?.length || 0, 'empleados encontrados')
    return { success: true, data }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error)
    return { success: false, error: error.message }
  }
}

// Función para verificar usuario específico
export const checkUser = async (email) => {
  try {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('email', email)
      .eq('activo', true)
      .single()
    
    if (error) {
      console.error('❌ Error verificando usuario:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('❌ Error en checkUser:', error)
    return null
  }
}

console.log('🔧 Supabase configurado con URL:', supabaseUrl)
console.log('⚠️ RLS deshabilitado temporalmente para evitar recursión')
