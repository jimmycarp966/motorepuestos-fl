// ================================================
// TESTS PARA BUSINESS RULES
// ================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock de Supabase (debe estar antes de los imports que lo usan)
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}))

import { BusinessRules } from '../../lib/businessRules'
import { createBusinessError, ERROR_CODES } from '../../lib/auditLogger'

describe('BusinessRules', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validateVenta', () => {
    it('debería validar venta válida', async () => {
      const ventaData = {
        items: [
          {
            producto_id: 'prod-1',
            cantidad: 2,
            precio_unitario: 100,
            subtotal: 200
          }
        ],
        metodo_pago: 'efectivo',
        total: 200
      }

      const result = await BusinessRules.validateVenta(ventaData)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('debería rechazar venta sin productos', async () => {
      const ventaData = {
        items: [],
        metodo_pago: 'efectivo',
        total: 0
      }

      const result = await BusinessRules.validateVenta(ventaData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(ERROR_CODES.VENTA_SIN_PRODUCTOS)
    })

    it('debería rechazar venta con cantidad inválida', async () => {
      const ventaData = {
        items: [
          {
            producto_id: 'prod-1',
            cantidad: 0,
            precio_unitario: 100,
            subtotal: 0
          }
        ],
        metodo_pago: 'efectivo',
        total: 0
      }

      const result = await BusinessRules.validateVenta(ventaData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(ERROR_CODES.CANTIDAD_INVALIDA)
    })

    it('debería rechazar venta con precio inválido', async () => {
      const ventaData = {
        items: [
          {
            producto_id: 'prod-1',
            cantidad: 1,
            precio_unitario: 0,
            subtotal: 0
          }
        ],
        metodo_pago: 'efectivo',
        total: 0
      }

      const result = await BusinessRules.validateVenta(ventaData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(ERROR_CODES.PRECIO_INVALIDO)
    })

    it('debería validar cliente para cuenta corriente', async () => {
      // Mock de cliente válido
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                limite_credito: 1000,
                saldo_cuenta_corriente: 0
              },
              error: null
            })
          }))
        }))
      })

      const ventaData = {
        items: [
          {
            producto_id: 'prod-1',
            cantidad: 1,
            precio_unitario: 100,
            subtotal: 100
          }
        ],
        metodo_pago: 'cuenta_corriente',
        cliente_id: 'cliente-1',
        total: 100
      }

      const result = await BusinessRules.validateVenta(ventaData)
      
      expect(result.isValid).toBe(true)
    })

    it('debería rechazar venta que excede límite de crédito', async () => {
      // Mock de cliente con límite excedido
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                limite_credito: 100,
                saldo_cuenta_corriente: 50
              },
              error: null
            })
          }))
        }))
      })

      const ventaData = {
        items: [
          {
            producto_id: 'prod-1',
            cantidad: 1,
            precio_unitario: 100,
            subtotal: 100
          }
        ],
        metodo_pago: 'cuenta_corriente',
        cliente_id: 'cliente-1',
        total: 100
      }

      const result = await BusinessRules.validateVenta(ventaData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(ERROR_CODES.LIMITE_CREDITO_EXCEDIDO)
    })
  })

  describe('validateProducto', () => {
    it('debería validar producto válido', async () => {
      const productoData = {
        nombre: 'Producto Test',
        codigo_sku: 'TEST-001',
        precio_minorista: 100,
        precio_mayorista: 80,
        costo: 50,
        stock: 10,
        stock_minimo: 5,
        categoria: 'Test',
        unidad_medida: 'unidad'
      }

      const result = await BusinessRules.validateProducto(productoData)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('debería rechazar producto con precio negativo', async () => {
      const productoData = {
        nombre: 'Producto Test',
        codigo_sku: 'TEST-001',
        precio_minorista: -100,
        costo: 50
      }

      const result = await BusinessRules.validateProducto(productoData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('mayor a cero'))).toBe(true)
    })

    it('debería advertir sobre margen de ganancia bajo', async () => {
      const productoData = {
        nombre: 'Producto Test',
        codigo_sku: 'TEST-001',
        precio_minorista: 50,
        costo: 60
      }

      const result = await BusinessRules.validateProducto(productoData)
      
      expect(result.isValid).toBe(true)
      expect(result.warnings.some(warning => warning.includes('menor o igual al costo'))).toBe(true)
    })
  })

  describe('validateCliente', () => {
    it('debería validar cliente válido', async () => {
      const clienteData = {
        nombre: 'Cliente Test',
        email: 'test@example.com',
        limite_credito: 1000
      }

      const result = await BusinessRules.validateCliente(clienteData)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('debería rechazar cliente con límite de crédito negativo', async () => {
      const clienteData = {
        nombre: 'Cliente Test',
        email: 'test@example.com',
        limite_credito: -100
      }

      const result = await BusinessRules.validateCliente(clienteData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('no puede ser negativo'))).toBe(true)
    })
  })

  describe('validateEmpleado', () => {
    it('debería validar empleado válido', async () => {
      const empleadoData = {
        nombre: 'Empleado Test',
        email: 'empleado@test.com',
        rol: 'Vendedor',
        salario: 1000,
        permisos_modulos: ['ventas']
      }

      const result = await BusinessRules.validateEmpleado(empleadoData)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('debería rechazar empleado con rol inválido', async () => {
      const empleadoData = {
        nombre: 'Empleado Test',
        email: 'empleado@test.com',
        rol: 'RolInexistente',
        salario: 1000,
        permisos_modulos: ['ventas']
      }

      const result = await BusinessRules.validateEmpleado(empleadoData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(ERROR_CODES.ROL_INVALIDO)
    })

    it('debería rechazar empleado sin módulos asignados', async () => {
      const empleadoData = {
        nombre: 'Empleado Test',
        email: 'empleado@test.com',
        rol: 'Vendedor',
        salario: 1000,
        permisos_modulos: []
      }

      const result = await BusinessRules.validateEmpleado(empleadoData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('al menos un módulo'))).toBe(true)
    })
  })

  describe('validateRequired', () => {
    it('debería validar valor presente', () => {
      const result = BusinessRules.validateRequired('valor', 'campo')
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('debería rechazar valor vacío', () => {
      const result = BusinessRules.validateRequired('', 'campo')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('campo es requerido')
    })

    it('debería rechazar valor null', () => {
      const result = BusinessRules.validateRequired(null, 'campo')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('campo es requerido')
    })

    it('debería rechazar valor undefined', () => {
      const result = BusinessRules.validateRequired(undefined, 'campo')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('campo es requerido')
    })
  })

  describe('validateEmail', () => {
    it('debería validar email válido', () => {
      const result = BusinessRules.validateEmail('test@example.com')
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('debería rechazar email inválido', () => {
      const result = BusinessRules.validateEmail('email-invalido')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Formato de email inválido')
    })

    it('debería rechazar email sin dominio', () => {
      const result = BusinessRules.validateEmail('test@')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Formato de email inválido')
    })
  })

  describe('validatePositiveNumber', () => {
    it('debería validar número positivo', () => {
      const result = BusinessRules.validatePositiveNumber(100, 'precio')
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('debería validar cero como válido', () => {
      const result = BusinessRules.validatePositiveNumber(0, 'descuento')
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('debería rechazar número negativo', () => {
      const result = BusinessRules.validatePositiveNumber(-100, 'precio')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('precio no puede ser negativo')
    })
  })
})
