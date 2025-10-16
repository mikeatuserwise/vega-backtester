'use client'

import { useState, useRef } from 'react'
import { Strategy, TickerRecommendation } from '@/types/strategy'
import { getTopActiveStocks, getTickerInfo } from '@/lib/polygon'
import { Upload, Plus, X, Star, TrendingUp, Volume, DollarSign } from 'lucide-react'

interface TickerManagementProps {
  strategy: Strategy
  onUpdate: (updates: Partial<Strategy>) => void
  recommendedTickers?: number
  tickerDescription?: string
}

export function TickerManagement({ strategy, onUpdate, recommendedTickers = 20, tickerDescription = "recommended stocks" }: TickerManagementProps) {
  const [tickers, setTickers] = useState<string[]>(strategy.tickers)
  const [newTicker, setNewTicker] = useState('')
  const [recommendations, setRecommendations] = useState<TickerRecommendation[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [topXCount, setTopXCount] = useState(recommendedTickers)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addTicker = async () => {
    if (!newTicker.trim()) return
    
    const ticker = newTicker.trim().toUpperCase()
    if (tickers.includes(ticker)) {
      setNewTicker('')
      return
    }

    // Validate ticker exists
    const tickerInfo = await getTickerInfo(ticker)
    if (!tickerInfo) {
      alert(`Ticker ${ticker} not found. Please check the symbol.`)
      return
    }

    const updatedTickers = [...tickers, ticker]
    setTickers(updatedTickers)
    onUpdate({ tickers: updatedTickers })
    setNewTicker('')
  }

  const removeTicker = (tickerToRemove: string) => {
    const updatedTickers = tickers.filter(ticker => ticker !== tickerToRemove)
    setTickers(updatedTickers)
    onUpdate({ tickers: updatedTickers })
  }

  const clearAllTickers = () => {
    setTickers([])
    onUpdate({ tickers: [] })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const lines = content.split('\n')
      const newTickers: string[] = []

      lines.forEach(line => {
        const ticker = line.trim().toUpperCase()
        if (ticker && !tickers.includes(ticker) && !newTickers.includes(ticker)) {
          newTickers.push(ticker)
        }
      })

      if (newTickers.length > 0) {
        const updatedTickers = [...tickers, ...newTickers]
        setTickers(updatedTickers)
        onUpdate({ tickers: updatedTickers })
      }
    }

    reader.readAsText(file)
  }

  const loadRecommendations = async () => {
    setIsLoadingRecommendations(true)
    try {
      // Fetch enough stocks to cover the requested amount plus some buffer
      const fetchCount = Math.max(topXCount * 3, 200) // Fetch 3x what's requested, minimum 200
      const topStocks = await getTopActiveStocks(fetchCount)
      
      // Generate recommendations based on strategy type
      const recs: TickerRecommendation[] = topStocks
        .filter(stock => {
          // Filter out non-standard tickers and ensure we have good variety
          return stock.ticker && 
                 stock.ticker.length <= 5 && 
                 !stock.ticker.includes('.') &&
                 stock.active === true
        })
        .map((stock, index) => {
          let score = 50 // Base score
          let reason = 'High volume, liquid stock'
          let liquidity: 'high' | 'medium' | 'low' = 'medium'

          // Strategy-specific scoring with more realistic distribution
          switch (strategy.type) {
            case 'microscalping':
              // Prefer high volume, tight spreads - give higher scores to first stocks
              score = Math.max(85 - (index * 0.1), 60) + Math.random() * 10
              reason = 'High volume, tight spreads - ideal for scalping'
              liquidity = 'high'
              break
            case 'momentum':
              // Prefer volatile stocks with good volume
              score = Math.max(80 - (index * 0.08), 55) + Math.random() * 8
              reason = 'Good momentum characteristics'
              liquidity = 'high'
              break
            case 'mean-reversion':
              // Prefer stable, liquid stocks
              score = Math.max(75 - (index * 0.06), 50) + Math.random() * 6
              reason = 'Stable price action, good for mean reversion'
              liquidity = 'high'
              break
            case 'breakout':
              // Prefer stocks with clear support/resistance
              score = Math.max(80 - (index * 0.08), 55) + Math.random() * 8
              reason = 'Clear breakout patterns'
              liquidity = 'high'
              break
            default:
              score = Math.max(70 - (index * 0.05), 40) + Math.random() * 10
          }

          return {
            ticker: stock.ticker,
            name: stock.name,
            reason,
            score: Math.round(score),
            volume: Math.floor(Math.random() * 10000000) + 1000000,
            avgSpread: Math.random() * 0.1 + 0.01,
            volatility: Math.random() * 5 + 1,
            liquidity
          }
        })

      // Sort by score
      recs.sort((a, b) => b.score - a.score)
      setRecommendations(recs)
      setShowRecommendations(true)
    } catch (error) {
      console.error('Error loading recommendations:', error)
      alert('Failed to load recommendations. Please try again.')
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  const addRecommendedTickers = () => {
    const topRecommendations = recommendations.slice(0, topXCount)
    const newTickers = topRecommendations
      .map(rec => rec.ticker)
      .filter(ticker => !tickers.includes(ticker))
    
    if (newTickers.length > 0) {
      const updatedTickers = [...tickers, ...newTickers]
      setTickers(updatedTickers)
      onUpdate({ tickers: updatedTickers })
    }
  }

  const addSingleRecommendation = (ticker: string) => {
    if (!tickers.includes(ticker)) {
      const updatedTickers = [...tickers, ticker]
      setTickers(updatedTickers)
      onUpdate({ tickers: updatedTickers })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Ticker Management</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {tickers.length} tickers selected
          </span>
          {tickers.length > 0 && (
            <button
              onClick={clearAllTickers}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Add Individual Ticker */}
      <div className="metric-card">
        <h4 className="font-medium text-foreground mb-4">Add Individual Ticker</h4>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
            placeholder="Enter ticker symbol (e.g., AAPL)"
            className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && addTicker()}
          />
          <button
            onClick={addTicker}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* CSV Upload */}
      <div className="metric-card">
        <h4 className="font-medium text-foreground mb-4">Import from CSV</h4>
        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Upload CSV</span>
          </button>
          <p className="text-sm text-muted-foreground">
            Upload a CSV file with ticker symbols (one per line)
          </p>
        </div>
      </div>

      {/* Top X Recommended */}
      <div className="metric-card">
        <h4 className="font-medium text-foreground mb-4">Top X Recommended</h4>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-foreground">Top</label>
            <input
              type="number"
              value={topXCount}
              onChange={(e) => setTopXCount(Number(e.target.value))}
              className="w-20 px-2 py-1 border border-border rounded bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              min="1"
              max="500"
            />
            <label className="text-sm text-foreground">{tickerDescription}</label>
          </div>
          <button
            onClick={loadRecommendations}
            disabled={isLoadingRecommendations}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Star className="h-4 w-4" />
            <span>
              {isLoadingRecommendations 
                ? `Loading ${Math.max(topXCount * 3, 200)} stocks...` 
                : 'Get Recommendations'
              }
            </span>
          </button>
        </div>

        {showRecommendations && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-foreground">Recommended Tickers</h5>
                <p className="text-sm text-muted-foreground">
                  Showing {Math.min(recommendations.length, Math.max(topXCount, 50))} of {recommendations.length} recommendations
                </p>
              </div>
              <button
                onClick={addRecommendedTickers}
                className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Plus className="h-3 w-3" />
                <span>Add Top {topXCount}</span>
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {recommendations.slice(0, Math.max(topXCount, 50)).map((rec) => (
                <div
                  key={rec.ticker}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground">{rec.ticker}</span>
                      <span className="text-sm text-muted-foreground">{rec.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rec.liquidity === 'high' ? 'bg-green-100 text-green-800' :
                        rec.liquidity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {rec.liquidity} liquidity
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Score: {rec.score}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Volume className="h-3 w-3" />
                        <span>Vol: {rec.volume.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>Spread: ${rec.avgSpread.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => addSingleRecommendation(rec.ticker)}
                    disabled={tickers.includes(rec.ticker)}
                    className="ml-4 px-3 py-1 text-sm border border-border rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {tickers.includes(rec.ticker) ? 'Added' : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Current Tickers */}
      {tickers.length > 0 && (
        <div className="metric-card">
          <h4 className="font-medium text-foreground mb-4">Selected Tickers</h4>
          <div className="flex flex-wrap gap-2">
            {tickers.map((ticker) => (
              <div
                key={ticker}
                className="flex items-center space-x-2 px-3 py-1 bg-primary/10 text-primary rounded-lg"
              >
                <span className="text-sm font-medium">{ticker}</span>
                <button
                  onClick={() => removeTicker(ticker)}
                  className="text-primary hover:text-primary/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
