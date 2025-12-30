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
  scan_summary?: {
    ports_scanned: number
    open_ports: number
    closed_ports: number
    error_count: number
    total_findings: number
    critical_findings: number
    high_findings: number
    risk_level: string
    risk_score: number
  }
}

export interface PortResult {
  port: number
  is_open: boolean
  service: string | null
  banner: string | null
  tls: boolean
  risk: 'low' | 'medium' | 'high'
  latency?: number
  tls_info?: {
    issuer: string
    not_before: string
    not_after: string
    version: string
    serial_number: string
  }
  http_info?: {
    server_header: string
    status_code: number
  }
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
