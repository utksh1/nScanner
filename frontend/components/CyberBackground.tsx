'use client'

import { useEffect, useRef } from 'react'

const CyberBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', resize)
    resize()

    // Particles for noise texture
    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number }> = []
    const particleCount = 40

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 0.5,
      })
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(2, 6, 12, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw digital grid (fixed but drawn every frame to allow for some subtle shifts if needed)
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.03)'
      ctx.lineWidth = 1
      const gridSize = 50
      
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Draw moving dots
      ctx.fillStyle = 'rgba(34, 211, 238, 0.2)'
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0 bg-[#02060c]">
      <canvas ref={canvasRef} className="opacity-60" />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#02060c] pointer-events-none" />
    </div>
  )
}

export default CyberBackground
