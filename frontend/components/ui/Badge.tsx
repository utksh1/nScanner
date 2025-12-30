'use client'

import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'neutral' | 'info' | 'success' | 'warn' | 'danger'

export function Badge({
  className,
  tone = 'neutral',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  const tones: Record<Tone, string> = {
    neutral: 'bg-slate-800/50 text-slate-200 border-slate-700/60',
    info: 'bg-cyan-500/10 text-cyan-200 border-cyan-500/25',
    success: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/25',
    warn: 'bg-amber-500/10 text-amber-200 border-amber-500/25',
    danger: 'bg-red-500/10 text-red-200 border-red-500/25',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] leading-none tracking-wide',
        tones[tone],
        className
      )}
      {...props}
    />
  )
}
