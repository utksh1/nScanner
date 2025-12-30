'use client'

import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import CyberBackground from '@/components/CyberBackground'

export default function Loading() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#02060c]">
      <CyberBackground />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        <div className="relative">
          <Shield className="w-16 h-16 text-cyan-500/20 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono tracking-[0.5em] text-cyan-500 uppercase animate-pulse">
            Decrypting Interface
          </span>
          <div className="w-48 h-[1px] bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              className="w-full h-full bg-cyan-500"
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

