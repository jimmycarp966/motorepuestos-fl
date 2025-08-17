import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppStore } from '../../store'
import type { AuthenticatedUser, ModuloPermitido } from '../../store'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { X, Eye, EyeOff, Check, X as XIcon } from 'lucide-react'

const empleadoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  rol: z.enum(['Administrador', 'Gerente', 'Vendedor', 'Técnico', 'Almacén', 'Cajero']),
  salario: z.number().min(0, 'El salario debe ser mayor a 0'),
  permisos_modulos: z.array(z.string()).min(1, 'Debe seleccionar al menos un módulo'),
})

type EmpleadoFormData = z.infer<typeof empleadoSchema>

interface EmpleadoFormProps {
  empleado?: AuthenticatedUser | null
  onClose: () => void
}

export const EmpleadoForm: React.FC<EmpleadoFormProps> = ({ empleado, onClose }) => {
  const createEmpleadoWithAuth = useAppStore((state) => state.createEmpleadoWithAuth)
  const updateEmpleadoWithAuth = useAppStore((state) => state.updateEmpleadoWithAuth)
  const getEmpleadoPermissions = useAppStore((state) => state.getEmpleadoPermissions)
  const loading = useAppStore((state) => state.empleados.loading)
  
  const [showPassword, setShowPassword] = useState(false)
  const [selectedModulos, setSelectedModulos] = useState<string[]>([])
  const [availableModulos, setAvailableModulos] = useState<string[]>([])

  // Módulos disponibles con descripciones
  const modulosInfo = [
    { id: 'dashboard', nombre: 'Dashboard', descripcion: 'Panel principal con estadísticas' },
    { id: 'empleados', nombre: 'Empleados', descripcion: 'Gestión de personal' },
    { id: 'productos', nombre: 'Productos', descripcion: 'Gestión de inventario' },
    { id: 'clientes', nombre: 'Clientes', descripcion: 'Gestión de clientes' },
    { id: 'ventas', nombre: 'Ventas', descripcion: 'Registro de ventas' },
    { id: 'caja', nombre: 'Caja', descripcion: 'Gestión de caja y arqueos' },
    { id: 'calendario', nombre: 'Calendario', descripcion: 'Eventos y programación' },
  ]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmpleadoFormData>({
    resolver: zodResolver(empleadoSchema),
    defaultValues: empleado ? {
      nombre: empleado.nombre,
      email: empleado.email,
      rol: empleado.rol,
      salario: 0, // Se actualizará desde la base de datos
      permisos_modulos: [], // Se actualizará desde la base de datos
    } : {
      salario: 0,
      permisos_modulos: [],
    },
  })

  const selectedRol = watch('rol')

  // Permitir selección libre de todos los módulos (administrador puede elegir)
  useEffect(() => {
    // Hacer todos los módulos disponibles para selección libre
    const todosLosModulos = modulosInfo.map(modulo => modulo.id)
    setAvailableModulos(todosLosModulos)
    
    if (selectedRol && !empleado) {
      // Para nuevos empleados, sugerir módulos del rol pero permitir cambio
      const permisosSugeridos = getEmpleadoPermissions(selectedRol)
      setSelectedModulos(permisosSugeridos)
      setValue('permisos_modulos', permisosSugeridos)
    }
  }, [selectedRol, getEmpleadoPermissions, setValue, empleado, modulosInfo])

  // Cargar datos del empleado si es edición
  useEffect(() => {
    if (empleado) {
      // Aquí deberías cargar los datos completos del empleado desde la base de datos
      // Por ahora usamos valores por defecto
      setValue('salario', 0)
      setValue('permisos_modulos', ['dashboard'])
      setSelectedModulos(['dashboard'])
    }
  }, [empleado, setValue])

  const toggleModulo = (moduloId: string) => {
    const newModulos = selectedModulos.includes(moduloId)
      ? selectedModulos.filter(m => m !== moduloId)
      : [...selectedModulos, moduloId]
    
    setSelectedModulos(newModulos)
    setValue('permisos_modulos', newModulos)
  }

  const onSubmit = async (data: EmpleadoFormData) => {
    try {
      if (empleado) {
        await updateEmpleadoWithAuth(empleado.id, data)
      } else {
        if (!data.password) {
          throw new Error('La contraseña es requerida para nuevos empleados')
        }
        await createEmpleadoWithAuth(data as any)
      }
      onClose()
    } catch (error: any) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 sticky top-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">
                {empleado ? '✏️ Editar Empleado' : '👤 Nuevo Empleado'}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {empleado ? 'Modifica los datos del empleado' : 'Agrega un nuevo empleado al sistema con acceso completo'}
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campo Nombre */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  📝 Nombre Completo
                </label>
                <Input
                  {...register('nombre')}
                  placeholder="Ingresa el nombre completo"
                  className={`w-full px-4 py-3 border-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all duration-200 ${
                    errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <span className="mr-1">⚠️</span>
                    {errors.nombre.message}
                  </p>
                )}
              </div>
              
              {/* Campo Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  📧 Correo Electrónico
                </label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="ejemplo@motorepuestos.com"
                  className={`w-full px-4 py-3 border-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all duration-200 ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: 'white', color: '#374151' }}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <span className="mr-1">⚠️</span>
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                🔐 Contraseña {empleado && '(dejar vacío para no cambiar)'}
              </label>
              <div className="relative">
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={empleado ? 'Nueva contraseña (opcional)' : 'Ingresa la contraseña'}
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all duration-200 ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: 'white', color: '#374151' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <span className="mr-1">⚠️</span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Rol y Salario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campo Rol */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  🎯 Rol en el Sistema
                </label>
                <select
                  {...register('rol')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all duration-200"
                  style={{ backgroundColor: 'white', color: '#374151' }}
                >
                  <option value="">Selecciona un rol</option>
                  <option value="Administrador">👑 Administrador</option>
                  <option value="Gerente">👔 Gerente</option>
                  <option value="Vendedor">💼 Vendedor</option>
                  <option value="Técnico">🔧 Técnico</option>
                  <option value="Almacén">📦 Almacén</option>
                  <option value="Cajero">💰 Cajero</option>
                </select>
                {errors.rol && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <span className="mr-1">⚠️</span>
                    {errors.rol.message}
                  </p>
                )}
              </div>

              {/* Campo Salario */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  💰 Salario Mensual
                </label>
                <Input
                  {...register('salario', { valueAsNumber: true })}
                  type="number"
                  placeholder="0.00"
                  className={`w-full px-4 py-3 border-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all duration-200 ${
                    errors.salario ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: 'white', color: '#374151' }}
                />
                {errors.salario && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <span className="mr-1">⚠️</span>
                    {errors.salario.message}
                  </p>
                )}
              </div>
            </div>

            {/* Permisos de Módulos */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                🔐 Módulos Accesibles (Selección Libre)
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Selecciona libremente qué módulos puede acceder el empleado, independientemente del rol.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {modulosInfo.map((modulo) => {
                  const isSelected = selectedModulos.includes(modulo.id)
                  
                  return (
                    <div
                      key={modulo.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => toggleModulo(modulo.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{modulo.nombre}</h4>
                            <p className="text-sm text-gray-500">{modulo.descripcion}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {errors.permisos_modulos && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <span className="mr-1">⚠️</span>
                  {errors.permisos_modulos.message}
                </p>
              )}
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
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </span>
                ) : (
                  <span>{empleado ? '💾 Actualizar' : '✨ Crear Empleado'}</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
