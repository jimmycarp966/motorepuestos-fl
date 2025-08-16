import React from 'react'

interface ConnectionErrorProps {
  error?: string
  onRetry?: () => void
}

export const ConnectionError: React.FC<ConnectionErrorProps> = ({ 
  error = 'Error de conexión con la base de datos', 
  onRetry 
}) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      color: 'white',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ 
        textAlign: 'center', 
        maxWidth: '500px',
        padding: '2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '1rem'
        }}>
          🔌
        </div>
        
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#ffffff'
        }}>
          Error de Conexión
        </h1>
        
        <p style={{
          fontSize: '1rem',
          marginBottom: '2rem',
          opacity: 0.9,
          lineHeight: '1.6'
        }}>
          {error}
        </p>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              🔄 Reintentar
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              color: 'white',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            🔄 Recargar página
          </button>
        </div>
        
        {import.meta.env.MODE === 'development' && (
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            fontSize: '0.875rem',
            opacity: 0.8
          }}>
            <p><strong>Debug Info:</strong></p>
            <p>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅' : '❌'}</p>
            <p>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅' : '❌'}</p>
            <p>MODE: {import.meta.env.MODE}</p>
          </div>
        )}
      </div>
    </div>
  )
}
