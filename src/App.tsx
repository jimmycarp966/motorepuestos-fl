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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationsContainer />
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <main className="flex-1 md:ml-64 min-h-screen">
          <div className="p-6">
            {renderModule()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
