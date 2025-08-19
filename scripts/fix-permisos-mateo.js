import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hsajhnxtlgfpkpzcrjyb.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixPermisosMateo() {
  console.log('🔧 Iniciando corrección de permisos para usuario Mateo...')
  
  try {
    // 1. Buscar el usuario Mateo
    console.log('📋 Buscando usuario Mateo...')
    const { data: empleados, error: searchError } = await supabase
      .from('empleados')
      .select('*')
      .or('email.ilike.%mateo%,nombre.ilike.%mateo%')
      .eq('activo', true)

    if (searchError) {
      throw new Error(`Error buscando empleado: ${searchError.message}`)
    }

    if (!empleados || empleados.length === 0) {
      console.log('❌ No se encontró ningún usuario con "mateo" en el nombre o email')
      return
    }

    console.log(`✅ Encontrados ${empleados.length} empleado(s):`)
    empleados.forEach(emp => {
      console.log(`   - ${emp.nombre} (${emp.email}) - Rol: ${emp.rol}`)
      console.log(`     Permisos actuales: [${emp.permisos_modulos?.join(', ') || 'ninguno'}]`)
    })

    // 2. Actualizar permisos para que solo tenga: clientes, caja, ventas
    const permisosCorrectos = ['clientes', 'caja', 'ventas']
    
    console.log(`🔧 Actualizando permisos a: [${permisosCorrectos.join(', ')}]`)
    
    const { data: updatedEmpleados, error: updateError } = await supabase
      .from('empleados')
      .update({ 
        permisos_modulos: permisosCorrectos,
        updated_at: new Date().toISOString()
      })
      .or('email.ilike.%mateo%,nombre.ilike.%mateo%')
      .eq('activo', true)
      .select()

    if (updateError) {
      throw new Error(`Error actualizando permisos: ${updateError.message}`)
    }

    console.log(`✅ Permisos actualizados exitosamente para ${updatedEmpleados?.length || 0} empleado(s)`)

    // 3. Verificar el resultado
    console.log('🔍 Verificando cambios...')
    const { data: verificacion, error: verifyError } = await supabase
      .from('empleados')
      .select('*')
      .or('email.ilike.%mateo%,nombre.ilike.%mateo%')
      .eq('activo', true)

    if (verifyError) {
      throw new Error(`Error verificando cambios: ${verifyError.message}`)
    }

    console.log('📊 Resultado final:')
    verificacion?.forEach(emp => {
      console.log(`   - ${emp.nombre} (${emp.email})`)
      console.log(`     Rol: ${emp.rol}`)
      console.log(`     Permisos: [${emp.permisos_modulos?.join(', ') || 'ninguno'}]`)
      console.log(`     ✅ Permisos correctos: ${JSON.stringify(emp.permisos_modulos) === JSON.stringify(permisosCorrectos)}`)
    })

    // 4. Verificar otros usuarios que puedan tener permisos incorrectos
    console.log('🔍 Verificando otros usuarios con posibles permisos incorrectos...')
    const { data: otrosUsuarios, error: otrosError } = await supabase
      .from('empleados')
      .select('*')
      .eq('activo', true)
      .not('email', 'ilike', '%mateo%')
      .not('nombre', 'ilike', '%mateo%')

    if (otrosError) {
      console.warn('⚠️ Error verificando otros usuarios:', otrosError.message)
    } else {
      const usuariosConProblemas = otrosUsuarios?.filter(emp => {
        if (emp.rol === 'Administrador' || emp.rol === 'Gerente') return false
        
        const permisosProblema = ['dashboard', 'productos', 'empleados', 'reportes']
        return permisosProblema.some(permiso => emp.permisos_modulos?.includes(permiso))
      })

      if (usuariosConProblemas && usuariosConProblemas.length > 0) {
        console.log('⚠️ Usuarios con posibles permisos incorrectos:')
        usuariosConProblemas.forEach(emp => {
          console.log(`   - ${emp.nombre} (${emp.email}) - Rol: ${emp.rol}`)
          console.log(`     Permisos: [${emp.permisos_modulos?.join(', ') || 'ninguno'}]`)
        })
      } else {
        console.log('✅ No se encontraron otros usuarios con permisos incorrectos')
      }
    }

    console.log('🎉 Corrección de permisos completada exitosamente!')

  } catch (error) {
    console.error('❌ Error durante la corrección:', error.message)
    process.exit(1)
  }
}

// Ejecutar el script
fixPermisosMateo()

export { fixPermisosMateo }
