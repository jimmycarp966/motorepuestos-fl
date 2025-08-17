import { supabase } from './supabase'
import { createBusinessError, ERROR_CODES } from './auditLogger'
import type { 
  CreateVentaData, 
  CreateProductoData, 
  UpdateProductoData,
  CreateClienteData,
  UpdateClienteData,
  CreateEmpleadoData,
  UpdateEmpleadoData,
  Producto,
  Cliente
} from '../store/types'

// Interfaz para validadores
interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Clase principal para reglas de negocio
export class BusinessRules {
  
  // ================================
  // VALIDACIONES DE VENTAS
  // ================================
  
  static async validateVenta(data: CreateVentaData): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Validar que hay productos
    if (!data.items || data.items.length === 0) {
      errors.push(ERROR_CODES.VENTA_SIN_PRODUCTOS)
    }

    // Validar cantidades
    if (data.items?.some(item => item.cantidad <= 0)) {
      errors.push(ERROR_CODES.CANTIDAD_INVALIDA)
    }

    // Validar precios
    if (data.items?.some(item => item.precio_unitario <= 0)) {
      errors.push(ERROR_CODES.PRECIO_INVALIDO)
    }

    // Validar cliente si es cuenta corriente
    if (data.metodo_pago === 'cuenta_corriente') {
      if (!data.cliente_id) {
        errors.push('Debe seleccionar un cliente para ventas a cuenta corriente')
      } else {
        // Validar límite de crédito
        const clienteValid = await this.validateCreditoCliente(data.cliente_id, data.items)
        if (!clienteValid.isValid) {
          errors.push(...clienteValid.errors)
        }
      }
    }

