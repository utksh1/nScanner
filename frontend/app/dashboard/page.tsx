'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Activity, AlertTriangle, CheckCircle, Clock, Radar, Terminal } from 'lucide-react'
import scannerApi from '@/lib/api'
import { Panel } from '@/components/ui/Panel'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table'

const Dashboard = () => {
  const [scans, setScans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [target, setTarget] = useState('')
  const [portRange, setPortRange] = useState('1-1024')
  const [scanLoading, setScanLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeScan, setActiveScan] = useState<any>(null)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    running: 0,
    highRisk: 0
  })

  useEffect(() => {
    loadScans()
    const interval = setInterval(() => {
      loadScans()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadScans = async () => {
    try {
      const response = await scannerApi.listScans(100)
      const fetchedScans = response.scans
      setScans(fetchedScans)

      const running = fetchedScans.find((s: any) => s.status === 'running')
      setActiveScan(running || null)

      // Calculate stats from fetched scans
      const newStats = {
        total: fetchedScans.length,
        completed: fetchedScans.filter((s: any) => s.status === 'completed').length,
        running: fetchedScans.filter((s: any) => s.status === 'running').length,
        highRisk: fetchedScans.filter((s: any) => s.overall_risk === 'high').length
      }
      setStats(newStats)
    } catch (err) {
      console.error('Failed to load scans:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!target.trim()) return

    setError('')
    setScanLoading(true)

    try {
      const response = await scannerApi.startScan(target, portRange)
      // Redirect to results page
      window.location.href = `/results/${response.scan_id}`
    } catch (err: any) {
      console.error('Dashboard scan error:', err)

      let errorMessage = 'Failed to start scan. Please try again.'

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

  const getRiskTone = (risk: string | null) => {
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
            <div className="h-6 w-40"><Skeleton className="h-6 w-40" /></div>
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <Skeleton className="h-[92px]" />
          <Skeleton className="h-[92px]" />
          <Skeleton className="h-[92px]" />
          <Skeleton className="h-[92px]" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radar className="h-4 w-4 text-cyan-300" />
            <h1 className="text-lg font-semibold tracking-wide text-slate-100">Dashboard</h1>
          </div>
          <div className="text-xs text-slate-400">/dashboard</div>
        </div>
        <div className="flex items-center gap-2">
          {activeScan ? (
            <Badge tone="info">RUNNING</Badge>
          ) : (
            <Badge tone="neutral">IDLE</Badge>
          )}
          <Button type="button" variant="secondary" size="sm" onClick={loadScans}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Panel className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Scans</div>
            <div className="h-7 w-7 rounded-md border border-slate-800/70 bg-slate-950/30 grid place-items-center">
              <Terminal className="h-4 w-4 text-slate-300" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-100 tabular-nums">{stats.total}</div>
        </Panel>

        <Panel className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Running</div>
            <div className="h-7 w-7 rounded-md border border-cyan-500/20 bg-cyan-500/10 grid place-items-center">
              <Activity className="h-4 w-4 text-cyan-300" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-100 tabular-nums">{stats.running}</div>
        </Panel>

        <Panel className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Completed</div>
            <div className="h-7 w-7 rounded-md border border-emerald-500/20 bg-emerald-500/10 grid place-items-center">
              <CheckCircle className="h-4 w-4 text-emerald-300" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-100 tabular-nums">{stats.completed}</div>
        </Panel>

        <Panel className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">High Risk</div>
            <div className="h-7 w-7 rounded-md border border-red-500/25 bg-red-500/10 grid place-items-center">
              <AlertTriangle className="h-4 w-4 text-red-200" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-100 tabular-nums">{stats.highRisk}</div>
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-slate-300" />
              <div className="text-sm font-semibold text-slate-100">New Scan</div>
            </div>
            <Badge tone="neutral">TCP</Badge>
          </div>

          <form onSubmit={handleStartScan} className="mt-4 space-y-3">
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Target</div>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-800/70 bg-slate-950/40 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                placeholder="host"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Scan Range</div>
              <select
                value={portRange}
                onChange={(e) => setPortRange(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-800/70 bg-slate-950/40 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none cursor-pointer"
                required
              >
                <option value="1-1024">Top 1024 Ports</option>
                <option value="1-5000">Top 5000 Ports</option>
                <option value="1-10000">Top 10000 Ports</option>
                <option value="1-65535">All Ports</option>
              </select>
            </div>

            {error ? (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {error}
              </div>
            ) : null}

            <Button type="submit" variant="primary" className="w-full" disabled={scanLoading}>
              {scanLoading ? 'Starting…' : 'Start Scan'}
            </Button>
          </form>

          {activeScan ? (
            <div className="mt-4 rounded-lg border border-cyan-500/15 bg-cyan-500/5 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-xs text-slate-200">
                  {activeScan.target}:{activeScan.port_range}
                </div>
                <Badge tone="info">RUNNING</Badge>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-900/70">
                <div className="h-2 w-2/5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
              </div>
            </div>
          ) : null}
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-300" />
              <div className="text-sm font-semibold text-slate-100">Recent Scans</div>
            </div>
            <Link href="/history" className="text-xs text-cyan-300 hover:text-cyan-200 transition">
              View
            </Link>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800/60">
            <Table>
              <THead>
                <Tr className="hover:bg-transparent">
                  <Th>Target</Th>
                  <Th>Status</Th>
                  <Th>Risk</Th>
                </Tr>
              </THead>
              <TBody>
                {scans.length === 0 ? (
                  <Tr>
                    <Td colSpan={3} className="py-10 text-center text-slate-400">
                      —
                    </Td>
                  </Tr>
                ) : (
                  scans.map((s) => (
                    <Tr key={s.id}>
                      <Td className="min-w-0">
                        <Link href={`/results/${s.id}`} className="block">
                          <div className="truncate text-sm text-slate-100">{s.target}</div>
                          <div className="truncate text-xs text-slate-500">{s.port_range}</div>
                        </Link>
                      </Td>
                      <Td>
                        {s.status === 'running' ? (
                          <Badge tone="info">RUNNING</Badge>
                        ) : s.status === 'completed' ? (
                          <Badge tone="success">COMPLETED</Badge>
                        ) : s.status === 'failed' ? (
                          <Badge tone="danger">FAILED</Badge>
                        ) : (
                          <Badge tone="neutral">{String(s.status).toUpperCase()}</Badge>
                        )}
                      </Td>
                      <Td>
                        <Badge tone={getRiskTone(s.overall_risk)}>
                          {s.overall_risk ? String(s.overall_risk).toUpperCase() : '—'}
                        </Badge>
                      </Td>
                    </Tr>
                  ))
                )}
              </TBody>
            </Table>
          </div>
        </Panel>
      </div>
    </div>
  )
}

export default Dashboard