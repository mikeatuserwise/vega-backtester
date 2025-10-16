'use client'

import { useState } from 'react'
import { Strategy, type StrategyParameters, StrategyType } from '@/types/strategy'
import { Sliders, Target, Clock, Shield, X } from 'lucide-react'
import { TickerManagement } from './TickerManagement'

// Strategy-specific recommendations
const strategyRecommendations: Record<StrategyType, { recommendedTickers: number; tickerDescription: string }> = {
  'microscalping': { recommendedTickers: 50, tickerDescription: 'High-volume, liquid stocks with tight spreads' },
  'momentum': { recommendedTickers: 15, tickerDescription: 'Volatile stocks with strong directional movement' },
  'mean-reversion': { recommendedTickers: 8, tickerDescription: 'Stable stocks with predictable swing patterns' },
  'breakout': { recommendedTickers: 20, tickerDescription: 'Stocks with clear support/resistance levels' },
  'gap-and-go': { recommendedTickers: 12, tickerDescription: 'High-volatility stocks prone to gaps' },
  'news-scalping': { recommendedTickers: 30, tickerDescription: 'News-sensitive stocks with high volatility' }
}

const getRecommendedTickers = (type: StrategyType): number => {
  return strategyRecommendations[type]?.recommendedTickers || 20
}

const getTickerDescription = (type: StrategyType): string => {
  return strategyRecommendations[type]?.tickerDescription || 'recommended stocks'
}

interface StrategyParametersModalProps {
  strategy: Strategy | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (updates: Partial<Strategy>) => void
}

