import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'TaxAdvisor AI — Big 4 Advisory Platform',
  description: 'Multi-agent AI tax advisory platform for Big 4 accounting teams',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-background min-h-screen`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-hidden flex flex-col min-w-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
