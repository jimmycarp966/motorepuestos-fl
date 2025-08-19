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
  
  // Si el concepto contiene "venta", buscar detalles de la venta
  if (concepto.includes('venta') || concepto.includes('venta #')) {
    try {
      // Extraer ID de venta del concepto (asumiendo formato "Venta #123")
      const ventaMatch = concepto.match(/venta\s*#?(\d+)/i)
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
              producto:productos(nombre, codigo_sku, categoria)
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
                nombre: item.producto?.nombre || 'Producto desconocido',
                cantidad: item.cantidad,
                precio: item.precio_unitario,
                codigo_sku: item.producto?.codigo_sku
              })) || []
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error al obtener detalles de venta:', error)
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
