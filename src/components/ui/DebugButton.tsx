import React, { useState } from 'react'
import { useAppStore } from '../../store'
import { Bug, X, Copy, Download } from 'lucide-react'

export const DebugButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  
  // Selectores básicos del store
  const user = useAppStore((state) => state.auth.user)
  const currentModule = useAppStore((state) => state.ui.currentModule)
  const authLoading = useAppStore((state) => state.auth.loading)
  const authError = useAppStore((state) => state.auth.error)

  const handleDebugClick = () => {
    console.log('🐛 Debug button clicked!')
    console.log('Current user:', user)
    console.log('Current module:', currentModule)
    console.log('Auth loading:', authLoading)
    console.log('Auth error:', authError)
    
    setIsOpen(true)
  }

  const copyToClipboard = () => {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      user,
      currentModule,
      authLoading,
      authError,
      systemInfo: {
        userAgent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        url: window.location.href
      }
    }
    
    const debugText = JSON.stringify(debugInfo, null, 2)
    navigator.clipboard.writeText(debugText)
    alert('Debug info copied to clipboard!')
  }

  const downloadDebugInfo = () => {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      user,
      currentModule,
      authLoading,
      authError,
      systemInfo: {
        userAgent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        url: window.location.href
      }
    }
    
    const debugText = JSON.stringify(debugInfo, null, 2)
    const blob = new Blob([debugText], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Solo mostrar en desarrollo
  if (import.meta.env.PROD) return null

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={handleDebugClick}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}
        title="Debug Info"
      >
        🐛
      </button>

      {/* Modal de debug */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                🐛 Debug Information
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={copyToClipboard}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Copy
                </button>
                <button
                  onClick={downloadDebugInfo}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Download
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Contenido */}
                         <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
               <div style={{ marginBottom: '16px' }}>
                 <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                   👤 User Info
                 </h3>
                 <pre style={{
                   background: '#1e293b',
                   color: '#e2e8f0',
                   padding: '12px',
                   borderRadius: '6px',
                   overflow: 'auto',
                   fontSize: '12px',
                   margin: 0,
                   border: '1px solid #334155'
                 }}>
                   {JSON.stringify(user, null, 2)}
                 </pre>
               </div>

               <div style={{ marginBottom: '16px' }}>
                 <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                   🏪 Store State
                 </h3>
                 <pre style={{
                   background: '#1e293b',
                   color: '#e2e8f0',
                   padding: '12px',
                   borderRadius: '6px',
                   overflow: 'auto',
                   fontSize: '12px',
                   margin: 0,
                   border: '1px solid #334155'
                 }}>
                   {JSON.stringify({
                     currentModule,
                     authLoading,
                     authError
                   }, null, 2)}
                 </pre>
               </div>

               <div style={{ marginBottom: '16px' }}>
                 <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                   💻 System Info
                 </h3>
                 <pre style={{
                   background: '#1e293b',
                   color: '#e2e8f0',
                   padding: '12px',
                   borderRadius: '6px',
                   overflow: 'auto',
                   fontSize: '12px',
                   margin: 0,
                   border: '1px solid #334155'
                 }}>
                   {JSON.stringify({
                     userAgent: navigator.userAgent,
                     viewport: { width: window.innerWidth, height: window.innerHeight },
                     url: window.location.href,
                     timestamp: new Date().toISOString()
                   }, null, 2)}
                 </pre>
               </div>
             </div>
          </div>
        </div>
      )}
    </>
  )
}
