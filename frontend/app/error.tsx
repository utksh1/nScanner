'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import CyberBackground from '@/components/CyberBackground'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#02060c]">
      <CyberBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md px-6 flex flex-col items-center text-center"
      >
        <div className="mb-8 p-4 rounded-full bg-red-500/5 border border-red-500/20">
          <AlertTriangle className="w-12 h-12 text-red-500/80" />
        </div>

        <h2 className="text-xl font-mono tracking-wider text-red-500 mb-4 uppercase">
          System Exception Detected
        </h2>

        <p className="text-sm font-mono text-slate-400 mb-8 leading-relaxed">
          {error.message || 'An unexpected failure occurred in the execution environment.'}
        </p>

        <div className="w-full flex flex-col gap-4">
          <button
            onClick={reset}
            className="cyber-button-primary w-full border-red-500/30 text-red-400 hover:border-red-400 hover:bg-red-500/5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>REINITIALIZE</span>
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="cyber-button-secondary w-full"
          >
            <Home className="w-4 h-4" />
            <span>RETURN TO BASE</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

