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
      justifyContent: 'center',
      fontSize: '0.875rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <img 
          src="/LOGO SISTEMAS.png" 
          alt="Sirius" 
          style={{ 
            height: '40px', 
            width: 'auto',
            objectFit: 'contain'
          }} 
        />
      </div>
    </footer>
  )
}
