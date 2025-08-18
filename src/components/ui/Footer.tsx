import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer style={{
      backgroundColor: '#ffffff',
      color: '#374151',
      padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem)',
      borderTop: '1px solid #e5e7eb',
      marginTop: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
      boxShadow: '0 -1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 'clamp(0.5rem, 2vw, 1rem)',
        flexWrap: 'wrap',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        {/* Logo Sirius */}
        <img 
          src="/assets/sirius-logo.png" 
          alt="Sirius Logo" 
          style={{ 
            width: 'clamp(32px, 6vw, 48px)', 
            height: 'clamp(32px, 6vw, 48px)',
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
            flexShrink: 0
          }} 
        />
        <span style={{
          fontSize: 'clamp(12px, 3vw, 16px)',
          fontWeight: '500',
          color: '#64748b',
          fontFamily: 'Inter, system-ui, sans-serif',
          lineHeight: '1.4'
        }}>
          Sirius - Sistema de Gestión Inteligente - Todos los derechos reservados
        </span>
      </div>
    </footer>
  )
}
