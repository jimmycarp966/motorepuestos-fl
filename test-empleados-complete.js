// Script para probar la creación completa de empleados con autenticación
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hsajhnxtlgfpkpzcrjyb.supabase.co'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI1NzY0NSwiZXhwIjoyMDcwODMzNjQ1fQ.Z_KzATN2NK9cvxAJMokNjtwhN1VWAUQH6Ezl_2-zFiU'

const supabase = createClient(supabaseUrl, anonKey)
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

async function testCompleteEmpleadoCreation() {
  console.log('🚀 Probando creación completa de empleados...')
  
  try {
    // 1. Crear usuario en auth usando service role key
    console.log('1. Creando usuario en Auth...')
    const testEmail = 'test-' + Date.now() + '@motorepuestos.com'
    const testPassword = 'Test123!'
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        nombre: 'Test Empleado Completo',
        rol: 'Vendedor'
      }
    })
    
    if (authError) {
      console.error('❌ Error creando usuario en Auth:', authError)
      return
    }
    
    console.log('✅ Usuario creado en Auth:', authData.user.id)
    
    // 2. Crear empleado en tabla empleados
    console.log('2. Creando empleado en tabla empleados...')
    const empleadoData = {
      id: authData.user.id,
      nombre: 'Test Empleado Completo',
      email: testEmail,
      rol: 'Vendedor',
      salario: 1500.00,
      permisos_modulos: ['dashboard', 'ventas', 'clientes'],
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data: empleadoResult, error: empleadoError } = await supabase
      .from('empleados')
      .insert([empleadoData])
      .select()
      .single()
    
    if (empleadoError) {
      console.error('❌ Error creando empleado en tabla:', empleadoError)
      return
    }
    
    console.log('✅ Empleado creado en tabla:', empleadoResult.id)
    
    // 3. Verificar que se puede hacer login
    console.log('3. Probando login del empleado...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })
    
    if (loginError) {
      console.error('❌ Error en login:', loginError)
    } else {
      console.log('✅ Login exitoso:', loginData.user.email)
      
      // Cerrar sesión
      await supabase.auth.signOut()
      console.log('✅ Sesión cerrada')
    }
    
    // 4. Verificar que aparece en la lista de empleados
    console.log('4. Verificando que aparece en la lista...')
    const { data: empleados, error: listError } = await supabase
      .from('empleados')
      .select('*')
      .eq('email', testEmail)
    
    if (listError) {
      console.error('❌ Error listando empleados:', listError)
    } else {
      console.log('✅ Empleado encontrado en lista:', empleados[0]?.nombre)
    }
    
    // 5. Limpiar datos de prueba
    console.log('5. Limpiando datos de prueba...')
    
    // Eliminar de tabla empleados
    const { error: deleteEmpleadoError } = await supabase
      .from('empleados')
      .delete()
      .eq('id', authData.user.id)
    
    if (deleteEmpleadoError) {
      console.error('❌ Error eliminando empleado:', deleteEmpleadoError)
    } else {
      console.log('✅ Empleado eliminado de tabla')
    }
    
    // Eliminar usuario de auth
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    
    if (deleteAuthError) {
      console.error('❌ Error eliminando usuario de auth:', deleteAuthError)
    } else {
      console.log('✅ Usuario eliminado de auth')
    }
    
    console.log('🎉 ¡Prueba completada exitosamente!')
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar el test
testCompleteEmpleadoCreation()
