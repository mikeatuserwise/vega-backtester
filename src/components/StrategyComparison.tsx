'use client'

import { useState, useEffect } from 'react'
import { Strategy, StrategyType } from '@/types/strategy'
import { StrategyParametersModal } from './StrategyParametersModal'
import { Plus, Settings } from 'lucide-react'

interface StrategyComparisonProps {
  capital: number
  onStrategiesChange: (strategies: Strategy[]) => void
}

const STRATEGY_OPTIONS = [
  { 
    type: 'microscalping' as StrategyType, 
    name: 'Micro Scalping', 
    description: 'Quick trades with tight spreads',
    pros: ['High win rate', 'Quick profits', 'Low market exposure'],
    cons: ['High transaction costs', 'Requires constant attention', 'Stressful'],
    riskLevel: 'Medium' as const,
    profitPotential: 'Medium' as const,
    recommendedTickers: 50,
    tickerDescription: 'High-volume, liquid stocks with tight spreads'
  },
  { 
    type: 'momentum' as StrategyType, 
    name: 'Momentum Trading', 
    description: 'Ride price momentum with volume',
    pros: ['High profit potential', 'Clear entry signals', 'Trend following'],
    cons: ['Late entries', 'Whipsaw losses', 'Requires discipline'],
    riskLevel: 'High' as const,
    profitPotential: 'High' as const,
    recommendedTickers: 15,
    tickerDescription: 'Volatile stocks with strong directional movement'
  },
  { 
    type: 'mean-reversion' as StrategyType, 
    name: 'Mean Reversion', 
    description: 'Trade against overextended moves',
    pros: ['Contrarian approach', 'Good in ranging markets', 'Lower risk'],
    cons: ['Can be early', 'Requires patience', 'Limited in trends'],
    riskLevel: 'Low' as const,
    profitPotential: 'Medium' as const,
    recommendedTickers: 8,
    tickerDescription: 'Stable stocks with predictable swing patterns'
  },
  { 
    type: 'breakout' as StrategyType, 
    name: 'Breakout Trading', 
    description: 'Trade breakouts with volume confirmation',
    pros: ['High reward potential', 'Clear setups', 'Trend continuation'],
    cons: ['False breakouts', 'High volatility', 'Requires quick decisions'],
    riskLevel: 'High' as const,
    profitPotential: 'High' as const,
    recommendedTickers: 20,
    tickerDescription: 'Stocks with clear support/resistance levels'
  },
  { 
    type: 'gap-and-go' as StrategyType, 
    name: 'Gap & Go', 
    description: 'Trade gap openings with momentum',
    pros: ['High volatility', 'Clear direction', 'Quick moves'],
    cons: ['Gap fills', 'High risk', 'Requires pre-market analysis'],
    riskLevel: 'Very High' as const,
    profitPotential: 'High' as const,
    recommendedTickers: 12,
    tickerDescription: 'High-volatility stocks prone to gaps'
  },
  { 
    type: 'news-scalping' as StrategyType, 
    name: 'News Scalping', 
    description: 'Quick trades on news events',
    pros: ['Event-driven', 'High volatility', 'Quick profits'],
    cons: ['Unpredictable', 'High risk', 'Requires news access'],
    riskLevel: 'Very High' as const,
    profitPotential: 'High' as const,
    recommendedTickers: 30,
    tickerDescription: 'News-sensitive stocks with high volatility'
  }
]

