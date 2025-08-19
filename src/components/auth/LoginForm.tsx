import React, { useState } from 'react'
import { useAppStore } from '../../store'
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'


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
      background: 'linear-gradient(135deg, #000000 0%, #121212 50%, #1E1E1E 100%)',
      padding: '1rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#121212',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(41, 121, 255, 0.15)',
        padding: 'clamp(1.5rem, 4vw, 3rem)',
        width: '100%',
        maxWidth: 'min(450px, calc(100vw - 2rem))',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #2C2C2C'
      }}>
        {/* Decoración de fondo */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2979FF 0%, #7C4DFF 100%)',
          opacity: 0.2
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2979FF 0%, #7C4DFF 100%)',
          opacity: 0.2
        }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <img 
              src="/assets/sirius-logo.png" 
              alt="Sirius Logo" 
              style={{ 
                width: 'clamp(80px, 15vw, 120px)', 
                height: 'clamp(80px, 15vw, 120px)',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
              }} 
            />
          </div>
          
          <h1 style={{
            fontSize: 'clamp(1.5rem, 5vw, 2rem)',
            fontWeight: '700',
            color: '#FFFFFF',
            marginBottom: '0.5rem',
            textShadow: '0 0 20px rgba(41, 121, 255, 0.3)'
          }}>
            Motorepuestos F.L.
          </h1>
          
          <p style={{
            fontSize: 'clamp(0.875rem, 3vw, 1rem)',
            color: '#B0B0B0',
            margin: 0
          }}>
            Sistema de Gestión Inteligente
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Campo Email */}
          <div>
            <Label>
              <Mail className="inline w-4 h-4 mr-2" />
              Correo Electrónico
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              helperText="Ingresa tu correo registrado en el sistema"
            />
          </div>

          {/* Campo Password */}
          <div>
            <Label>
              <Lock className="inline w-4 h-4 mr-2" />
              Contraseña
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="pr-12"
                helperText="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-text-secondary hover:text-dark-text-primary transition-colors p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 border rounded-moto text-sm flex items-center gap-2" style={{
              backgroundColor: 'rgba(244, 51, 54, 0.1)',
              borderColor: '#F44336',
              color: '#F44336'
            }}>
              <span>⚠️</span>
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
              background: 'linear-gradient(135deg, #2979FF 0%, #7C4DFF 100%)',
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
              opacity: loading || isLoading ? 0.7 : 1,
              boxShadow: '0 0 20px rgba(41, 121, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!loading && !isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(41, 121, 255, 0.6)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !isLoading) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 0 20px rgba(41, 121, 255, 0.3)'
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
            backgroundColor: '#1E1E1E',
            borderRadius: '0.75rem',
            border: '1px solid #2C2C2C'
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: '#B0B0B0',
              margin: 0
            }}>
              💡 <strong style={{ color: '#FFFFFF' }}>Consejo:</strong> Usa tu correo electrónico y contraseña para acceder al sistema
            </p>
          </div>
        </form>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #2C2C2C'
        }}>
          <p style={{
            fontSize: '0.75rem',
            color: '#B0B0B0',
            margin: 0,
            opacity: 0.7
          }}>
            © 2024 Motorepuestos F.L. - Sistema de Gestión Inteligente - Todos los derechos reservados
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
