import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'nScanner - Network Security Scanner',
  description: 'Advanced network reconnaissance with real-time vulnerability assessment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#02060c] text-slate-200 antialiased`}>
        {children}
      </body>
    </html>
  )
}
