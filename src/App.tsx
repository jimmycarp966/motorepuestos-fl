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
import { performSimpleHealthCheck } from './utils/simpleHealthCheck'

function App() {
  const user = useAppStore((state) => state.auth.user)
  const loading = useAppStore((state) => state.auth.loading)
  const checkAuth = useAppStore((state) => state.checkAuth)
  const sidebarOpen = useAppStore((state) => state.ui.sidebarOpen)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const currentModule = useAppStore((state) => state.ui.currentModule)
  
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
        // Realizar health check simplificado
        const healthResult = await performSimpleHealthCheck()
        console.log('🏥 App: Resultado del health check simplificado:', healthResult)
        
        if (!healthResult.canContinue) {
          setDebugInfo(prev => ({ 
            ...prev, 
            authChecked: true, 
            connectionError: healthResult.issues.join('; ') || 'Error en verificación del sistema'
          }))
          return
        }
        
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
    console.log('🔄 App: Estado actualizado - loading:', loading, 'user:', user)
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

  // Renderizar módulo correspondiente
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

  // Debug: Mostrar información de estado
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 App: Renderizando con estado:', { loading, user, debugInfo })
  }

  // Mostrar error de conexión si existe
  if (debugInfo.connectionError) {
    return (
      <ConnectionError 
        error={debugInfo.connectionError}
        onRetry={() => {
          setDebugInfo(prev => ({ ...prev, connectionError: null, authError: null }))
          initAuth()
        }}
      />
    )
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            height: '48px',
            width: '48px',
            borderBottom: '2px solid #ffffff',
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
