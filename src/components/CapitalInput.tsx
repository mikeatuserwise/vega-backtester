'use client'

import { useState } from 'react'
import { DollarSign, Calculator, TrendingUp } from 'lucide-react'

interface CapitalInputProps {
  onCapitalChange: (capital: number) => void
  initialCapital?: number
}

export function CapitalInput({ onCapitalChange, initialCapital = 50000 }: CapitalInputProps) {
  const [capital, setCapital] = useState(initialCapital)
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCapitalChange(capital)
    setIsEditing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const quickAmounts = [10000, 25000, 50000, 100000, 250000, 500000]

  return (
    <div className="metric-card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Trading Capital
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calculator className="h-4 w-4" />
          <span>Backtest with real capital</span>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="capital" className="block text-sm font-medium text-foreground mb-2">
              Enter your trading capital
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="capital"
                type="number"
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="50000"
                min="1000"
                max="10000000"
                step="1000"
                autoFocus
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Update Backtest</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(capital)}
              </p>
              <p className="text-sm text-muted-foreground">
                Total capital for backtesting
              </p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Edit
            </button>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Quick amounts:</p>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setCapital(amount)
                    onCapitalChange(amount)
                  }}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    capital === amount
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
