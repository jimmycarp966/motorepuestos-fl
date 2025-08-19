import React from 'react'
import { CheckCircle, Star, Zap, Eye, ShoppingCart, Receipt } from 'lucide-react'

/**
 * Componente de demostración para mostrar las mejoras del sistema de ventas
 * Diseñado específicamente para mostrar las características mejoradas
 */
export const VentasShowcase: React.FC = () => {
  const mejoras = [
    {
      titulo: "🖥️ Interfaz Amplia y Moderna",
      descripcion: "Diseño de pantalla completa con distribución optimizada",
      caracteristicas: [
        "Layout de 2 paneles: productos (70%) + carrito (30%)",
        "Cards de productos más grandes y visibles",
        "Vista grid y lista intercambiables",
        "Búsqueda y filtros prominentes"
      ],
      estado: "completado"
    },
    {
      titulo: "🔍 Selección de Productos Mejorada",
      descripcion: "Experiencia optimizada para encontrar y agregar productos",
      caracteristicas: [
        "Búsqueda en tiempo real por múltiples campos",
        "Filtros por categoría específica de motorepuestos",
        "Iconos distintivos por tipo de producto",
        "Información clara de stock y precios"
      ],
      estado: "completado"
    },
    {
      titulo: "🛒 Carrito Visual e Intuitivo",
      descripcion: "Gestión clara y eficiente del carrito de compras",
      caracteristicas: [
        "Controles de cantidad grandes y accesibles",
        "Información detallada de cada producto",
        "Total prominente y actualización en tiempo real",
        "Animaciones sutiles para mejor feedback"
      ],
      estado: "completado"
    },
    {
      titulo: "💳 Proceso de Finalización Prominente",
      descripcion: "Botón y flujo de finalización destacado y profesional",
      caracteristicas: [
        "Botón de finalizar con gradiente llamativo",
        "Múltiples métodos de pago",
        "Selección opcional de cliente",
        "Confirmación clara del proceso"
      ],
      estado: "completado"
    },
    {
      titulo: "🔧 Optimización para Motorepuestos",
      descripcion: "Características específicas del sector automotriz",
      caracteristicas: [
        "Categorías: Lubricantes, Repuestos, Herramientas, Accesorios",
        "Iconos temáticos (aceite, herramientas, autopartes)",
        "Colores azul mecánico y naranja de alta visibilidad",
        "Flujo de trabajo optimizado para venta rápida"
      ],
      estado: "completado"
    },
    {
      titulo: "⚡ Rendimiento y UX",
      descripcion: "Experiencia fluida y profesional",
      caracteristicas: [
        "Animaciones CSS optimizadas",
        "Búsqueda instantánea sin lag",
        "Feedback visual inmediato",
        "Atajos de teclado (F10, F11)"
      ],
      estado: "completado"
    }
  ]

  const getEstadoIcon = (estado: string) => {
    if (estado === 'completado') {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
    return <div className="w-5 h-5 bg-yellow-400 rounded-full animate-pulse" />
  }

  return (
    <div className="max-w-7xl mx-auto p-8 bg-gradient-to-br from-dark-bg-primary to-dark-bg-secondary min-h-screen">
      <div className="bg-dark-bg-secondary rounded-2xl shadow-dark-xl p-8 border border-dark-border">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-dark-text-primary mb-4">
            🏪 Sistema de Ventas Mejorado
          </h1>
          <p className="text-xl text-dark-text-secondary mb-2">
            Diseño amplio y moderno para tiendas de motorepuestos
          </p>
          <div className="flex items-center justify-center space-x-6 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">100%</div>
              <div className="text-sm text-dark-text-secondary">Completado</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-moto-blue">6</div>
              <div className="text-sm text-dark-text-secondary">Mejoras Principales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-moto-orange">25+</div>
              <div className="text-sm text-dark-text-secondary">Características Nuevas</div>
            </div>
          </div>
        </div>

        {/* Mejoras Implementadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {mejoras.map((mejora, index) => (
            <div key={index} className="border border-dark-border rounded-xl p-6 hover:shadow-dark-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    {getEstadoIcon(mejora.estado)}
                    <h3 className="text-lg font-semibold text-dark-text-primary">{mejora.titulo}</h3>
                  </div>
                  <p className="text-dark-text-secondary text-sm">{mejora.descripcion}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {mejora.caracteristicas.map((caracteristica, charIndex) => (
                  <div key={charIndex} className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-dark-text-primary">{caracteristica}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Comparación Antes vs Después */}
        <div className="bg-gradient-to-r from-moto-blue/10 to-moto-orange/10 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-dark-text-primary mb-6 text-center">📊 Antes vs Después</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Antes */}
            <div className="bg-dark-bg-secondary rounded-lg p-6 border border-dark-border">
              <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                <X className="w-5 h-5 mr-2" />
                Antes (Sistema Anterior)
              </h3>
              <div className="space-y-3 text-sm text-dark-text-secondary">
                <div>• Modal pequeño con espacio limitado</div>
                <div>• Cards de productos pequeños</div>
                <div>• Información condensada y difícil de leer</div>
                <div>• Botón de finalizar poco visible</div>
                <div>• Sin categorización específica</div>
                <div>• UX genérica sin identidad visual</div>
                <div>• Carrito básico sin detalles</div>
                <div>• Sin animaciones ni feedback visual</div>
              </div>
            </div>

            {/* Después */}
            <div className="bg-dark-bg-secondary rounded-lg p-6 border border-dark-border">
              <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Después (Sistema Mejorado)
              </h3>
              <div className="space-y-3 text-sm text-dark-text-secondary">
                <div>• Pantalla completa con layout optimizado</div>
                <div>• Cards grandes con información clara</div>
                <div>• Texto legible y bien espaciado</div>
                <div>• Botón de finalizar prominente y atractivo</div>
                <div>• Categorías específicas de motorepuestos</div>
                <div>• Colores y tema profesional del sector</div>
                <div>• Carrito detallado con controles grandes</div>
                <div>• Animaciones suaves y feedback instantáneo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Características Técnicas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-6 bg-dark-bg-tertiary rounded-xl">
            <Eye className="w-12 h-12 text-moto-blue mx-auto mb-4" />
            <h3 className="font-semibold text-dark-text-primary mb-2">Visibilidad Mejorada</h3>
            <p className="text-sm text-dark-text-secondary">
              Layout amplio que aprovecha toda la pantalla para mostrar productos con claridad
            </p>
          </div>
          
          <div className="text-center p-6 bg-dark-bg-tertiary rounded-xl">
            <Zap className="w-12 h-12 text-moto-orange mx-auto mb-4" />
            <h3 className="font-semibold text-dark-text-primary mb-2">Flujo Rápido</h3>
            <p className="text-sm text-dark-text-secondary">
              Optimizado para ventas rápidas con búsqueda instantánea y atajos de teclado
            </p>
          </div>
          
          <div className="text-center p-6 bg-dark-bg-tertiary rounded-xl">
            <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="font-semibold text-dark-text-primary mb-2">UX Profesional</h3>
            <p className="text-sm text-dark-text-secondary">
              Diseño específico para motorepuestos con iconografía y colores apropiados
            </p>
          </div>
        </div>

        {/* Instrucciones de Uso */}
        <div className="bg-dark-bg-secondary border border-dark-border rounded-xl p-6">
          <h3 className="text-xl font-semibold text-dark-text-primary mb-4 flex items-center">
            <Receipt className="w-6 h-6 mr-2 text-moto-blue" />
            Cómo Usar el Nuevo Sistema de Ventas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-dark-text-primary mb-3">🔍 Búsqueda y Selección:</h4>
              <ol className="space-y-2 text-sm text-dark-text-secondary">
                <li>1. Usa la barra de búsqueda para encontrar productos</li>
                <li>2. Filtra por categoría (Lubricantes, Repuestos, etc.)</li>
                <li>3. Cambia entre vista grid y lista según prefieras</li>
                <li>4. Haz clic en "Agregar al Carrito" en cualquier producto</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium text-dark-text-primary mb-3">💳 Finalización:</h4>
              <ol className="space-y-2 text-sm text-dark-text-secondary">
                <li>1. Revisa los productos en el carrito lateral</li>
                <li>2. Ajusta cantidades con los botones + y -</li>
                <li>3. Selecciona cliente (opcional) y método de pago</li>
                <li>4. Haz clic en "FINALIZAR VENTA" para completar</li>
              </ol>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-moto-blue/10 rounded-lg">
            <h4 className="font-medium text-moto-blue mb-2">⌨️ Atajos de Teclado:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-dark-text-secondary">
              <div><kbd className="bg-dark-bg-tertiary px-2 py-1 rounded border border-dark-border text-dark-text-secondary">F10</kbd> - Enfocar búsqueda</div>
              <div><kbd className="bg-dark-bg-tertiary px-2 py-1 rounded border border-dark-border text-dark-text-secondary">F11</kbd> - Finalizar venta</div>
              <div><kbd className="bg-dark-bg-tertiary px-2 py-1 rounded border border-dark-border text-dark-text-secondary">Enter</kbd> - Agregar producto destacado</div>
              <div><kbd className="bg-dark-bg-tertiary px-2 py-1 rounded border border-dark-border text-dark-text-secondary">Esc</kbd> - Limpiar búsqueda</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Agregar import que faltaba
import { X } from 'lucide-react'
