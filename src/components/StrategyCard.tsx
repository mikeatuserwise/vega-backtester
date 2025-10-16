'use client'

import { TrendingUp, TrendingDown, Target, Activity } from 'lucide-react'

interface StrategyCardProps {
  id: string
  name: string
  description: string
  performance: number
  trades: number
  winRate: number
  isSelected: boolean
  onSelect: () => void
}

export function StrategyCard({
  id,
  name,
  description,
  performance,
  trades,
  winRate,
  isSelected,
  onSelect
}: StrategyCardProps) {
  const isPositive = performance > 0

  return (
    <div
      className={`strategy-card cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <div className={`flex items-center space-x-1 ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {isPositive ? '+' : ''}{performance}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Trades</p>
            <p className="text-sm font-medium text-foreground">{trades}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className="text-sm font-medium text-foreground">{winRate}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
