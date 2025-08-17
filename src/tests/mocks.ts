// ================================================
// MOCKS PARA TESTING
// ================================================

import { vi } from 'vitest'

// Mock para AuditLogger
export const mockAuditLogger = {
  logAction: vi.fn(),
  logSuccess: vi.fn(),
  logError: vi.fn(),
  newSession: vi.fn(),
  getSessionStats: vi.fn(() => ({ actions: 0, errors: 0 }))
}

// Mock para BusinessRules
export const mockBusinessRules = {
  validateVenta: vi.fn(),
  validateProducto: vi.fn(),
  validateCliente: vi.fn(),
  validateEmpleado: vi.fn()
}

// Mock para Supabase
export const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  })),
  auth: {
    getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null }))
  },
  rpc: vi.fn(() => Promise.resolve({ data: null, error: null }))
}

// Configurar mocks globales
vi.mock('../lib/auditLogger', () => ({
  AuditLogger: mockAuditLogger,
  createBusinessError: vi.fn(),
  ERROR_CODES: {}
}))

vi.mock('../lib/businessRules', () => ({
  BusinessRules: mockBusinessRules
}))

vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase,
  supabaseAdmin: mockSupabase
}))
