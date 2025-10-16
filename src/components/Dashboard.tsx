'use client'

import { useState } from 'react'
import { Strategy } from '@/types/strategy'
import { StrategyComparison } from './StrategyComparison'
import { MetricsOverview } from './MetricsOverview'
import { ChartSection } from './ChartSection'
import { PerformanceTable } from './PerformanceTable'
import { StrategyInsights } from './StrategyInsights'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'results'>('dashboard')
  const [capital, setCapital] = useState(50000)
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const [backtestMode, setBacktestMode] = useState<'single' | 'multi'>('multi')
  const [singleSessionDate, setSingleSessionDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0] // Today
  })
  const [backtestStartDate, setBacktestStartDate] = useState<string>(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30) // Default to 30 days ago
    return date.toISOString().split('T')[0]
  })
  const [backtestEndDate, setBacktestEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0] // Today
  })
  const [isRunningBacktest, setIsRunningBacktest] = useState(false)
  const [backtestResults, setBacktestResults] = useState<any>(null)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const runBacktest = async () => {
    setIsRunningBacktest(true)
    setBacktestResults(null)

    try {
      // Import the backtesting engine
      const { BacktestingEngine } = await import('@/lib/backtesting')
      
      // Determine date range based on mode
      const startDate = backtestMode === 'single' ? singleSessionDate : backtestStartDate
      const endDate = backtestMode === 'single' ? singleSessionDate : backtestEndDate
      
      // Create backtesting engine with current parameters
      const engine = new BacktestingEngine(
        capital,
        strategies,
        new Date(startDate),
        new Date(endDate),
        backtestMode
      )

      // Run the actual backtest
      const results = await engine.runBacktest()

      // Store results and switch to results tab
      setBacktestResults({
        mode: backtestMode,
        startDate: startDate,
        endDate: endDate,
        strategies: strategies.length,
        capital: capital,
        completed: true,
        results: results
      })
      
      // Automatically switch to results tab
      setActiveTab('results')

    } catch (error) {
      console.error('Backtest failed:', error)
      // Fallback to mock results if backtest fails
      setBacktestResults({
        startDate: backtestStartDate,
        endDate: backtestEndDate,
        strategies: strategies.length,
        capital: capital,
        completed: true,
        error: 'Backtest failed - using mock data'
      })
    }

    setIsRunningBacktest(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              VEGA Trading Strategy Backtester
            </h2>
            <p className="text-muted-foreground">
              Test and compare day trading strategies with real market data
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {backtestResults && (
              <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                ✓ Analysis completed {backtestResults.strategies > 0 ? `for ${backtestResults.strategies} strategies` : 'with current parameters'}
              </div>
            )}
              <button
                onClick={runBacktest}
                disabled={isRunningBacktest}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isRunningBacktest
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:scale-105'
                }`}
              >
              {isRunningBacktest ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Calculating...</span>
                </div>
              ) : (
                <span>Analyze</span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
                <span>Dashboard</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('results')}
              disabled={!backtestResults}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'results'
                  ? 'border-blue-500 text-blue-600'
                  : backtestResults
                    ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    : 'border-transparent text-gray-300 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Results</span>
                {backtestResults && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                    Ready
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Backtest Progress Indicator */}
      {isRunningBacktest && (
        <div className="mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <div>
                <p className="text-sm font-medium text-blue-900">Running backtest analysis...</p>
                  <p className="text-xs text-blue-700">
                    {backtestMode === 'single' 
                      ? `Analyzing ${strategies.length > 0 ? `${strategies.length} strategies` : 'current parameters'} for single session on ${singleSessionDate}`
                      : `Analyzing ${strategies.length > 0 ? `${strategies.length} strategies` : 'current parameters'} from ${backtestStartDate} to ${backtestEndDate}`
                    }
                  </p>
              </div>
            </div>
            <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Tab Content */}
      {activeTab === 'dashboard' && (
        <>
        {/* Trading Configuration Card */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Setup Your Test</h3>
                <p className="text-sm text-gray-600">Choose your investment amount and test dates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Capital Input Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-green-100 rounded-md">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">How much to invest?</h4>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-lg font-medium">$</span>
                  </div>
                  <input
                    type="number"
                    value={capital}
                    onChange={(e) => setCapital(Number(e.target.value))}
                    className="block w-full pl-8 pr-4 py-4 text-2xl font-bold text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="50000"
                    min="1000"
                    step="1000"
                  />
                </div>
                
                {/* Capital Quick Presets */}
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Quick amounts:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: '$10K', value: 10000 },
                      { label: '$25K', value: 25000 },
                      { label: '$50K', value: 50000 },
                      { label: '$100K', value: 100000 },
                      { label: '$250K', value: 250000 },
                      { label: '$500K', value: 500000 }
                    ].map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => setCapital(preset.value)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                          capital === preset.value
                            ? 'bg-green-600 text-white shadow-md transform scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  Initial capital for backtesting your strategies
                </p>
              </div>

              {/* Dual-Mode Date Picker Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-purple-100 rounded-md">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Dates to backtest</h4>
                  </div>
                </div>

                {/* Mode Toggle */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="single-mode"
                      name="backtest-mode"
                      checked={backtestMode === 'single'}
                      onChange={() => setBacktestMode('single')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="single-mode" className="text-sm font-medium text-gray-700">
                      Single day test
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="multi-mode"
                      name="backtest-mode"
                      checked={backtestMode === 'multi'}
                      onChange={() => setBacktestMode('multi')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="multi-mode" className="text-sm font-medium text-gray-700">
                      Date range test
                    </label>
                  </div>
                </div>

                {/* Single Session Mode */}
                {backtestMode === 'single' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Session Date (9:30 AM - 4:00 PM)
                      </label>
                      <input
                        type="date"
                        value={singleSessionDate}
                        onChange={(e) => setSingleSessionDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded-md">
                      💡 Single session mode shows detailed trade-by-trade analysis for debugging and trade replay
                    </div>
                  </div>
                )}

                {/* Multi-Session Mode */}
                {backtestMode === 'multi' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Date Range</span>
                      {/* Date Quick Presets */}
                      <div className="flex items-center space-x-1">
                        {[
                          { label: 'Yesterday', days: 1 },
                          { label: '1W', days: 7 },
                          { label: '1M', days: 30 },
                          { label: '3M', days: 90 },
                          { label: '6M', days: 180 },
                          { label: '1Y', days: 365 }
                        ].map((preset) => {
                          const isActive = activePreset === preset.label
                          return (
                            <button
                              key={preset.label}
                              onClick={() => {
                                const endDate = new Date()
                                const startDate = new Date()
                                startDate.setDate(startDate.getDate() - preset.days)
                                setBacktestStartDate(startDate.toISOString().split('T')[0])
                                setBacktestEndDate(endDate.toISOString().split('T')[0])
                                setActivePreset(preset.label)
                              }}
                              className={`px-2 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                                isActive
                                  ? 'bg-purple-600 text-white shadow-md transform scale-105'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                              }`}
                            >
                              {preset.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={backtestStartDate}
                          onChange={(e) => {
                            setBacktestStartDate(e.target.value)
                            setActivePreset(null)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          max={backtestEndDate}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={backtestEndDate}
                          onChange={(e) => {
                            setBacktestEndDate(e.target.value)
                            setActivePreset(null)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          min={backtestStartDate}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 bg-green-50 p-2 rounded-md">
                      📊 Multi-session mode provides aggregated performance stats: avg P&L/day, worst day, win streaks, etc.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


      {/* Strategy Comparison */}
      <div className="mb-8">
        <StrategyComparison 
          capital={capital}
          onStrategiesChange={setStrategies}
        />
      </div>
        </>
      )}

      {/* Results Tab Content */}
      {activeTab === 'results' && backtestResults && (
        <div className="space-y-8">
          {/* Results Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Backtest Results
                </h2>
                <p className="text-gray-600">
                  {backtestResults.mode === 'single' 
                    ? `Single session analysis for ${backtestResults.startDate}`
                    : `Multi-session analysis from ${backtestResults.startDate} to ${backtestResults.endDate}`
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Capital</div>
                <div className="text-2xl font-bold text-green-600">
                  ${backtestResults.capital.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Strategy Selector */}
          {strategies.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Strategy for Detailed View</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedStrategy(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    !selectedStrategy
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Strategies
                </button>
                {strategies.map((strategy) => {
                  const result = backtestResults.results?.find((r: any) => r.strategyId === strategy.id)
                  const returnPercent = result?.performance?.totalReturn || 0
                  return (
                    <button
                      key={strategy.id}
                      onClick={() => setSelectedStrategy(strategy.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedStrategy === strategy.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{strategy.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          returnPercent >= 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {returnPercent >= 0 ? '+' : ''}{returnPercent.toFixed(1)}%
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Performance Comparison Table */}
          <div className="mb-8">
            <PerformanceTable 
              strategies={strategies} 
              capital={capital}
              backtestStartDate={backtestStartDate}
              backtestEndDate={backtestEndDate}
              backtestResults={backtestResults}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSection 
              selectedStrategy={selectedStrategy}
              strategies={strategies}
              capital={capital}
              backtestStartDate={backtestStartDate}
              backtestEndDate={backtestEndDate}
              backtestResults={backtestResults}
            />
            <MetricsOverview 
              strategies={strategies}
              capital={capital}
              backtestStartDate={backtestStartDate}
              backtestEndDate={backtestEndDate}
              backtestResults={backtestResults}
              selectedStrategy={selectedStrategy}
            />
          </div>
          
          {/* Strategy Insights */}
          <StrategyInsights 
            backtestResults={backtestResults}
            selectedStrategy={selectedStrategy}
            capital={capital}
          />
        </div>
      )}

      {/* No Results State */}
      {activeTab === 'results' && !backtestResults && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-xl p-8">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Yet</h3>
            <p className="text-gray-600 mb-4">
              Run an analysis from the Dashboard tab to see your backtest results here.
            </p>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
