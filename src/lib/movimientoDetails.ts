import { supabase } from './supabase'
import type { MovimientoCaja, Venta } from '../store/types'

export interface MovimientoDetalle {
  id: string
  tipo: 'ingreso' | 'egreso'
  monto: number
  concepto: string
  fecha: string
  empleado?: any
  detalles?: {
    tipo: 'venta' | 'gasto' | 'ingreso_manual'
    items?: Array<{
      nombre: string
      cantidad: number
      precio: number
      codigo_sku?: string
    }>
    descripcion?: string
    categoria?: string
  }
}

export async function obtenerDetallesMovimiento(movimiento: MovimientoCaja): Promise<MovimientoDetalle> {
  const concepto = movimiento.concepto.toLowerCase()
  
  // PRIMERO: Si el concepto contiene "venta #" (formato antiguo), buscar detalles de la venta
  if (concepto.includes('venta #') || concepto.includes('venta#')) {
    try {
      // Extraer ID de venta del concepto (asumiendo formato "Venta #123")
      const ventaMatch = concepto.match(/venta\s*#?([a-f0-9-]+)/i)
      if (ventaMatch) {
        const ventaId = ventaMatch[1]
        
        const { data: venta, error } = await supabase
          .from('ventas')
          .select(`
            *,
            items:venta_items(
              cantidad,
              precio_unitario,
              subtotal,
              producto_id
            )
          `)
          .eq('id', ventaId)
          .single()

        if (!error && venta) {
          return {
            ...movimiento,
            detalles: {
              tipo: 'venta',
              items: venta.items?.map(item => ({
                nombre: 'Producto', // Simplificado sin join anidado
                cantidad: item.cantidad,
                precio: item.precio_unitario,
                codigo_sku: 'N/A'
              })) || [],
              descripcion: formatearProductosVenta(venta.items || [])
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error al obtener detalles de venta:', error)
    }
  }
  
  // SEGUNDO: Si el concepto parece ser una venta (contiene "x" para cantidades o productos)
  if (concepto.includes(' x') || concepto.includes('más') || 
      (movimiento.tipo === 'ingreso' && !concepto.includes('gasto') && !concepto.includes('pago'))) {
    
    // El concepto ya contiene los productos vendidos, no necesitamos buscar en BD
    const productos = parsearProductosDelConcepto(movimiento.concepto)
    
    return {
      ...movimiento,
      detalles: {
        tipo: 'venta',
        items: productos,
        descripcion: movimiento.concepto
      }
    }
  }
  
  // Si el concepto contiene "gasto", buscar detalles del gasto
  if (concepto.includes('gasto') || concepto.includes('pago') || concepto.includes('compra')) {
    return {
      ...movimiento,
      detalles: {
        tipo: 'gasto',
        descripcion: movimiento.concepto,
        categoria: 'Gasto'
      }
    }
  }
  
  // Para otros tipos de ingresos
  if (movimiento.tipo === 'ingreso' && !concepto.includes('venta')) {
    return {
      ...movimiento,
      detalles: {
        tipo: 'ingreso_manual',
        descripcion: movimiento.concepto,
        categoria: 'Ingreso Manual'
      }
    }
  }
  
  // Por defecto, retornar el movimiento sin detalles adicionales
  return {
    ...movimiento,
    detalles: {
      tipo: 'ingreso_manual',
      descripcion: movimiento.concepto,
      categoria: 'Movimiento'
    }
  }
}

export function formatearDetallesMovimiento(detalles: MovimientoDetalle): string {
  if (!detalles.detalles) {
    return detalles.concepto
  }

  switch (detalles.detalles.tipo) {
    case 'venta':
      // Si el concepto ya contiene los productos, usarlo directamente
      if (detalles.detalles.descripcion) {
        return detalles.detalles.descripcion
      }
      
      // Fallback para casos donde aún tenemos items
      if (detalles.detalles.items && detalles.detalles.items.length > 0) {
        const items = detalles.detalles.items
        if (items.length === 1) {
          return `${items[0].nombre} x${items[0].cantidad}`
        } else if (items.length <= 3) {
          return items.map(item => `${item.nombre} x${item.cantidad}`).join(', ')
        } else {
          const primerItem = items[0]
          return `${primerItem.nombre} x${primerItem.cantidad} +${items.length - 1} más`
        }
      }
      return 'Venta de productos'
      
    case 'gasto':
      return detalles.detalles.descripcion || 'Gasto'
      
    case 'ingreso_manual':
      return detalles.detalles.descripcion || 'Ingreso manual'
      
    default:
      return detalles.concepto
  }
}

// Función para formatear productos de una venta
function formatearProductosVenta(items: any[]): string {
  if (!items || items.length === 0) {
    return 'Venta de productos'
  }
  
  const productos = items.map(item => {
    const nombreProducto = item.producto?.nombre || 'Producto desconocido'
    return `${nombreProducto} x${item.cantidad}`
  })
  
  if (productos.length === 1) {
    return productos[0]
  } else if (productos.length <= 3) {
    return productos.join(', ')
  } else {
    const primerProducto = productos[0]
    return `${primerProducto} +${productos.length - 1} más`
  }
}

// Función para parsear productos del concepto
function parsearProductosDelConcepto(concepto: string): Array<{
  nombre: string
  cantidad: number
  precio: number
  codigo_sku?: string
}> {
  const productos: Array<{
    nombre: string
    cantidad: number
    precio: number
    codigo_sku?: string
  }> = []
  
  // Si contiene "más", es una venta con múltiples productos
  if (concepto.includes('más')) {
    // Extraer el primer producto
    const match = concepto.match(/^(.+?)\s+x(\d+)/)
    if (match) {
      productos.push({
        nombre: match[1].trim(),
        cantidad: parseInt(match[2]),
        precio: 0 // No tenemos el precio individual
      })
    }
  } else {
    // Separar por comas y procesar cada producto
    const partes = concepto.split(',').map(p => p.trim())
    
    for (const parte of partes) {
      const match = parte.match(/^(.+?)\s+x(\d+)$/)
      if (match) {
        productos.push({
          nombre: match[1].trim(),
          cantidad: parseInt(match[2]),
          precio: 0 // No tenemos el precio individual
        })
      }
    }
  }
  
  return productos
}

export function obtenerIconoMovimiento(detalles: MovimientoDetalle): string {
  if (!detalles.detalles) {
    return '💰'
  }

  switch (detalles.detalles.tipo) {
    case 'venta':
      return '🛒'
    case 'gasto':
      return '💸'
    case 'ingreso_manual':
      return '💵'
    default:
      return '💰'
  }
}
