import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { X, Plus, Calendar, Clock, User, Edit, Trash2 } from 'lucide-react'
import { EventoCalendario, CreateEventoData } from '../../store'

interface EventoFormProps {
  evento?: EventoCalendario
  onClose: () => void
}

const EventoForm: React.FC<EventoFormProps> = ({ evento, onClose }) => {
  const createEvento = useAppStore((state) => state.createEvento)
  const updateEvento = useAppStore((state) => state.updateEvento)
  const addNotification = useAppStore((state) => state.addNotification)
  
  const [formData, setFormData] = useState<CreateEventoData>({
    titulo: evento?.titulo || '',
    descripcion: evento?.descripcion || '',
    fecha_inicio: evento?.fecha_inicio ? evento.fecha_inicio.slice(0, 16) : '',
    fecha_fin: evento?.fecha_fin ? evento.fecha_fin.slice(0, 16) : '',
    tipo: evento?.tipo || 'otro'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (evento) {
        await updateEvento(evento.id, formData)
      } else {
        await createEvento(formData)
      }
      onClose()
    } catch (error) {
      console.error('Error al guardar evento:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">
                {evento ? '✏️ Editar Evento' : '📅 Nuevo Evento'}
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                {evento ? 'Modifica los datos del evento' : 'Agrega un nuevo evento al calendario'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido del formulario */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Título */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                📝 Título del Evento *
              </label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej: Reunión con proveedor"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-gray-300"
                required
              />
            </div>

            {/* Campo Descripción */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                📄 Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe el evento..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-gray-300 resize-none"
                rows={3}
              />
            </div>

            {/* Campo Tipo */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                🏷️ Tipo de Evento *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-gray-300 transition-all duration-200"
                required
              >
                <option value="venta">🛒 Venta</option>
                <option value="compra">📦 Compra</option>
                <option value="mantenimiento">🔧 Mantenimiento</option>
                <option value="reunion">🤝 Reunión</option>
                <option value="otro">📋 Otro</option>
              </select>
            </div>

            {/* Campos Fecha y Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  🕐 Fecha y Hora de Inicio *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-gray-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  🕐 Fecha y Hora de Fin *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-gray-300"
                  required
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 py-3 px-6 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
              >
                ❌ Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </span>
                ) : (
                  <span>{evento ? '💾 Actualizar' : '✨ Crear Evento'}</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export const Calendario: React.FC = () => {
  const eventos = useAppStore((state) => state.calendario.eventos)
  const loading = useAppStore((state) => state.calendario.loading)
  const fetchEventos = useAppStore((state) => state.fetchEventos)
  const deleteEvento = useAppStore((state) => state.deleteEvento)
  const addNotification = useAppStore((state) => state.addNotification)
  
  const [showForm, setShowForm] = useState(false)
  const [selectedEvento, setSelectedEvento] = useState<EventoCalendario | undefined>()

  useEffect(() => {
    fetchEventos()
  }, [fetchEventos])

  const handleEdit = (evento: EventoCalendario) => {
    setSelectedEvento(evento)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        await deleteEvento(id)
      } catch (error) {
        console.error('Error al eliminar evento:', error)
      }
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'venta': return 'bg-green-100 text-green-800'
      case 'compra': return 'bg-blue-100 text-blue-800'
      case 'mantenimiento': return 'bg-orange-100 text-orange-800'
      case 'reunion': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'venta': return '🛒'
      case 'compra': return '📦'
      case 'mantenimiento': return '🔧'
      case 'reunion': return '🤝'
      default: return '📋'
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📅 Calendario</h1>
          <p className="text-gray-600">Gestiona eventos y actividades del negocio</p>
        </div>
        <Button
          onClick={() => {
            setSelectedEvento(undefined)
            setShowForm(true)
          }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>

      {/* Lista de eventos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Eventos Programados</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando eventos...</p>
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos programados</h3>
              <p className="text-gray-600 mb-4">Crea tu primer evento para comenzar a organizar tu agenda</p>
              <Button
                onClick={() => {
                  setSelectedEvento(undefined)
                  setShowForm(true)
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Evento
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {eventos.map((evento) => (
                <div
                  key={evento.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getTipoIcon(evento.tipo)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{evento.titulo}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(evento.tipo)}`}>
                          {evento.tipo}
                        </span>
                      </div>
                      
                      {evento.descripcion && (
                        <p className="text-gray-600 mb-3">{evento.descripcion}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(evento.fecha_inicio).toLocaleString('es-ES', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{evento.empleado?.nombre || 'Usuario'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(evento)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(evento.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <EventoForm
          evento={selectedEvento}
          onClose={() => {
            setShowForm(false)
            setSelectedEvento(undefined)
          }}
        />
      )}
    </div>
  )
}
