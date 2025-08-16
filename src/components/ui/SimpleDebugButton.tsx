import React, { useState, useEffect } from 'react'
import { Bug, X, AlertTriangle, Info, RefreshCw } from 'lucide-react'
import { useAppStore } from '../../store'
import { testStore } from '../../utils/testStore'
import { debugSlices } from '../../utils/debugSlices'
import { verifySyncStatus, forceSyncAll } from '../../utils/syncVerification'

interface DebugError {
  id: string
  type: 'error' | 'warning' | 'info'
  message: string
  timestamp: Date
  component?: string
  stack?: string
}

export const SimpleDebugButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [errors, setErrors] = useState<DebugError[]>([])
  const [authState, setAuthState] = useState<any>(null)
  
  // Obtener estado de autenticación
  const auth = useAppStore((state) => state.auth)
  const login = useAppStore((state) => state.login)
  const checkAuth = useAppStore((state) => state.checkAuth)
  const addNotification = useAppStore((state) => state.addNotification)

  // Capturar errores globales
  useEffect(() => {
    const originalError = console.error
    const originalWarn = console.warn
    const originalLog = console.log

    console.error = (...args) => {
      const errorInfo: DebugError = {
        id: Date.now().toString(),
        type: 'error',
        message: args.join(' '),
        timestamp: new Date(),
        stack: new Error().stack
      }
      
      setErrors(prev => [...prev, errorInfo])
      originalError.apply(console, args)
    }

    console.warn = (...args) => {
      const warningInfo: DebugError = {
        id: Date.now().toString(),
        type: 'warning',
        message: args.join(' '),
        timestamp: new Date()
      }
      
      setErrors(prev => [...prev, warningInfo])
      originalWarn.apply(console, args)
    }

    console.log = (...args) => {
      // Solo capturar logs importantes
      const message = args.join(' ')
      if (message.includes('login') || message.includes('auth') || message.includes('error')) {
        const logInfo: DebugError = {
          id: Date.now().toString(),
          type: 'info',
          message: message,
          timestamp: new Date()
        }
        setErrors(prev => [...prev, logInfo])
      }
      originalLog.apply(console, args)
    }

    return () => {
      console.error = originalError
      console.warn = originalWarn
      console.log = originalLog
    }
  }, [])

  // Actualizar estado de auth
  useEffect(() => {
    setAuthState({
      user: auth.user,
      loading: auth.loading,
      isAuthenticated: !!auth.user
    })
  }, [auth])

  // Función para probar login
  const testLogin = async () => {
    try {
      console.log('🔍 Debug: Probando login con credenciales de prueba...')
      await login('test@example.com', 'password123')
    } catch (error) {
      console.error('🔍 Debug: Error en login de prueba:', error)
    }
  }

  // Función para probar el store
  const testStoreFunctions = () => {
    console.log('🔍 Debug: Probando funciones del store...')
    testStore()
  }

  // Función para probar los slices
  const testSlices = () => {
    console.log('🔍 Debug: Probando slices individuales...')
    debugSlices()
  }

  // Función para verificar sincronización
  const checkSyncStatus = async () => {
    console.log('🔄 Debug: Verificando sincronización...')
    const status = await verifySyncStatus()
    console.log('📊 Estado de sincronización:', status)
    
    // Mostrar resumen en notificación
    const syncedCount = Object.values(status).filter(s => s.synced).length
    const totalCount = Object.keys(status).length
    
    addNotification({
      id: Date.now().toString(),
      type: syncedCount === totalCount ? 'success' : 'warning',
      title: 'Estado de Sincronización',
      message: `${syncedCount}/${totalCount} módulos sincronizados correctamente`
    })
  }

  // Función para forzar sincronización
  const forceSync = async () => {
    console.log('🔄 Debug: Forzando sincronización completa...')
    await forceSyncAll()
  }

  // Función para limpiar errores
  const clearErrors = () => {
    setErrors([])
  }

  return (
    <>
      {/* Botón flotante siempre visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: errors.length > 0 ? '#ef4444' : '#3b82f6',
          color: 'white',
          padding: '12px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
        title={`DEBUG - ${errors.length} errores capturados`}
      >
        🐛
        {errors.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {errors.length}
          </span>
        )}
      </button>

      {/* Panel de debug mejorado */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '400px',
            height: '600px',
            backgroundColor: 'white',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            zIndex: 10000,
            padding: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '16px',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '8px'
          }}>
            <h3 style={{ margin: 0, color: '#3b82f6', fontWeight: 'bold' }}>
              🐛 DEBUG ACTIVO ({errors.length} eventos)
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              ✕
            </button>
          </div>
          
          {/* Controles */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={testLogin}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🔑 Probar Login
            </button>
            <button
              onClick={testStore}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🔍 Test Store
            </button>
            <button
              onClick={testSlices}
              style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🔧 Test Slices
            </button>
            <button
              onClick={checkSyncStatus}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🔄 Verificar Sync
            </button>
            <button
              onClick={forceSync}
              style={{
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ⚡ Forzar Sync
            </button>
            <button
              onClick={clearErrors}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🗑️ Limpiar
            </button>
          </div>

          {/* Estado de Auth */}
          <div style={{ 
            backgroundColor: '#f3f4f6', 
            padding: '12px', 
            borderRadius: '4px', 
            marginBottom: '16px',
            fontSize: '12px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>🔐 Estado de Autenticación:</h4>
            <div style={{ lineHeight: '1.4' }}>
              <p><strong>Usuario:</strong> {authState?.user ? '✅ Conectado' : '❌ No conectado'}</p>
              <p><strong>Loading:</strong> {authState?.loading ? '⏳ Cargando' : '✅ Listo'}</p>
              <p><strong>Error:</strong> ✅ Sin errores</p>
              <p><strong>MODE:</strong> {import.meta.env.MODE}</p>
            </div>
          </div>

          {/* Lista de errores */}
          <div style={{ 
            flex: 1, 
            overflow: 'auto', 
            border: '1px solid #e5e7eb', 
            borderRadius: '4px',
            padding: '8px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px' }}>
              📋 Eventos Capturados:
            </h4>
            {errors.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center' }}>
                No hay eventos capturados aún. Intenta hacer login para ver errores.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {errors.slice(-10).reverse().map((error, index) => (
                  <div
                    key={`${error.id}-${index}`}
                    style={{
                      padding: '8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: error.type === 'error' ? '#fef2f2' : 
                                     error.type === 'warning' ? '#fffbeb' : '#f0f9ff'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      marginBottom: '4px' 
                    }}>
                      {error.type === 'error' ? '❌' : error.type === 'warning' ? '⚠️' : 'ℹ️'}
                      <span style={{ 
                        fontWeight: 'bold',
                        color: error.type === 'error' ? '#dc2626' : 
                               error.type === 'warning' ? '#d97706' : '#2563eb'
                      }}>
                        {error.type.toUpperCase()}
                      </span>
                      <span style={{ color: '#6b7280', fontSize: '10px' }}>
                        {error.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ 
                      color: '#374151', 
                      wordBreak: 'break-word',
                      lineHeight: '1.3'
                    }}>
                      {error.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
