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
