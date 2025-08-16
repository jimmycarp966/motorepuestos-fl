import { supabase } from '../../lib/supabase.js'

export const createVentasSlice = (set, get) => ({
  ventas: {
    ventas: [],
    loading: false,
    error: null
  },

  // Acciones de ventas
  fetchVentas: async () => {
    set((state) => ({ 
      ventas: { ...state.ventas, loading: true, error: null } 
    }))

    try {
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          *,
          cliente:clientes(*),
          empleado:empleados(*),
          items:venta_items(
            *,
            producto:productos(*)
          )
        `)
        .order('fecha', { ascending: false })

      if (error) throw error

      set((state) => ({
        ventas: {
          ...state.ventas,
          ventas: data || [],
          loading: false
        }
      }))
    } catch (error) {
      set((state) => ({
        ventas: {
          ...state.ventas,
          loading: false,
          error: error.message
        }
      }))
    }
  },

  // Acción compuesta: Registrar venta completa
  registrarVenta: async (ventaData) => {
    const { cliente_id, items, metodo_pago = 'efectivo' } = ventaData
    
    try {
      // 1. Validar stock de productos
      const productos = get().productos.productos
      for (const item of items) {
        const producto = productos.find(p => p.id === item.producto_id)
        if (!producto) {
          throw new Error(`Producto no encontrado: ${item.producto_id}`)
        }
        if (producto.stock < item.cantidad) {
          throw new Error(`Stock insuficiente para ${producto.nombre}`)
        }
      }

      // 2. Calcular total
      const total = items.reduce((sum, item) => {
        const producto = productos.find(p => p.id === item.producto_id)
        return sum + (producto.precio * item.cantidad)
      }, 0)

      // 3. Crear venta
      const { data: venta, error: ventaError } = await supabase
        .from('ventas')
        .insert([{
          cliente_id: cliente_id || null,
          empleado_id: get().auth.user?.id,
          total,
          metodo_pago,
          fecha: new Date().toISOString(),
          estado: 'completada'
        }])
        .select()
        .single()

      if (ventaError) throw ventaError

      // 4. Crear items de venta
      const ventaItems = items.map(item => {
        const producto = productos.find(p => p.id === item.producto_id)
        return {
          venta_id: venta.id,
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: producto.precio,
          subtotal: producto.precio * item.cantidad
        }
      })

      const { error: itemsError } = await supabase
        .from('venta_items')
        .insert(ventaItems)

      if (itemsError) throw itemsError

      // 5. Actualizar stock de productos
      for (const item of items) {
        const { error: stockError } = await supabase.rpc('decrementar_stock', {
          producto_id: item.producto_id,
          cantidad: item.cantidad
        })
        if (stockError) throw stockError
      }

      // 6. Registrar movimiento de caja
      await get().registrarIngreso(total, `Venta #${venta.id.slice(0, 8)}`)

      // 7. Actualizar estado local
      const currentVentas = get().ventas.ventas
      set((state) => ({
        ventas: {
          ...state.ventas,
          ventas: [venta, ...currentVentas]
        }
      }))

      // 8. Refrescar productos para actualizar stock
      await get().fetchProductos()

      return { success: true, data: venta }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Obtener ventas por fecha
  getVentasByDate: (fecha) => {
    const ventas = get().ventas.ventas
    const fechaInicio = new Date(fecha)
    fechaInicio.setHours(0, 0, 0, 0)
    const fechaFin = new Date(fecha)
    fechaFin.setHours(23, 59, 59, 999)

    return ventas.filter(venta => {
      const ventaFecha = new Date(venta.fecha)
      return ventaFecha >= fechaInicio && ventaFecha <= fechaFin
    })
  },

  // Obtener ventas por cliente
  getVentasByCliente: (clienteId) => {
    const ventas = get().ventas.ventas
    return ventas.filter(venta => venta.cliente_id === clienteId)
  },

  // Obtener ventas por empleado
  getVentasByEmpleado: (empleadoId) => {
    const ventas = get().ventas.ventas
    return ventas.filter(venta => venta.empleado_id === empleadoId)
  },

  // Estadísticas de ventas
  getEstadisticasVentas: () => {
    const ventas = get().ventas.ventas
    const hoy = new Date().toDateString()
    
    const ventasHoy = ventas.filter(v => 
      new Date(v.fecha).toDateString() === hoy
    )

    const totalHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0)
    const totalGeneral = ventas.reduce((sum, v) => sum + v.total, 0)

    return {
      totalVentas: ventas.length,
      totalVentasHoy: ventasHoy.length,
      totalHoy,
      totalGeneral,
      promedioVenta: ventas.length > 0 ? totalGeneral / ventas.length : 0
    }
  },

  // Productos más vendidos
  getProductosMasVendidos: (limit = 10) => {
    const ventas = get().ventas.ventas
    const productos = get().productos.productos
    
    const ventasPorProducto = {}
    
    ventas.forEach(venta => {
      venta.items?.forEach(item => {
        if (!ventasPorProducto[item.producto_id]) {
          ventasPorProducto[item.producto_id] = 0
        }
        ventasPorProducto[item.producto_id] += item.cantidad
      })
    })

    return Object.entries(ventasPorProducto)
      .map(([productoId, cantidad]) => {
        const producto = productos.find(p => p.id === productoId)
        return {
          producto,
          cantidad,
          total: cantidad * (producto?.precio || 0)
        }
      })
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, limit)
  }
})
