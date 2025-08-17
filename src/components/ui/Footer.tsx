import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer style={{
      backgroundColor: '#1e293b',
      color: '#94a3b8',
      padding: '1rem 2rem',
      borderTop: '1px solid #334155',
      marginTop: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '0.875rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <img 
          src="/logo-sistemas.png" 
          alt="Sirius" 
          style={{ 
            height: '28px', 
            width: 'auto',
            filter: 'brightness(0) invert(1)',
            objectFit: 'contain'
          }} 
        />
        <span style={{ fontWeight: '600', color: '#e2e8f0', fontSize: '1rem' }}>
          Sirius
        </span>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <span>© 2024 Motorepuestos F.L. - Todos los derechos reservados</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>Desarrollado por</span>
        <span style={{ fontWeight: '600', color: '#e2e8f0', fontSize: '1rem' }}>
          Sirius
        </span>
      </div>
    </footer>
  )
}
