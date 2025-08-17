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
  
  return {
    ventas: initialState.ventas,
    loading: initialState.loading,
    error: initialState.error,

         fetchVentas: async () => {
       set((state) => ({ loading: true, error: null }))
       
       try {
         const { data, error } = await supabase
           .from('ventas')
           .select('*')
           .order('created_at', { ascending: false })
         
         if (error) {
           throw error
         }
         
         if (!data) {
           set((state) => ({ ventas: [], loading: false }))
           return
         }
         
         if (data.length > 0) {
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
             
             if (relationsError) {
               set((state) => ({ ventas: data || [], loading: false }))
             } else {
               set((state) => ({ ventas: dataWithRelations || [], loading: false }))
             }
           } catch (relationsError: any) {
             set((state) => ({ ventas: data || [], loading: false }))
           }
         } else {
           set((state) => ({ ventas: [], loading: false }))
         }
         
       } catch (error: any) {
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

                 const { data: venta, error: errorVenta } = await supabase
           .from('ventas')
           .insert([ventaCompleta])
           .select()
           .single()

         if (errorVenta) {
           throw errorVenta
         }

         // Crear los items de la venta
         const itemsConVentaId = ventaData.items.map(item => ({
           ...item,
           venta_id: venta.id,
         }))

        const { error: errorItems } = await supabase
          .from('venta_items')
          .insert(itemsConVentaId)

                 if (errorItems) {
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
             // No lanzar error aquí, solo continuar
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
           // No lanzar error aquí, solo continuar
         }

        // Actualizar estado local
        set((state) => ({ 
          ventas: [venta, ...state.ventas], 
          loading: false 
        }))

                 // Notificar éxito
        get().addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Venta registrada',
          message: `Venta #${venta.id} registrada por $${total.toLocaleString()}`,
        })

             } catch (error: any) {
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
