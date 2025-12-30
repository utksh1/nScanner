'use client'

import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

type Size = 'sm' | 'md'

export function Button({
  className,
  variant = 'secondary',
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 focus-visible:ring-offset-0 disabled:opacity-50 disabled:pointer-events-none'

  const variants: Record<Variant, string> = {
    primary:
      'bg-gradient-to-r from-blue-500 to-cyan-500 text-slate-950 shadow-[0_0_0_1px_rgba(34,211,238,0.15),0_10px_30px_rgba(0,0,0,0.55)] hover:brightness-110 active:brightness-95',
    secondary:
      'bg-slate-900/60 text-slate-200 border border-slate-800/70 hover:bg-slate-900/80',
    ghost: 'bg-transparent text-slate-200 hover:bg-slate-900/60',
    danger:
      'bg-red-500/15 text-red-200 border border-red-500/25 hover:bg-red-500/20',
  }

  const sizes: Record<Size, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
}
