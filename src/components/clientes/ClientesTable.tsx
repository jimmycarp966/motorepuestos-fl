import React, { useState } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Plus, Edit, Trash2, User, Mail, Phone, MapPin, DollarSign, CreditCard } from 'lucide-react'
import { ClienteForm } from './ClienteForm'
import { PagarDeudaModal } from './PagarDeudaModal'

export const ClientesTable: React.FC = () => {
  const clientes = useAppStore((state) => state.clientes.clientes)
  const loading = useAppStore((state) => state.clientes.loading)
  const deleteCliente = useAppStore((state) => state.deleteCliente)
  const addNotification = useAppStore((state) => state.addNotification)
  const [showForm, setShowForm] = useState(false)
  const [editingCliente, setEditingCliente] = useState<any>(null)
  const [showPagarDeuda, setShowPagarDeuda] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<any>(null)

  const handleDelete = async (id: string) => {
    try {
      await deleteCliente(id)
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Cliente eliminado',
        message: 'El cliente se eliminó correctamente'
      })
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar el cliente'
      })
    }
  }

  const handleEdit = (cliente: any) => {
    setEditingCliente(cliente)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingCliente(null)
  }

  const handlePagarDeuda = (cliente: any) => {
    setSelectedCliente(cliente)
    setShowPagarDeuda(true)
  }

  const handlePagarDeudaClose = () => {
    setShowPagarDeuda(false)
    setSelectedCliente(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gestiona la base de datos de clientes</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: '600px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cuenta Corriente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                          <User className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {cliente.nombre}
                        </div>
                        <div className="text-xs text-gray-500 hidden sm:block">
                          ID: {cliente.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {cliente.email && (
                        <div className="flex items-center text-xs sm:text-sm text-gray-900">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{cliente.email}</span>
                        </div>
                      )}
                      {cliente.telefono && (
                        <div className="flex items-center text-xs sm:text-sm text-gray-900">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{cliente.telefono}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cliente.direccion ? (
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate max-w-xs">{cliente.direccion}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Sin dirección</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Saldo:</span>
                        <span className={`text-sm font-semibold ${
                          cliente.saldo_cuenta_corriente > 0 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          ${cliente.saldo_cuenta_corriente.toLocaleString()}
                        </span>
                      </div>
                      {cliente.limite_credito > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Límite:</span>
                          <span className="text-xs text-gray-600">
                            ${cliente.limite_credito.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {cliente.saldo_cuenta_corriente > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Disponible:</span>
                          <span className="text-xs text-gray-600">
                            ${(cliente.limite_credito - cliente.saldo_cuenta_corriente).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      cliente.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {cliente.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(cliente)}
                        className="!bg-blue-600 !hover:bg-blue-700 !text-white !border-0"
                        style={{ backgroundColor: '#2563eb', color: 'white', border: 'none' }}
                        title="Editar cliente"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {cliente.saldo_cuenta_corriente > 0 && (
                        <Button
                          size="sm"
                          onClick={() => handlePagarDeuda(cliente)}
                          className="!bg-green-600 !hover:bg-green-700 !text-white !border-0"
                          style={{ backgroundColor: '#059669', color: 'white', border: 'none' }}
                          title="Pagar deuda"
                        >
                          <DollarSign className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleDelete(cliente.id)}
                        className="!bg-red-600 !hover:bg-red-700 !text-white !border-0"
                        style={{ backgroundColor: '#dc2626', color: 'white', border: 'none' }}
                        title="Eliminar cliente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showForm && (
        <ClienteForm
          cliente={editingCliente}
          onClose={handleFormClose}
        />
      )}

      {showPagarDeuda && selectedCliente && (
        <PagarDeudaModal
          cliente={selectedCliente}
          onClose={handlePagarDeudaClose}
        />
      )}
    </div>
  )
}