export function StrategyParametersModal({ strategy, isOpen, onClose, onUpdate }: StrategyParametersModalProps) {
  const [parameters, setParameters] = useState<StrategyParameters>(
    strategy?.parameters || {
      maxPositions: 3,
      positionSize: 25,
      riskPerTrade: 0,
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
    } as StrategyParameters
  )

  const isMicroscalping = strategy?.type === 'microscalping'
  const isMomentum = strategy?.type === 'momentum'

  if (!isOpen || !strategy) return null

  const handleParameterChange = (key: keyof StrategyParameters, value: any) => {
    const updatedParameters = { ...parameters, [key]: value }
    setParameters(updatedParameters)
    onUpdate({ parameters: updatedParameters })
  }

  const handleNestedChange = (parentKey: keyof StrategyParameters, childKey: string, value: any) => {
    const parentValue = parameters[parentKey] as any
    const updatedParameters = {
      ...parameters,
      [parentKey]: {
        ...parentValue,
        [childKey]: value
      }
    }
    setParameters(updatedParameters)
    onUpdate({ parameters: updatedParameters })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Sliders className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">
              Configure {strategy.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-8">
            {/* Ticker Management */}
            <TickerManagement
              strategy={strategy}
              onUpdate={onUpdate}
              recommendedTickers={getRecommendedTickers(strategy.type)}
              tickerDescription={getTickerDescription(strategy.type)}
            />

            {/* Strategy Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Position Sizing */}
              <div className="metric-card">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-foreground">Position Sizing</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Max Positions
                    </label>
                    <input
                      type="number"
                      value={parameters.maxPositions}
                      onChange={(e) => handleParameterChange('maxPositions', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="1"
                      max="20"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {isMicroscalping 
                        ? "Max number of concurrent open trades. Scalpers rarely manage more than 1–2 at a time due to rapid execution."
                        : "Maximum number of concurrent positions"
                      }
                    </p>
                  </div>

                  {isMicroscalping ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Risk Per Trade ($)
                        </label>
                        <input
                          type="number"
                          value={parameters.riskPerTrade || 150}
                          onChange={(e) => handleParameterChange('riskPerTrade', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="1"
                          step="1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Dollar amount you're willing to risk per trade. For example, 500 shares × $0.03 stop = $15 risk. You can scale from this.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Max Daily Trades (All Symbols)
                        </label>
                        <input
                          type="number"
                          value={parameters.maxDailyTrades}
                          onChange={(e) => handleParameterChange('maxDailyTrades', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="1"
                          max="200"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Stop taking new trades after this number. Keeps you from over-trading during chop.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Max Trades Per Symbol
                        </label>
                        <input
                          type="number"
                          value={parameters.maxTradesPerSymbol || 8}
                          onChange={(e) => handleParameterChange('maxTradesPerSymbol', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="1"
                          max="50"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Limits trade frequency per ticker to avoid grinding a dead stock.
                        </p>
                      </div>
                    </>
                  ) : isMomentum ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Position Size (%)
                        </label>
                        <input
                          type="number"
                          value={parameters.positionSize}
                          onChange={(e) => handleParameterChange('positionSize', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="5"
                          max="20"
                          step="1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Momentum trades are higher stop distance, so reduce size to control risk. Recommended: 10-15% per trade.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Max Daily Trades
                        </label>
                        <input
                          type="number"
                          value={parameters.maxDailyTrades}
                          onChange={(e) => handleParameterChange('maxDailyTrades', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="5"
                          max="30"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Momentum trades should be selective, not spammed like scalps. Recommended: 10-15 trades.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Position Size (%)
                        </label>
                        <input
                          type="number"
                          value={parameters.positionSize}
                          onChange={(e) => handleParameterChange('positionSize', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="1"
                          max="100"
                          step="1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Percentage of capital per trade
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Max Daily Trades
                        </label>
                        <input
                          type="number"
                          value={parameters.maxDailyTrades}
                          onChange={(e) => handleParameterChange('maxDailyTrades', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="1"
                          max="200"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Maximum trades per day
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Risk Management */}
              <div className="metric-card">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-foreground">🚨 Risk Management</h4>
                </div>
                
                <div className="space-y-4">
                  {isMicroscalping ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Stop Loss ($)
                        </label>
                        <input
                          type="number"
                          value={parameters.stopLossDollar || 0.03}
                          onChange={(e) => handleParameterChange('stopLossDollar', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="0.01"
                          max="1"
                          step="0.01"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Stop per trade in cents. Scalpers measure risk in ticks, not percentage.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Take Profit ($)
                        </label>
                        <input
                          type="number"
                          value={parameters.takeProfitDollar || 0.10}
                          onChange={(e) => handleParameterChange('takeProfitDollar', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="0.01"
                          max="2"
                          step="0.01"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Scalp target per trade. Typical micro-scalp exit is 3–4× stop distance.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Max Daily Loss ($)
                        </label>
                        <input
                          type="number"
                          value={parameters.maxDailyLoss || 500}
                          onChange={(e) => handleParameterChange('maxDailyLoss', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="10"
                          max="5000"
                          step="10"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          If total realized loss reaches this number, halt all trading to prevent tilt.
                        </p>
                      </div>
                    </>
                  ) : isMomentum ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Stop = ATR(5m) × Multiplier
                        </label>
                        <input
                          type="number"
                          value={parameters.stopLossATR || 1.2}
                          onChange={(e) => handleParameterChange('stopLossATR', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="0.5"
                          max="3.0"
                          step="0.1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Use dynamic stops, not static % — momentum has volatility expansion. ATR Multiplier: 1.2x recommended.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Profit Mode
                        </label>
                        <select
                          value={parameters.takeProfitMode || 'partial_trail'}
                          onChange={(e) => handleParameterChange('takeProfitMode', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="partial_trail">Partial Take + Trail</option>
                          <option value="fixed">Fixed Target</option>
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Take 50% at 2R, trail rest using VWAP OR EMA-9. Momentum is about catching runners.
                        </p>
                      </div>

                      {parameters.takeProfitMode === 'partial_trail' && (
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Partial Take Percent (%)
                          </label>
                          <input
                            type="number"
                            value={parameters.partialTakePercent || 50}
                            onChange={(e) => handleParameterChange('partialTakePercent', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                            min="25"
                            max="75"
                            step="5"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Percentage to take at first target (e.g., 50% at 2R), then trail the rest.
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Max Drawdown (%)
                        </label>
                        <input
                          type="number"
                          value={parameters.maxDrawdown}
                          onChange={(e) => handleParameterChange('maxDrawdown', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="5"
                          max="20"
                          step="1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Momentum moves lead to bigger swings, expect higher drawdown tolerance.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Stop Loss (%)
                        </label>
                        <input
                          type="number"
                          value={parameters.stopLoss}
                          onChange={(e) => handleParameterChange('stopLoss', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="0.1"
                          max="10"
                          step="0.1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Maximum loss per trade
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Take Profit (%)
                        </label>
                        <input
                          type="number"
                          value={parameters.takeProfit}
                          onChange={(e) => handleParameterChange('takeProfit', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="0.1"
                          max="20"
                          step="0.1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Target profit per trade
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Max Drawdown (%)
                        </label>
                        <input
                          type="number"
                          value={parameters.maxDrawdown}
                          onChange={(e) => handleParameterChange('maxDrawdown', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="1"
                          max="50"
                          step="1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Maximum portfolio drawdown
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Entry Conditions */}
              <div className="metric-card">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-foreground">🎯 Entry Conditions</h4>
                </div>
                
                <div className="space-y-4">
                  {isMicroscalping ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Relative Volume (RVOL ≥)
                        </label>
                        <input
                          type="number"
                          value={parameters.entryConditions.relativeVolume || 1.3}
                          onChange={(e) => handleNestedChange('entryConditions', 'relativeVolume', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="1.0"
                          max="5.0"
                          step="0.1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Only enter if current 1-minute volume > 1.3× average of last 5 mins — confirms active liquidity.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Entry Trigger
                        </label>
                        <select
                          value={parameters.entryConditions.entryTrigger || 'vwap_cross'}
                          onChange={(e) => handleNestedChange('entryConditions', 'entryTrigger', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="vwap_cross">VWAP Cross (preferred)</option>
                          <option value="break_high">Break of Last High + Spread Buffer</option>
                          <option value="break_low">Break of Last Low + Spread Buffer</option>
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">
                          VWAP cross is ideal for smart scalps. Break of high can be added for aggressive mode.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Spread Filter (Max Spread $)
                        </label>
                        <input
                          type="number"
                          value={parameters.entryConditions.maxSpread || 0.02}
                          onChange={(e) => handleNestedChange('entryConditions', 'maxSpread', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="0.01"
                          max="0.50"
                          step="0.01"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Only trade if bid-ask spread is below this. Prevents entries in illiquid chop.
                        </p>
                      </div>
                    </>
                  ) : isMomentum ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Relative Volume (RVOL ≥)
                        </label>
                        <input
                          type="number"
                          value={parameters.entryConditions.relativeVolume || 1.75}
                          onChange={(e) => handleNestedChange('entryConditions', 'relativeVolume', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="1.0"
                          max="5.0"
                          step="0.1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Relative Volume > 1.5 to 2.0x on breakout candle. Confirms institutional participation.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Breakout Trigger Mode
                        </label>
                        <select
                          value={parameters.entryConditions.entryTrigger || 'or_break'}
                          onChange={(e) => handleNestedChange('entryConditions', 'entryTrigger', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="or_break">Break of Opening Range High (ORH)</option>
                          <option value="consolidation_break">Break of Consolidation</option>
                          <option value="vwap_reclaim">VWAP reclaim & hold → then break</option>
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Break of Opening Range High is most reliable for momentum entries.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Minimum Range Expansion (% of ATR)
                        </label>
                        <input
                          type="number"
                          value={parameters.entryConditions.minRangeExpansion || 0.5}
                          onChange={(e) => handleNestedChange('entryConditions', 'minRangeExpansion', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="0.1"
                          max="2.0"
                          step="0.1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Prevents entries on weak pushes. Ensures meaningful breakout strength.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Max VWAP Extension (ATR ×)
                        </label>
                        <input
                          type="number"
                          value={parameters.entryConditions.maxVWAPExtension || 2.5}
                          onChange={(e) => handleNestedChange('entryConditions', 'maxVWAPExtension', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="1.0"
                          max="5.0"
                          step="0.1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Reject entries if price too extended >2.5× ATR above VWAP. Avoid chasing exhaustion candles.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Volume Threshold
                        </label>
                        <input
                          type="number"
                          value={parameters.entryConditions.volumeThreshold}
                          onChange={(e) => handleNestedChange('entryConditions', 'volumeThreshold', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="1000"
                          step="1000"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Minimum volume for entry
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Price Change Threshold (%)
                        </label>
                        <input
                          type="number"
                          value={parameters.entryConditions.priceChangeThreshold}
                          onChange={(e) => handleNestedChange('entryConditions', 'priceChangeThreshold', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="0.01"
                          max="10"
                          step="0.01"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Minimum price movement for entry
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Exit Conditions */}
              <div className="metric-card">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-foreground">Exit Conditions</h4>
                </div>
                
                <div className="space-y-4">
                  {isMicroscalping ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Max Hold Time (minutes)
                        </label>
                        <input
                          type="number"
                          value={parameters.exitConditions.maxHoldTime}
                          onChange={(e) => handleNestedChange('exitConditions', 'maxHoldTime', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="1"
                          max="60"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Scalps should resolve quickly. If price hasn't moved within 3 minutes, exit to free capital.
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="forceExitAtSessionEnd"
                          checked={parameters.forceExitAtSessionEnd || false}
                          onChange={(e) => handleParameterChange('forceExitAtSessionEnd', e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <label htmlFor="forceExitAtSessionEnd" className="text-sm font-medium text-foreground">
                          Force Exit at Session Time (3:55 PM)
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">
                        Automatically close remaining positions before end-of-day volatility spike.
                      </p>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="trailingStop"
                          checked={false}
                          disabled={true}
                          className="rounded border-border text-gray-400 focus:ring-primary"
                        />
                        <label htmlFor="trailingStop" className="text-sm font-medium text-gray-400">
                          Trailing Stop (Disabled for Scalping)
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">
                        Trailing stops cause you to sit through micro pullbacks. Scalpers prefer fixed exit logic.
                      </p>
                    </>
                  ) : isMomentum ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="eodExit"
                          checked={parameters.exitConditions.eodExit || false}
                          onChange={(e) => handleNestedChange('exitConditions', 'eodExit', e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <label htmlFor="eodExit" className="text-sm font-medium text-foreground">
                          Use EOD Close (End of Day Exit)
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">
                        Momentum is NOT about fixed time exits. Use EOD close OR trailing stop logic.
                      </p>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="trailingStop"
                          checked={parameters.exitConditions.trailingStop}
                          onChange={(e) => handleNestedChange('exitConditions', 'trailingStop', e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <label htmlFor="trailingStop" className="text-sm font-medium text-foreground">
                          Enable Trailing Stop (Default ON for momentum)
                        </label>
                      </div>

                      {parameters.exitConditions.trailingStop && (
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Trailing Stop Method
                          </label>
                          <select
                            value={parameters.exitConditions.trailMethod || 'vwap'}
                            onChange={(e) => handleNestedChange('exitConditions', 'trailMethod', e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="vwap">VWAP</option>
                            <option value="ema9">EMA(9)</option>
                            <option value="atr_pullback">Percent Pullback (0.5 ATR)</option>
                          </select>
                          <p className="text-xs text-muted-foreground mt-1">
                            Trailing Stop Choices: VWAP, EMA(9), or Percent Pullback (ex: 0.5 ATR).
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Max Hold Time (minutes) - Optional
                        </label>
                        <input
                          type="number"
                          value={parameters.exitConditions.maxHoldTime}
                          onChange={(e) => handleNestedChange('exitConditions', 'maxHoldTime', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="1"
                          max="480"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Optional safety net. Momentum is about catching runners like NFLX/AAPL on huge trend days.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="timeBasedExit"
                          checked={parameters.exitConditions.timeBasedExit}
                          onChange={(e) => handleNestedChange('exitConditions', 'timeBasedExit', e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <label htmlFor="timeBasedExit" className="text-sm font-medium text-foreground">
                          Time-based Exit
                        </label>
                      </div>

                      {parameters.exitConditions.timeBasedExit && (
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Max Hold Time (minutes)
                          </label>
                          <input
                            type="number"
                            value={parameters.exitConditions.maxHoldTime}
                            onChange={(e) => handleNestedChange('exitConditions', 'maxHoldTime', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                            min="1"
                            max="480"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Maximum time to hold position
                          </p>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="trailingStop"
                          checked={parameters.exitConditions.trailingStop}
                          onChange={(e) => handleNestedChange('exitConditions', 'trailingStop', e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <label htmlFor="trailingStop" className="text-sm font-medium text-foreground">
                          Trailing Stop
                        </label>
                      </div>

                      {parameters.exitConditions.trailingStop && (
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Trailing Stop (%)
                          </label>
                          <input
                            type="number"
                            value={parameters.exitConditions.trailingStopPercent}
                            onChange={(e) => handleNestedChange('exitConditions', 'trailingStopPercent', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                            min="0.1"
                            max="5"
                            step="0.1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Trailing stop percentage
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Trading Hours */}
              <div className="metric-card">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-foreground">Trading Hours</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={parameters.tradingHours.start}
                      onChange={(e) => handleNestedChange('tradingHours', 'start', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={parameters.tradingHours.end}
                      onChange={(e) => handleNestedChange('tradingHours', 'end', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Avoid News (minutes)
                    </label>
                    <input
                      type="number"
                      value={parameters.avoidNewsMinutes}
                      onChange={(e) => handleParameterChange('avoidNewsMinutes', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="0"
                      max="60"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Minutes to avoid trading around news
                    </p>
                  </div>
                </div>
              </div>

              {/* Costs */}
              <div className="metric-card">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-foreground">Trading Costs</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Commission per Trade ($)
                    </label>
                    <input
                      type="number"
                      value={parameters.commissionPerTrade}
                      onChange={(e) => handleParameterChange('commissionPerTrade', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="0"
                      max="10"
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Brokerage commission per trade
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Slippage Buffer (%)
                    </label>
                    <input
                      type="number"
                      value={parameters.slippageBuffer}
                      onChange={(e) => handleParameterChange('slippageBuffer', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Additional slippage buffer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
