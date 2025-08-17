import { create } from 'zustand';
import { authSlice, AuthSlice } from './slices/authSlice';
import { uiSlice, UISlice } from './slices/uiSlice';
import { productosSlice, ProductosSlice } from './slices/productosSlice';
import { ventasSlice, VentasSlice } from './slices/ventasSlice';
import { clientesSlice, ClientesSlice } from './slices/clientesSlice';
import { empleadosSlice, EmpleadosSlice } from './slices/empleadosSlice';
import { cajaSlice, CajaSlice } from './slices/cajaSlice';
import { notificationsSlice, NotificationsSlice } from './slices/notificationsSlice';
import { cajaHistorialSlice, CajaHistorialSlice } from './slices/cajaHistorialSlice';
import { reportesSlice, ReportesSlice } from './slices/reportesSlice';

export interface AppStore extends 
  AuthSlice, 
  UISlice, 
  ProductosSlice, 
  VentasSlice, 
  ClientesSlice, 
  EmpleadosSlice, 
  CajaSlice, 
  NotificationsSlice,
  CajaHistorialSlice,
  ReportesSlice {}

export const useAppStore = create<AppStore>((...a) => ({
  ...authSlice(...a),
  ...uiSlice(...a),
  ...productosSlice(...a),
  ...ventasSlice(...a),
  ...clientesSlice(...a),
  ...empleadosSlice(...a),
  ...cajaSlice(...a),
  ...notificationsSlice(...a),
  ...cajaHistorialSlice(...a),
  ...reportesSlice(...a),
}));
