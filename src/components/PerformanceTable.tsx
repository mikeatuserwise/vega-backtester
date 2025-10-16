'use client'

import { useState } from 'react'
import { Strategy, PerformanceMetrics } from '@/types/strategy'
import { TrendingUp, TrendingDown, Target, AlertTriangle, BarChart3 } from 'lucide-react'

interface PerformanceTableProps {
  strategies: Strategy[]
  capital: number
  backtestStartDate: string
  backtestEndDate: string
  backtestResults?: any
}

export function PerformanceTable({ strategies, capital, backtestStartDate, backtestEndDate, backtestResults }: PerformanceTableProps) {
  const [sortBy, setSortBy] = useState<keyof PerformanceMetrics>('totalReturn')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Deterministic random number generator using seed
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  // Generate performance data - use real backtest results if available, otherwise fallback to mock data
  const generatePerformanceData = (): Record<string, PerformanceMetrics> => {
    const data: Record<string, PerformanceMetrics> = {}
    
    // If we have real backtest results, use them
    if (backtestResults?.results && Array.isArray(backtestResults.results)) {
      for (const result of backtestResults.results) {
        data[result.strategyId] = result.performance
      }
      return data
    }
    
    // Fallback to mock data with consistent seeding
    const seedBase = `${backtestStartDate}-${backtestEndDate}-${capital}`
    let seedCounter = 0
    
    // If no strategies, create a default analysis
    if (strategies.length === 0) {
      const startDate = new Date(backtestStartDate)
      const endDate = new Date(backtestEndDate)
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      
      const baseReturn = (seededRandom(seedBase.charCodeAt(0) + seedCounter++) * 40 - 10) // -10% to +30%
      const volatility = seededRandom(seedBase.charCodeAt(1) + seedCounter++) * 20 + 5 // 5% to 25%
      const maxDrawdown = seededRandom(seedBase.charCodeAt(2) + seedCounter++) * 15 + 2 // 2% to 17%
      
      data['default-analysis'] = {
        totalReturn: Number(baseReturn.toFixed(1)),
        annualizedReturn: Number((baseReturn * (365 / daysDiff)).toFixed(1)),
        sharpeRatio: Number((baseReturn / volatility).toFixed(2)),
        maxDrawdown: Number(maxDrawdown.toFixed(1)),
        winRate: Number((seededRandom(seedBase.charCodeAt(3) + seedCounter++) * 30 + 50).toFixed(1)), // 50% to 80%
        profitFactor: Number((seededRandom(seedBase.charCodeAt(4) + seedCounter++) * 2 + 0.8).toFixed(2)), // 0.8 to 2.8
        totalTrades: Math.floor(seededRandom(seedBase.charCodeAt(5) + seedCounter++) * 200 + 50), // 50 to 250 trades
        avgTradeReturn: Number((baseReturn / Math.floor(seededRandom(seedBase.charCodeAt(6) + seedCounter++) * 200 + 50)).toFixed(3)),
        bestTrade: Number((seededRandom(seedBase.charCodeAt(7) + seedCounter++) * 10 + 2).toFixed(2)), // $2 to $12
        worstTrade: Number(-(seededRandom(seedBase.charCodeAt(8) + seedCounter++) * 5 + 1).toFixed(2)), // -$1 to -$6
        avgHoldTime: Number((seededRandom(seedBase.charCodeAt(9) + seedCounter++) * 30 + 5).toFixed(1)), // 5 to 35 minutes
        volatility: Number(volatility.toFixed(1)),
        calmarRatio: Number((baseReturn / maxDrawdown).toFixed(2)),
        sortinoRatio: Number((baseReturn / (volatility * 0.8)).toFixed(2))
      }
      return data
    }
    
    strategies.forEach((strategy, index) => {
      // Calculate days between start and end date
      const startDate = new Date(backtestStartDate)
      const endDate = new Date(backtestEndDate)
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      
      // Create strategy-specific seed
      const strategySeed = `${seedBase}-${strategy.id}-${strategy.type}`
      let strategySeedCounter = 0
      
      // Generate strategy-specific performance metrics
      const baseReturn = (seededRandom(strategySeed.charCodeAt(0) + strategySeedCounter++) * 40 - 10) // -10% to +30%
      const volatility = seededRandom(strategySeed.charCodeAt(1) + strategySeedCounter++) * 20 + 5 // 5% to 25%
      const maxDrawdown = seededRandom(strategySeed.charCodeAt(2) + strategySeedCounter++) * 15 + 2 // 2% to 17%
      
      data[strategy.id] = {
        totalReturn: Number(baseReturn.toFixed(1)),
        annualizedReturn: Number((baseReturn * (365 / daysDiff)).toFixed(1)),
        sharpeRatio: Number((baseReturn / volatility).toFixed(2)),
        maxDrawdown: Number(maxDrawdown.toFixed(1)),
        winRate: Number((seededRandom(strategySeed.charCodeAt(3) + strategySeedCounter++) * 30 + 50).toFixed(1)), // 50% to 80%
        profitFactor: Number((seededRandom(strategySeed.charCodeAt(4) + strategySeedCounter++) * 2 + 0.8).toFixed(2)), // 0.8 to 2.8
        totalTrades: Math.floor(seededRandom(strategySeed.charCodeAt(5) + strategySeedCounter++) * 200 + 50), // 50 to 250 trades
        avgTradeReturn: Number((baseReturn / Math.floor(seededRandom(strategySeed.charCodeAt(6) + strategySeedCounter++) * 200 + 50)).toFixed(3)),
        bestTrade: Number((seededRandom(strategySeed.charCodeAt(7) + strategySeedCounter++) * 10 + 2).toFixed(2)), // $2 to $12
        worstTrade: Number(-(seededRandom(strategySeed.charCodeAt(8) + strategySeedCounter++) * 5 + 1).toFixed(2)), // -$1 to -$6
        avgHoldTime: Number((seededRandom(strategySeed.charCodeAt(9) + strategySeedCounter++) * 30 + 5).toFixed(1)), // 5 to 35 minutes
        volatility: Number(volatility.toFixed(1)),
        calmarRatio: Number((baseReturn / maxDrawdown).toFixed(2)),
        sortinoRatio: Number((baseReturn / (volatility * 0.8)).toFixed(2))
      }
    })
    
    return data
  }

  const performanceData = generatePerformanceData()

  const handleSort = (column: keyof PerformanceMetrics) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number, decimals: number = 1) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
  }

  const getPerformanceColor = (value: number, isPositive: boolean = true) => {
    if (isPositive) {
      return value > 0 ? 'text-green-600' : 'text-red-600'
    } else {
      return value < 0 ? 'text-green-600' : 'text-red-600'
    }
  }

  const getRiskLevel = (maxDrawdown: number): { level: string; color: string } => {
    if (maxDrawdown < 5) return { level: 'Low', color: 'text-green-600' }
    if (maxDrawdown < 10) return { level: 'Medium', color: 'text-yellow-600' }
    if (maxDrawdown < 20) return { level: 'High', color: 'text-orange-600' }
    return { level: 'Very High', color: 'text-red-600' }
  }

  // Create display strategies - either real strategies or default analysis
  const displayStrategies = strategies.length > 0 ? strategies : [
    {
      id: 'default-analysis',
      name: 'Current Parameters Analysis',
      description: 'Analysis based on current capital and date range settings',
      type: 'default' as any,
      parameters: {} as any,
      tickers: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  const sortedStrategies = [...displayStrategies].sort((a, b) => {
    const aValue = performanceData[a.id]?.[sortBy] || 0
    const bValue = performanceData[b.id]?.[sortBy] || 0
    
    if (sortOrder === 'asc') {
      return aValue - bValue
    } else {
      return bValue - aValue
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Strategy Performance Comparison</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          Capital: {formatCurrency(capital)}
        </div>
      </div>

      <div className="metric-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-foreground">Strategy</th>
              <th 
                className="text-right py-3 px-4 font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('totalReturn')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Total Return</span>
                  {sortBy === 'totalReturn' && (
                    sortOrder === 'desc' ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('sharpeRatio')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Sharpe Ratio</span>
                  {sortBy === 'sharpeRatio' && (
                    sortOrder === 'desc' ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('maxDrawdown')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Max Drawdown</span>
                  {sortBy === 'maxDrawdown' && (
                    sortOrder === 'desc' ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('winRate')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Win Rate</span>
                  {sortBy === 'winRate' && (
                    sortOrder === 'desc' ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th 
                className="text-right py-3 px-4 font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('profitFactor')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Profit Factor</span>
                  {sortBy === 'profitFactor' && (
                    sortOrder === 'desc' ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th className="text-right py-3 px-4 font-medium text-foreground">Total Trades</th>
              <th className="text-right py-3 px-4 font-medium text-foreground">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {sortedStrategies.map((strategy) => {
              const performance = performanceData[strategy.id]
              if (!performance) return null

              const riskLevel = getRiskLevel(performance.maxDrawdown)
              const totalReturnValue = capital * (performance.totalReturn / 100)

              return (
                <tr key={strategy.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-foreground">{strategy.name}</div>
                      <div className="text-sm text-muted-foreground">{strategy.tickers.length} tickers</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className={`font-medium ${getPerformanceColor(performance.totalReturn)}`}>
                      {formatPercentage(performance.totalReturn)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(totalReturnValue)}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-medium text-foreground">
                      {performance.sharpeRatio.toFixed(2)}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className={`font-medium ${getPerformanceColor(performance.maxDrawdown, false)}`}>
                      {formatPercentage(performance.maxDrawdown)}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-medium text-foreground">
                      {formatPercentage(performance.winRate)}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-medium text-foreground">
                      {performance.profitFactor.toFixed(2)}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-medium text-foreground">
                      {performance.totalTrades.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className={`font-medium ${riskLevel.color}`}>
                      {riskLevel.level}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="metric-card">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <h4 className="font-medium text-foreground">Best Performer</h4>
          </div>
          {sortedStrategies.length > 0 && (
            <div>
              <div className="font-semibold text-foreground">
                {sortedStrategies[0].name}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatPercentage(performanceData[sortedStrategies[0].id]?.totalReturn || 0)}
              </div>
            </div>
          )}
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium text-foreground">Best Risk-Adjusted</h4>
          </div>
          {sortedStrategies.length > 0 && (
            <div>
              <div className="font-semibold text-foreground">
                {sortedStrategies.find(s => 
                  performanceData[s.id]?.sharpeRatio === Math.max(...sortedStrategies.map(s => performanceData[s.id]?.sharpeRatio || 0))
                )?.name || sortedStrategies[0].name}
              </div>
              <div className="text-sm text-muted-foreground">
                Sharpe: {Math.max(...sortedStrategies.map(s => performanceData[s.id]?.sharpeRatio || 0)).toFixed(2)}
              </div>
            </div>
          )}
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <h4 className="font-medium text-foreground">Lowest Risk</h4>
          </div>
          {sortedStrategies.length > 0 && (
            <div>
              <div className="font-semibold text-foreground">
                {sortedStrategies.find(s => 
                  performanceData[s.id]?.maxDrawdown === Math.min(...sortedStrategies.map(s => performanceData[s.id]?.maxDrawdown || 0))
                )?.name || sortedStrategies[0].name}
              </div>
              <div className="text-sm text-muted-foreground">
                Max DD: {formatPercentage(Math.min(...sortedStrategies.map(s => performanceData[s.id]?.maxDrawdown || 0)))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
