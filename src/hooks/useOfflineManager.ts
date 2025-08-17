import { useState, useEffect } from 'react'
import { offlineManager, type OfflineState } from '../lib/offlineManager'

export function useOfflineManager() {
  const [state, setState] = useState<OfflineState>(offlineManager.getState())

  useEffect(() => {
    const unsubscribe = offlineManager.subscribe(setState)
    return unsubscribe
  }, [])

  return {
    ...state,
    registrarVentaOffline: offlineManager.registrarVentaOffline.bind(offlineManager),
    getVentasOfflinePendientes: offlineManager.getVentasOfflinePendientes.bind(offlineManager),
    forcSync: offlineManager.forcSync.bind(offlineManager),
    clearOfflineData: offlineManager.clearOfflineData.bind(offlineManager)
  }
}
