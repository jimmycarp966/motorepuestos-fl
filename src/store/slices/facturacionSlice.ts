import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import { DateUtils } from '../../lib/dateUtils'
import { AuditLogger } from '../../lib/auditLogger'
import { BusinessRules } from '../../lib/businessRules'
import { ErrorHandler } from '../../lib/errorHandler'
import { createBusinessError, ERROR_CODES } from '../../lib/auditLogger'
import type { AppStore } from '../index'
import type { FacturacionState, CreateFacturaData } from '../types'

const initialState: FacturacionState = {
  facturas: [],
  loading: false,
  error: null,
}

export const facturacionSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'facturacion' | 'facturacionLoading' | 'facturacionError' | 'fetchFacturas' | 'registrarFactura' | 'updateFactura'>> = (set, get) => {
  
  return {
    facturacion: initialState,
    facturacionLoading: initialState.loading,
    facturacionError: initialState.error,

    fetchFacturas: async (page = 1, pageSize = 50) => {
      set((state) => ({ 
        facturacion: { ...state.facturacion, loading: true, error: null },
        facturacionLoading: true,
        facturacionError: null
      }))
      
      try {
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1
        
        // Optimización: Una sola consulta con joins y paginación inteligente
        const { data, error, count } = await supabase
          .from('facturas')
          .select(`
            *,
            cliente:clientes(*),
            empleado:empleados(*),
            items:factura_items(
              *,
              producto_id
            )
          `)
          .order('created_at', { ascending: false })
          .range(from, to)
        
        if (error) throw error

        set((state) => ({ 
          facturacion: { 
            ...state.facturacion, 
            facturas: data || [], 
            loading: false 
          },
          facturacionLoading: false
        }))

        // Log de auditoría
        await AuditLogger.log({
          action: 'FETCH_FACTURAS',
          entity: 'facturas',
          entityId: 'multiple',
          details: { page, pageSize, count: data?.length || 0 },
          userId: get().auth.user?.id
        })

      } catch (error: any) {
        const handledError = ErrorHandler.handle(error)
        
        set((state) => ({ 
          facturacion: { 
            ...state.facturacion, 
            loading: false, 
            error: handledError.message 
          },
          facturacionLoading: false,
          facturacionError: handledError.message
        }))

        // Log de error
        await AuditLogger.log({
          action: 'FETCH_FACTURAS_ERROR',
          entity: 'facturas',
          entityId: 'multiple',
          details: { error: handledError.message },
          userId: get().auth.user?.id,
          level: 'ERROR'
        })
      }
    },

    registrarFactura: async (facturaData: CreateFacturaData) => {
      const currentUser = get().auth.user
      if (!currentUser) throw new Error('Usuario no autenticado')

      set((state) => ({ 
        facturacion: { ...state.facturacion, loading: true, error: null },
        facturacionLoading: true,
        facturacionError: null
      }))

      try {
        // Validaciones de negocio
        const businessRules = new BusinessRules()
        const validationResult = await businessRules.validateFactura(facturaData)
        
        if (!validationResult.isValid) {
          throw createBusinessError(ERROR_CODES.VALIDATION_ERROR, validationResult.errors.join(', '))
        }

        // Calcular total
        const total = facturaData.items.reduce((sum, item) => sum + item.subtotal, 0)

        // Generar número de comprobante (esto se implementará con AFIP)
        const puntoVenta = 1 // Por defecto, se configurará desde AFIP
        const numeroComprobante = 1 // Se obtendrá del próximo número disponible en AFIP

        // Crear la factura
        const { data: factura, error: facturaError } = await supabase
          .from('facturas')
          .insert([{
            cliente_id: facturaData.cliente_id,
            empleado_id: currentUser.id,
            total,
            fecha: DateUtils.getCurrentLocalDateTime(),
            metodo_pago: facturaData.metodo_pago,
            tipo_precio: facturaData.tipo_precio || 'minorista',
            tipo_comprobante: facturaData.tipo_comprobante,
            punto_venta: puntoVenta,
            numero_comprobante: numeroComprobante,
            cae: null, // Se obtendrá de AFIP
            cae_vto: null, // Se obtendrá de AFIP
            estado_afip: 'pendiente'
          }])
          .select()
          .single()

        if (facturaError) throw facturaError

        // Crear los items de la factura
        const facturaItems = facturaData.items.map(item => ({
          factura_id: factura.id,
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal,
          tipo_precio: item.tipo_precio
        }))

        const { error: itemsError } = await supabase
          .from('factura_items')
          .insert(facturaItems)

        if (itemsError) throw itemsError

        // Actualizar stock de productos
        for (const item of facturaData.items) {
          const { data: producto } = await supabase
            .from('productos')
            .select('stock')
            .eq('id', item.producto_id)
            .single()

          if (producto) {
            const nuevoStock = producto.stock - item.cantidad
            await supabase
              .from('productos')
              .update({ stock: nuevoStock })
              .eq('id', item.producto_id)
          }
        }

        // TODO: Aquí se implementará la integración con AFIP
        // - Obtener CAE
        // - Actualizar estado_afip
        // - Generar PDF de factura

        // Recargar facturas
        await get().fetchFacturas()

        // Log de auditoría
        await AuditLogger.log({
          action: 'CREATE_FACTURA',
          entity: 'facturas',
          entityId: factura.id,
          details: { 
            total, 
            itemsCount: facturaData.items.length,
            tipoComprobante: facturaData.tipo_comprobante
          },
          userId: currentUser.id
        })

        // Notificación de éxito
        get().addNotification({
          id: `factura-${Date.now()}`,
          type: 'success',
          title: 'Factura Creada',
          message: `Factura ${facturaData.tipo_comprobante} registrada exitosamente`,
          duration: 5000
        })

        return factura

      } catch (error: any) {
        const handledError = ErrorHandler.handle(error)
        
        set((state) => ({ 
          facturacion: { 
            ...state.facturacion, 
            loading: false, 
            error: handledError.message 
          },
          facturacionLoading: false,
          facturacionError: handledError.message
        }))

        // Log de error
        await AuditLogger.log({
          action: 'CREATE_FACTURA_ERROR',
          entity: 'facturas',
          entityId: 'new',
          details: { error: handledError.message },
          userId: currentUser?.id,
          level: 'ERROR'
        })

        // Notificación de error
        get().addNotification({
          id: `factura-error-${Date.now()}`,
          type: 'error',
          title: 'Error al Crear Factura',
          message: handledError.message,
          duration: 8000
        })

        throw handledError
      }
    },

    updateFactura: async (facturaId: string, updates: Partial<CreateFacturaData>) => {
      const currentUser = get().auth.user
      if (!currentUser) throw new Error('Usuario no autenticado')

      set((state) => ({ 
        facturacion: { ...state.facturacion, loading: true, error: null },
        facturacionLoading: true,
        facturacionError: null
      }))

      try {
        const { data, error } = await supabase
          .from('facturas')
          .update(updates)
          .eq('id', facturaId)
          .select()
          .single()

        if (error) throw error

        // Recargar facturas
        await get().fetchFacturas()

        // Log de auditoría
        await AuditLogger.log({
          action: 'UPDATE_FACTURA',
          entity: 'facturas',
          entityId: facturaId,
          details: { updates },
          userId: currentUser.id
        })

        return data

      } catch (error: any) {
        const handledError = ErrorHandler.handle(error)
        
        set((state) => ({ 
          facturacion: { 
            ...state.facturacion, 
            loading: false, 
            error: handledError.message 
          },
          facturacionLoading: false,
          facturacionError: handledError.message
        }))

        throw handledError
      }
    }
  }
}