export function StrategyComparison({ capital, onStrategiesChange }: StrategyComparisonProps) {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalStrategy, setModalStrategy] = useState<Strategy | null>(null)
  const [deletingStrategy, setDeletingStrategy] = useState<string | null>(null)

  const getFallbackTickers = (count: number): string[] => {
    const commonTickers = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC',
      'CRM', 'ADBE', 'PYPL', 'UBER', 'LYFT', 'ZOOM', 'SNOW', 'PLTR', 'ROKU', 'SQ',
      'SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'ARKK', 'TQQQ', 'SQQQ', 'UPRO', 'SPXL',
      'BAC', 'JPM', 'WFC', 'GS', 'MS', 'C', 'XOM', 'CVX', 'COP', 'EOG',
      'JNJ', 'PFE', 'UNH', 'ABBV', 'MRK', 'TMO', 'ABT', 'DHR', 'BMY', 'AMGN'
    ]
    return commonTickers.slice(0, count)
  }

  const getStrategyDefaults = (type: StrategyType) => {
    if (type === 'microscalping') {
      return {
        maxPositions: 2,
        positionSize: 25, // legacy field
        riskPerTrade: 150, // $150 risk per trade
        maxDailyTrades: 30,
        maxTradesPerSymbol: 8,
        stopLoss: 1.5, // legacy field
        stopLossDollar: 0.03, // $0.03 stop loss
        takeProfit: 2, // legacy field
        takeProfitDollar: 0.10, // $0.10 take profit
        maxDrawdown: 6, // legacy field
        maxDailyLoss: 500, // $500 max daily loss
        entryConditions: {
          volumeThreshold: 250000, // legacy field
          relativeVolume: 1.3, // 1.3x relative volume
          priceChangeThreshold: 0.5,
          technicalIndicators: [],
          entryTrigger: 'vwap_cross' as const,
          maxSpread: 0.02 // $0.02 max spread
        },
        exitConditions: {
          timeBasedExit: true,
          maxHoldTime: 3, // 3 minutes for scalping
          trailingStop: false,
          trailingStopPercent: 0
        },
        commissionPerTrade: 1,
        slippageBuffer: 0.15,
        tradingHours: {
          start: '09:30',
          end: '16:00'
        },
        avoidNewsMinutes: 20,
        forceExitAtSessionEnd: true // Force exit at 3:55 PM
      }
    }
    
    if (type === 'momentum') {
      return {
        maxPositions: 3,
        positionSize: 12, // 10-15% per trade (reduced from 25%)
        maxDailyTrades: 12, // 10-15 trades (selective, not spammed)
        stopLoss: 1.5, // legacy field
        stopLossATR: 1.2, // ATR multiplier for dynamic stops
        takeProfit: 2, // legacy field
        takeProfitMode: 'partial_trail' as const,
        partialTakePercent: 50, // Take 50% at 2R
        trailMethod: 'vwap' as const,
        maxDrawdown: 8, // Higher drawdown tolerance for momentum
        entryConditions: {
          volumeThreshold: 250000, // legacy field
          relativeVolume: 1.75, // 1.5-2.0x on breakout candle
          priceChangeThreshold: 0.5,
          technicalIndicators: [],
          entryTrigger: 'or_break' as const, // Break of Opening Range High
          minRangeExpansion: 0.5, // Minimum range expansion % of ATR
          maxVWAPExtension: 2.5 // Max ATR extension above VWAP
        },
        exitConditions: {
          timeBasedExit: false, // Not about fixed time exits
          maxHoldTime: 480, // Use EOD close instead
          trailingStop: true, // Default ON for momentum
          trailingStopPercent: 0.5, // 0.5 ATR pullback
          eodExit: true, // Exit at end of day
          trailMethod: 'vwap' as const
        },
        commissionPerTrade: 1,
        slippageBuffer: 0.2,
        tradingHours: {
          start: '09:30',
          end: '16:00'
        },
        avoidNewsMinutes: 30
      }
    }
    
    // Default parameters for other strategies
    return {
      maxPositions: 3,
      positionSize: 25,
      maxDailyTrades: 30,
      stopLoss: 1.5,
      takeProfit: 2,
      maxDrawdown: 6,
      entryConditions: {
        volumeThreshold: 250000,
        priceChangeThreshold: 0.5,
        technicalIndicators: []
      },
      exitConditions: {
        timeBasedExit: true,
        maxHoldTime: 15,
        trailingStop: false,
        trailingStopPercent: 0
      },
      commissionPerTrade: 1,
      slippageBuffer: 0.15,
      tradingHours: {
        start: '09:30',
        end: '16:00'
      },
      avoidNewsMinutes: 20
    }
  }

  const addStrategy = async (type: StrategyType) => {
    const strategyOption = STRATEGY_OPTIONS.find(st => st.type === type)
    const newStrategy: Strategy = {
      id: `${type}-${Date.now()}`,
      name: strategyOption?.name || type,
      description: strategyOption?.description || '',
      type,
      parameters: getStrategyDefaults(type),
      tickers: getFallbackTickers(strategyOption?.recommendedTickers || 10),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const updatedStrategies = [...strategies, newStrategy]
    setStrategies(updatedStrategies)
    onStrategiesChange(updatedStrategies)
  }

  const updateStrategy = (id: string, updates: Partial<Strategy>) => {
    const updatedStrategies = strategies.map(strategy =>
      strategy.id === id ? { ...strategy, ...updates, updatedAt: new Date() } : strategy
    )
    setStrategies(updatedStrategies)
    onStrategiesChange(updatedStrategies)
  }

  const deleteStrategy = (id: string) => {
    setDeletingStrategy(id)
    setTimeout(() => {
      const updatedStrategies = strategies.filter(strategy => strategy.id !== id)
      setStrategies(updatedStrategies)
      onStrategiesChange(updatedStrategies)
      setDeletingStrategy(null)
      if (selectedStrategy === id) {
        setSelectedStrategy(null)
      }
    }, 300)
  }

  // Initialize with default strategies
  useEffect(() => {
    const initialStrategies: Strategy[] = [
      {
        id: 'microscalping-1',
        name: 'Micro Scalping',
        description: 'Quick scalping with tight spreads and high volume',
        type: 'microscalping',
        parameters: getStrategyDefaults('microscalping'),
        tickers: getFallbackTickers(50),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'momentum-1',
        name: 'Momentum Trading',
        description: 'Ride the momentum with volume confirmation',
        type: 'momentum',
        parameters: getStrategyDefaults('momentum'),
        tickers: getFallbackTickers(15),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    setStrategies(initialStrategies)
    onStrategiesChange(initialStrategies)
  }, [])

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-50'
      case 'Medium': return 'text-yellow-600 bg-yellow-50'
      case 'High': return 'text-orange-600 bg-orange-50'
      case 'Very High': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }
  
  const getProfitColor = (profit: string) => {
    switch (profit) {
      case 'Low': return 'text-blue-600 bg-blue-50'
      case 'Medium': return 'text-purple-600 bg-purple-50'
      case 'High': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Strategies</h3>
          <div className="relative">
            <select
              onChange={async (e) => {
                if (e.target.value) {
                  await addStrategy(e.target.value as StrategyType)
                  e.target.value = ''
                }
              }}
              className="appearance-none bg-background border border-border rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Add Strategy</option>
              {STRATEGY_OPTIONS.map((option) => (
                <option key={option.type} value={option.type}>
                  {option.name}
                </option>
              ))}
            </select>
            <Plus className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strategy, index) => {
            const strategyOption = STRATEGY_OPTIONS.find(st => st.type === strategy.type)
            const isDeleting = deletingStrategy === strategy.id
            
            return (
              <div
                key={strategy.id}
                className={`group relative p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out transform ${
                  isDeleting 
                    ? 'animate-out slide-out-to-top-4 fade-out scale-95 opacity-0'
                    : 'animate-in slide-in-from-top-4 fade-in'
                } ${
                  selectedStrategy === strategy.id
                    ? 'border-primary bg-primary/5 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-primary/30 hover:shadow-md bg-white hover:scale-102'
                }`}
                style={{
                  animationDelay: isDeleting ? '0ms' : `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
                onClick={() => !isDeleting && setSelectedStrategy(strategy.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {strategy.name}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {strategy.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {strategy.tickers.length} tickers
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setModalStrategy(strategy)
                        setIsModalOpen(true)
                      }}
                      className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 transition-opacity p-1"
                      title="Configure Strategy"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isDeleting) {
                          deleteStrategy(strategy.id)
                        }
                      }}
                      disabled={isDeleting}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 ${
                        isDeleting 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-red-500 hover:text-red-700'
                      }`}
                      title={isDeleting ? "Deleting..." : "Delete Strategy"}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {strategyOption && (
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          <span className="text-xs font-medium text-gray-500">Risk</span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getRiskColor(strategyOption.riskLevel)}`}>
                            {strategyOption.riskLevel}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          <span className="text-xs font-medium text-gray-500">Profit</span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getProfitColor(strategyOption.profitPotential)}`}>
                            {strategyOption.profitPotential}
                          </span>
                        </div>
                      </div>
                      <div className={`text-xs font-medium px-3 py-1 rounded-full ${
                        strategy.isActive
                          ? 'text-green-700 bg-green-100'
                          : 'text-gray-600 bg-gray-100'
                      }`}>
                        {strategy.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        <span className="text-xs font-medium text-gray-500">Tickers</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {strategy.tickers.length} selected
                      </span>
                    </div>
                  </div>
                )}

                {strategyOption && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="font-medium text-green-700 mb-1">Key Benefits</div>
                      <div className="text-gray-600">
                        {strategyOption.pros.slice(0, 2).join(' • ')}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-red-700 mb-1">Considerations</div>
                      <div className="text-gray-600">
                        {strategyOption.cons.slice(0, 2).join(' • ')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <StrategyParametersModal
        strategy={modalStrategy}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setModalStrategy(null)
        }}
        onUpdate={(updates) => {
          if (modalStrategy) {
            updateStrategy(modalStrategy.id, updates)
          }
        }}
      />
    </div>
  )
}