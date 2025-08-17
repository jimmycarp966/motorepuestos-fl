import { supabase } from './supabase'

export async function testVentasQuery() {
  console.log('🧪 [TEST] Probando consulta de ventas...')
  
  try {
    // Prueba 1: Consulta básica
    console.log('🧪 [TEST] Prueba 1: Consulta básica a ventas')
    const { data: basicData, error: basicError } = await supabase
      .from('ventas')
      .select('*')
      .limit(5)
    
    console.log('🧪 [TEST] Resultado básico:', { 
      data: basicData?.length, 
      error: basicError,
      sample: basicData?.[0]
    })
    
    // Prueba 2: Consulta con relaciones
    console.log('🧪 [TEST] Prueba 2: Consulta con relaciones')
    const { data: relationData, error: relationError } = await supabase
      .from('ventas')
      .select(`
        *,
        cliente:clientes(*),
        empleado:empleados(*),
        items:venta_items(*)
      `)
      .order('created_at', { ascending: false })
      .limit(5)
    
    console.log('🧪 [TEST] Resultado con relaciones:', { 
      data: relationData?.length, 
      error: relationError,
      sample: relationData?.[0]
    })
    
    // Prueba 3: Verificar permisos
    console.log('🧪 [TEST] Prueba 3: Verificar permisos')
    const { data: user } = await supabase.auth.getUser()
    console.log('🧪 [TEST] Usuario actual:', user?.user?.id)
    
    // Prueba 4: Verificar RLS
    console.log('🧪 [TEST] Prueba 4: Verificar políticas RLS')
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'ventas')
    
    console.log('🧪 [TEST] Políticas RLS:', { 
      policies: policies?.length, 
      error: policiesError 
    })
    
    return {
      basic: { data: basicData, error: basicError },
      relations: { data: relationData, error: relationError },
      user: user?.user,
      policies: { data: policies, error: policiesError }
    }
    
  } catch (error) {
    console.error('❌ [TEST] Error en testVentasQuery:', error)
    return { error }
  }
}
