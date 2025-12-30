'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLanding = pathname === '/'

  return (
    <>
      {!isLanding && <Navbar />}
      <div className={!isLanding ? "relative min-h-screen pt-16 px-4" : ""}>
        {/* Colorful Gradient Background for non-landing pages */}
        {!isLanding && (
          <div className="absolute inset-0 -mt-16">
            {/* Multi-color gradient orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-amber-500/8 rounded-full blur-3xl" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
          </div>
        )}
        
        <div className={!isLanding ? "relative z-10 mx-auto max-w-7xl" : ""}>
          {children}
        </div>
      </div>
    </>
  )
}

