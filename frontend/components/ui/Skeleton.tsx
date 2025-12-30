'use client'

import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gradient-to-r from-slate-900/60 via-slate-800/40 to-slate-900/60',
        'border border-slate-800/50',
        className
      )}
      {...props}
    />
  )
}
