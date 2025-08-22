import { createClient } from '@supabase/supabase-js'
import { config, validateConfig } from './config'

// Validar configuración al inicio
const configValidation = validateConfig()
if (!configValidation.valid) {
  console.error('❌ [Supabase] Configuración inválida:', configValidation.errors)
  if (config.isProduction) {
    throw new Error('Invalid configuration in production')
  }
}

// Log de configuración en desarrollo
if (config.debug) {
  console.log('🔧 [Supabase] Configuración:', {
    url: config.supabaseUrl ? '✅' : '❌',
    anonKey: config.supabaseKey ? '✅' : '❌',
    serviceKey: config.supabaseServiceKey ? '✅' : '❌',
    environment: config.isProduction ? 'production' : 'development'
  })
}

// Cliente principal con anon key (para operaciones normales)
export const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Timezone': 'America/Argentina/Buenos_Aires'
    }
  }
})

// Cliente con service role key para operaciones de administrador
export const supabaseAdmin = config.supabaseServiceKey 
  ? createClient(config.supabaseUrl, config.supabaseServiceKey, {
      global: {
        headers: {
          'X-Client-Timezone': 'America/Argentina/Buenos_Aires'
        }
      }
    })
  : null

// Warning si no hay service key
if (!supabaseAdmin && config.debug) {
  console.warn('⚠️ [Supabase] Service role key no configurada - funciones admin limitadas')
}

// Función para verificar el estado de autenticación
export async function checkAuthStatus() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    return { session, error }
  } catch (error) {
    console.error('❌ [supabase] Error verificando sesión:', error)
    return { session: null, error }
  }
}

// Tipos para las tablas de Supabase
export interface Database {
  public: {
    Tables: {
      empleados: {
        Row: {
          id: string
          nombre: string
          email: string
          rol: 'Administrador' | 'Gerente' | 'Vendedor' | 'Técnico' | 'Almacén' | 'Cajero'
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          email: string
          rol: 'Administrador' | 'Gerente' | 'Vendedor' | 'Técnico' | 'Almacén' | 'Cajero'
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          email?: string
          rol?: 'Administrador' | 'Gerente' | 'Vendedor' | 'Técnico' | 'Almacén' | 'Cajero'
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      productos: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          codigo_sku: string
          precio_minorista: number
          precio_mayorista: number
          costo: number
          stock: number
          stock_minimo: number
          categoria: string
          unidad_medida: string
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          codigo_sku: string
          precio_minorista: number
          precio_mayorista: number
          costo: number
          stock?: number
          stock_minimo?: number
          categoria: string
          unidad_medida: string
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          codigo_sku?: string
          precio_minorista?: number
          precio_mayorista?: number
          costo?: number
          stock?: number
          stock_minimo?: number
          categoria?: string
          unidad_medida?: string
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      clientes: {
        Row: {
          id: string
          nombre: string
          email: string | null
          telefono: string | null
          direccion: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          email?: string | null
          telefono?: string | null
          direccion?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          email?: string | null
          telefono?: string | null
          direccion?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ventas: {
        Row: {
          id: string
          cliente_id: string | null
          empleado_id: string
          total: number
          metodo_pago: string
          tipo_precio: string
          estado: string
          fecha: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cliente_id?: string | null
          empleado_id: string
          total: number
          metodo_pago?: string
          tipo_precio?: string
          estado?: string
          fecha?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string | null
          empleado_id?: string
          total?: number
          metodo_pago?: string
          tipo_precio?: string
          estado?: string
          fecha?: string
          created_at?: string
          updated_at?: string
        }
      }
      venta_items: {
        Row: {
          id: string
          venta_id: string
          producto_id: string
          cantidad: number
          precio_unitario: number
          subtotal: number
          tipo_precio: string
          created_at: string
        }
        Insert: {
          id?: string
          venta_id: string
          producto_id: string
          cantidad: number
          precio_unitario: number
          subtotal: number
          tipo_precio?: string
          created_at?: string
        }
        Update: {
          id?: string
          venta_id?: string
          producto_id?: string
          cantidad?: number
          precio_unitario?: number
          subtotal?: number
          tipo_precio?: string
          created_at?: string
        }
      }
      movimientos_caja: {
        Row: {
          id: string
          tipo: 'ingreso' | 'egreso'
          monto: number
          concepto: string
          empleado_id: string
          fecha: string
          created_at: string
        }
        Insert: {
          id?: string
          tipo: 'ingreso' | 'egreso'
          monto: number
          concepto: string
          empleado_id: string
          fecha?: string
          created_at?: string
        }
        Update: {
          id?: string
          tipo?: 'ingreso' | 'egreso'
          monto?: number
          concepto?: string
          empleado_id?: string
          fecha?: string
          created_at?: string
        }
      }
    }
  }
}
