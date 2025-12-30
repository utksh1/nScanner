import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shield, 
  Search,
  Filter,
  Trash2,
  Terminal,
  Calendar,
  TrendingUp,
  Radar
} from 'lucide-react'
import scannerApi, { ScanListItem } from '../services/api'
import AnimatedGrid from '../components/AnimatedGrid'

const History = () => {
  const [scans, setScans] = useState<ScanListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRisk, setFilterRisk] = useState('all')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadScans()
  }, [])

  const loadScans = async () => {
    try {
      const response = await scannerApi.listScans(100)
      setScans(response.scans)
    } catch (err) {
      console.error('Failed to load scans:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (scanId: string) => {
    setDeleting(scanId)
    try {
      await scannerApi.deleteScan(scanId)
      setScans(scans.filter(s => s.id !== scanId))
    } catch (err) {
      console.error('Failed to delete scan:', err)
    } finally {
      setDeleting(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-cyber-success" />
      case 'running':
        return <Activity className="h-5 w-5 text-cyber-accent animate-pulse" />
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-cyber-danger" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getRiskColor = (risk: string | null) => {
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

  const filteredScans = scans.filter(scan => {
    const matchesSearch = scan.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scan.port_range.includes(searchTerm)
    const matchesStatus = filterStatus === 'all' || scan.status === filterStatus
    const matchesRisk = filterRisk === 'all' || scan.overall_risk === filterRisk
    return matchesSearch && matchesStatus && matchesRisk
  })

  const stats = {
    total: scans.length,
    completed: scans.filter(s => s.status === 'completed').length,
    running: scans.filter(s => s.status === 'running').length,
    highRisk: scans.filter(s => s.overall_risk === 'high').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
        <AnimatedGrid />
        <div className="relative z-10 text-center">
          <div className="glass-panel p-8">
            <Radar className="h-12 w-12 text-cyber-accent animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Loading operation history...</p>
            <div className="scan-progress mt-4">
              <div className="scan-progress-bar"></div>
            </div>
          </div>
        </div>
      </div>
    )
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
            className="mb-8"
          >
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-cyber-accent" />
              <h1 className="text-4xl font-bold text-white glow-text">Operation History</h1>
            </div>
            <p className="text-gray-400 mt-2">Complete timeline of network reconnaissance operations</p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-4 gap-6 mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-panel text-center p-6"
            >
              <TrendingUp className="h-8 w-8 text-cyber-accent mx-auto mb-3" />
              <div className="text-3xl font-bold text-white glow-text">{stats.total}</div>
              <div className="text-gray-300 text-sm">Total Operations</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-panel text-center p-6"
            >
              <CheckCircle className="h-8 w-8 text-cyber-success mx-auto mb-3" />
              <div className="text-3xl font-bold text-cyber-success">{stats.completed}</div>
              <div className="text-gray-300 text-sm">Completed</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-panel text-center p-6"
            >
              <Activity className="h-8 w-8 text-cyber-accent mx-auto mb-3" />
              <div className="text-3xl font-bold text-cyber-accent">{stats.running}</div>
              <div className="text-gray-300 text-sm">Active</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-panel text-center p-6"
            >
              <AlertTriangle className="h-8 w-8 text-cyber-danger mx-auto mb-3" />
              <div className="text-3xl font-bold text-cyber-danger">{stats.highRisk}</div>
              <div className="text-gray-300 text-sm">High Risk</div>
            </motion.div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="glass-panel-glow mb-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Filter className="h-5 w-5 text-cyber-accent" />
              <h2 className="text-xl font-semibold text-white">Filter Operations</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search target or ports..."
                  className="cyber-input pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="cyber-input"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="running">Running</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="cyber-input"
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="glass-panel-glow">
              <div className="flex items-center space-x-3 mb-6">
                <Terminal className="h-6 w-6 text-cyber-accent" />
                <h2 className="text-2xl font-semibold text-white">Operation Timeline</h2>
                <span className="text-gray-400 text-sm ml-auto">
                  {filteredScans.length} operations found
                </span>
              </div>
              
              {filteredScans.length === 0 ? (
                <div className="text-center py-12">
                  <Terminal className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {scans.length === 0 ? 'No operations recorded yet' : 'No operations match your filters'}
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyber-accent to-cyber-accent/20"></div>
                  
                  <div className="space-y-6">
                    {filteredScans.map((scan, index) => (
                      <motion.div
                        key={scan.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="relative flex items-start space-x-6"
                      >
                        {/* Timeline Dot */}
                        <div className="relative z-10">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            scan.status === 'completed' ? 'bg-cyber-success border-cyber-success' :
                            scan.status === 'running' ? 'bg-cyber-accent border-cyber-accent animate-pulse' :
                            scan.status === 'failed' ? 'bg-cyber-danger border-cyber-danger' :
                            'bg-gray-500 border-gray-500'
                          }`}></div>
                        </div>
                        
                        {/* Content Card */}
                        <div className="flex-1 min-w-0">
                          <div className="glass-panel p-6 hover:border-cyber-accent/50 transition-all duration-300">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-3">
                                  {getStatusIcon(scan.status)}
                                  <div>
                                    <h3 className="text-lg font-semibold text-white">{scan.target}</h3>
                                    <p className="text-gray-400 text-sm">
                                      Ports: {scan.port_range} • {new Date(scan.started_at).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-4 mb-4">
                                  {scan.overall_risk && (
                                    <span className={getRiskColor(scan.overall_risk)}>
                                      {scan.overall_risk.toUpperCase()} RISK
                                    </span>
                                  )}
                                  <span className="text-gray-400 text-sm">
                                    Scan ID: {scan.id.substring(0, 8)}...
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-6 text-sm text-gray-400">
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      {scan.status === 'running' ? 'In Progress' :
                                       scan.completed_at ? 
                                       `${Math.round((new Date(scan.completed_at).getTime() - new Date(scan.started_at).getTime()) / 1000)}s` :
                                       'Unknown'}
                                    </span>
                                  </div>
                                  {scan.overall_risk && (
                                    <div className="flex items-center space-x-2">
                                      <Shield className="h-4 w-4" />
                                      <span>Risk Assessment Complete</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                <a
                                  href={`/results/${scan.id}`}
                                  className="cyber-button text-sm px-4 py-2"
                                >
                                  Analyze
                                </a>
                                <button
                                  onClick={() => handleDelete(scan.id)}
                                  disabled={deleting === scan.id}
                                  className="cyber-button-danger text-sm px-4 py-2 disabled:opacity-50"
                                >
                                  {deleting === scan.id ? (
                                    <Activity className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default History
