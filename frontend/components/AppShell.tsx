'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { Activity, History, Home, Menu, Radar, X } from 'lucide-react'

const nav = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/dashboard', icon: Activity, label: 'Dashboard' },
  { href: '/history', icon: History, label: 'History' },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const active = useMemo(() => {
    return nav.find((n) => n.href === pathname)?.label
  }, [pathname])

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:48px_48px] opacity-25" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.12),transparent_40%)]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="md:hidden"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Radar className="h-5 w-5 text-cyan-300" />
              <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-md" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-slate-100">nScanner</span>
          </div>

          <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
            <span className="hidden sm:inline">{active ?? ''}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[240px_1fr]">
        <aside className="hidden md:block">
          <nav className="sticky top-20 space-y-2">
            {nav.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition',
                    isActive
                      ? 'border-cyan-500/30 bg-cyan-500/10 text-slate-100'
                      : 'border-slate-800/60 bg-slate-950/30 text-slate-300 hover:bg-slate-950/50'
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-slate-200')} />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>

      {/* Mobile drawer */}
      <div className={cn('fixed inset-0 z-50 md:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')}>
        <div
          className={cn(
            'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity',
            open ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setOpen(false)}
        />

        <div
          className={cn(
            'absolute left-0 top-0 h-full w-[280px] border-r border-slate-800/60 bg-slate-950/80 backdrop-blur-xl',
            'transition-transform duration-200',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Radar className="h-5 w-5 text-cyan-300" />
              <span className="text-sm font-semibold tracking-wide text-slate-100">nScanner</span>
            </div>
            <Button type="button" variant="ghost" size="sm" aria-label="Close navigation" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="px-3 py-3">
            {nav.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'mb-2 flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition',
                    isActive
                      ? 'border-cyan-500/30 bg-cyan-500/10 text-slate-100'
                      : 'border-slate-800/60 bg-slate-950/30 text-slate-300 hover:bg-slate-950/50'
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive ? 'text-cyan-300' : 'text-slate-400')} />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
