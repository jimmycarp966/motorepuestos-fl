import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer style={{
      backgroundColor: '#121212',
      color: '#B0B0B0',
      padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem)',
      borderTop: '1px solid #2C2C2C',
      marginTop: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
      boxShadow: '0 -1px 3px 0 rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 'clamp(0.5rem, 2vw, 1rem)',
        flexWrap: 'wrap',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        {/* Logo Motorepuestos */}
        <img 
          src="/assets/sirius-logo.png" 
          alt="Motorepuestos Logo" 
          style={{ 
            width: 'clamp(32px, 6vw, 48px)', 
            height: 'clamp(32px, 6vw, 48px)',
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 4px rgba(41, 121, 255, 0.3))',
            flexShrink: 0
          }} 
        />
        <span style={{
          fontSize: 'clamp(12px, 3vw, 16px)',
          fontWeight: '500',
          color: '#B0B0B0',
          fontFamily: 'Inter, system-ui, sans-serif',
          lineHeight: '1.4'
        }}>
          Motorepuestos F.L. - Sistema de Gestión Inteligente - Todos los derechos reservados
        </span>
      </div>
    </footer>
  )
}
