import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import { DateUtils } from '../../lib/dateUtils'
import type { AppStore } from '../index'
import type { VentasState, CreateVentaData } from '../types'

const initialState: VentasState = {
  ventas: [],
  loading: false,
  error: null,
}

export const ventasSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'ventas' | 'ventasLoading' | 'ventasError' | 'fetchVentas' | 'registrarVenta'>> = (set, get) => {
  console.log('🔧 [ventasSlice] Inicializando slice con estado:', initialState)
  
  return {
    ventas: initialState.ventas,
    loading: initialState.loading,
    error: initialState.error,

    fetchVentas: async () => {
      console.log('🔍 [ventasSlice] Iniciando fetchVentas...')
      set((state) => ({ loading: true, error: null }))
      
      try {
        console.log('🔍 [ventasSlice] Ejecutando consulta simple a Supabase...')
        
        // Consulta simple sin relaciones primero
        const { data, error } = await supabase
          .from('ventas')
          .select('*')
          .order('created_at', { ascending: false })
        
        console.log('🔍 [ventasSlice] Respuesta simple de Supabase:', { 
          data: data?.length, 
          error,
          dataType: typeof data,
          isArray: Array.isArray(data),
          sample: data?.[0],
          errorDetails: error ? {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          } : null
        })
        
        if (error) {
          console.error('❌ [ventasSlice] Error en consulta simple:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          throw error
        }
        
        // Verificar si tenemos datos
        if (!data) {
          console.warn('⚠️ [ventasSlice] No hay datos en la respuesta')
          set((state) => ({ ventas: [], loading: false }))
          return
        }
        
        console.log('✅ [ventasSlice] Consulta simple exitosa, datos encontrados:', data.length)
        
        // Si la consulta simple funciona, intentar con relaciones
        if (data.length > 0) {
          console.log('🔍 [ventasSlice] Intentando consulta con relaciones...')
          
          try {
            const { data: dataWithRelations, error: relationsError } = await supabase
              .from('ventas')
              .select(`
                *,
                cliente:clientes(*),
                empleado:empleados(*),
                items:venta_items(*)
              `)
              .order('created_at', { ascending: false })
            
            console.log('🔍 [ventasSlice] Respuesta con relaciones:', { 
              data: dataWithRelations?.length, 
              error: relationsError,
              sample: dataWithRelations?.[0]
            })
            
            if (relationsError) {
              console.warn('⚠️ [ventasSlice] Error en relaciones, usando datos simples:', relationsError.message)
              set((state) => ({ ventas: data || [], loading: false }))
            } else {
              console.log('✅ [ventasSlice] Consulta con relaciones exitosa')
              set((state) => ({ ventas: dataWithRelations || [], loading: false }))
            }
          } catch (relationsError: any) {
            console.warn('⚠️ [ventasSlice] Error en consulta con relaciones:', relationsError.message)
            set((state) => ({ ventas: data || [], loading: false }))
          }
        } else {
          console.log('ℹ️ [ventasSlice] No hay ventas en la base de datos')
          set((state) => ({ ventas: [], loading: false }))
        }
        
        console.log('✅ [ventasSlice] Ventas cargadas exitosamente')
        
      } catch (error: any) {
        console.error('❌ [ventasSlice] Error general en fetchVentas:', {
          message: error.message,
          stack: error.stack,
          error
        })
        
        set((state) => ({ 
          ventas: [], 
          loading: false, 
          error: error.message || 'Error desconocido al cargar ventas'
        }))
      }
    },

    // Acción compuesta: Registrar venta completa
    registrarVenta: async (ventaData: CreateVentaData) => {
      console.log('🔍 [ventasSlice] Iniciando registro de venta...')
      set((state) => ({ loading: true, error: null }))
      
      try {
        // Verificar si el arqueo está completado para hoy
        const fechaHoy = DateUtils.getCurrentDate()
        const empleadoId = get().auth.session?.user?.id
        
        if (empleadoId) {
          const { data: arqueoHoy } = await supabase
            .from('arqueos_caja')
            .select('completado')
            .eq('fecha', fechaHoy)
            .eq('empleado_id', empleadoId)
            .single()

          if (arqueoHoy?.completado) {
            throw new Error('No se pueden registrar ventas después del arqueo de caja. El sistema estará disponible mañana.')
          }
        }

        // Validar que hay productos en la venta
        if (!ventaData.items || ventaData.items.length === 0) {
          throw new Error('La venta debe tener al menos un producto')
        }

        // Validar que el cliente existe si se proporciona
        if (ventaData.cliente_id) {
          const { data: cliente, error: errorCliente } = await supabase
            .from('clientes')
            .select('id')
            .eq('id', ventaData.cliente_id)
            .single()

          if (errorCliente || !cliente) {
            throw new Error('Cliente no encontrado')
          }
        }

        // Calcular total de la venta
        const total = ventaData.items.reduce((sum, item) => sum + item.subtotal, 0)

        // Crear la venta
        const ventaCompleta = {
          ...ventaData,
          total,
          fecha: fechaHoy,
          estado: 'completada',
          empleado_id: empleadoId,
        }

        console.log('🔍 [ventasSlice] Creando venta:', ventaCompleta)

        const { data: venta, error: errorVenta } = await supabase
          .from('ventas')
          .insert([ventaCompleta])
          .select()
          .single()

        if (errorVenta) {
          console.error('❌ [ventasSlice] Error creando venta:', errorVenta)
          throw errorVenta
        }

        console.log('✅ [ventasSlice] Venta creada:', venta)

        // Crear los items de la venta
        const itemsConVentaId = ventaData.items.map(item => ({
          ...item,
          venta_id: venta.id,
        }))

        console.log('🔍 [ventasSlice] Creando items de venta:', itemsConVentaId)

        const { error: errorItems } = await supabase
          .from('venta_items')
          .insert(itemsConVentaId)

        if (errorItems) {
          console.error('❌ [ventasSlice] Error creando items:', errorItems)
          throw errorItems
        }

        // Actualizar stock de productos
        for (const item of ventaData.items) {
          const { error: errorStock } = await supabase
            .from('productos')
            .update({ 
              stock: supabase.rpc('decrement_stock', { 
                product_id: item.producto_id, 
                quantity: item.cantidad 
              })
            })
            .eq('id', item.producto_id)

          if (errorStock) {
            console.error('❌ [ventasSlice] Error actualizando stock:', errorStock)
            // No lanzar error aquí, solo log
          }
        }

        // Registrar ingreso en caja
        const concepto = `Venta #${venta.id} - ${ventaData.cliente_id ? 'Con cliente' : 'Sin cliente'}`
        
        const { error: errorCaja } = await supabase
          .from('movimientos_caja')
          .insert([{
            tipo: 'ingreso',
            monto: total,
            concepto,
            empleado_id: empleadoId,
            fecha: fechaHoy,
          }])

        if (errorCaja) {
          console.error('❌ [ventasSlice] Error registrando en caja:', errorCaja)
          // No lanzar error aquí, solo log
        }

        // Actualizar estado local
        set((state) => ({ 
          ventas: [venta, ...state.ventas], 
          loading: false 
        }))

        console.log('✅ [ventasSlice] Venta registrada exitosamente')

        // Notificar éxito
        get().addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Venta registrada',
          message: `Venta #${venta.id} registrada por $${total.toLocaleString()}`,
        })

      } catch (error: any) {
        console.error('❌ [ventasSlice] Error registrando venta:', error)
        const errorMessage = error?.message || 'Error desconocido al registrar venta'
        set((state) => ({ 
          loading: false, 
          error: errorMessage 
        }))
        
        // Notificar error
        get().addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Error al registrar venta',
          message: errorMessage,
        })
        
        throw error
      }
    }
  }
}
