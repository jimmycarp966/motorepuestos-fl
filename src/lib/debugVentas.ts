import { supabase } from './supabase'

export async function debugVentas() {
  console.log('🔍 [DEBUG] Verificando tabla de ventas...')
  
  try {
    // Verificar si la tabla existe
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'ventas')
      .eq('table_schema', 'public')
    
    console.log('📋 [DEBUG] Información de tabla:', { tableInfo, tableError })
    
    // Verificar estructura de la tabla
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'ventas')
      .eq('table_schema', 'public')
    
    console.log('📋 [DEBUG] Estructura de columnas:', { columns, columnsError })
    
    // Verificar si hay datos
    const { data: ventas, error: ventasError, count } = await supabase
      .from('ventas')
      .select('*', { count: 'exact' })
      .limit(5)
    
    console.log('📋 [DEBUG] Datos de ventas:', { 
      ventas: ventas?.length, 
      count, 
      error: ventasError,
      sample: ventas?.[0]
    })
    
    // Verificar relaciones
    if (ventas && ventas.length > 0) {
      const { data: ventaCompleta, error: relacionError } = await supabase
        .from('ventas')
        .select(`
          *,
          cliente:clientes(*),
          empleado:empleados(*),
          items:venta_items(*)
        `)
        .limit(1)
      
      console.log('📋 [DEBUG] Venta con relaciones:', { 
        ventaCompleta: ventaCompleta?.length, 
        error: relacionError,
        sample: ventaCompleta?.[0]
      })
    }
    
  } catch (error) {
    console.error('❌ [DEBUG] Error en debugVentas:', error)
  }
}
