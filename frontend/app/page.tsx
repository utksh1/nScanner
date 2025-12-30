'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Radar, ArrowRight, Activity, Shield, Terminal, Cpu, Zap, Lock, Globe } from 'lucide-react'
import Navbar from '@/components/Navbar'
import scannerApi from '@/lib/api'

export default function Index() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const [target, setTarget] = useState('')
  const [portRange, setPortRange] = useState('1-1024')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!target.trim()) return

    setError('')
    setLoading(true)

    try {
      const response = await scannerApi.startScan(target, portRange)
      router.push(`/results/${response.scan_id}`)
    } catch (err: any) {
      console.error('Scan error:', err)

      let errorMessage = 'Failed to initialize scan'

      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        if (typeof detail === 'string') {
          errorMessage = detail
        } else if (Array.isArray(detail)) {
          // Handle Pydantic validation errors
          errorMessage = detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ')
        } else if (typeof detail === 'object') {
          errorMessage = detail.message || JSON.stringify(detail)
        }
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden bg-slate-950">
      {/* Colorful Gradient Background */}
      <div className="absolute inset-0">
        {/* Multi-color gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-amber-500/8 rounded-full blur-3xl" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto w-full">

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
                <Radar className="h-12 w-12 text-cyan-400" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 rounded-2xl blur-xl" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                nScanner
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Network reconnaissance & vulnerability assessment platform
            </p>
          </motion.div>

          {/* Scan Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-xl mx-auto mb-16"
          >
            <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-8 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Quick Scan</h2>
                </div>

                <form onSubmit={handleStartScan} className="space-y-5">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Target Host</label>
                    <input
                      type="text"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder="example.com or 192.168.1.1"
                      className="w-full h-12 px-4 bg-slate-800/50 border border-slate-700/50 rounded-xl 
                               text-white placeholder:text-slate-500
                               focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                               transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Scan Range</label>
                    <select
                      value={portRange}
                      onChange={(e) => setPortRange(e.target.value)}
                      className="w-full h-12 px-4 bg-slate-800/50 border border-slate-700/50 rounded-xl 
                               text-white placeholder:text-slate-500
                               focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                               transition-all duration-300 appearance-none cursor-pointer"
                      required
                    >
                      <option value="1-1024">Top 1024 Ports (Default)</option>
                      <option value="1-5000">Top 5000 Ports</option>
                      <option value="1-10000">Top 10000 Ports</option>
                      <option value="1-65535">All Ports (Common Full Scan)</option>
                    </select>
                  </div>

                  {error && (
                    <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !target.trim()}
                    className="w-full h-12 flex items-center justify-center gap-3 
                             bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 
                             text-white font-semibold rounded-xl
                             hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400
                             hover:shadow-lg hover:shadow-purple-500/25
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Activity className="w-5 h-5 animate-spin" />
                        <span>Scanning...</span>
                      </>
                    ) : (
                      <>
                        <Radar className="w-5 h-5" />
                        <span>Start Scan</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Feature Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {/* Security Card - Cyan */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-xl 
                       hover:border-cyan-500/40 transition-all duration-300 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-400/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Security First</h3>
                <p className="text-slate-400 text-sm">Advanced threat detection with real-time alerts</p>
              </div>
            </motion.div>

            {/* Analysis Card - Purple */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-xl 
                       hover:border-purple-500/40 transition-all duration-300 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-400/10 flex items-center justify-center mb-4">
                  <Terminal className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Deep Analysis</h3>
                <p className="text-slate-400 text-sm">Vulnerability scanning with detailed reports</p>
              </div>
            </motion.div>

            {/* Performance Card - Emerald */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-xl 
                       hover:border-emerald-500/40 transition-all duration-300 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-400/10 flex items-center justify-center mb-4">
                  <Cpu className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">High Performance</h3>
                <p className="text-slate-400 text-sm">Optimized engine for fast concurrent scans</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}