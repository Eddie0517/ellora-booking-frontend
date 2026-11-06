import { Outlet } from 'react-router-dom'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 antialiased selection:bg-rose-100 selection:text-brand-dark">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
