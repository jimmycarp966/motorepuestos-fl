// ================================================
// TESTS PARA PERMISSION GUARD
// ================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePermissionGuard, useRouteGuard } from '../../hooks/usePermissionGuard'
import { setupAuthenticatedStore, setupUnauthenticatedStore, createMockUser } from '../utils/testUtils'

describe('usePermissionGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Usuario Administrador', () => {
    beforeEach(() => {
      const adminUser = createMockUser({
        rol: 'Administrador',
        permisos_modulos: ['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'reportes']
      })
      setupAuthenticatedStore(adminUser)
    })

    it('debería tener acceso a todos los módulos', () => {
      const { result } = renderHook(() => usePermissionGuard())
      
      expect(result.current.canAccess('dashboard')).toBe(true)
      expect(result.current.canAccess('empleados')).toBe(true)
      expect(result.current.canAccess('productos')).toBe(true)
      expect(result.current.canAccess('clientes')).toBe(true)
      expect(result.current.canAccess('ventas')).toBe(true)
      expect(result.current.canAccess('caja')).toBe(true)
      expect(result.current.canAccess('reportes')).toBe(true)
    })

    it('debería poder realizar todas las acciones', () => {
      const { result } = renderHook(() => usePermissionGuard())
      
      expect(result.current.canPerform('productos', 'create')).toBe(true)
      expect(result.current.canPerform('productos', 'update')).toBe(true)
      expect(result.current.canPerform('productos', 'delete')).toBe(true)
      expect(result.current.canPerform('empleados', 'manage')).toBe(true)
    })

    it('debería ser identificado como admin', () => {
      const { result } = renderHook(() => usePermissionGuard())
      
      expect(result.current.isAdmin).toBe(true)
      expect(result.current.isManager).toBe(true)
    })

    it('debería obtener todos los módulos accesibles', () => {
      const { result } = renderHook(() => usePermissionGuard())
      
      const accessibleModules = result.current.getAccessibleModules()
      expect(accessibleModules).toContain('dashboard')
      expect(accessibleModules).toContain('empleados')
      expect(accessibleModules).toContain('productos')
      expect(accessibleModules.length).toBeGreaterThan(5)
    })
  })

  describe('Usuario Vendedor', () => {
    beforeEach(() => {
      const vendedorUser = createMockUser({
        rol: 'Vendedor',
        permisos_modulos: ['dashboard', 'ventas', 'clientes']
      })
      setupAuthenticatedStore(vendedorUser)
    })

    it('debería tener acceso limitado a módulos', () => {
      const { result } = renderHook(() => usePermissionGuard())
      
      expect(result.current.canAccess('dashboard')).toBe(true)
      expect(result.current.canAccess('ventas')).toBe(true)
      expect(result.current.canAccess('clientes')).toBe(true)
      expect(result.current.canAccess('empleados')).toBe(false)
      expect(result.current.canAccess('reportes')).toBe(false)
    })

    it('debería tener permisos limitados en productos', () => {
      const { result } = renderHook(() => usePermissionGuard())
      
      expect(result.current.canPerform('productos', 'read')).toBe(true)
      expect(result.current.canPerform('productos', 'create')).toBe(false)
      expect(result.current.canPerform('productos', 'delete')).toBe(false)
    })

    it('no debería ser admin ni manager', () => {
      const { result } = renderHook(() => usePermissionGuard())
      
      expect(result.current.isAdmin).toBe(false)
      expect(result.current.isManager).toBe(false)
    })
  })

  describe('Usuario no autenticado', () => {
    beforeEach(() => {
      setupUnauthenticatedStore()
    })

    it('no debería tener acceso a ningún módulo', () => {
      const { result } = renderHook(() => usePermissionGuard())
      
      expect(result.current.canAccess('dashboard')).toBe(false)
      expect(result.current.canAccess('ventas')).toBe(false)
      expect(result.current.canAccess('productos')).toBe(false)
    })

    it('no debería poder realizar ninguna acción', () => {
      const { result } = renderHook(() => usePermissionGuard())
      
      expect(result.current.canPerform('ventas', 'create')).toBe(false)
      expect(result.current.canPerform('productos', 'read')).toBe(false)
    })

    it('checkModuleAccess debería devolver redirect a login', () => {
      const { result } = renderHook(() => usePermissionGuard())
      
      const check = result.current.checkModuleAccess('dashboard')
      expect(check.hasPermission).toBe(false)
      expect(check.redirectTo).toBe('/login')
      expect(check.reason).toContain('no autenticado')
    })
  })

  describe('Usuario inactivo', () => {
    beforeEach(() => {
      const inactiveUser = createMockUser({
        activo: false
      })
      setupAuthenticatedStore(inactiveUser)
    })

    it('no debería tener acceso a módulos', () => {
      const { result } = renderHook(() => usePermissionGuard())
      
      const check = result.current.checkModuleAccess('dashboard')
      expect(check.hasPermission).toBe(false)
      expect(check.redirectTo).toBe('/unauthorized')
      expect(check.reason).toContain('inactivo')
    })
  })
})

