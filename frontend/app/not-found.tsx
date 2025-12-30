'use client'

import { motion } from 'framer-motion'
import { Radar, Home, Shield } from 'lucide-react'
import CyberBackground from '@/components/CyberBackground'

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#02060c]">
      <CyberBackground />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-6 flex flex-col items-center text-center"
      >
        <div className="mb-8 p-4 rounded-full bg-cyan-500/5 border border-cyan-500/10">
          <Radar className="w-12 h-12 text-cyan-500/80 animate-pulse" />
        </div>

        <h1 className="text-4xl font-mono tracking-widest text-cyan-500/50 mb-2">404</h1>

        <h2 className="text-xl font-mono tracking-wider text-cyan-500 mb-6 uppercase">
          Target Not Found
        </h2>

        <p className="text-sm font-mono text-slate-400 mb-10 leading-relaxed">
          The requested coordinate does not exist within the system registry.
        </p>

        <div className="w-full flex flex-col gap-4">
          <button
            onClick={() => window.location.href = '/'}
            className="cyber-button-primary w-full"
          >
            <Home className="w-4 h-4" />
            <span>RETURN TO BASE</span>
          </button>

          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] text-cyan-500/40 uppercase mt-4">
            <Shield className="w-3 h-3" />
            Access Restricted
          </div>
        </div>
      </motion.div>
    </div>
  )
}

