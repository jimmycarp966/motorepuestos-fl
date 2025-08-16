import { useEffect, useState } from 'react'
import { useAppStore } from './store/index.js'
import { LoginForm } from './components/auth/LoginForm'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './components/dashboard/Dashboard'
import { EmpleadosTable } from './components/empleados/EmpleadosTable'
import { ProductosTable } from './components/productos/ProductosTable'
import { ClientesTable } from './components/clientes/ClientesTable'
import { VentasTable } from './components/ventas/VentasTable'
import { CajaTable } from './components/caja/CajaTable'
import { ReportesTable } from './components/reportes/ReportesTable'
import { NotificationsContainer } from './components/ui/notifications'
import { ConnectionError } from './components/ui/ConnectionError'
import { DebugPanel } from './components/ui/DebugPanel'

function App() {
  console.log('🚀 App: Componente iniciando...')
  
  try {
    const user = useAppStore((state) => state.auth.user)
    const loading = useAppStore((state) => state.auth.loading)
    const checkAuth = useAppStore((state) => state.checkAuth)
    const sidebarOpen = useAppStore((state) => state.ui.sidebarOpen)
    const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
    const currentModule = useAppStore((state) => state.ui.currentModule)
    
    console.log('✅ App: Store accedido correctamente', { user, loading, currentModule })
    
    // Estado de debug y manejo de errores
    const [debugInfo, setDebugInfo] = useState({
      authChecked: false,
      authError: null as string | null,
      storeState: null as any,
      connectionError: null as string | null
    })
    
    // Acciones para cargar datos
    const fetchEmpleados = useAppStore((state) => state.fetchEmpleados)
    const fetchProductos = useAppStore((state) => state.fetchProductos)
    const fetchClientes = useAppStore((state) => state.fetchClientes)
    const fetchVentas = useAppStore((state) => state.fetchVentas)
    const fetchMovimientos = useAppStore((state) => state.fetchMovimientos)

    useEffect(() => {
      console.log('🔍 App: Iniciando verificación completa del sistema...')
      
      const performSystemCheck = async () => {
        try {
          console.log('🔍 App: Iniciando verificación de autenticación...')
          console.log('🔍 App: Estado inicial - loading:', loading, 'user:', user)
          
          await checkAuth()
          setDebugInfo(prev => ({ ...prev, authChecked: true }))
          console.log('✅ App: Verificación de autenticación completada')
          
        } catch (error) {
          console.error('❌ App: Error en verificación del sistema:', error)
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
          setDebugInfo(prev => ({ 
            ...prev, 
            authChecked: true, 
            authError: errorMessage,
            connectionError: errorMessage.includes('Missing Supabase') || errorMessage.includes('connection') ? errorMessage : null
          }))
        }
      }
      
      performSystemCheck()
    }, [checkAuth])

    // Log del estado actual
    useEffect(() => {
      setDebugInfo(prev => ({ ...prev, storeState: { loading, user } }))
    }, [loading, user])

    // Cargar datos según el módulo activo
    useEffect(() => {
      if (!user) return

      const loadModuleData = async () => {
        try {
          switch (currentModule) {
            case 'empleados':
              await fetchEmpleados()
              break
            case 'productos':
              await fetchProductos()
              break
            case 'clientes':
              await fetchClientes()
              break
            case 'ventas':
              await fetchVentas()
              break
            case 'caja':
              await fetchMovimientos()
              break
            case 'reportes':
              // Los reportes se calculan en tiempo real
              break
            default:
              // Dashboard carga todos los datos necesarios
              await Promise.all([
                fetchVentas(),
                fetchMovimientos(),
                fetchProductos()
              ])
          }
        } catch (error) {
          console.error('Error cargando datos del módulo:', error)
        }
      }

      loadModuleData()
    }, [currentModule, user, fetchEmpleados, fetchProductos, fetchClientes, fetchVentas, fetchMovimientos])

    // Renderizar módulo actual
    const renderModule = () => {
      switch (currentModule) {
        case 'dashboard':
          return <Dashboard />
        case 'empleados':
          return <EmpleadosTable />
        case 'productos':
          return <ProductosTable />
        case 'clientes':
          return <ClientesTable />
        case 'ventas':
          return <VentasTable />
        case 'caja':
          return <CajaTable />
        case 'reportes':
          return <ReportesTable />
        default:
          return <Dashboard />
      }
    }

    // Mostrar error de conexión si existe
    if (debugInfo.connectionError) {
      return <ConnectionError error={debugInfo.connectionError} />
    }

    // Mostrar pantalla de carga
    if (loading && !debugInfo.authChecked) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid rgba(255, 255, 255, 0.3)',
              borderTop: '4px solid #ffffff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
            <p style={{ marginTop: '1rem', color: '#ffffff' }}>Cargando aplicación...</p>
            {process.env.NODE_ENV === 'development' && (
              <div style={{ marginTop: '1rem', fontSize: '12px', opacity: 0.8 }}>
                <p>Debug: Auth checked: {debugInfo.authChecked ? '✅' : '⏳'}</p>
                {debugInfo.authError && <p>Error: {debugInfo.authError}</p>}
              </div>
            )}
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
            marginLeft: '256px',
            minHeight: '100vh'
          }}>
            <div style={{ padding: '1.5rem' }}>
              {renderModule()}
            </div>
          </main>
        </div>

        {/* Panel de Debug (solo en desarrollo) */}
        <DebugPanel />
        
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  } catch (error) {
    console.error('❌ App: Error crítico en el componente:', error)
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌ Error Crítico</h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            Ha ocurrido un error al cargar la aplicación.
          </p>
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginTop: '1rem',
            textAlign: 'left',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            <strong>Error:</strong> {error instanceof Error ? error.message : 'Error desconocido'}
            {error instanceof Error && error.stack && (
              <details style={{ marginTop: '0.5rem' }}>
                <summary>Stack trace</summary>
                <pre style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            🔄 Recargar Página
          </button>
        </div>
      </div>
    )
  }
}

export default App
