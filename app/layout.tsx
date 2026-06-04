import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Motel QA Management',
  description: 'Next.js 15 Supabase Motel Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <div className="flex min-h-screen">
          {/* Simple Sidebar for Navigation */}
          <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-blue-600">Motel QA</h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
              <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Dashboard</Link>
              <Link href="/rooms" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Rooms</Link>
              <Link href="/tenants" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Tenants</Link>
              <Link href="/bills" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Bills</Link>
              <Link href="/templates" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Templates</Link>
              <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Settings</Link>
            </nav>
            <div className="p-4 border-t">
              <form action="/login">
                 {/* Simulate logout by going to login page (real logout action needs a form) */}
                 <button type="submit" className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">Logout</button>
              </form>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
