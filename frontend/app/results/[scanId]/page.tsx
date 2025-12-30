'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Server, Terminal, AlertTriangle, Activity, CheckCircle, Clock, Radar, RefreshCw, Cable, ArrowLeft } from 'lucide-react'
import scannerApi from '@/lib/api'
import { Panel } from '@/components/ui/Panel'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table'

interface FindingModel {
  type: string
  detail: string
  severity: string
}

// UI shape used by this page (normalized from backend)
interface UiPortResult {
  port: number
  state: 'open' | 'closed' | 'filtered' | 'unknown'
  protocol?: string
  service?: string
  version?: string
  banner?: string
  tls?: boolean
  risk?: string
  findings?: FindingModel[]
}

interface UiScanResult {
  id: string
  target: string
  port_range: string
  status: string
  started_at?: string
  completed_at?: string | null
  overall_risk?: string | null
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
  port_results: UiPortResult[]
}

const normalizeScan = (raw: any): UiScanResult => {
  const id = raw?.id ?? raw?.scan_id ?? ''
  const target = raw?.target ?? raw?.host ?? ''
  const port_range = raw?.port_range ?? raw?.ports ?? ''

  const port_results_raw: any[] =
    Array.isArray(raw?.port_results) ? raw.port_results : Array.isArray(raw?.results) ? raw.results : []

  const port_results: UiPortResult[] = port_results_raw.map((p) => {
    const port = Number(p?.port)

    let state: UiPortResult['state'] = 'unknown'
    if (typeof p?.state === 'string') {
      const s = p.state.toLowerCase()
      state = s === 'open' || s === 'closed' || s === 'filtered' ? s : 'unknown'
    } else if (typeof p?.is_open === 'boolean') {
      state = p.is_open ? 'open' : 'closed'
    }

    return {
      port,
      state,
      protocol: p?.protocol ?? undefined,
      service: p?.service ?? undefined,
      version: p?.version ?? undefined,
      banner: p?.banner ?? undefined,
      tls: typeof p?.tls === 'boolean' ? p.tls : undefined,
      risk: p?.risk ?? p?.base_severity ?? undefined,
      findings: Array.isArray(p?.findings) ? p.findings : undefined,
    }
  })

  const computed = {
    ports_scanned: port_results.length,
    open_ports: port_results.filter((p) => p.state === 'open').length,
    closed_ports: port_results.filter((p) => p.state === 'closed').length,
    error_count: 0,
    total_findings: port_results.reduce((acc, p) => acc + (p.findings?.length ?? 0), 0),
    critical_findings: 0,
    high_findings: 0,
    risk_level: (raw?.scan_summary?.risk_level ?? raw?.overall_risk ?? 'unknown') as string,
    risk_score: Number(raw?.scan_summary?.risk_score ?? 0),
  }

  return {
    id,
    target,
    port_range,
    status: raw?.status ?? 'unknown',
    started_at: raw?.started_at,
    completed_at: raw?.completed_at ?? null,
    overall_risk: raw?.overall_risk ?? null,
    scan_summary: raw?.scan_summary ?? computed,
    port_results,
  }
}

