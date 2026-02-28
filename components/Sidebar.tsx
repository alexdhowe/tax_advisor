'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, UserPlus, Scale, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/clients', icon: Users, label: 'Clients' },
  { href: '/clients/new', icon: UserPlus, label: 'New Client' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] shrink-0 flex flex-col" style={{
      background: 'linear-gradient(180deg, #0d1424 0%, #111827 100%)',
    }}>
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm tracking-tight leading-none">TaxAdvisor AI</p>
            <p className="text-slate-500 text-[10px] mt-0.5">Big 4 Platform</p>
          </div>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/5" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest px-2 mb-2">Navigation</p>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group',
                active
                  ? 'bg-indigo-500/15 text-indigo-300 font-medium'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              )}
            >
              <Icon className={cn(
                'w-4 h-4 shrink-0',
                active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
              )} />
              <span>{label}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto text-indigo-400/60" />}
            </Link>
          )
        })}
      </nav>

      <div className="mx-4 h-px bg-white/5" />

      {/* Footer */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-slate-500 text-[11px]">Claude Sonnet 4.6</p>
        </div>
      </div>
    </aside>
  )
}
