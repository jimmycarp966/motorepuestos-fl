import { createClient } from '@supabase/supabase-js'

// Configuración directa sin validaciones complejas
const supabaseUrl = 'https://hsajhnxtlgfpkpzcrjyb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4'

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Función simple de prueba
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('empleados').select('count').limit(1)
    return { success: !error, error: error?.message }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

console.log('🔧 Supabase configurado con URL:', supabaseUrl)
