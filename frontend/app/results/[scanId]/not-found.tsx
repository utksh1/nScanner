'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowLeft, Search } from 'lucide-react'
import AnimatedGrid from '@/components/AnimatedGrid'

export default function ScanNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <AnimatedGrid />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl max-w-lg w-full mx-4">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl"></div>
          <div className="relative z-10 text-center">
            <div
              className="bg-gradient-to-br from-red-500/20 to-orange-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">Scan Not Found</h1>
            
            <p className="text-slate-400 mb-6">
              The scan results you're looking for don't exist or have been deleted.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard"
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
              
              <Link
                href="/history"
                className="flex items-center justify-center space-x-2 bg-slate-800/50 text-slate-200 border border-slate-600/50 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:bg-slate-800/70"
              >
                <Search className="h-4 w-4" />
                <span>View History</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
