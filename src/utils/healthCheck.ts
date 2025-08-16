/**
 * Utilidad para verificar la salud del sistema
 * Se ejecuta al inicio para detectar problemas de configuración y conexión
 */

import { supabase } from '../lib/supabase'

export interface HealthCheckResult {
  isValid: boolean
  issues: string[]
  message: string
  details?: {
    supabase: boolean
    auth: boolean
    database: boolean
    tables: string[]
  }
}

export const performHealthCheck = async (): Promise<HealthCheckResult> => {
  console.log('🔍 Iniciando verificación de salud del sistema...')
  
  const issues: string[] = []
  const details = {
    supabase: false,
    auth: false,
    database: false,
    tables: [] as string[]
  }

  try {
    // 1. Verificar conexión a Supabase
    console.log('🔍 Verificando conexión a Supabase...')
    const { data, error } = await supabase.from('empleados').select('count').limit(1)
    
    if (error) {
      issues.push(`Error de conexión a Supabase: ${error.message}`)
      console.error('❌ Error de conexión a Supabase:', error)
    } else {
      details.supabase = true
      details.database = true
      console.log('✅ Conexión a Supabase: OK')
    }

    // 2. Verificar autenticación
    console.log('🔍 Verificando autenticación...')
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      details.auth = true
      console.log('✅ Autenticación: Sesión activa')
    } else {
      console.log('ℹ️ Autenticación: No hay sesión activa (normal)')
    }

    // 3. Verificar tablas principales
    console.log('🔍 Verificando tablas principales...')
    const tablesToCheck = ['empleados', 'productos', 'clientes', 'ventas', 'caja_movimientos']
    
    for (const table of tablesToCheck) {
      try {
        const { error } = await supabase.from(table).select('count').limit(1)
        if (error) {
          issues.push(`Error en tabla ${table}: ${error.message}`)
          console.error(`❌ Error en tabla ${table}:`, error)
        } else {
          details.tables.push(table)
          console.log(`✅ Tabla ${table}: OK`)
        }
      } catch (error) {
        issues.push(`Error verificando tabla ${table}: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        console.error(`❌ Error verificando tabla ${table}:`, error)
      }
    }

  } catch (error) {
    issues.push(`Error general en health check: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    console.error('❌ Error general en health check:', error)
  }

  const isValid = issues.length === 0 && details.supabase && details.database
  const message = isValid 
    ? 'Sistema funcionando correctamente' 
    : `Se encontraron ${issues.length} problema(s)`

  console.log(`🎯 Health check completado: ${isValid ? '✅' : '❌'} ${message}`)

  return {
    isValid,
    issues,
    message,
    details
  }
}

export const checkSupabaseConfig = (): HealthCheckResult => {
  console.log('🔍 Verificando configuración de Supabase...')
  
  const issues: string[] = []
  
  // Verificar variables de entorno
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  if (!supabaseUrl) {
    issues.push('VITE_SUPABASE_URL no está definida')
  }
  
  if (!supabaseAnonKey) {
    issues.push('VITE_SUPABASE_ANON_KEY no está definida')
  }

  const isValid = issues.length === 0
  const message = isValid 
    ? 'Configuración de Supabase correcta' 
    : 'Problemas en configuración de Supabase'

  console.log(`🎯 Configuración de Supabase: ${isValid ? '✅' : '❌'} ${message}`)

  return {
    isValid,
    issues,
    message
  }
}

export const validateSupabaseConnection = async (): Promise<HealthCheckResult> => {
  console.log('🔍 Validando conexión a Supabase...')
  
  const issues: string[] = []
  
  try {
    // Intentar una consulta simple
    const { data, error } = await supabase.from('empleados').select('count').limit(1)
    
    if (error) {
      issues.push(`Error de conexión: ${error.message}`)
      console.error('❌ Error de conexión:', error)
    } else {
      console.log('✅ Conexión a Supabase validada')
    }
  } catch (error) {
    issues.push(`Error validando conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    console.error('❌ Error validando conexión:', error)
  }

  const isValid = issues.length === 0
  const message = isValid 
    ? 'Conexión a Supabase validada' 
    : 'Problemas de conexión a Supabase'

  console.log(`🎯 Validación de conexión: ${isValid ? '✅' : '❌'} ${message}`)

  return {
    isValid,
    issues,
    message
  }
}
