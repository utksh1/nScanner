import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

export interface ScanRequest {
  target: string
  port_range: string
}

export interface ScanResponse {
  scan_id: string
}

export interface ScanResult {
  id: string
  target: string
  port_range: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  started_at: string
  completed_at: string | null
  overall_risk: 'low' | 'medium' | 'high' | null
  port_results: PortResult[]
}

export interface PortResult {
  port: number
  is_open: boolean
  service: string | null
  banner: string | null
  tls: boolean
  risk: 'low' | 'medium' | 'high'
}

export interface ScanListItem {
  id: string
  target: string
  port_range: string
  status: string
  started_at: string
  completed_at: string | null
  overall_risk: string | null
}

export interface HealthResponse {
  status: string
  service: string
  version: string
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const scannerApi = {
  startScan: async (target: string, port_range: string): Promise<ScanResponse> => {
    const response = await api.post('/api/scan', null, {
      params: { target, port_range }
    })
    return response.data
  },

  getScan: async (scanId: string): Promise<ScanResult> => {
    const response = await api.get(`/api/scan/${scanId}`)
    return response.data
  },

  listScans: async (limit: number = 50): Promise<{ scans: ScanListItem[] }> => {
    const response = await api.get('/api/scans', {
      params: { limit }
    })
    return response.data
  },

  deleteScan: async (scanId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/api/scan/${scanId}`)
    return response.data
  },

  getHealth: async (): Promise<HealthResponse> => {
    const response = await api.get('/api/health')
    return response.data
  },
}

export default scannerApi
