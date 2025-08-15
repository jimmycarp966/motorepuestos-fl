import { useEffect, useState } from 'react'
import { useAppStore } from './store'
import { LoginForm } from './components/auth/LoginForm'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './components/dashboard/Dashboard'
import { EmpleadosTable } from './components/empleados/EmpleadosTable'
import { NotificationsContainer } from './components/ui/notifications'

function App() {
  const user = useAppStore((state) => state.auth.user)
  const loading = useAppStore((state) => state.auth.loading)
  const checkAuth = useAppStore((state) => state.checkAuth)
  const sidebarOpen = useAppStore((state) => state.ui.sidebarOpen)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  
  const [currentModule] = useState('dashboard')

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Simular navegación por módulos
  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <Dashboard />
      case 'empleados':
        return <EmpleadosTable />
      case 'productos':
        return <div className="p-6">Módulo de Productos - En desarrollo</div>
      case 'clientes':
        return <div className="p-6">Módulo de Clientes - En desarrollo</div>
      case 'ventas':
        return <div className="p-6">Módulo de Ventas - En desarrollo</div>
      case 'caja':
        return <div className="p-6">Módulo de Caja - En desarrollo</div>
      case 'reportes':
        return <div className="p-6">Módulo de Reportes - En desarrollo</div>
      default:
        return <Dashboard />
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            height: '48px',
            width: '48px',
            borderBottom: '2px solid #2563eb',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <NotificationsContainer />
      
      <div style={{ display: 'flex' }}>
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <main style={{
          flex: 1,
          marginLeft: sidebarOpen ? '256px' : '0',
          minHeight: '100vh',
          transition: 'margin-left 0.3s ease'
        }}>
          <div style={{ padding: '1.5rem' }}>
            {renderModule()}
          </div>
        </main>
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default App
