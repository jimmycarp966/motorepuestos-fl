import React from 'react'

export const TestComponent: React.FC = () => {
  return (
    <div style={{
      padding: '2rem',
      backgroundColor: '#f0f0f0',
      border: '2px solid #333',
      borderRadius: '8px',
      margin: '1rem'
    }}>
      <h1 style={{ color: '#333', fontSize: '24px', marginBottom: '1rem' }}>
        Componente de Prueba
      </h1>
      <p style={{ color: '#666', fontSize: '16px' }}>
        Si puedes ver este componente, el renderizado está funcionando correctamente.
      </p>
      <div style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        marginTop: '1rem',
        display: 'inline-block'
      }}>
        Botón de Prueba
      </div>
    </div>
  )
}