describe('useRouteGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería permitir acceso con permisos válidos', () => {
    const adminUser = createMockUser({ rol: 'Administrador' })
    setupAuthenticatedStore(adminUser)

    const { result } = renderHook(() => useRouteGuard('productos', 'read'))
    
    const check = result.current.checkAccess()
    expect(check.hasPermission).toBe(true)
  })

  it('debería denegar acceso sin permisos', () => {
    const vendedorUser = createMockUser({ 
      rol: 'Vendedor',
      permisos_modulos: ['ventas'] 
    })
    setupAuthenticatedStore(vendedorUser)

    const { result } = renderHook(() => useRouteGuard('empleados', 'read'))
    
    const check = result.current.checkAccess()
    expect(check.hasPermission).toBe(false)
  })

  it('debería denegar acción específica sin permisos', () => {
    const vendedorUser = createMockUser({ 
      rol: 'Vendedor',
      permisos_modulos: ['productos'] 
    })
    setupAuthenticatedStore(vendedorUser)

    const { result } = renderHook(() => useRouteGuard('productos', 'delete'))
    
    const check = result.current.checkAccess()
    expect(check.hasPermission).toBe(false)
    expect(check.reason).toContain('delete')
  })
})

describe('Roles específicos', () => {
  it('Gerente debería tener acceso de management a algunos módulos', () => {
    const gerenteUser = createMockUser({ rol: 'Gerente' })
    setupAuthenticatedStore(gerenteUser)

    const { result } = renderHook(() => usePermissionGuard())
    
    expect(result.current.canPerform('caja', 'manage')).toBe(true)
    expect(result.current.canPerform('empleados', 'create')).toBe(true)
    expect(result.current.canPerform('empleados', 'delete')).toBe(false) // Solo admin puede delete empleados
  })

  it('Técnico debería tener acceso limitado a productos', () => {
    const tecnicoUser = createMockUser({ rol: 'Técnico' })
    setupAuthenticatedStore(tecnicoUser)

    const { result } = renderHook(() => usePermissionGuard())
    
    expect(result.current.canAccess('productos')).toBe(true)
    expect(result.current.canPerform('productos', 'create')).toBe(true)
    expect(result.current.canPerform('productos', 'update')).toBe(true)
    expect(result.current.canAccess('ventas')).toBe(false)
    expect(result.current.canAccess('caja')).toBe(false)
  })

  it('Cajero debería tener acceso a ventas y caja', () => {
    const cajeroUser = createMockUser({ rol: 'Cajero' })
    setupAuthenticatedStore(cajeroUser)

    const { result } = renderHook(() => usePermissionGuard())
    
    expect(result.current.canAccess('ventas')).toBe(true)
    expect(result.current.canAccess('caja')).toBe(true)
    expect(result.current.canPerform('ventas', 'create')).toBe(true)
    expect(result.current.canPerform('caja', 'update')).toBe(true)
    expect(result.current.canAccess('empleados')).toBe(false)
    expect(result.current.canAccess('reportes')).toBe(false)
  })
})
