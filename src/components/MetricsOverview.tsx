'use client'

import { DollarSign, TrendingUp, AlertTriangle, Clock } from 'lucide-react'
import { Strategy } from '@/types/strategy'

interface MetricsOverviewProps {
  strategies: Strategy[]
  capital: number
  backtestStartDate: string
  backtestEndDate: string
  backtestResults?: any
  selectedStrategy?: string | null
}

export function MetricsOverview({ strategies, capital, backtestStartDate, backtestEndDate, backtestResults, selectedStrategy }: MetricsOverviewProps) {
  // Calculate metrics based on actual backtest results
  const calculateMetrics = () => {
    if (!backtestResults?.results || !Array.isArray(backtestResults.results)) {
      return {
        totalPnL: 0,
        totalPnLPercent: 0,
        activeStrategies: strategies.length,
        avgWinRate: 0,
        maxDrawdown: 0,
        bestStrategy: null,
        worstStrategy: null,
        selectedStrategyData: null
      }
    }

    const results = backtestResults.results
    
    // If a specific strategy is selected, show data for that strategy only
    if (selectedStrategy) {
      const selectedResult = results.find((r: any) => r.strategyId === selectedStrategy)
      if (selectedResult) {
        const totalPnL = (selectedResult.performance?.totalReturn || 0) * capital / 100
        const totalPnLPercent = selectedResult.performance?.totalReturn || 0
        const winRate = selectedResult.performance?.winRate || 0
        const maxDrawdown = selectedResult.performance?.maxDrawdown || 0
        const totalTrades = selectedResult.performance?.totalTrades || 0
        const profitFactor = selectedResult.performance?.profitFactor || 0
        
        return {
          totalPnL,
          totalPnLPercent,
          activeStrategies: 1,
          avgWinRate: winRate,
          maxDrawdown,
          bestStrategy: selectedResult,
          worstStrategy: selectedResult,
          selectedStrategyData: {
            name: strategies.find(s => s.id === selectedStrategy)?.name || 'Selected Strategy',
            totalTrades,
            profitFactor,
            sharpeRatio: selectedResult.performance?.sharpeRatio || 0
          }
        }
      }
    }
    
    // Otherwise, show aggregate data across all strategies
    const totalPnL = results.reduce((sum: number, result: any) => sum + (result.performance?.totalReturn || 0) * capital / 100, 0)
    const totalPnLPercent = (totalPnL / capital) * 100
    const avgWinRate = results.reduce((sum: number, result: any) => sum + (result.performance?.winRate || 0), 0) / results.length
    const maxDrawdown = Math.max(...results.map((result: any) => result.performance?.maxDrawdown || 0))
    
    const bestStrategy = results.reduce((best: any, current: any) => 
      (current.performance?.totalReturn || 0) > (best.performance?.totalReturn || 0) ? current : best
    )
    const worstStrategy = results.reduce((worst: any, current: any) => 
      (current.performance?.totalReturn || 0) < (worst.performance?.totalReturn || 0) ? current : worst
    )

    return {
      totalPnL,
      totalPnLPercent,
      activeStrategies: strategies.length,
      avgWinRate,
      maxDrawdown,
      bestStrategy,
      worstStrategy,
      selectedStrategyData: null
    }
  }

  const metricsData = calculateMetrics()

  const metrics = selectedStrategy && metricsData.selectedStrategyData ? [
    // Strategy-specific metrics
    {
      title: 'Strategy P&L',
      value: `${metricsData.totalPnL >= 0 ? '+' : ''}$${metricsData.totalPnL.toLocaleString()}`,
      change: `${metricsData.totalPnLPercent >= 0 ? '+' : ''}${metricsData.totalPnLPercent.toFixed(1)}%`,
      icon: DollarSign,
      trend: metricsData.totalPnL >= 0 ? 'up' : 'down'
    },
    {
      title: 'Win Rate',
      value: `${metricsData.avgWinRate.toFixed(1)}%`,
      change: `${metricsData.selectedStrategyData.totalTrades} total trades`,
      icon: TrendingUp,
      trend: metricsData.avgWinRate > 50 ? 'up' : metricsData.avgWinRate > 40 ? 'neutral' : 'down'
    },
    {
      title: 'Max Drawdown',
      value: `${metricsData.maxDrawdown.toFixed(1)}%`,
      change: metricsData.maxDrawdown < 10 ? 'Low risk' : metricsData.maxDrawdown < 20 ? 'Medium risk' : 'High risk',
      icon: AlertTriangle,
      trend: metricsData.maxDrawdown < 10 ? 'up' : metricsData.maxDrawdown < 20 ? 'neutral' : 'down'
    },
    {
      title: 'Profit Factor',
      value: metricsData.selectedStrategyData.profitFactor.toFixed(2),
      change: `Sharpe: ${metricsData.selectedStrategyData.sharpeRatio.toFixed(2)}`,
      icon: Clock,
      trend: metricsData.selectedStrategyData.profitFactor > 1.5 ? 'up' : metricsData.selectedStrategyData.profitFactor > 1.0 ? 'neutral' : 'down'
    }
  ] : [
    // Aggregate metrics across all strategies
    {
      title: 'Total P&L',
      value: `${metricsData.totalPnL >= 0 ? '+' : ''}$${metricsData.totalPnL.toLocaleString()}`,
      change: `${metricsData.totalPnLPercent >= 0 ? '+' : ''}${metricsData.totalPnLPercent.toFixed(1)}%`,
      icon: DollarSign,
      trend: metricsData.totalPnL >= 0 ? 'up' : 'down'
    },
    {
      title: 'Active Strategies',
      value: metricsData.activeStrategies.toString(),
      change: `${metricsData.avgWinRate.toFixed(1)}% avg win rate`,
      icon: TrendingUp,
      trend: 'neutral'
    },
    {
      title: 'Max Drawdown',
      value: `${metricsData.maxDrawdown.toFixed(1)}%`,
      change: metricsData.maxDrawdown < 10 ? 'Low risk' : metricsData.maxDrawdown < 20 ? 'Medium risk' : 'High risk',
      icon: AlertTriangle,
      trend: metricsData.maxDrawdown < 10 ? 'up' : metricsData.maxDrawdown < 20 ? 'neutral' : 'down'
    },
    {
      title: 'Best Performer',
      value: metricsData.bestStrategy ? strategies.find(s => s.id === metricsData.bestStrategy.strategyId)?.name || 'Unknown' : 'N/A',
      change: metricsData.bestStrategy ? `+${metricsData.bestStrategy.performance?.totalReturn?.toFixed(1)}%` : '',
      icon: Clock,
      trend: 'up'
    }
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {selectedStrategy && metricsData.selectedStrategyData 
          ? `Key Metrics - ${metricsData.selectedStrategyData.name}`
          : 'Key Metrics - All Strategies'
        }
      </h3>
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <div key={index} className="metric-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {metric.value}
                  </p>
                </div>
              </div>
              <div className={`text-sm font-medium ${
                metric.trend === 'up' ? 'text-green-600' :
                metric.trend === 'down' ? 'text-red-600' :
                'text-muted-foreground'
              }`}>
                {metric.change}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
