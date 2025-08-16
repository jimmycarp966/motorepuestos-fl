export interface AuthenticatedUser {
  id: string
  nombre: string
  email: string
  rol: 'admin' | 'cajero' | 'vendedor' | 'consulta'
  activo: boolean
  created_at: string
  updated_at: string
}
