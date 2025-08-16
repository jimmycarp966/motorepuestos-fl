import { useEffect, useState } from 'react'
import { useAppStore } from '../store'

export const useSidebar = () => {
  const sidebarOpen = useAppStore((state) => state.ui.sidebarOpen)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  return {
    sidebarOpen,
    isMobile,
    toggleSidebar,
    closeSidebar,
    setSidebarOpen
  }
}