    // Validar stock disponible
    const stockValidation = await this.validateStockDisponible(data.items)
    if (!stockValidation.isValid) {
      // Stock insuficiente es warning, no error (se permite venta con stock negativo)
      warnings.push(...stockValidation.errors)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  private static async validateCreditoCliente(
    clienteId: string, 
    items: CreateVentaData['items']
  ): Promise<ValidationResult> {
    try {
      const { data: cliente, error } = await supabase
        .from('clientes')
        .select('limite_credito, saldo_cuenta_corriente')
        .eq('id', clienteId)
        .single()

      if (error || !cliente) {
        return {
          isValid: false,
          errors: [ERROR_CODES.CLIENTE_NO_ENCONTRADO],
          warnings: []
        }
      }

      const totalVenta = items.reduce((sum, item) => sum + item.subtotal, 0)
      const saldoFuturo = cliente.saldo_cuenta_corriente + totalVenta

      if (saldoFuturo > cliente.limite_credito) {
        return {
          isValid: false,
          errors: [ERROR_CODES.LIMITE_CREDITO_EXCEDIDO],
          warnings: []
        }
      }

      return { isValid: true, errors: [], warnings: [] }
    } catch (error) {
      return {
        isValid: false,
        errors: [ERROR_CODES.CONEXION_DB_ERROR],
        warnings: []
      }
    }
  }

  private static async validateStockDisponible(
    items: CreateVentaData['items']
  ): Promise<ValidationResult> {
    const errors: string[] = []

    try {
      for (const item of items) {
        const { data: producto, error } = await supabase
          .from('productos')
          .select('stock, nombre')
          .eq('id', item.producto_id)
          .single()

        if (error || !producto) {
          errors.push(`Producto no encontrado: ${item.producto_id}`)
          continue
        }

        if (producto.stock < item.cantidad) {
          errors.push(`Stock insuficiente para ${producto.nombre}: disponible ${producto.stock}, solicitado ${item.cantidad}`)
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings: []
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [ERROR_CODES.CONEXION_DB_ERROR],
        warnings: []
      }
    }
  }

  // ================================
  // VALIDACIONES DE PRODUCTOS
  // ================================

  static async validateProducto(
    data: CreateProductoData | UpdateProductoData,
    isUpdate = false,
    existingId?: string
  ): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Validar SKU único
    if (data.codigo_sku) {
      const skuExists = await this.validateUniqueSKU(data.codigo_sku, existingId)
      if (!skuExists.isValid) {
        errors.push(...skuExists.errors)
      }
    }

    // Validar precios
    if (data.precio_minorista !== undefined && data.precio_minorista <= 0) {
      errors.push('El precio minorista debe ser mayor a cero')
    }

    if (data.precio_mayorista !== undefined && data.precio_mayorista <= 0) {
      errors.push('El precio mayorista debe ser mayor a cero')
    }

    if (data.costo !== undefined && data.costo < 0) {
      errors.push('El costo no puede ser negativo')
    }

    // Validar margen de ganancia
    if (data.precio_minorista && data.costo && data.precio_minorista <= data.costo) {
      warnings.push('El precio minorista es menor o igual al costo')
    }

    // Validar stock
    if (data.stock !== undefined && data.stock < 0) {
      errors.push('El stock no puede ser negativo')
    }

    if (data.stock_minimo !== undefined && data.stock_minimo < 0) {
      errors.push('El stock mínimo no puede ser negativo')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  private static async validateUniqueSKU(
    sku: string, 
    excludeId?: string
  ): Promise<ValidationResult> {
    try {
      let query = supabase
        .from('productos')
        .select('id')
        .eq('codigo_sku', sku)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) {
        return {
          isValid: false,
          errors: [ERROR_CODES.CONEXION_DB_ERROR],
          warnings: []
        }
      }

      if (data && data.length > 0) {
        return {
          isValid: false,
          errors: [ERROR_CODES.SKU_DUPLICADO],
          warnings: []
        }
      }

      return { isValid: true, errors: [], warnings: [] }
    } catch (error) {
      return {
        isValid: false,
        errors: [ERROR_CODES.CONEXION_DB_ERROR],
        warnings: []
      }
    }
  }

  // ================================
  // VALIDACIONES DE CLIENTES
  // ================================

  static async validateCliente(
    data: CreateClienteData | UpdateClienteData,
    isUpdate = false,
    existingId?: string
  ): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Validar email único
    if (data.email) {
      const emailValid = await this.validateUniqueEmail(data.email, 'clientes', existingId)
      if (!emailValid.isValid) {
        errors.push(...emailValid.errors)
      }
    }

    // Validar límite de crédito
    if (data.limite_credito !== undefined && data.limite_credito < 0) {
      errors.push('El límite de crédito no puede ser negativo')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // ================================
  // VALIDACIONES DE EMPLEADOS
  // ================================

  static async validateEmpleado(
    data: CreateEmpleadoData | UpdateEmpleadoData,
    isUpdate = false,
    existingId?: string
  ): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Validar email único
    if (data.email) {
      const emailValid = await this.validateUniqueEmail(data.email, 'empleados', existingId)
      if (!emailValid.isValid) {
        errors.push(...emailValid.errors)
      }
    }

    // Validar rol
    const rolesValidos = ['Administrador', 'Gerente', 'Vendedor', 'Técnico', 'Almacén', 'Cajero']
    if (data.rol && !rolesValidos.includes(data.rol)) {
      errors.push(ERROR_CODES.ROL_INVALIDO)
    }

    // Validar salario
    if (data.salario !== undefined && data.salario < 0) {
      errors.push('El salario no puede ser negativo')
    }

    // Validar permisos
    if (data.permisos_modulos && data.permisos_modulos.length === 0) {
      errors.push('Debe asignar al menos un módulo al empleado')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  private static async validateUniqueEmail(
    email: string,
    table: 'clientes' | 'empleados',
    excludeId?: string
  ): Promise<ValidationResult> {
    try {
      let query = supabase
        .from(table)
        .select('id')
        .eq('email', email)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) {
        return {
          isValid: false,
          errors: [ERROR_CODES.CONEXION_DB_ERROR],
          warnings: []
        }
      }

      if (data && data.length > 0) {
        return {
          isValid: false,
          errors: [ERROR_CODES.EMAIL_DUPLICADO],
          warnings: []
        }
      }

      return { isValid: true, errors: [], warnings: [] }
    } catch (error) {
      return {
        isValid: false,
        errors: [ERROR_CODES.CONEXION_DB_ERROR],
        warnings: []
      }
    }
  }

  // ================================
  // VALIDACIONES DE CAJA
  // ================================

  static async validateAperturaCaja(
    empleadoId: string,
    fecha: string,
    saldoInicial: number
  ): Promise<ValidationResult> {
    const errors: string[] = []

    // Validar saldo inicial
    if (saldoInicial < 0) {
      errors.push('El saldo inicial no puede ser negativo')
    }

    // Validar que no hay caja abierta
    try {
      const { data, error } = await supabase
        .from('cajas_diarias')
        .select('id')
        .eq('fecha', fecha)
        .eq('estado', 'abierta')

      if (error) {
        errors.push(ERROR_CODES.CONEXION_DB_ERROR)
      } else if (data && data.length > 0) {
        errors.push(ERROR_CODES.CAJA_YA_ABIERTA)
      }
    } catch (error) {
      errors.push(ERROR_CODES.CONEXION_DB_ERROR)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    }
  }

  static async validateMovimientoCaja(
    empleadoId: string,
    fecha: string,
    monto: number,
    tipo: 'ingreso' | 'egreso'
  ): Promise<ValidationResult> {
    const errors: string[] = []

    // Validar monto
    if (monto <= 0) {
      errors.push('El monto debe ser mayor a cero')
    }

    // Validar que hay caja abierta
    try {
      const { data, error } = await supabase
        .from('cajas_diarias')
        .select('id')
        .eq('fecha', fecha)
        .eq('estado', 'abierta')

      if (error) {
        errors.push(ERROR_CODES.CONEXION_DB_ERROR)
      } else if (!data || data.length === 0) {
        errors.push(ERROR_CODES.CAJA_NO_ABIERTA)
      }
    } catch (error) {
      errors.push(ERROR_CODES.CONEXION_DB_ERROR)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    }
  }

  // ================================
  // VALIDACIONES GENERALES
  // ================================

  static validateRequired(value: any, fieldName: string): ValidationResult {
    if (value === null || value === undefined || value === '') {
      return {
        isValid: false,
        errors: [`${fieldName} es requerido`],
        warnings: []
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  static validateEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        errors: ['Formato de email inválido'],
        warnings: []
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  static validatePositiveNumber(value: number, fieldName: string): ValidationResult {
    if (value < 0) {
      return {
        isValid: false,
        errors: [`${fieldName} no puede ser negativo`],
        warnings: []
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  // ================================
  // INVARIANTES DE NEGOCIO
  // ================================

  // Verificar integridad de saldo de caja
  static async validateSaldoCajaIntegrity(fecha: string): Promise<ValidationResult> {
    const errors: string[] = []

    try {
      // Obtener movimientos del día
      const { data: movimientos, error } = await supabase
        .from('movimientos_caja')
        .select('tipo, monto')
        .eq('fecha', fecha)

      if (error) {
        errors.push(ERROR_CODES.CONEXION_DB_ERROR)
        return { isValid: false, errors, warnings: [] }
      }

      // Calcular saldo teórico
      const saldoTeorico = movimientos?.reduce((acc, mov) => {
        return mov.tipo === 'ingreso' ? acc + mov.monto : acc - mov.monto
      }, 0) || 0

      // En una implementación completa, comparar con el saldo registrado
      // Por ahora, solo validar que no sea negativo
      if (saldoTeorico < 0) {
        errors.push('El saldo de caja no puede ser negativo')
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings: []
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [ERROR_CODES.CONEXION_DB_ERROR],
        warnings: []
      }
    }
  }
}

export default BusinessRules
