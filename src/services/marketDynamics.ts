export interface MarketItem {
  id: string;
  name: string;
  emoji: string;
  basePrice: number;
  currentPrice: number;
  supply: number;
  demand: number;
  volatility: number;
  trend: number;
  history: number[];
}

export interface MarketState {
  items: MarketItem[];
  globalTrend: number;
  inflation: number;
  day: number;
}

export function createMarket(itemDefs: Omit<MarketItem, 'currentPrice' | 'history'>[]): MarketState {
  return {
    items: itemDefs.map(item => ({
      ...item,
      currentPrice: item.basePrice,
      history: [item.basePrice],
    })),
    globalTrend: 0,
    inflation: 0,
    day: 1,
  };
}

export function updateMarket(state: MarketState, dt: number): MarketState {
  // Fluctuate global trend
  const newGlobalTrend = state.globalTrend + (Math.random() - 0.5) * 0.01;
  const clampedGlobalTrend = Math.max(-0.05, Math.min(0.05, newGlobalTrend));

  const updatedItems = state.items.map(item => {
    // Supply/demand pressure
    const supplyPressure = (item.supply - item.demand) / Math.max(item.demand, 1);
    const demandPressure = (item.demand - item.supply) / Math.max(item.supply, 1);

    // Random walk with trend
    const randomChange = (Math.random() - 0.5) * item.volatility * dt;
    const trendChange = item.trend * dt;
    const supplyDemandChange = (demandPressure - supplyPressure) * 0.02 * dt;
    const globalChange = clampedGlobalTrend * dt;

    const totalChange = randomChange + trendChange + supplyDemandChange + globalChange;
    const newPrice = Math.max(item.basePrice * 0.1, item.currentPrice * (1 + totalChange));

    // Fluctuate supply and demand
    const newSupply = Math.max(0, item.supply + Math.floor((Math.random() - 0.5) * 10));
    const newDemand = Math.max(1, item.demand + Math.floor((Math.random() - 0.5) * 8));

    return {
      ...item,
      currentPrice: Math.round(newPrice * 100) / 100,
      supply: newSupply,
      demand: newDemand,
      history: [...item.history.slice(-50), newPrice],
    };
  });

  return {
    ...state,
    items: updatedItems,
    globalTrend: clampedGlobalTrend,
    inflation: state.inflation + clampedGlobalTrend * 0.1,
    day: state.day + 1,
  };
}

export function getItemProfit(item: MarketItem): number {
  return item.currentPrice - item.basePrice;
}

export function getItemTrend(item: MarketItem): 'up' | 'down' | 'stable' {
  if (item.history.length < 2) return 'stable';
  const recent = item.history.slice(-5);
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  if (avg > item.currentPrice * 1.02) return 'down';
  if (avg < item.currentPrice * 0.98) return 'up';
  return 'stable';
}

export function getMarketSentiment(state: MarketState): 'bull' | 'bear' | 'neutral' {
  if (state.globalTrend > 0.02) return 'bull';
  if (state.globalTrend < -0.02) return 'bear';
  return 'neutral';
}
