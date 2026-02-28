import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tax Advisor — AI Tax Advisory Platform',
  description: 'Multi-agent AI tax advisory platform for Big 4 accounting teams',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-56 bg-gray-900 flex flex-col shrink-0">
            {/* Logo */}
            <div className="px-5 py-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚖️</span>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">TaxAdvisor AI</p>
                  <p className="text-gray-400 text-xs">Big 4 Advisory Platform</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
              <SidebarLink href="/" icon="📊" label="Dashboard" />
              <SidebarLink href="/clients" icon="👥" label="Clients" />
              <SidebarLink href="/clients/new" icon="➕" label="New Client" />
            </nav>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-700">
              <p className="text-gray-500 text-xs">Powered by Claude Sonnet</p>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-hidden flex flex-col">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

function SidebarLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm"
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}
