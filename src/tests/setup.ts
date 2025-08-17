// ================================================
// CONFIGURACIÓN DE TESTING PARA VITEST
// ================================================

import { expect, afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Importar y configurar mocks
import './mocks'

// Cleanup después de cada test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Mock de variables de entorno para tests
beforeEach(() => {
  vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')
  vi.stubEnv('VITE_APP_NAME', 'Test App')
  vi.stubEnv('NODE_ENV', 'test')
})

// Mock de window.matchMedia (requerido por algunos componentes)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock de IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}))

// Mock de ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}))

// Mock básico de crypto para Node.js
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
    getRandomValues: (arr: any) => arr.map(() => Math.floor(Math.random() * 256))
  }
})

// Extender expect con matchers personalizados
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const pass = typeof received === 'string' && uuidRegex.test(received)
    
    return {
      pass,
      message: () => pass 
        ? `Expected ${received} not to be a valid UUID`
        : `Expected ${received} to be a valid UUID`
    }
  },
  
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const pass = typeof received === 'string' && emailRegex.test(received)
    
    return {
      pass,
      message: () => pass 
        ? `Expected ${received} not to be a valid email`
        : `Expected ${received} to be a valid email`
    }
  },
  
  toBePositiveNumber(received: number) {
    const pass = typeof received === 'number' && received > 0
    
    return {
      pass,
      message: () => pass 
        ? `Expected ${received} not to be a positive number`
        : `Expected ${received} to be a positive number`
    }
  }
})

// Tipos para los matchers personalizados
declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toBeValidUUID(): T
      toBeValidEmail(): T
      toBePositiveNumber(): T
    }
  }
}
