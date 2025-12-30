'use client'

import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative rounded-xl border border-slate-800/70 bg-slate-950/40 backdrop-blur-xl',
        'shadow-[0_0_0_1px_rgba(34,211,238,0.04),0_18px_60px_rgba(0,0,0,0.55)]',
        className
      )}
      {...props}
    />
  )
}
