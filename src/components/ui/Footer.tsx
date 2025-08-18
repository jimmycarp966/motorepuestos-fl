import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer style={{
      backgroundColor: '#ffffff',
      color: '#374151',
      padding: '1rem 2rem',
      borderTop: '1px solid #e5e7eb',
      marginTop: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.875rem',
      boxShadow: '0 -1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Logo SISTEMAS */}
        <img 
          src="/logo-sistemas.png" 
          alt="Sistemas Logo" 
          style={{ 
            width: '40px', 
            height: '40px',
            objectFit: 'contain'
          }} 
        />
        <span style={{
          fontSize: '16px',
          fontWeight: '500',
          color: '#64748b',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          Desarrollado por Sistemas
        </span>
      </div>
    </footer>
  )
}
