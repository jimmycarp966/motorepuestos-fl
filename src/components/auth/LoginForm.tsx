import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginForm: React.FC = () => {
  const login = useAppStore((state) => state.login)
  const authLoading = useAppStore((state) => state.auth.loading)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    console.log('🔐 LoginForm: Intentando autenticación...', { email: data.email })
    try {
      console.log('🔑 LoginForm: Iniciando sesión...')
      await login(data.email, data.password)
      console.log('🔑 LoginForm: Login exitoso')
    } catch (error: any) {
      console.error('❌ LoginForm: Error en autenticación:', error)
      console.error('❌ LoginForm: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      // Error ya manejado en el store
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.1)'
      }}></div>
      
      <div style={{
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          paddingBottom: '2rem'
        }}>
          <div style={{
            margin: '0 auto',
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
          }}>
            <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            Motorepuestos F.L.
          </h1>
          
          <p style={{
            color: '#6b7280',
            marginTop: '0.5rem',
            fontSize: '1rem'
          }}>
            Inicia sesión para acceder al sistema
          </p>
        </div>
        
        <div style={{
          padding: '0 2rem 2rem 2rem'
        }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="tu@email.com"
                style={{
                  height: '48px',
                  padding: '0 1rem',
                  fontSize: '1rem',
                  border: errors.email ? '2px solid #ef4444' : '2px solid #d1d5db',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = errors.email ? '#ef4444' : '#667eea';
                  e.target.style.boxShadow = errors.email ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.email ? '#ef4444' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.email && (
                <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center' }}>
                  <svg style={{ width: '16px', height: '16px', marginRight: '0.25rem' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Contraseña</label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                style={{
                  height: '48px',
                  padding: '0 1rem',
                  fontSize: '1rem',
                  border: errors.password ? '2px solid #ef4444' : '2px solid #d1d5db',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = errors.password ? '#ef4444' : '#667eea';
                  e.target.style.boxShadow = errors.password ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.password ? '#ef4444' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.password && (
                <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center' }}>
                  <svg style={{ width: '16px', height: '16px', marginRight: '0.25rem' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={authLoading}
              style={{
                width: '100%',
                height: '48px',
                fontSize: '1rem',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: authLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.2s',
                opacity: authLoading ? 0.7 : 1,
                transform: 'translateY(0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!authLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!authLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
                }
              }}
            >
              {authLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ 
                    animation: 'spin 1s linear infinite',
                    marginRight: '0.75rem',
                    width: '20px',
                    height: '20px',
                    color: 'white'
                  }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            {/* Debug info - Solo en desarrollo */}
            {import.meta.env.DEV && (
              <div style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                marginTop: '1rem',
                fontSize: '0.75rem',
                color: '#0c4a6e'
              }}>
                <p><strong>Debug Info:</strong></p>
                <p>Loading: {authLoading ? 'Sí' : 'No'}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={async () => {
                      console.log('🔍 Probando conexión a Supabase...')
                      try {
                        const { supabase } = await import('../../lib/supabase')
                        const { data, error } = await supabase.auth.getSession()
                        console.log('🔍 Sesión actual:', data.session)
                        console.log('🔍 Error:', error)
                      } catch (err) {
                        console.error('❌ Error probando conexión:', err)
                      }
                    }}
                    style={{
                      backgroundColor: '#0ea5e9',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    🔍 Probar Conexión
                  </button>
                  <button
                    onClick={async () => {
                      console.log('🧪 Probando login con credenciales de desarrollo...')
                      try {
                        await login('admin@test.com', '123456')
                      } catch (error) {
                        console.error('❌ Error en login de prueba:', error)
                      }
                    }}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    🧪 Login Test
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
