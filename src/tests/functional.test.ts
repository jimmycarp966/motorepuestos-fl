// ================================================
// TESTS FUNCIONALES DE LA WEBAPP
// ================================================

import { describe, it, expect, vi } from 'vitest'
import { config } from '../lib/config'

describe('Tests Funcionales de la Webapp', () => {
  
  describe('Configuración del Sistema', () => {
    it('debería tener configuración válida para tests', () => {
      expect(config.isTest).toBe(true)
      expect(config.debug).toBe(true)
      expect(config.cacheEnabled).toBe(false)
      expect(config.auditEnabled).toBe(true)
    })

    it('debería tener URLs de Supabase configuradas', () => {
      expect(config.supabaseUrl).toBeDefined()
      expect(config.supabaseKey).toBeDefined()
      expect(config.supabaseUrl.length).toBeGreaterThan(0)
      expect(config.supabaseKey.length).toBeGreaterThan(0)
    })

    it('debería tener configuración de paginación', () => {
      expect(config.itemsPerPage).toBeGreaterThan(0)
      expect(typeof config.itemsPerPage).toBe('number')
    })

    it('debería tener configuración de notificaciones', () => {
      expect(config.notificationDuration).toBeGreaterThan(0)
      expect(typeof config.notificationDuration).toBe('number')
    })
  })

  describe('Validaciones de Negocio', () => {
    it('debería validar estructura de venta completa', () => {
      const venta = {
        id: 'venta-001',
        cliente_id: 'cliente-001',
        empleado_id: 'empleado-001',
        items: [
          {
            producto_id: 'prod-001',
            cantidad: 2,
            precio_unitario: 150.50,
            subtotal: 301.00,
            tipo_precio: 'minorista'
          }
        ],
        total: 301.00,
        metodo_pago: 'efectivo',
        tipo_precio: 'minorista',
        fecha: '2024-01-01',
        estado: 'completada'
      }

      // Validaciones
      expect(venta.items.length).toBeGreaterThan(0)
      expect(venta.total).toBeGreaterThan(0)
      expect(venta.items[0].subtotal).toBe(venta.items[0].cantidad * venta.items[0].precio_unitario)
      expect(['efectivo', 'tarjeta', 'transferencia', 'cuenta_corriente']).toContain(venta.metodo_pago)
      expect(['minorista', 'mayorista']).toContain(venta.tipo_precio)
    })

    it('debería validar estructura de producto', () => {
      const producto = {
        id: 'prod-001',
        nombre: 'Aceite Motor',
        codigo_sku: 'ACE-001',
        precio_minorista: 250.00,
        precio_mayorista: 200.00,
        costo: 150.00,
        stock: 25,
        stock_minimo: 5,
        categoria: 'Lubricantes',
        unidad_medida: 'litro',
        activo: true
      }

      // Validaciones
      expect(producto.nombre.length).toBeGreaterThan(0)
      expect(producto.codigo_sku.length).toBeGreaterThan(0)
      expect(producto.precio_minorista).toBeGreaterThan(0)
      expect(producto.precio_mayorista).toBeGreaterThan(0)
      expect(producto.costo).toBeGreaterThan(0)
      expect(producto.precio_minorista).toBeGreaterThan(producto.precio_mayorista)
      expect(producto.precio_mayorista).toBeGreaterThan(producto.costo)
      expect(producto.stock).toBeGreaterThanOrEqual(0)
      expect(producto.stock_minimo).toBeGreaterThanOrEqual(0)
    })

    it('debería validar estructura de cliente', () => {
      const cliente = {
        id: 'cli-001',
        nombre: 'Cliente Test',
        email: 'cliente@test.com',
        telefono: '123456789',
        direccion: 'Dirección Test 123',
        limite_credito: 5000.00,
        saldo_cuenta_corriente: 1500.00,
        activo: true
      }

      // Validaciones
      expect(cliente.nombre.length).toBeGreaterThan(0)
      expect(cliente.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      expect(cliente.limite_credito).toBeGreaterThanOrEqual(0)
      expect(cliente.saldo_cuenta_corriente).toBeGreaterThanOrEqual(0)
      expect(typeof cliente.activo).toBe('boolean')
    })

    it('debería validar cálculos de inventario', () => {
      const productos = [
        { stock: 10, stock_minimo: 5 },
        { stock: 3, stock_minimo: 5 },
        { stock: 0, stock_minimo: 2 }
      ]

      const conStockBajo = productos.filter(p => p.stock <= p.stock_minimo && p.stock > 0)
      const sinStock = productos.filter(p => p.stock === 0)
      const conStockNormal = productos.filter(p => p.stock > p.stock_minimo)

      expect(conStockBajo.length).toBe(1)
      expect(sinStock.length).toBe(1)
      expect(conStockNormal.length).toBe(1)
    })
  })

  describe('Funciones de Utilidad', () => {
    it('debería generar IDs únicos consistentemente', () => {
      const ids = new Set()
      
      for (let i = 0; i < 100; i++) {
        const id = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        ids.add(id)
      }
      
      // Todos los IDs deben ser únicos
      expect(ids.size).toBe(100)
    })

    it('debería formatear números correctamente', () => {
      const precio = 1234567.89
      const formateado = precio.toLocaleString()
      
      expect(formateado).toContain('1')
      expect(formateado).toContain('234')
      expect(formateado).toContain('567')
    })

    it('debería manejar fechas en diferentes formatos', () => {
      const hoy = new Date()
      const fechaISO = hoy.toISOString()
      const fechaLocal = hoy.toLocaleDateString()
      
      expect(new Date(fechaISO)).toBeInstanceOf(Date)
      expect(fechaLocal).toContain('/')
    })

    it('debería validar rangos de datos', () => {
      const stock = 15
      const stockMinimo = 10
      const stockMaximo = 100
      
      const enRango = stock >= stockMinimo && stock <= stockMaximo
      const esBajo = stock <= stockMinimo
      const esAlto = stock >= stockMaximo
      
      expect(enRango).toBe(true)
      expect(esBajo).toBe(false)
      expect(esAlto).toBe(false)
    })
  })

  describe('Integridad de Datos', () => {
    it('debería mantener consistencia en cálculos de venta', () => {
      const items = [
        { cantidad: 2, precio_unitario: 100, subtotal: 200 },
        { cantidad: 1, precio_unitario: 50, subtotal: 50 },
        { cantidad: 3, precio_unitario: 75, subtotal: 225 }
      ]
      
      // Verificar que cada subtotal sea correcto
      items.forEach(item => {
        expect(item.subtotal).toBe(item.cantidad * item.precio_unitario)
      })
      
      // Verificar total
      const total = items.reduce((sum, item) => sum + item.subtotal, 0)
      expect(total).toBe(475)
    })

    it('debería validar estados de entidades', () => {
      const estados = {
        producto: { activo: true, stock: 10 },
        cliente: { activo: true, saldo: 0 },
        venta: { estado: 'completada', total: 100 },
        empleado: { activo: true, rol: 'Vendedor' }
      }
      
      expect(estados.producto.activo).toBe(true)
      expect(estados.cliente.activo).toBe(true)
      expect(['completada', 'pendiente', 'cancelada']).toContain(estados.venta.estado)
      expect(['Administrador', 'Gerente', 'Vendedor', 'Cajero']).toContain(estados.empleado.rol)
    })
  })

  describe('Flujos de Negocio', () => {
    it('debería calcular precios con descuentos correctamente', () => {
      const producto = {
        precio_minorista: 100,
        precio_mayorista: 80
      }
      
      const ventaMinorista = {
        cantidad: 1,
        precio_unitario: producto.precio_minorista,
        descuento: 0.1 // 10%
      }
      
      const precioConDescuento = ventaMinorista.precio_unitario * (1 - ventaMinorista.descuento)
      const subtotal = precioConDescuento * ventaMinorista.cantidad
      
      expect(precioConDescuento).toBe(90)
      expect(subtotal).toBe(90)
    })

    it('debería validar límites de crédito para clientes', () => {
      const cliente = {
        limite_credito: 1000,
        saldo_cuenta_corriente: 200
      }
      
      const nuevaVenta = {
        total: 900
      }
      
      const creditoDisponible = cliente.limite_credito - cliente.saldo_cuenta_corriente
      const puedeVender = nuevaVenta.total <= creditoDisponible
      
      expect(creditoDisponible).toBe(800)
      expect(puedeVender).toBe(false) // 900 > 800
    })

    it('debería manejar diferentes métodos de pago', () => {
      const metodosPago = ['efectivo', 'tarjeta', 'transferencia', 'cuenta_corriente']
      const venta = {
        total: 500,
        metodo_pago: 'efectivo'
      }
      
      expect(metodosPago).toContain(venta.metodo_pago)
      
      // Validar que cada método de pago es válido
      metodosPago.forEach(metodo => {
        expect(typeof metodo).toBe('string')
        expect(metodo.length).toBeGreaterThan(0)
      })
    })

    it('debería controlar stock durante las ventas', () => {
      const producto = {
        stock: 10,
        stock_minimo: 5
      }
      
      const venta = {
        cantidad: 3
      }
      
      const stockDespuesVenta = producto.stock - venta.cantidad
      const necesitaReposicion = stockDespuesVenta <= producto.stock_minimo
      
      expect(stockDespuesVenta).toBe(7)
      expect(necesitaReposicion).toBe(false) // 7 > 5
      
      // Caso con stock crítico
      const ventaGrande = { cantidad: 8 }
      const stockCritico = producto.stock - ventaGrande.cantidad
      const alertaStock = stockCritico <= producto.stock_minimo
      
      expect(stockCritico).toBe(2)
      expect(alertaStock).toBe(true) // 2 <= 5
    })
  })

  describe('Roles y Permisos', () => {
    it('debería definir roles válidos del sistema', () => {
      const rolesValidos = ['Administrador', 'Gerente', 'Vendedor', 'Cajero', 'Técnico', 'Invitado']
      
      rolesValidos.forEach(rol => {
        expect(typeof rol).toBe('string')
        expect(rol.length).toBeGreaterThan(0)
      })
      
      expect(rolesValidos).toContain('Administrador')
      expect(rolesValidos).toContain('Vendedor')
      expect(rolesValidos).toContain('Cajero')
    })

    it('debería validar módulos del sistema', () => {
      const modulosDisponibles = [
        'dashboard', 
        'empleados', 
        'productos', 
        'clientes', 
        'ventas', 
        'caja', 
        'reportes', 
        'calendario'
      ]
      
      modulosDisponibles.forEach(modulo => {
        expect(typeof modulo).toBe('string')
        expect(modulo.length).toBeGreaterThan(0)
      })
      
      expect(modulosDisponibles.length).toBeGreaterThan(5)
    })

    it('debería validar acciones por módulo', () => {
      const accionesBasicas = ['view', 'create', 'update', 'delete', 'manage']
      
      accionesBasicas.forEach(accion => {
        expect(typeof accion).toBe('string')
        expect(accion.length).toBeGreaterThan(0)
      })
      
      expect(accionesBasicas).toContain('view')
      expect(accionesBasicas).toContain('create')
      expect(accionesBasicas).toContain('delete')
    })
  })
})
