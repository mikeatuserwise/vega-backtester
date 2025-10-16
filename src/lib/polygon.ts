// Polygon.io API integration for real market data
const POLYGON_API_KEY = 'CgW2jZF1NAo3selfXO3pQwNJfa_VTXkY'
const POLYGON_BASE_URL = 'https://api.polygon.io'

export interface PolygonQuote {
  p: number // price
  s: number // size
  t: number // timestamp
}

export interface PolygonBar {
  o: number // open
  h: number // high
  l: number // low
  c: number // close
  v: number // volume
  t: number // timestamp
}

export interface PolygonResponse {
  results: PolygonBar[]
  status: string
  request_id: string
  next_url?: string
}

export interface TickerInfo {
  ticker: string
  name: string
  market: string
  locale: string
  primary_exchange: string
  type: string
  active: boolean
  currency_name: string
  cik?: string
  composite_figi?: string
  share_class_figi?: string
  last_updated_utc: string
}

// Fetch minute-by-minute data for backtesting
// Rate limiting helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function fetchMinuteData(
  ticker: string,
  from: string,
  to: string,
  multiplier: number = 1,
  timespan: 'minute' | 'hour' | 'day' = 'minute',
  retryCount: number = 0
): Promise<PolygonBar[]> {
  const url = `${POLYGON_BASE_URL}/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&apikey=${POLYGON_API_KEY}`
  
  console.log(`Fetching ${ticker} data from ${from} to ${to} (attempt ${retryCount + 1})`)
  
  try {
    const response = await fetch(url)
    console.log(`Response status: ${response.status}`)
    
    if (response.status === 429) {
      // Rate limited - wait and retry
      if (retryCount < 3) {
        const waitTime = Math.pow(2, retryCount) * 1000 // Exponential backoff: 1s, 2s, 4s
        console.log(`Rate limited. Waiting ${waitTime}ms before retry...`)
        await delay(waitTime)
        return fetchMinuteData(ticker, from, to, multiplier, timespan, retryCount + 1)
      } else {
        throw new Error(`Rate limited after ${retryCount + 1} attempts`)
      }
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data: PolygonResponse = await response.json()
    console.log(`Polygon API response for ${ticker}:`, data.status, data.results?.length || 0, 'bars')
    
    if (data.status !== 'OK') {
      throw new Error(`Polygon API error: ${data.status}`)
    }
    
    return data.results || []
  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error)
    throw error
  }
}

// Get ticker information
export async function getTickerInfo(ticker: string): Promise<TickerInfo | null> {
  const url = `${POLYGON_BASE_URL}/v3/reference/tickers/${ticker}?apikey=${POLYGON_API_KEY}`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.results || null
  } catch (error) {
    console.error(`Error fetching ticker info for ${ticker}:`, error)
    return null
  }
}

// Get top active stocks (for recommendations)
export async function getTopActiveStocks(limit: number = 50): Promise<TickerInfo[]> {
  // Polygon API has a max limit of 1000 per request, so we'll fetch more to ensure we have enough
  const fetchLimit = Math.min(limit * 2, 1000) // Fetch 2x what we need, up to 1000
  const url = `${POLYGON_BASE_URL}/v3/reference/tickers?market=stocks&active=true&limit=${fetchLimit}&apikey=${POLYGON_API_KEY}`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching top active stocks:', error)
    return []
  }
}

// Get market status
export async function getMarketStatus(): Promise<{ market: string; serverTime: string }> {
  const url = `${POLYGON_BASE_URL}/v1/marketstatus/now?apikey=${POLYGON_API_KEY}`
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching market status:', error)
    return { market: 'unknown', serverTime: new Date().toISOString() }
  }
}

// Calculate spread and slippage simulation
export function calculateSpreadAndSlippage(
  price: number,
  volume: number,
  ticker: string
): { bid: number; ask: number; slippage: number } {
  // Simulate realistic spreads based on stock characteristics
  const baseSpread = price < 10 ? 0.01 : price < 50 ? 0.02 : 0.05
  const volumeFactor = Math.max(0.5, Math.min(2, 1000000 / volume)) // Higher volume = tighter spread
  
  const spread = baseSpread * volumeFactor
  const bid = price - spread / 2
  const ask = price + spread / 2
  
  // Slippage increases with trade size relative to volume
  const slippage = Math.min(0.1, (volume / 1000000) * 0.05)
  
  return { bid, ask, slippage }
}
