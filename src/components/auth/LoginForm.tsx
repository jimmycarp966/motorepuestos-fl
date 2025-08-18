import React, { useState } from 'react'
import { useAppStore } from '../../store'
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react'


export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Registrar componente para debug

  
  const login = useAppStore((state) => state.login)
  const loading = useAppStore((state) => state.auth.loading)
  const error = useAppStore((state) => state.auth.error)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await login(email, password)
    } catch (error) {
      // Error en login
    } finally {
      setIsLoading(false)
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
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '3rem',
        width: '100%',
        maxWidth: '450px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decoración de fondo */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          opacity: 0.1
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          opacity: 0.1
        }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            border: '3px solid #667eea'
          }}>
            <img 
              src="/assets/sirius-logo.png" 
              alt="Sirius Logo" 
              style={{ 
                width: '80px', 
                height: '80px',
                objectFit: 'contain'
              }} 
            />
          </div>
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>
            Sirius
          </h1>
          
          <p style={{
            fontSize: '1rem',
            color: '#64748b',
            margin: 0
          }}>
            Sistema de Gestión Inteligente
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Campo Email */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Correo Electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }}>
                <Mail size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 3rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea'
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Campo Password */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }}>
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 3rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea'
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              color: '#dc2626',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          {/* Botón de Login */}
          <button
            type="submit"
            disabled={loading || isLoading}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading || isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: loading || isLoading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading && !isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !isLoading) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          >
            {loading || isLoading ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          {/* Información adicional */}
          <div style={{
            textAlign: 'center',
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0'
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: '#64748b',
              margin: 0
            }}>
              💡 <strong>Consejo:</strong> Usa tu correo electrónico y contraseña para acceder al sistema
            </p>
          </div>
        </form>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: '0.75rem',
            color: '#9ca3af',
            margin: 0
          }}>
            © 2024 Sirius - Sistema de Gestión Inteligente - Todos los derechos reservados
          </p>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}
