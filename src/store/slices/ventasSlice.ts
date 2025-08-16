import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { AppStore } from '../index'
import type { VentasState, CreateVentaData } from '../types'

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

        // Usar precio según tipo seleccionado
        const precio = ventaData.tipo_precio === 'mayorista' 
          ? producto.precio_mayorista 
          : producto.precio_minorista

        const subtotal = precio * item.cantidad
        total += subtotal

        itemsToInsert.push({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: precio,
          subtotal,
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

      // 5. Registrar ingreso en caja
      await get().registrarIngreso(total, `Venta #${venta.id}`)

      // 6. Actualizar estado local
      const ventaCompleta = {
        ...venta,
        items: itemsToInsert,
        empleado: currentUser,
      }

      set((state) => ({
        ventas: {
          ...state.ventas,
          ventas: [ventaCompleta, ...state.ventas.ventas],
          loading: false,
        }
      }))

      // 7. Refrescar productos para actualizar stock
      await get().fetchProductos()

      // 8. Refrescar caja para actualizar saldo
      await get().fetchMovimientos()

      // Notificar éxito
      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Venta registrada',
        message: `Venta #${venta.id} registrada por $${total.toFixed(2)} (${ventaData.tipo_precio})`,
      })

    } catch (error: any) {
      set((state) => ({
        ventas: {
          ...state.ventas,
          loading: false,
          error: error.message,
        }
      }))

      // Notificar error
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al registrar venta',
        message: error.message,
      })
    }
  },
})
