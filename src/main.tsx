import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AppProviders } from '@/app/providers'
import { router } from '@/app/router'
import 'leaflet/dist/leaflet.css'
import '@/styles/globals.css'

// Tự động tải lại trang khi Vite phát hiện chunk file bị thay đổi sau khi deploy phiên bản mới
window.addEventListener('vite:preloadError', () => {
  const lastReload = Number(sessionStorage.getItem('ellora_vite_preload_error') || 0)
  const now = Date.now()
  if (now - lastReload > 10000) {
    sessionStorage.setItem('ellora_vite_preload_error', String(now))
    window.location.reload()
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
)
