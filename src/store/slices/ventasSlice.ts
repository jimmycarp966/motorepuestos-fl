import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { AppStore, VentasState, CreateVentaData } from '../index'

const initialState: VentasState = {
  ventas: [],
  loading: false,
  error: null,
}

export const ventasSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'ventas' | 'fetchVentas' | 'registrarVenta'>> = (set, get) => ({
  ventas: initialState,

  fetchVentas: async () => {
    set((state) => ({ ventas: { ...state.ventas, loading: true, error: null } }))
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          *,
          cliente:clientes(*),
          empleado:empleados(*),
          items:venta_items(*)
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      set((state) => ({ ventas: { ...state.ventas, ventas: data || [], loading: false } }))
    } catch (error: any) {
      set((state) => ({ ventas: { ...state.ventas, loading: false, error: error.message } }))
    }
  },

  // Acción compuesta: Registrar venta completa
  registrarVenta: async (ventaData: CreateVentaData) => {
    set((state) => ({ ventas: { ...state.ventas, loading: true, error: null } }))
    
    try {
      const currentUser = get().auth.user
      if (!currentUser) throw new Error('Usuario no autenticado')

      get().addDebugLog({
        level: 'info',
        message: `Iniciando registro de venta`,
        source: 'VentasSlice',
        data: { 
          empleado: currentUser.nombre,
          items: ventaData.items.length,
          cliente: ventaData.cliente_id ? 'Sí' : 'No'
        }
      })

      // 1. Calcular total y validar stock
      let total = 0
      const itemsToInsert = []

      for (const item of ventaData.items) {
        const { data: producto } = await supabase
          .from('productos')
          .select('*')
          .eq('id', item.producto_id)
          .single()

        if (!producto) {
          get().addDebugLog({
            level: 'error',
            message: `Producto no encontrado: ${item.producto_id}`,
            source: 'VentasSlice',
            data: { producto_id: item.producto_id }
          })
          throw new Error(`Producto ${item.producto_id} no encontrado`)
        }

        if (producto.stock < item.cantidad) {
          get().addDebugLog({
            level: 'error',
            message: `Stock insuficiente para ${producto.nombre}`,
            source: 'VentasSlice',
            data: { 
              producto: producto.nombre,
              stock_disponible: producto.stock,
              cantidad_solicitada: item.cantidad
            }
          })
          throw new Error(`Stock insuficiente para ${producto.nombre}`)
        }

        const subtotal = producto.precio * item.cantidad
        total += subtotal

        itemsToInsert.push({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: producto.precio,
          subtotal,
        })
      }

      get().addDebugLog({
        level: 'info',
        message: `Validación completada - Total: $${total.toFixed(2)}`,
        source: 'VentasSlice',
        data: { total, items_count: itemsToInsert.length }
      })

      // 2. Crear venta
      const { data: venta, error: ventaError } = await supabase
        .from('ventas')
        .insert([{
          cliente_id: ventaData.cliente_id,
          empleado_id: currentUser.id,
          total,
          fecha: new Date().toISOString(),
        }])
        .select()
        .single()

      if (ventaError) {
        get().addDebugLog({
          level: 'error',
          message: `Error creando venta: ${ventaError.message}`,
          source: 'VentasSlice',
          data: { error: ventaError.message }
        })
        throw ventaError
      }

      get().addDebugLog({
        level: 'success',
        message: `Venta creada exitosamente: ${venta.id}`,
        source: 'VentasSlice',
        data: { venta_id: venta.id, total }
      })

      // 3. Crear items de venta
      const { error: itemsError } = await supabase
        .from('venta_items')
        .insert(itemsToInsert.map(item => ({ ...item, venta_id: venta.id })))

      if (itemsError) {
        get().addDebugLog({
          level: 'error',
          message: `Error creando items de venta: ${itemsError.message}`,
          source: 'VentasSlice',
          data: { error: itemsError.message }
        })
        throw itemsError
      }

      // 4. Actualizar stock de productos
      for (const item of ventaData.items) {
        const { error: stockError } = await supabase.rpc('decrementar_stock', {
          producto_id: item.producto_id,
          cantidad: item.cantidad
        })
        if (stockError) {
          get().addDebugLog({
            level: 'error',
            message: `Error actualizando stock: ${stockError.message}`,
            source: 'VentasSlice',
            data: { 
              producto_id: item.producto_id,
              cantidad: item.cantidad,
              error: stockError.message
            }
          })
          throw stockError
        }
      }

      get().addDebugLog({
        level: 'success',
        message: `Stock actualizado para ${ventaData.items.length} productos`,
        source: 'VentasSlice'
      })

      // 5. Registrar ingreso en caja
      await get().registrarIngreso(total, `Venta #${venta.id}`)

      get().addDebugLog({
        level: 'success',
        message: `Ingreso registrado en caja: $${total.toFixed(2)}`,
        source: 'VentasSlice'
      })

      // 6. Actualizar estado local
      const ventaCompleta = {
        ...venta,
        cliente: null,
        empleado: currentUser,
        items: itemsToInsert
      }

      set((state) => ({
        ventas: {
          ...state.ventas,
          ventas: [ventaCompleta, ...state.ventas.ventas],
          loading: false
        }
      }))

      get().addDebugLog({
        level: 'success',
        message: `Venta completada exitosamente`,
        source: 'VentasSlice',
        data: { 
          venta_id: venta.id,
          total,
          items_count: itemsToInsert.length
        }
      })

    } catch (error: any) {
      get().addDebugLog({
        level: 'error',
        message: `Error en registro de venta: ${error.message}`,
        source: 'VentasSlice',
        data: { error: error.message }
      })

      set((state) => ({ 
        ventas: { 
          ...state.ventas, 
          loading: false, 
          error: error.message 
        } 
      }))
      throw error
    }
  },
})
