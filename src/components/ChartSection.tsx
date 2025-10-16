'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Strategy } from '@/types/strategy'

interface ChartSectionProps {
  selectedStrategy: string | null
  strategies: Strategy[]
  capital: number
  backtestStartDate: string
  backtestEndDate: string
  backtestResults?: any
}

export function ChartSection({ selectedStrategy, strategies, capital, backtestStartDate, backtestEndDate, backtestResults }: ChartSectionProps) {
  // Deterministic random number generator using seed
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  // Generate chart data - use real backtest results if available, otherwise fallback to mock data
  const generateChartData = () => {
    // If we have real backtest results, use the equity curve
    if (backtestResults?.results && Array.isArray(backtestResults.results)) {
      const selectedResult = selectedStrategy 
        ? backtestResults.results.find((r: any) => r.strategyId === selectedStrategy)
        : backtestResults.results[0] // Use first result if no strategy selected
      
      if (selectedResult?.equityCurve) {
        return selectedResult.equityCurve.map((point: any) => ({
          date: point.date,
          pnl: point.equity - capital, // Daily P&L
          cumulative: point.equity - capital // Cumulative P&L
        }))
      }
    }
    
    // Fallback to mock data with consistent seeding
    const startDate = new Date(backtestStartDate)
    const endDate = new Date(backtestEndDate)
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Create consistent seed based on date range and capital
    const seedBase = `${backtestStartDate}-${backtestEndDate}-${capital}`
    
    const data = []
    let cumulative = 0
    
    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      
      // Generate consistent P&L for each day using seeded random
      const dailyPnL = (seededRandom(seedBase.charCodeAt(i % seedBase.length) + i) * 400 - 200) // -$200 to +$200
      cumulative += dailyPnL
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        pnl: Number(dailyPnL.toFixed(2)),
        cumulative: Number(cumulative.toFixed(2))
      })
    }
    
    return data
  }

  const chartData = generateChartData()

  // Get selected strategy details
  const selectedStrategyData = selectedStrategy ? strategies.find(s => s.id === selectedStrategy) : null
  const selectedResult = selectedStrategy && backtestResults?.results 
    ? backtestResults.results.find((r: any) => r.strategyId === selectedStrategy)
    : null

  return (
    <div className="metric-card">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground">
            Performance Chart
          </h3>
          {selectedResult && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Return</div>
              <div className={`text-lg font-bold ${selectedResult.performance?.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {selectedResult.performance?.totalReturn >= 0 ? '+' : ''}{selectedResult.performance?.totalReturn?.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {selectedStrategy 
            ? `Showing results for: ${selectedStrategyData?.name || selectedStrategy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`
            : strategies.length > 0 
              ? 'Select a strategy to view detailed performance'
              : 'Showing analysis for current parameters and date range'
          }
        </p>
        {selectedStrategyData && (
          <div className="mt-3 flex items-center space-x-4 text-xs text-gray-600">
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{selectedStrategyData.tickers.length} tickers</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{selectedStrategyData.parameters.maxDailyTrades} max trades/day</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>{selectedStrategyData.parameters.stopLoss}% stop loss</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>{selectedStrategyData.parameters.takeProfit}% take profit</span>
            </span>
          </div>
        )}
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: number) => [`$${value}`, 'Cumulative P&L']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="cumulative" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
