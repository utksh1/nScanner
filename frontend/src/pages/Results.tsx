import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shield, 
  Server,
  Lock,
  Globe,
  RefreshCw,
  Terminal,
  Radar,
  Cable
} from 'lucide-react'
import scannerApi, { ScanResult, PortResult } from '../services/api'
import AnimatedGrid from '../components/AnimatedGrid'

const Results = () => {
  const { scanId } = useParams<{ scanId: string }>()
  const [scan, setScan] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (scanId) {
      loadScan()
      const interval = setInterval(() => {
        if (scan?.status === 'running') {
          loadScan()
        }
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [scanId, scan?.status])

  const loadScan = async () => {
    if (!scanId) return
    
    try {
      const response = await scannerApi.getScan(scanId)
      setScan(response)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load scan results')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadScan()
  }

  const getServiceIcon = (service: string | null) => {
    switch (service?.toLowerCase()) {
      case 'http':
      case 'https':
        return <Globe className="h-4 w-4 text-cyber-accent" />
      case 'ssh':
        return <Lock className="h-4 w-4 text-cyber-success" />
      case 'ftp':
        return <Server className="h-4 w-4 text-cyber-warning" />
      default:
        return <Cable className="h-4 w-4 text-gray-500" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'risk-badge-high'
      case 'medium':
        return 'risk-badge-medium'
      case 'low':
        return 'risk-badge-low'
      default:
        return 'px-3 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-cyber-success" />
      case 'running':
        return <Activity className="h-6 w-6 text-cyber-accent animate-pulse" />
      case 'failed':
        return <AlertTriangle className="h-6 w-6 text-cyber-danger" />
      default:
        return <Clock className="h-6 w-6 text-gray-500" />
    }
  }

  const getRiskGaugePosition = (risk: string | null) => {
    switch (risk) {
      case 'low': return 25
      case 'medium': return 50
      case 'high': return 75
      default: return 0
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
        <AnimatedGrid />
        <div className="relative z-10 text-center">
          <div className="glass-panel p-8">
            <Radar className="h-12 w-12 text-cyber-accent animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Analyzing scan results...</p>
            <div className="scan-progress mt-4">
              <div className="scan-progress-bar"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !scan) {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
        <AnimatedGrid />
        <div className="relative z-10 text-center">
          <div className="glass-panel p-8">
            <AlertTriangle className="h-12 w-12 text-cyber-danger mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error || 'Scan not found'}</p>
            <Link to="/dashboard" className="cyber-button">
              Return to Command Center
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const openPorts = scan.port_results.filter(p => p.is_open)
  const riskStats = {
    high: scan.port_results.filter(p => p.risk === 'high').length,
    medium: scan.port_results.filter(p => p.risk === 'medium').length,
    low: scan.port_results.filter(p => p.risk === 'low').length,
  }

  return (
    <div className="min-h-screen bg-cyber-bg relative overflow-hidden">
      <AnimatedGrid />
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center space-x-4">
              {getStatusIcon(scan.status)}
              <div>
                <h1 className="text-4xl font-bold text-white glow-text">Scan Analysis</h1>
                <p className="text-gray-300 text-lg">
                  Target: {scan.target} • Ports: {scan.port_range}
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="cyber-button flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </motion.div>

          {/* Risk Assessment Dashboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="glass-panel-glow">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="h-6 w-6 text-cyber-accent" />
                <h2 className="text-2xl font-semibold text-white">Threat Assessment</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Risk Gauge */}
                <div className="text-center">
                  <div className="relative w-48 h-48 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-8 border-gray-700"></div>
                    <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-cyber-success border-r-cyber-warning border-b-cyber-danger transform rotate-45"></div>
                    <div className="absolute inset-4 rounded-full bg-cyber-bg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{openPorts.length}</div>
                        <div className="text-gray-400 text-sm">Open Ports</div>
                      </div>
                    </div>
                    <motion.div
                      className="absolute top-0 left-1/2 w-1 h-24 bg-cyber-accent origin-bottom"
                      animate={{ rotate: scan.overall_risk ? getRiskGaugePosition(scan.overall_risk) - 90 : 0 }}
                      transition={{ duration: 1 }}
                    >
                      <div className="absolute -top-2 -left-2 w-5 h-5 bg-cyber-accent rounded-full"></div>
                    </motion.div>
                  </div>
                  {scan.overall_risk && (
                    <div className={`inline-block px-4 py-2 rounded-full ${getRiskColor(scan.overall_risk)}`}>
                      Overall Risk: {scan.overall_risk.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Risk Breakdown */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-cyber-danger rounded-full"></div>
                      <span className="text-white">Critical Risk</span>
                    </div>
                    <span className="text-2xl font-bold text-cyber-danger">{riskStats.high}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-cyber-warning rounded-full"></div>
                      <span className="text-white">Medium Risk</span>
                    </div>
                    <span className="text-2xl font-bold text-cyber-warning">{riskStats.medium}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-cyber-success rounded-full"></div>
                      <span className="text-white">Low Risk</span>
                    </div>
                    <span className="text-2xl font-bold text-cyber-success">{riskStats.low}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Port Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="glass-panel-glow">
              <div className="flex items-center space-x-3 mb-6">
                <Terminal className="h-6 w-6 text-cyber-accent" />
                <h2 className="text-2xl font-semibold text-white">Port Analysis</h2>
                <span className="text-gray-400 text-sm ml-auto">
                  {scan.port_results.length} ports scanned
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {scan.port_results.length === 0 ? (
                  <div className="text-center py-12 md:col-span-2 xl:col-span-3">
                    {scan.status === 'running' ? (
                      <div>
                        <Activity className="h-12 w-12 text-cyber-accent animate-pulse mx-auto mb-4" />
                        <p className="text-gray-300">Scanning in progress...</p>
                        <div className="scan-progress mt-4 max-w-md mx-auto">
                          <div className="scan-progress-bar"></div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400">No port data available</p>
                    )}
                  </div>
                ) : (
                  scan.port_results.map((port: PortResult, index: number) => (
                    <motion.div
                      key={port.port}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`p-4 rounded-lg border transition-all duration-300 h-full ${
                        port.is_open 
                          ? 'bg-gray-800/30 border-gray-700/50 hover:border-cyber-accent/50' 
                          : 'bg-gray-900/50 border-gray-800/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5 shrink-0">{getServiceIcon(port.service)}</div>
                            <div className="min-w-0">
                              <div className="text-white font-mono font-medium leading-snug">
                                Port {port.port}
                                {!port.is_open && <span className="text-gray-500 ml-2">[CLOSED]</span>}
                              </div>
                              <div className="text-gray-400 text-sm leading-snug">
                                {port.service || 'Unknown'}
                                {port.tls && <span className="text-cyber-accent ml-2">• TLS</span>}
                              </div>
                            </div>
                          </div>

                          {port.banner && (
                            <div className="mt-3 terminal-text text-sm bg-gray-900/50 px-3 py-2 rounded border border-gray-700/50 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                              {port.banner}
                            </div>
                          )}
                        </div>

                        <span className={`${getRiskColor(port.risk)} shrink-0`}>
                          {port.risk.toUpperCase()}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Scan Metadata */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <div className="glass-panel">
              <div className="flex items-center justify-center space-x-8 text-gray-400 text-sm">
                <div>
                  <Clock className="h-4 w-4 inline mr-2" />
                  Started: {new Date(scan.started_at).toLocaleString()}
                </div>
                {scan.completed_at && (
                  <div>
                    <CheckCircle className="h-4 w-4 inline mr-2" />
                    Completed: {new Date(scan.completed_at).toLocaleString()}
                  </div>
                )}
                <div>
                  <Radar className="h-4 w-4 inline mr-2" />
                  ID: {scan.id.substring(0, 8)}...
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Results
