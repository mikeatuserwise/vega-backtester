'use client'

import { TrendingUp, Settings, Users } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              VEGA Backtester
            </h1>
          </div>
          
          <nav className="flex items-center space-x-6">
            <a 
              href="#" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Team</span>
            </a>
            <a 
              href="#" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
