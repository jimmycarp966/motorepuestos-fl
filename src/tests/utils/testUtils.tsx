// ================================================
// UTILIDADES PARA TESTING
// ================================================

import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'
import { useAppStore } from '../../store'
import type { AuthenticatedUser } from '../../store/types'

// Mock de useAppStore
vi.mock('../../store', () => ({
  useAppStore: vi.fn()
}))

// Mock del store para tests
export const mockStore = {
  auth: {
    session: null,
    user: null,
    loading: false
  },
  productos: [],
  ventas: [],
  clientes: { clientes: [], loading: false, error: null },
  empleados: { empleados: [], loading: false, error: null },
  caja: { movimientos: [], loading: false, error: null, cajaAbierta: false },
  ui: { theme: 'light', sidebarOpen: true, currentModule: 'dashboard' },
  notifications: { notifications: [] },
  
  // Acciones mock
  login: vi.fn(),
  logout: vi.fn(),
  checkAuth: vi.fn(),
  fetchProductos: vi.fn(),
  createProducto: vi.fn(),
  updateProducto: vi.fn(),
  deleteProducto: vi.fn(),
  fetchVentas: vi.fn(),
  registrarVenta: vi.fn(),
  fetchClientes: vi.fn(),
  createCliente: vi.fn(),
  updateCliente: vi.fn(),
  deleteCliente: vi.fn(),
  addNotification: vi.fn(),
  removeNotification: vi.fn(),
  setTheme: vi.fn(),
  setSidebarOpen: vi.fn(),
  setCurrentModule: vi.fn()
}

// Usuario mock para tests
export const mockUser: AuthenticatedUser = {
  id: 'test-user-id',
  nombre: 'Usuario Test',
  email: 'test@example.com',
  rol: 'Administrador',
  activo: true,
  permisos_modulos: ['dashboard', 'productos', 'ventas', 'clientes', 'empleados', 'caja', 'reportes'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

// Crear usuario mock con rol específico
export function createMockUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    ...mockUser,
    ...overrides
  }
}

// Configurar store para tests con usuario autenticado
export function setupAuthenticatedStore(user: AuthenticatedUser = mockUser) {
  const initialStore = {
    ...mockStore,
    auth: {
      session: { user: { id: user.id, email: user.email } },
      user,
      loading: false
    }
  }
  
  // Mock del hook useAppStore
  const mockedUseAppStore = useAppStore as any
  mockedUseAppStore.mockImplementation((selector: any) => {
    if (typeof selector === 'function') {
      return selector(initialStore)
    }
    return initialStore
  })
  
  return initialStore
}

// Configurar store para tests sin usuario
export function setupUnauthenticatedStore() {
  const initialStore = {
    ...mockStore,
    auth: {
      session: null,
      user: null,
      loading: false
    }
  }
  
  const mockedUseAppStore = useAppStore as any
  mockedUseAppStore.mockImplementation((selector: any) => {
    if (typeof selector === 'function') {
      return selector(initialStore)
    }
    return initialStore
  })
  
  return initialStore
}

// Wrapper para componentes que requieren contexto
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

// Función de render personalizada
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Helpers para datos de test
export const testData = {
  producto: {
    id: 'test-producto-id',
    nombre: 'Producto Test',
    codigo_sku: 'TEST-001',
    precio_minorista: 100,
    precio_mayorista: 80,
    costo: 50,
    stock: 10,
    stock_minimo: 5,
    categoria: 'Test',
    unidad_medida: 'unidad',
    activo: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  
  cliente: {
    id: 'test-cliente-id',
    nombre: 'Cliente Test',
    email: 'cliente@test.com',
    telefono: '123456789',
    direccion: 'Dirección Test',
    limite_credito: 1000,
    saldo_cuenta_corriente: 0,
    activo: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  
  venta: {
    id: 'test-venta-id',
    cliente_id: 'test-cliente-id',
    empleado_id: 'test-user-id',
    total: 200,
    fecha: '2024-01-01',
    metodo_pago: 'efectivo',
    tipo_precio: 'minorista',
    estado: 'completada',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    items: [
      {
        id: 'test-item-id',
        venta_id: 'test-venta-id',
        producto_id: 'test-producto-id',
        cantidad: 2,
        precio_unitario: 100,
        subtotal: 200,
        tipo_precio: 'minorista'
      }
    ]
  }
}

// Helper para esperar por efectos asíncronos
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Helper para simular delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock de notificaciones
export const mockNotifications = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn()
}

// Helper para verificar llamadas de notificación
export function expectNotificationCalled(type: 'success' | 'error' | 'warning' | 'info', message?: string) {
  const addNotification = vi.mocked(mockStore.addNotification)
  
  expect(addNotification).toHaveBeenCalled()
  
  if (message) {
    const calls = addNotification.mock.calls
    const matchingCall = calls.find(call => 
      call[0].type === type && call[0].message.includes(message)
    )
    expect(matchingCall).toBeDefined()
  }
}

// Helper para limpiar mocks
export function clearAllMocks() {
  Object.values(mockStore).forEach(value => {
    if (typeof value === 'function') {
      vi.mocked(value).mockClear()
    }
  })
}

// Re-exportar todo de testing-library
export * from '@testing-library/react'
export { customRender as render }
export { vi } from 'vitest'
