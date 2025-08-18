import { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import { getAFIPService } from '../../lib/afipBrowserService'

// Interfaces
interface ComprobanteElectronico {
  id: string
  venta_id: string
  tipo_comprobante: string
  punto_venta: number
  numero_comprobante: number
  fecha_emision: string
  fecha_vencimiento?: string
  cae?: string
  cae_vto?: string
  resultado: string
  motivo_rechazo?: string
  observaciones?: string
  xml_request?: string
  xml_response?: string
  created_at: string
  updated_at: string
}

interface ConfiguracionAFIP {
  id: string
  cuit: string
  punto_venta: number
  condicion_iva: string
  ambiente: string
  certificado_path?: string
  clave_privada_path?: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface FacturacionSlice {
  // State
  comprobantes: ComprobanteElectronico[]
  configuracion: ConfiguracionAFIP | null
  facturacionLoading: boolean
  facturacionError: string | null
  lastComprobante: ComprobanteElectronico | null

  // Actions
  fetchComprobantes: () => Promise<void>
  fetchConfiguracionAFIP: () => Promise<void>
  generarComprobante: (ventaId: string) => Promise<ComprobanteElectronico | null>
  verificarEstadoAFIP: () => Promise<boolean>
  clearFacturacionError: () => void
  clearLastComprobante: () => void
  setConfiguracion: (config: ConfiguracionAFIP) => void
}

export const facturacionSlice: StateCreator<FacturacionSlice> = (set, get) => ({
  // Initial state
  comprobantes: [],
  configuracion: null,
  facturacionLoading: false,
  facturacionError: null,
  lastComprobante: null,

  // Actions
  fetchComprobantes: async () => {
    set({ facturacionLoading: true, facturacionError: null })
    
    try {
      const { data, error } = await supabase
        .from('comprobantes_electronicos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      set({ comprobantes: data || [], facturacionLoading: false })
    } catch (error: any) {
      set({ 
        facturacionError: error.message || 'Error al cargar comprobantes',
        facturacionLoading: false 
      })
    }
  },

  fetchConfiguracionAFIP: async () => {
    set({ facturacionLoading: true, facturacionError: null })
    
    try {
      const { data, error } = await supabase
        .from('configuracion_afip')
        .select('*')
        .eq('activo', true)
        .single()

      if (error) throw error
      
      set({ configuracion: data, facturacionLoading: false })
    } catch (error: any) {
      set({ 
        facturacionError: error.message || 'Error al cargar configuración AFIP',
        facturacionLoading: false 
      })
    }
  },

  generarComprobante: async (ventaId: string) => {
    set({ facturacionLoading: true, facturacionError: null })
    
    try {
      // Obtener datos de la venta
      const { data: venta, error: ventaError } = await supabase
        .from('ventas')
        .select(`
          *,
          cliente:clientes(*),
          items:venta_items(
            *,
            producto:productos(*)
          )
        `)
        .eq('id', ventaId)
        .single()

      if (ventaError) throw ventaError

      // Generar comprobante usando AFIP Service
      const afipService = getAFIPService()
      
      const request = {
        tipoComprobante: 'B', // Por defecto Factura B
        puntoVenta: 1,
        concepto: 1, // Productos
        tipoDoc: 96, // DNI por defecto
        nroDoc: venta.cliente?.documento || '99999999',
        fechaServicio: new Date().toISOString().split('T')[0],
        fechaVtoPago: new Date().toISOString().split('T')[0],
        impTotal: venta.total,
        impTotConc: 0,
        impNeto: venta.total / 1.21,
        impOpEx: 0,
        impIVA: venta.total - (venta.total / 1.21),
        impTrib: 0,
        items: venta.items.map((item: any) => ({
          descripcion: item.producto.nombre,
          cantidad: item.cantidad,
          precioUnitario: item.precio_unitario,
          bonif: 0,
          impIVA: item.subtotal * 0.21,
          impTotal: item.subtotal
        }))
      }

      const response = await afipService.generarComprobante(request)

      // Guardar en base de datos
      const { data: comprobante, error: dbError } = await supabase
        .from('comprobantes_electronicos')
        .insert({
          venta_id: ventaId,
          tipo_comprobante: request.tipoComprobante,
          punto_venta: request.puntoVenta,
          numero_comprobante: 1,
          cae: response.cae,
          cae_vto: response.caeVto,
          resultado: response.resultado,
          observaciones: response.observaciones,
          xml_request: JSON.stringify(request),
          xml_response: JSON.stringify(response)
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Actualizar estado
      const currentComprobantes = get().comprobantes
      set({ 
        comprobantes: [comprobante, ...currentComprobantes],
        lastComprobante: comprobante,
        facturacionLoading: false 
      })

      return comprobante
    } catch (error: any) {
      set({ 
        facturacionError: error.message || 'Error al generar comprobante',
        facturacionLoading: false 
      })
      return null
    }
  },

  verificarEstadoAFIP: async () => {
    try {
      const afipService = getAFIPService()
      const estado = await afipService.verificarEstado()
      
      if (!estado) {
        set({ facturacionError: 'Error de conexión con AFIP' })
      }
      
      return estado
    } catch (error: any) {
      set({ facturacionError: error.message || 'Error verificando estado AFIP' })
      return false
    }
  },

  clearFacturacionError: () => {
    set({ facturacionError: null })
  },

  clearLastComprobante: () => {
    set({ lastComprobante: null })
  },

  setConfiguracion: (config: ConfiguracionAFIP) => {
    set({ configuracion: config })
  }
})
