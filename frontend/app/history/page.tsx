'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search,
  Trash2,
  Radar
} from 'lucide-react'
import scannerApi from '@/lib/api'
import { Panel } from '@/components/ui/Panel'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table'

const History = () => {
  const [scans, setScans] = useState<any[]>([])
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-6 w-40" />
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

        <Skeleton className="h-[420px]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radar className="h-4 w-4 text-cyan-300" />
            <h1 className="text-lg font-semibold tracking-wide text-slate-100">History</h1>
          </div>
          <div className="text-xs text-slate-400">/history</div>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={loadScans}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Panel className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Scans</div>
          <div className="mt-2 text-2xl font-semibold text-slate-100 tabular-nums">{stats.total}</div>
        </Panel>
        <Panel className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Running</div>
          <div className="mt-2 text-2xl font-semibold text-slate-100 tabular-nums">{stats.running}</div>
        </Panel>
        <Panel className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Completed</div>
          <div className="mt-2 text-2xl font-semibold text-slate-100 tabular-nums">{stats.completed}</div>
        </Panel>
        <Panel className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">High Risk</div>
          <div className="mt-2 text-2xl font-semibold text-slate-100 tabular-nums">{stats.highRisk}</div>
        </Panel>
      </div>

      <Panel className="p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative md:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-800/70 bg-slate-950/40 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              placeholder="Search"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-800/70 bg-slate-950/40 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-800/70 bg-slate-950/40 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="all">All Risk</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </Panel>

      <Panel className="p-0 overflow-hidden">
        <div className="border-b border-slate-800/60 px-5 py-4">
          <div className="text-sm font-semibold text-slate-100">Scans</div>
          <div className="text-xs text-slate-500 tabular-nums">{filteredScans.length}</div>
        </div>

        <div className="overflow-auto">
          <Table>
            <THead>
              <Tr className="hover:bg-transparent">
                <Th>Target</Th>
                <Th>Status</Th>
                <Th>Risk</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </THead>
            <TBody>
              {filteredScans.length === 0 ? (
                <Tr>
                  <Td colSpan={4} className="py-12 text-center text-slate-400">
                    —
                  </Td>
                </Tr>
              ) : (
                filteredScans.map((s: any) => (
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
                    <Td className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link href={`/results/${s.id}`} className="inline-flex">
                          <Button type="button" variant="secondary" size="sm">View</Button>
                        </Link>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          disabled={deleting === s.id}
                          onClick={() => handleDelete(s.id)}
                          aria-label="Delete"
                        >
                          {deleting === s.id ? (
                            <Activity className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
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

export default History
