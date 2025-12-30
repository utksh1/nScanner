'use client'

import { useId, useState } from 'react'
import { cn } from '@/lib/cn'

export function Disclosure({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const contentId = useId()

  return (
    <div className={cn('rounded-xl border border-slate-800/60 bg-slate-950/30', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full px-4 py-3 text-left',
          'flex items-center justify-between gap-4',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60'
        )}
      >
        <div className="min-w-0">{title}</div>
        <div
          className={cn(
            'h-2 w-2 rounded-full border border-cyan-500/40 bg-cyan-500/10',
            'transition-transform duration-200',
            open ? 'rotate-45' : 'rotate-0'
          )}
        />
      </button>
      <div
        id={contentId}
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
