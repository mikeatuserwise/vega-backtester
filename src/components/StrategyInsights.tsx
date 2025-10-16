'use client'

import { Target, AlertTriangle, Lightbulb, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface StrategyInsightsProps {
  backtestResults: any
  selectedStrategy: string | null
  capital: number
}

interface InsightCard {
  type: 'capital' | 'risk' | 'action' | 'performance'
  icon: React.ReactNode
  title: string
  content: string
  color: string
}

export function StrategyInsights({ backtestResults, selectedStrategy, capital }: StrategyInsightsProps) {
  if (!backtestResults || !backtestResults.results) return null

  const results = backtestResults.results
  const strategies = Object.keys(results)
  
  // If a specific strategy is selected, analyze that one
  const analysisData = selectedStrategy && results[selectedStrategy] 
    ? { [selectedStrategy]: results[selectedStrategy] }
    : results

  const generateInsights = (): InsightCard[] => {
    const insights: InsightCard[] = []
    
    if (selectedStrategy && results[selectedStrategy]) {
      // Single strategy analysis
      const strategy = results[selectedStrategy]
      const strategyName = strategy.strategyName || selectedStrategy
      const totalReturn = strategy.performance?.totalReturn || 0
      const maxDrawdown = strategy.performance?.maxDrawdown || 0
      const winRate = strategy.performance?.winRate || 0
      const sharpeRatio = strategy.performance?.sharpeRatio || 0
      const totalTrades = strategy.performance?.totalTrades || 0
      
      // Capital Allocation Recommendation
      if (totalReturn > 0) {
        const returnPercent = (totalReturn / capital) * 100
        const drawdownPercent = Math.abs(maxDrawdown / capital) * 100
        
        if (strategyName.toLowerCase().includes('momentum')) {
          insights.push({
            type: 'capital',
            icon: <Target className="h-5 w-5" />,
            title: '🎯 Capital Allocation Recommendation',
            content: `${strategyName} shows ${returnPercent.toFixed(1)}% return but ${drawdownPercent.toFixed(1)}% max drawdown. Consider reducing position size from current settings or tightening stops to improve risk-adjusted returns.`,
            color: 'border-blue-200 bg-blue-50'
          })
        } else if (strategyName.toLowerCase().includes('scalp')) {
          insights.push({
            type: 'capital',
            icon: <Target className="h-5 w-5" />,
            title: '🎯 Capital Allocation Recommendation',
            content: `${strategyName} shows higher consistency (${winRate.toFixed(1)}% win rate) but lower return. Consider using as "base income strategy" while adding higher-return strategies as "satellite boosters."`,
            color: 'border-green-200 bg-green-50'
          })
        }
      }
      
      // Risk Analysis
      if (maxDrawdown < 0) {
        const drawdownAmount = Math.abs(maxDrawdown)
        const drawdownPercent = (drawdownAmount / capital) * 100
        
        if (drawdownPercent > 5) {
          insights.push({
            type: 'risk',
            icon: <AlertTriangle className="h-5 w-5" />,
            title: '⚠️ Risk Note',
            content: `${strategyName} had a -${drawdownPercent.toFixed(1)}% drawdown ($${drawdownAmount.toLocaleString()}) which on $${capital.toLocaleString()} = -$${(drawdownAmount).toLocaleString()} in one session → psychologically challenging for most traders.`,
            color: 'border-red-200 bg-red-50'
          })
        }
      }
      
      // Performance Insights
      if (sharpeRatio > 0) {
        if (sharpeRatio < 1.0) {
          insights.push({
            type: 'performance',
            icon: <TrendingDown className="h-5 w-5" />,
            title: '📊 Performance Analysis',
            content: `Sharpe ratio of ${sharpeRatio.toFixed(2)} indicates moderate risk-adjusted returns. Consider optimizing entry conditions or reducing trade frequency to improve consistency.`,
            color: 'border-yellow-200 bg-yellow-50'
          })
        } else if (sharpeRatio > 2.0) {
          insights.push({
            type: 'performance',
            icon: <TrendingUp className="h-5 w-5" />,
            title: '📊 Performance Analysis',
            content: `Excellent Sharpe ratio of ${sharpeRatio.toFixed(2)}! This strategy shows strong risk-adjusted performance. Consider scaling up position size gradually.`,
            color: 'border-green-200 bg-green-50'
          })
        }
      }
      
      // Actionable Next Steps
      if (strategyName.toLowerCase().includes('momentum')) {
        insights.push({
          type: 'action',
          icon: <Lightbulb className="h-5 w-5" />,
          title: '🤖 Suggested Next Step',
          content: `Run a sensitivity analysis: What happens to ${strategyName} Sharpe if you reduce stop loss by 20% or limit to only top 5 liquid tickers? Test with tighter risk management.`,
          color: 'border-purple-200 bg-purple-50'
        })
      } else if (strategyName.toLowerCase().includes('scalp')) {
        insights.push({
          type: 'action',
          icon: <Lightbulb className="h-5 w-5" />,
          title: '🤖 Suggested Next Step',
          content: `Optimize ${strategyName}: Test reducing max trades per symbol or tightening spread filters. Consider increasing position size slightly if win rate remains above 60%.`,
          color: 'border-purple-200 bg-purple-50'
        })
      }
      
    } else {
      // Multi-strategy analysis
      const strategyNames = Object.keys(results)
      const totalReturn = Object.values(results).reduce((sum: number, result: any) => sum + (result.performance?.totalReturn || 0), 0)
      const bestStrategy = Object.entries(results).reduce((best, [name, result]: [string, any]) => {
        const returnPercent = (result.performance?.totalReturn || 0) / capital * 100
        const bestReturn = (best.performance?.totalReturn || 0) / capital * 100
        return returnPercent > bestReturn ? { name, ...result } : best
      }, { name: '', performance: { totalReturn: 0 } })
      
      // Portfolio Allocation
      insights.push({
        type: 'capital',
        icon: <DollarSign className="h-5 w-5" />,
        title: '🎯 Portfolio Allocation Recommendation',
        content: `Best performer: ${bestStrategy.name} with ${((bestStrategy.performance?.totalReturn || 0) / capital * 100).toFixed(1)}% return. Consider allocating 60% to top performer, 30% to consistent strategies, 10% to experimental.`,
        color: 'border-blue-200 bg-blue-50'
      })
      
      // Risk Management
      const maxDrawdowns = Object.values(results).map((result: any) => Math.abs(result.performance?.maxDrawdown || 0))
      const maxDrawdown = Math.max(...maxDrawdowns)
      
      if (maxDrawdown > capital * 0.05) {
        insights.push({
          type: 'risk',
          icon: <AlertTriangle className="h-5 w-5" />,
          title: '⚠️ Portfolio Risk Note',
          content: `Maximum drawdown across all strategies: $${maxDrawdown.toLocaleString()} (${(maxDrawdown/capital*100).toFixed(1)}%). Consider diversifying across uncorrelated strategies or reducing position sizes.`,
          color: 'border-red-200 bg-red-50'
        })
      }
      
      // Next Steps
      insights.push({
        type: 'action',
        icon: <Lightbulb className="h-5 w-5" />,
        title: '🤖 Suggested Next Step',
        content: `Run correlation analysis between strategies. If strategies are highly correlated, consider adding mean-reversion or different time-frame strategies for better diversification.`,
        color: 'border-purple-200 bg-purple-50'
      })
    }
    
    return insights
  }

  const insights = generateInsights()

  if (insights.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Lightbulb className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Actionable Insights</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 ${insight.color} transition-all duration-200 hover:shadow-md`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {insight.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {insight.title}
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {insight.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
