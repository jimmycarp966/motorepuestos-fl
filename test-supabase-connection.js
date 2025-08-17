// Script para probar la conexión con Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hsajhnxtlgfpkpzcrjyb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseConnection() {
  console.log('🔍 Probando conexión con Supabase...')
  
  try {
    // 1. Probar conexión básica
    console.log('1. Probando conexión básica...')
    const { data, error } = await supabase
      .from('empleados')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Error en conexión básica:', error)
    } else {
      console.log('✅ Conexión básica exitosa')
    }

    // 2. Probar lectura de empleados
    console.log('2. Probando lectura de empleados...')
    const { data: empleados, error: empleadosError } = await supabase
      .from('empleados')
      .select('*')
      .limit(5)
    
    if (empleadosError) {
      console.error('❌ Error leyendo empleados:', empleadosError)
    } else {
      console.log('✅ Lectura de empleados exitosa')
      console.log('Empleados encontrados:', empleados?.length || 0)
    }

    // 3. Probar inserción de empleado de prueba
    console.log('3. Probando inserción de empleado...')
    const testEmpleado = {
      nombre: 'Test Empleado',
      email: 'test-' + Date.now() + '@motorepuestos.com',
      rol: 'Vendedor',
      salario: 1500.00,
      permisos_modulos: ['dashboard', 'ventas', 'clientes'],
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: insertData, error: insertError } = await supabase
      .from('empleados')
      .insert([testEmpleado])
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Error insertando empleado:', insertError)
      console.error('Detalles del error:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      })
    } else {
      console.log('✅ Inserción de empleado exitosa')
      console.log('Empleado creado:', insertData)
      
      // 4. Limpiar empleado de prueba
      console.log('4. Limpiando empleado de prueba...')
      const { error: deleteError } = await supabase
        .from('empleados')
        .delete()
        .eq('id', insertData.id)
      
      if (deleteError) {
        console.error('❌ Error eliminando empleado de prueba:', deleteError)
      } else {
        console.log('✅ Empleado de prueba eliminado correctamente')
      }
    }

    // 5. Verificar políticas RLS
    console.log('5. Verificando políticas RLS...')
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'empleados' })
      .catch(() => ({ data: null, error: { message: 'Función get_policies no disponible' } }))
    
    if (policiesError) {
      console.log('⚠️ No se pudieron verificar políticas RLS:', policiesError.message)
    } else {
      console.log('✅ Políticas RLS verificadas')
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar el test
testSupabaseConnection()
