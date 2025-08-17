import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
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
      set((state) => ({ loading: true, error: null }))
      
      try {
        const currentUser = get().auth.user
        if (!currentUser) throw new Error('Usuario no autenticado')

        // 1. Calcular total y validar stock
        let total = 0
        const itemsToInsert = []

        for (const item of ventaData.items) {
          const { data: producto } = await supabase
            .from('productos')
            .select('*')
            .eq('id', item.producto_id)
            .single()

          if (!producto) throw new Error(`Producto ${item.producto_id} no encontrado`)
          if (producto.stock < item.cantidad) throw new Error(`Stock insuficiente para ${producto.nombre}`)

          // Usar precio que viene en el item (ya calculado en el frontend)
          const subtotal = item.precio_unitario * item.cantidad
          total += subtotal

          itemsToInsert.push({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            subtotal,
            tipo_precio: item.tipo_precio || 'minorista'
          })
        }

        // 2. Crear venta
        const { data: venta, error: ventaError } = await supabase
          .from('ventas')
          .insert([{
            cliente_id: ventaData.cliente_id,
            empleado_id: currentUser.id,
            total,
            fecha: new Date().toISOString(),
            metodo_pago: ventaData.metodo_pago || 'efectivo',
            tipo_precio: ventaData.tipo_precio || 'minorista'
          }])
          .select()
          .single()

        if (ventaError) throw ventaError

        // 3. Crear items de venta
        const { error: itemsError } = await supabase
          .from('venta_items')
          .insert(itemsToInsert.map(item => ({ ...item, venta_id: venta.id })))

        if (itemsError) throw itemsError

        // 4. Actualizar stock de productos
        for (const item of ventaData.items) {
          const { error: stockError } = await supabase.rpc('decrementar_stock', {
            producto_id: item.producto_id,
            cantidad: item.cantidad
          })
          if (stockError) throw stockError
        }

        // 5. Registrar ingreso en caja (solo si no es cuenta corriente)
        if (ventaData.metodo_pago !== 'cuenta_corriente') {
          await get().registrarIngreso(total, `Venta #${venta.id} - ${ventaData.metodo_pago}`)
        }

        // 6. Actualizar estado local
        const ventaCompleta = {
          ...venta,
          items: itemsToInsert,
          empleado: currentUser,
        }

        set((state) => ({
          ventas: [ventaCompleta, ...state.ventas],
          loading: false,
        }))

        // 7. Refrescar productos para actualizar stock
        await get().fetchProductos()

        // 8. Refrescar caja para actualizar saldo
        await get().fetchMovimientos()

        // Notificar éxito
        get().addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Venta registrada exitosamente',
          message: `Venta #${venta.id} registrada por $${total.toFixed(2)} (${ventaData.metodo_pago}) - Ingreso en caja incluido`,
        })

      } catch (error: any) {
        set((state) => ({
          loading: false,
          error: error.message,
        }))

        // Notificar error
        get().addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Error al registrar venta',
          message: error.message,
        })
      }
    }
  }
}
