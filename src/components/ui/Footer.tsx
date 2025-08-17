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
        {/* Logo Sirius creado con CSS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          backgroundColor: '#3b82f6',
          borderRadius: '8px',
          position: 'relative',
          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
        }}>
          <span style={{
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif'
          }}>
            S
          </span>
        </div>
        <span style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937',
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '0.5px'
        }}>
          Sirius
        </span>
      </div>
    </footer>
  )
}
