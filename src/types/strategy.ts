// Core types for trading strategies and backtesting

export interface Strategy {
  id: string
  name: string
  description: string
  type: StrategyType
  parameters: StrategyParameters
  tickers: string[]
  performance?: PerformanceMetrics
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type StrategyType = 
  | 'microscalping'
  | 'momentum'
  | 'mean-reversion'
  | 'breakout'
  | 'gap-and-go'
  | 'news-scalping'

export interface StrategyParameters {
  // Position sizing
  maxPositions: number
  positionSize: number // percentage of capital per trade (legacy)
  riskPerTrade: number // dollar amount risk per trade (new for scalping)
  maxDailyTrades: number
  maxTradesPerSymbol?: number // new field for scalping
  
  // Risk management
  stopLoss: number // percentage (legacy)
  stopLossDollar?: number // dollar amount stop loss (new for scalping)
  stopLossATR?: number // ATR multiplier for momentum (new for momentum)
  takeProfit: number // percentage (legacy)
  takeProfitDollar?: number // dollar amount take profit (new for scalping)
  takeProfitMode?: 'partial_trail' | 'fixed' // new for momentum
  partialTakePercent?: number // percentage to take at first target (new for momentum)
  trailMethod?: 'vwap' | 'ema9' | 'atr_pullback' // new for momentum
  maxDrawdown: number // percentage (legacy)
  maxDailyLoss?: number // dollar amount max daily loss (new for scalping)
  
  // Entry/Exit conditions
  entryConditions: EntryConditions
  exitConditions: ExitConditions
  
  // Fees and costs
  commissionPerTrade: number
  slippageBuffer: number // percentage
  
  // Time-based filters
  tradingHours: {
    start: string // "09:30"
    end: string // "16:00"
  }
  avoidNewsMinutes: number // minutes before/after news
  forceExitAtSessionEnd?: boolean // new field for scalping
}

export interface EntryConditions {
  volumeThreshold: number // minimum volume (legacy)
  relativeVolume?: number // relative volume multiplier (new for scalping/momentum)
  priceChangeThreshold: number // percentage
  technicalIndicators: TechnicalIndicator[]
  entryTrigger?: 'vwap_cross' | 'break_high' | 'break_low' | 'or_break' | 'consolidation_break' | 'vwap_reclaim' // updated for momentum
  maxSpread?: number // maximum spread in dollars (new for scalping)
  minRangeExpansion?: number // minimum range expansion % of ATR (new for momentum)
  maxVWAPExtension?: number // max ATR extension above VWAP (new for momentum)
}

export interface ExitConditions {
  timeBasedExit: boolean
  maxHoldTime: number // minutes
  trailingStop: boolean
  trailingStopPercent: number
  eodExit?: boolean // new for momentum - exit at end of day
  trailMethod?: 'vwap' | 'ema9' | 'atr_pullback' // new for momentum
}

export interface TechnicalIndicator {
  type: 'sma' | 'ema' | 'rsi' | 'macd' | 'bollinger'
  period: number
  threshold?: number
}

export interface PerformanceMetrics {
  totalReturn: number
  annualizedReturn: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  profitFactor: number
  totalTrades: number
  avgTradeReturn: number
  bestTrade: number
  worstTrade: number
  avgHoldTime: number // minutes
  volatility: number
  calmarRatio: number
  sortinoRatio: number
}

export interface BacktestResult {
  strategyId: string
  capital: number
  startDate: string
  endDate: string
  performance: PerformanceMetrics
  trades: Trade[]
  equityCurve: EquityPoint[]
  drawdownCurve: DrawdownPoint[]
  monthlyReturns: MonthlyReturn[]
}

export interface Trade {
  id: string
  ticker: string
  entryTime: Date
  exitTime: Date
  entryPrice: number
  exitPrice: number
  quantity: number
  pnl: number
  pnlPercent: number
  fees: number
  slippage: number
  reason: 'stop_loss' | 'take_profit' | 'time_exit' | 'trailing_stop'
  holdTime: number // minutes
}

export interface EquityPoint {
  date: Date
  equity: number
  return: number
}

export interface DrawdownPoint {
  date: Date
  drawdown: number
  peak: number
}

export interface MonthlyReturn {
  month: string
  return: number
  trades: number
}

export interface TickerRecommendation {
  ticker: string
  name: string
  reason: string
  score: number
  volume: number
  avgSpread: number
  volatility: number
  liquidity: 'high' | 'medium' | 'low'
}

export interface CapitalAllocation {
  totalCapital: number
  strategies: {
    strategyId: string
    allocation: number // percentage
    capital: number
  }[]
}
