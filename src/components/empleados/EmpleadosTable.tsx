import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../store'
import type { AuthenticatedUser } from '../../store'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Edit, Trash2, Plus, Search, Eye, EyeOff } from 'lucide-react'
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
  const [showSalarios, setShowSalarios] = useState(false)

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
    if (permisos.length <= 2) return permisos.join(', ')
    return `${permisos.slice(0, 2).join(', ')} +${permisos.length - 2} más`
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
            <Button
              variant="outline"
              onClick={() => setShowSalarios(!showSalarios)}
              className="flex items-center space-x-2"
            >
              {showSalarios ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showSalarios ? 'Ocultar' : 'Mostrar'} Salarios</span>
            </Button>
            {canManage && (
              <Button onClick={() => setShowForm(true)}>
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
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Rol</th>
                  {showSalarios && <th className="text-left p-2">Salario</th>}
                  <th className="text-left p-2">Permisos</th>
                  <th className="text-left p-2">Estado</th>
                  {canManage && <th className="text-left p-2">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filteredEmpleados.map((empleado) => (
                  <tr key={empleado.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{empleado.nombre}</td>
                    <td className="p-2 text-gray-600">{empleado.email}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRolBadgeColor(empleado.rol)}`}>
                        {empleado.rol}
                      </span>
                    </td>
                    {showSalarios && (
                      <td className="p-2">
                        <span className="font-mono text-sm">
                          {formatSalario((empleado as any).salario || 0)}
                        </span>
                      </td>
                    )}
                    <td className="p-2">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
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
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(empleado)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(empleado.id)}
                            disabled={empleado.id === user?.id}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50"
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
