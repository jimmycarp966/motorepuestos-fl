import React, { useEffect } from 'react'
import { useAppStore } from '../../store'

export const SimpleProductosTable: React.FC = () => {
  const productos = useAppStore((state) => state.productos)
  const loading = useAppStore((state) => state.productos.loading)
  const fetchProductos = useAppStore((state) => state.fetchProductos)

  useEffect(() => {
    console.log('🔄 SimpleProductosTable: Cargando productos...')
    fetchProductos()
  }, [fetchProductos])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontSize: '1.125rem',
        color: '#666'
      }}>
        Cargando productos...
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        color: '#333',
        marginBottom: '1rem'
      }}>
        Productos
      </h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Gestiona el catálogo de productos ({productos.length} productos)
      </p>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f8f9fa'
        }}>
          <button style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}>
            + Nuevo Producto
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #e0e0e0',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: '#666'
                }}>
                  Producto
                </th>
                <th style={{
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #e0e0e0',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: '#666'
                }}>
                  Categoría
                </th>
                <th style={{
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #e0e0e0',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: '#666'
                }}>
                  Precio
                </th>
                <th style={{
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #e0e0e0',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: '#666'
                }}>
                  Stock
                </th>
                <th style={{
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #e0e0e0',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: '#666'
                }}>
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '1rem'
                  }}>
                    No hay productos disponibles
                  </td>
                </tr>
              ) : (
                productos.map((producto) => (
                  <tr key={producto.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#333'
                    }}>
                      <div style={{ fontWeight: '500' }}>{producto.nombre}</div>
                      {producto.descripcion && (
                        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                          {producto.descripcion}
                        </div>
                      )}
                    </td>
                    <td style={{
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#333'
                    }}>
                      {producto.categoria}
                    </td>
                    <td style={{
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#333',
                      fontWeight: 'bold'
                    }}>
                      ${producto.precio.toFixed(2)}
                    </td>
                    <td style={{
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      color: producto.stock < 10 ? '#e53e3e' : '#333',
                      fontWeight: producto.stock < 10 ? 'bold' : 'normal'
                    }}>
                      {producto.stock} {producto.unidad_medida}
                    </td>
                    <td style={{
                      padding: '0.75rem',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{
                        backgroundColor: producto.activo ? '#d4edda' : '#f8d7da',
                        color: producto.activo ? '#155724' : '#721c24',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Debug info */}
      <div style={{
        backgroundColor: '#f7fafc',
        borderRadius: '8px',
        padding: '1rem',
        marginTop: '1.5rem',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>
          Debug Info - Productos
        </h4>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          <div>Productos cargados: {productos.length}</div>
          <div>Estado de carga: {loading ? 'Cargando...' : 'Completado'}</div>
        </div>
      </div>
    </div>
  )
}
