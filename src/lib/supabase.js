import { createClient } from '@supabase/supabase-js'

// Configuración robusta con fallbacks y validación
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validación de variables de entorno
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas:')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌')
  console.error('Archivos .env disponibles:', import.meta.env)
  
  // Fallback para desarrollo
  if (import.meta.env.DEV) {
    console.warn('⚠️ Usando configuración de fallback para desarrollo')
  } else {
    throw new Error('Missing Supabase environment variables. Please check your .env file.')
  }
} else {
  console.log('✅ Supabase configurado correctamente')
}

// Configuración final con fallbacks
const finalUrl = supabaseUrl || 'https://hsajhnxtlgfpkpzcrjyb.supabase.co'
const finalKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4'

export const supabase = createClient(finalUrl, finalKey)

// Función de prueba de conexión
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('empleados').select('count').limit(1)
    if (error) {
      console.error('❌ Error de conexión con Supabase:', error)
      return false
    }
    console.log('✅ Conexión con Supabase exitosa')
    return true
  } catch (error) {
    console.error('❌ Error de conexión con Supabase:', error)
    return false
  }
}

// Función para verificar variables de entorno
export const checkEnvironmentVariables = () => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  console.log('🔍 Verificando variables de entorno:')
  console.log('VITE_SUPABASE_URL:', url ? '✅ Presente' : '❌ Faltante')
  console.log('VITE_SUPABASE_ANON_KEY:', key ? '✅ Presente' : '❌ Faltante')
  
  return {
    url: !!url,
    key: !!key,
    both: !!(url && key)
  }
}
