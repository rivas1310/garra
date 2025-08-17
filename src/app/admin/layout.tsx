'use client'

import AdminNav from '@/components/AdminNav'
import { Toaster } from 'react-hot-toast'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import { useState } from 'react'
import { Menu } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gradient-elegant">
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-md p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-premium rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </div>
            <h1 className="text-lg font-bold text-neutral-700">Bazar Admin</h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed top-0 left-0 z-50 h-full w-64
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:fixed lg:z-10 lg:h-screen
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          shadow-lg
        `}>
          <AdminNav onCloseMobile={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto pt-16 lg:pt-0 lg:pl-64 w-full">
          {children}
        </main>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </AdminProtectedRoute>
  )
}