const Results = () => {
  const params = useParams()
  const scanId = params?.scanId as string
  const [scan, setScan] = useState<UiScanResult | null>(null)
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
      setScan(normalizeScan(response))
    } catch (err: any) {
      console.error('Load scan error:', err)

      let errorMessage = 'Failed to load scan results'

      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        if (typeof detail === 'string') {
          errorMessage = detail
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ')
        } else if (typeof detail === 'object') {
          errorMessage = detail.message || JSON.stringify(detail)
        }
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadScan()
  }

  const getRiskTone = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'danger' as const
      case 'medium':
        return 'warn' as const
      case 'low':
        return 'success' as const
      default:
        return 'neutral' as const
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-4">
          <Skeleton className="h-[92px]" />
          <Skeleton className="h-[92px]" />
          <Skeleton className="h-[92px]" />
          <Skeleton className="h-[92px]" />
        </div>

        <Skeleton className="h-[420px]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>

        <Panel className="p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-300" />
            <div className="text-sm font-semibold text-slate-100">Error</div>
          </div>
          <div className="mt-2 text-sm text-slate-400">{error}</div>
          <div className="mt-4">
            <Link href="/dashboard">
              <Button variant="primary">Return to Dashboard</Button>
            </Link>
          </div>
        </Panel>
      </div>
    )
  }

  if (!scan) {
    return null
  }

  const visiblePorts = scan.port_results.filter((p) => p.state === 'open')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radar className="h-4 w-4 text-cyan-300" />
            <h1 className="text-lg font-semibold tracking-wide text-slate-100">Results</h1>
          </div>
          <div className="text-xs text-slate-400">{scan.target}:{scan.port_range}</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{scan.status.toUpperCase()}</Badge>
          {scan.overall_risk && <Badge tone={getRiskTone(scan.overall_risk)}>{scan.overall_risk.toUpperCase()}</Badge>}
          <Link href="/dashboard">
            <Button variant="secondary" size="sm">Dashboard</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-4">
        <Panel className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Total Ports</div>
          <div className="mt-2 text-2xl font-semibold text-slate-100 tabular-nums">{scan.port_results.length}</div>
        </Panel>
        <Panel className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Open</div>
          <div className="mt-2 text-2xl font-semibold text-emerald-400 tabular-nums">{scan.port_results.filter(p => p.state === 'open').length}</div>
        </Panel>
        <Panel className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Closed</div>
          <div className="mt-2 text-2xl font-semibold text-slate-500 tabular-nums">{scan.port_results.filter(p => p.state === 'closed').length}</div>
        </Panel>
        <Panel className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Filtered</div>
          <div className="mt-2 text-2xl font-semibold text-slate-500 tabular-nums">{scan.port_results.filter(p => p.state === 'filtered').length}</div>
        </Panel>
      </div>

      <Panel className="p-0 overflow-hidden">
        <div className="border-b border-slate-800/60 px-5 py-4">
          <div className="text-sm font-semibold text-slate-100">Open Ports</div>
          <div className="text-xs text-slate-500 tabular-nums">{visiblePorts.length}</div>
        </div>

        <div className="overflow-auto">
          <Table>
            <THead>
              <Tr className="hover:bg-transparent">
                <Th>Port</Th>
                <Th>Protocol</Th>
                <Th>Service</Th>
                <Th>Version</Th>
                <Th>Banner</Th>
              </Tr>
            </THead>
            <TBody>
              {visiblePorts.length === 0 ? (
                <Tr>
                  <Td colSpan={5} className="py-12 text-center text-slate-400">
                    —
                  </Td>
                </Tr>
              ) : (
                visiblePorts.map((port, index) => (
                  <Tr key={index} className="group">
                    <Td className="font-mono text-sm text-slate-100">{port.port}</Td>
                    <Td>{port.protocol?.toUpperCase() || 'TCP'}</Td>
                    <Td>{port.service || '—'}</Td>
                    <Td>{port.version || '—'}</Td>
                    <Td className="max-w-xs">
                      {port.banner ? (
                        <details className="group">
                          <summary className="cursor-pointer truncate font-mono text-xs text-slate-400 hover:text-slate-300 list-none [&::-webkit-details-marker]:hidden">
                            <span className="inline-block max-w-[200px] truncate">{port.banner}</span>
                            <span className="ml-1 text-cyan-400">▾</span>
                          </summary>
                          <div className="mt-1 rounded border border-slate-800/60 bg-slate-950/60 p-2 font-mono text-xs text-slate-300">
                            {port.banner}
                          </div>
                        </details>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </Td>
                  </Tr>
                ))
              )}
            </TBody>
          </Table>
        </div>
      </Panel>
    </div>
  )
}

export default Results