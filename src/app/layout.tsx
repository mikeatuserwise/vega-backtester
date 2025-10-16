import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VEGA Backtester Dashboard',
  description: 'Internal dashboard for backtesting day trading strategies',
  keywords: ['trading', 'backtesting', 'day trading', 'strategy'],
  authors: [{ name: 'VEGA Team' }],
  robots: 'noindex, nofollow', // Prevent search engine indexing for internal use
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
}
