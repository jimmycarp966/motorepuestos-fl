import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../store'
import type { AuthenticatedUser } from '../../store'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Edit, Trash2, Plus, Search } from 'lucide-react'
import { canManageModule } from '../../store/slices/empleadosSlice'
import { EmpleadoForm } from './EmpleadoForm'

export const EmpleadosTable: React.FC = () => {
  const empleados = useAppStore((state) => state.empleados.empleados)
  const loading = useAppStore((state) => state.empleados.loading)
  const fetchEmpleados = useAppStore((state) => state.fetchEmpleados)
  const deleteEmpleado = useAppStore((state) => state.deleteEmpleado)
  const user = useAppStore((state) => state.auth.user)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingEmpleado, setEditingEmpleado] = useState<AuthenticatedUser | null>(null)

  useEffect(() => {
    // Solo cargar empleados si no están ya cargados
    if (empleados.length === 0 && !loading) {
      fetchEmpleados()
    }
  }, [fetchEmpleados, empleados.length, loading])

  const canManage = Boolean(user && canManageModule(user.rol, 'empleados'))

  const filteredEmpleados = empleados.filter(empleado =>
    empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.rol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (empleado: AuthenticatedUser) => {
    setEditingEmpleado(empleado)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      await deleteEmpleado(id)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingEmpleado(null)
  }

  const getRolBadgeColor = (rol: string) => {
    switch (rol) {
      case 'Administrador': return 'bg-danger-500/20 text-danger-500 border border-danger-500/30'
      case 'Cajero': return 'bg-primary-500/20 text-primary-500 border border-primary-500/30'
      case 'Vendedor': return 'bg-success-500/20 text-success-500 border border-success-500/30'
      case 'Gerente': return 'bg-secondary-500/20 text-secondary-500 border border-secondary-500/30'
      case 'Técnico': return 'bg-warning-500/20 text-warning-500 border border-warning-500/30'
      case 'Almacén': return 'bg-warning-500/20 text-warning-500 border border-warning-500/30'
      default: return 'bg-dark-bg-tertiary text-dark-text-secondary border border-dark-border'
    }
  }

  const formatSalario = (salario: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(salario)
  }

  const getModulosText = (permisos: string[]) => {
    if (!permisos || permisos.length === 0) return 'Sin permisos'
    
    // Si tiene todos los módulos disponibles (7 módulos), mostrar "Todos los módulos"
    const todosLosModulos = ['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'calendario']
    const tieneTodosLosModulos = todosLosModulos.every(modulo => permisos.includes(modulo))
    
    if (tieneTodosLosModulos) {
      return 'Todos los módulos'
    }
    
    // Para otros casos, mostrar todos los permisos si son pocos, o truncar si son muchos
    if (permisos.length <= 4) return permisos.join(', ')
    return `${permisos.slice(0, 3).join(', ')} +${permisos.length - 3} más`
  }

  if (showForm) {
    return (
      <EmpleadoForm 
        empleado={editingEmpleado} 
        onClose={handleFormClose} 
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark-text-primary">Empleados</h1>
          <p className="text-dark-text-secondary">Gestiona el personal de la empresa</p>
        </div>
        <div className="flex space-x-2">
          {canManage && (
            <Button 
              onClick={() => setShowForm(true)}
              variant="default"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Empleado
            </Button>
          )}
        </div>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500 w-4 h-4" />
            <Input
              placeholder="Buscar empleados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-dark-text-secondary">Cargando empleados...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left p-2 text-dark-text-primary font-semibold">Nombre</th>
                  <th className="text-left p-2 text-dark-text-primary font-semibold">Email</th>
                  <th className="text-left p-2 text-dark-text-primary font-semibold">Rol</th>
                  <th className="text-left p-2 text-dark-text-primary font-semibold">Salario</th>
                  <th className="text-left p-2 text-dark-text-primary font-semibold">Permisos</th>
                  <th className="text-left p-2 text-dark-text-primary font-semibold">Estado</th>
                  {canManage && <th className="text-left p-2 text-dark-text-primary font-semibold">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filteredEmpleados.map((empleado) => (
                  <tr key={empleado.id} className="border-b border-dark-border hover:bg-dark-bg-tertiary transition-colors">
                    <td className="p-2 font-medium text-dark-text-primary">{empleado.nombre}</td>
                    <td className="p-2 text-dark-text-secondary">{empleado.email}</td>
                                         <td className="p-2">
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRolBadgeColor(empleado.rol)}`}>
                         {empleado.rol}
                       </span>
                     </td>
                     <td className="p-2">
                       <span className="font-mono text-sm text-dark-text-primary">
                         {formatSalario((empleado as any).salario || 0)}
                       </span>
                     </td>
                    <td className="p-2">
                      <span className="text-xs text-dark-text-secondary bg-dark-bg-tertiary px-2 py-1 rounded font-medium border border-dark-border">
                        {getModulosText((empleado as any).permisos_modulos || [])}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        empleado.activo 
                          ? 'bg-success-500/20 text-success-500 border border-success-500/30' 
                          : 'bg-danger-500/20 text-danger-500 border border-danger-500/30'
                      }`}>
                        {empleado.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {canManage && (
                      <td className="p-2">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(empleado)}
                            variant="outline"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDelete(empleado.id)}
                            disabled={empleado.id === user?.id}
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEmpleados.length === 0 && (
              <div className="text-center py-8 text-dark-text-secondary">
                No se encontraron empleados
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  )
}
