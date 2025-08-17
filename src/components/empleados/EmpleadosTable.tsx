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
    fetchEmpleados()
  }, [fetchEmpleados])

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
      case 'Administrador': return 'bg-red-100 text-red-800'
      case 'Cajero': return 'bg-blue-100 text-blue-800'
      case 'Vendedor': return 'bg-green-100 text-green-800'
      case 'Gerente': return 'bg-purple-100 text-purple-800'
      case 'Técnico': return 'bg-orange-100 text-orange-800'
      case 'Almacén': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestión de Empleados</CardTitle>
          <div className="flex space-x-2">
            {canManage && (
              <Button 
                onClick={() => setShowForm(true)}
                className="!bg-green-600 !hover:bg-green-700 !text-white !border-0"
                style={{ backgroundColor: '#059669', color: 'white', border: 'none' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Empleado
              </Button>
            )}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
          <div className="text-center py-8">Cargando empleados...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-gray-900 font-semibold">Nombre</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Email</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Rol</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Salario</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Permisos</th>
                  <th className="text-left p-2 text-gray-900 font-semibold">Estado</th>
                  {canManage && <th className="text-left p-2 text-gray-900 font-semibold">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filteredEmpleados.map((empleado) => (
                  <tr key={empleado.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium text-gray-900">{empleado.nombre}</td>
                    <td className="p-2 text-gray-600">{empleado.email}</td>
                                         <td className="p-2">
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRolBadgeColor(empleado.rol)}`}>
                         {empleado.rol}
                       </span>
                     </td>
                     <td className="p-2">
                       <span className="font-mono text-sm text-gray-900">
                         {formatSalario((empleado as any).salario || 0)}
                       </span>
                     </td>
                    <td className="p-2">
                      <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded font-medium">
                        {getModulosText((empleado as any).permisos_modulos || [])}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        empleado.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
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
                            className="!bg-blue-600 !hover:bg-blue-700 !text-white !border-0"
                            style={{ backgroundColor: '#2563eb', color: 'white', border: 'none' }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDelete(empleado.id)}
                            disabled={empleado.id === user?.id}
                            className="!bg-red-600 !hover:bg-red-700 !text-white !border-0 disabled:opacity-50"
                            style={{ backgroundColor: '#dc2626', color: 'white', border: 'none' }}
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
              <div className="text-center py-8 text-gray-500">
                No se encontraron empleados
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
