'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, History, Home, Radar } from 'lucide-react'

const Navbar = () => {
  const pathname = usePathname()
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: Activity },
    { path: '/history', label: 'History', icon: History },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Radar className="h-8 w-8 text-blue-400 animate-pulse" />
              <div className="absolute inset-0 h-8 w-8 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">nScanner</span>
            </Link>
          </div>
          
          <div className="flex space-x-2">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.path
              
              return (
                <div key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/50'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
