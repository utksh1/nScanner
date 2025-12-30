import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, AlertTriangle, CheckCircle, Clock, Shield, TrendingUp, Radar, Terminal, Server, Zap, ShieldCheck } from 'lucide-react'
import scannerApi, { ScanListItem } from '../services/api'
import AnimatedGrid from '../components/AnimatedGrid'

const Dashboard = () => {
  const [scans, setScans] = useState<ScanListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [target, setTarget] = useState('')
  const [portRange, setPortRange] = useState('1-1024')
  const [scanLoading, setScanLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeScan, setActiveScan] = useState<ScanListItem | null>(null)

  useEffect(() => {
    loadScans()
    const interval = setInterval(() => {
      loadScans()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadScans = async () => {
    try {
      const response = await scannerApi.listScans(10)
      setScans(response.scans)
      const running = response.scans.find(s => s.status === 'running')
      setActiveScan(running || null)
    } catch (err) {
      console.error('Failed to load scans:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setScanLoading(true)

    try {
      await scannerApi.startScan(target, portRange)
      setTarget('')
      setPortRange('1-1024')
      loadScans()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start scan')
    } finally {
      setScanLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'running':
        return <Activity className="h-5 w-5 text-blue-400 animate-pulse" />
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-400" />
      default:
        return <Clock className="h-5 w-5 text-slate-400" />
    }
  }

  const getRiskColor = (risk: string | null) => {
    switch (risk) {
      case 'high':
        return 'px-3 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30'
      case 'medium':
        return 'px-3 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      case 'low':
        return 'px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30'
      default:
        return 'px-3 py-1 text-xs font-medium rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30'
    }
  }

  const stats = {
    total: scans.length,
    running: scans.filter(s => s.status === 'running').length,
    completed: scans.filter(s => s.status === 'completed').length,
    highRisk: scans.filter(s => s.overall_risk === 'high').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <AnimatedGrid />
        <div className="relative z-10 text-center">
          <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl"></div>
            <div className="relative z-10">
              <Radar className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-300">Initializing dashboard...</p>
              <div className="w-full bg-slate-700/50 rounded-full h-2 mt-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <AnimatedGrid />
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Radar className="h-10 w-10 text-blue-400" />
                <div className="absolute inset-0 h-10 w-10 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Command Center</h1>
                <p className="text-slate-400 mt-2 text-lg">Network reconnaissance operations dashboard</p>
              </div>
            </div>
          </motion.div>

          {/* Active Scan Progress */}
          {activeScan && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 w-12 h-12 rounded-full flex items-center justify-center">
                        <Activity className="h-6 w-6 text-blue-400 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">Active Scan</h3>
                        <p className="text-slate-400">{activeScan.target}:{activeScan.port_range}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-400 text-sm font-medium">EXECUTING</span>
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full animate-pulse"></div>
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-slate-400">
                    <span>Scanning ports...</span>
                    <span>{new Date(activeScan.started_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-4 gap-6 mb-12"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 text-center transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-blue-400" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{stats.total}</div>
                <div className="text-slate-300 text-sm mt-1">Total Operations</div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 text-center transition-all duration-300 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-green-400">{stats.running}</div>
                <div className="text-slate-300 text-sm mt-1">Active Scans</div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 text-center transition-all duration-300 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-purple-400">{stats.completed}</div>
                <div className="text-slate-300 text-sm mt-1">Completed</div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 text-center transition-all duration-300 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
                <div className="text-3xl font-bold text-red-400">{stats.highRisk}</div>
                <div className="text-slate-300 text-sm mt-1">High Risk</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Launch New Scan */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 w-10 h-10 rounded-full flex items-center justify-center">
                      <Terminal className="h-5 w-5 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Launch New Scan</h2>
                  </div>
                  <form onSubmit={handleStartScan} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Target Host
                      </label>
                      <input
                        type="text"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="example.com or 192.168.1.1"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Port Configuration
                      </label>
                      <input
                        type="text"
                        value={portRange}
                        onChange={(e) => setPortRange(e.target.value)}
                        placeholder="1-1024 or 80,443,22"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3"
                      >
                        {error}
                      </motion.div>
                    )}
                    <button
                      type="submit"
                      disabled={scanLoading}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {scanLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Activity className="h-5 w-5 animate-spin" />
                          <span>Deploying...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <ShieldCheck className="h-5 w-5" />
                          <span>Deploy Security Scan</span>
                        </div>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>

            {/* Recent Operations */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 w-10 h-10 rounded-full flex items-center justify-center">
                      <Server className="h-5 w-5 text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Recent Operations</h2>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {scans.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="bg-gradient-to-br from-slate-500/20 to-slate-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Terminal className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-slate-400">No operations yet. Deploy your first scan!</p>
                      </div>
                    ) : (
                      scans.map((scan, index) => (
                        <motion.div
                          key={scan.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-600/50 hover:border-purple-500/50 transition-all duration-300"
                        >
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(scan.status)}
                            <div>
                              <div className="text-white font-medium">{scan.target}</div>
                              <div className="text-slate-400 text-sm">{scan.port_range}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {scan.overall_risk && (
                              <span className={getRiskColor(scan.overall_risk)}>
                                {scan.overall_risk}
                              </span>
                            )}
                            <a
                              href={`/results/${scan.id}`}
                              className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                            >
                              Analyze →
                            </a>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
