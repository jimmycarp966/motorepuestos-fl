import { createClient } from '@supabase/supabase-js'

// Configuración robusta con fallbacks y validación
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validación de variables de entorno
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas:')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌')
  console.error('Archivos .env disponibles:', import.meta.env)
  
  // Fallback para desarrollo
  if (import.meta.env.DEV) {
    console.warn('⚠️ Usando configuración de fallback para desarrollo')
  } else {
    throw new Error('Missing Supabase environment variables. Please check your .env file.')
  }
} else {
  if (import.meta.env.DEV) {
    console.log('✅ Supabase configurado correctamente')
  }
}

// Configuración final con fallbacks
const finalUrl = supabaseUrl || 'https://hsajhnxtlgfpkpzcrjyb.supabase.co'
const finalKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4'

export const supabase = createClient(finalUrl, finalKey)

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
          precio: number
          stock: number
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
          precio: number
          stock?: number
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
          precio?: number
          stock?: number
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
          fecha: string
          created_at: string
        }
        Insert: {
          id?: string
          cliente_id?: string | null
          empleado_id: string
          total: number
          fecha?: string
          created_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string | null
          empleado_id?: string
          total?: number
          fecha?: string
          created_at?: string
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
        }
        Insert: {
          id?: string
          venta_id: string
          producto_id: string
          cantidad: number
          precio_unitario: number
          subtotal: number
        }
        Update: {
          id?: string
          venta_id?: string
          producto_id?: string
          cantidad?: number
          precio_unitario?: number
          subtotal?: number
        }
      }
      caja_movimientos: {
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
