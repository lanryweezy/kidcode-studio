import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Clock, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { MiniChart, LineChart } from '../ui/Charts';
import { GameTopBar, NotificationToast, GoalProgress, GamePanel, StatCard } from '../ui/TycoonUI';
import { MARKET_EVENTS, generateEvent, GameEvent } from '../../services/businessEventSystem';
import { saveTycoonGame, getTycoonSaves } from '../../services/tycoonSaveService';

interface Stock {
  id: string;
  name: string;
  symbol: string;
  emoji: string;
  price: number;
  history: number[];
  volatility: number;
  trend: number;
  sector: string;
}

interface Portfolio {
  cash: number;
  holdings: Record<string, { shares: number; avgPrice: number }>;
  totalValue: number;
  profit: number;
}

interface GameState {
  day: number;
  time: number;
  stocks: Stock[];
  portfolio: Portfolio;
  events: GameEvent[];
  gameOver: boolean;
  goal: number;
  difficulty: number;
}

const INITIAL_STOCKS: Stock[] = [
  { id: 'tech1', name: 'ByteTech', symbol: 'BYTE', emoji: '💻', price: 150, history: [150], volatility: 0.08, trend: 0.02, sector: 'tech' },
  { id: 'tech2', name: 'CloudNine', symbol: 'CLD', emoji: '☁️', price: 85, history: [85], volatility: 0.12, trend: 0.03, sector: 'tech' },
  { id: 'energy1', name: 'SolarPower', symbol: 'SOLR', emoji: '☀️', price: 65, history: [65], volatility: 0.15, trend: 0.01, sector: 'energy' },
  { id: 'food1', name: 'TastyBites', symbol: 'TAST', emoji: '🍔', price: 45, history: [45], volatility: 0.05, trend: 0.01, sector: 'food' },
  { id: 'health1', name: 'MediCare+', symbol: 'MEDI', emoji: '💊', price: 200, history: [200], volatility: 0.06, trend: 0.02, sector: 'health' },
  { id: 'auto1', name: 'ElectroDrive', symbol: 'ELEC', emoji: '🚗', price: 320, history: [320], volatility: 0.1, trend: 0.04, sector: 'auto' },
  { id: 'retail1', name: 'MegaMart', symbol: 'MEGA', emoji: '🛒', price: 75, history: [75], volatility: 0.04, trend: 0.005, sector: 'retail' },
  { id: 'finance1', name: 'GoldBank', symbol: 'GLDB', emoji: '🏦', price: 180, history: [180], volatility: 0.07, trend: 0.015, sector: 'finance' },
];

export const StockMarketTycoon: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    time: 0,
    stocks: INITIAL_STOCKS.map(s => ({ ...s, history: [s.price] })),
    portfolio: { cash: 10000, holdings: {}, totalValue: 10000, profit: 0 },
    events: [],
    gameOver: false,
    goal: 50000,
    difficulty: 1,
  });
  
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [tradeAmount, setTradeAmount] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [speed, setSpeed] = useState<number>(1);
  const [isPaused, setIsPaused] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate portfolio value
  const calculatePortfolioValue = useCallback((portfolio: Portfolio, stocks: Stock[]) => {
    let holdingsValue = 0;
    for (const [stockId, holding] of Object.entries(portfolio.holdings)) {
      const stock = stocks.find(s => s.id === stockId);
      if (stock) holdingsValue += stock.price * holding.shares;
    }
    return portfolio.cash + holdingsValue;
  }, []);

  // Update stock prices
  const updateStockPrices = useCallback((stocks: Stock[], difficulty: number) => {
    return stocks.map(stock => {
      const randomFactor = (Math.random() - 0.5) * stock.volatility * difficulty;
      const trendFactor = stock.trend * (Math.random() > 0.3 ? 1 : -0.5);
      const newPrice = Math.max(1, stock.price * (1 + randomFactor + trendFactor));
      return {
        ...stock,
        price: Math.round(newPrice * 100) / 100,
        history: [...stock.history.slice(-50), newPrice],
      };
    });
  }, []);

  // Game tick
  const tick = useCallback(() => {
    if (isPaused || gameState.gameOver) return;

    setGameState(prev => {
      let newTime = prev.time + speed;
      let newDay = prev.day;
      let newStocks = [...prev.stocks];
      let newEvents = [...prev.events];

      // New day
      if (newTime >= 24) {
        newTime = 0;
        newDay++;
        newStocks = updateStockPrices(newStocks, prev.difficulty);
        
        const event = generateEvent(MARKET_EVENTS, prev.difficulty);
        if (event) {
          // Apply event to stocks manually
          newStocks = newStocks.map(stock => {
            if (event.affectedSector === 'all' || event.affectedSector === stock.sector) {
              const priceChange = stock.price * event.severity;
              return {
                ...stock,
                price: Math.max(1, stock.price + priceChange),
                history: [...stock.history.slice(-50), Math.max(1, stock.price + priceChange)],
              };
            }
            return stock;
          });
          newEvents = [...newEvents.slice(-4), event];
        }
      }

      const newTotalValue = calculatePortfolioValue(prev.portfolio, newStocks);
      const newProfit = newTotalValue - 10000;

      return {
        ...prev,
        day: newDay,
        time: newTime,
        stocks: newStocks,
        events: newEvents,
        portfolio: { ...prev.portfolio, totalValue: newTotalValue, profit: newProfit },
        gameOver: newTotalValue >= prev.goal,
        difficulty: 1 + Math.floor(newDay / 10) * 0.2,
      };
    });
  }, [isPaused, gameState.gameOver, speed, updateStockPrices, calculatePortfolioValue]);

  useEffect(() => {
    intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [tick]);

  // Buy stock
  const buyStock = useCallback((stockId: string, amount: number) => {
    setGameState(prev => {
      const stock = prev.stocks.find(s => s.id === stockId);
      if (!stock || amount <= 0) return prev;

      const totalCost = stock.price * amount;
      if (totalCost > prev.portfolio.cash) {
        setNotification('Not enough cash!');
        setTimeout(() => setNotification(null), 2000);
        return prev;
      }

      const currentHolding = prev.portfolio.holdings[stockId] || { shares: 0, avgPrice: 0 };
      const newShares = currentHolding.shares + amount;
      const newAvgPrice = (currentHolding.avgPrice * currentHolding.shares + stock.price * amount) / newShares;

      return {
        ...prev,
        portfolio: {
          ...prev.portfolio,
          cash: prev.portfolio.cash - totalCost,
          holdings: {
            ...prev.portfolio.holdings,
            [stockId]: { shares: newShares, avgPrice: newAvgPrice },
          },
        },
      };
    });
    setNotification(`Bought ${amount} shares!`);
    setTimeout(() => setNotification(null), 2000);
  }, []);

  // Sell stock
  const sellStock = useCallback((stockId: string, amount: number) => {
    setGameState(prev => {
      const stock = prev.stocks.find(s => s.id === stockId);
      const holding = prev.portfolio.holdings[stockId];
      if (!stock || !holding || amount <= 0 || amount > holding.shares) return prev;

      const totalRevenue = stock.price * amount;
      const newShares = holding.shares - amount;
      const newHoldings = { ...prev.portfolio.holdings };
      
      if (newShares === 0) {
        delete newHoldings[stockId];
      } else {
        newHoldings[stockId] = { ...holding, shares: newShares };
      }

      return {
        ...prev,
        portfolio: {
          ...prev.portfolio,
          cash: prev.portfolio.cash + totalRevenue,
          holdings: newHoldings,
        },
      };
    });
    setNotification(`Sold ${amount} shares!`);
    setTimeout(() => setNotification(null), 2000);
  }, []);

  // Render mini chart
  const renderMiniChart = (history: number[], width: number = 120, height: number = 40) => {
    if (history.length < 2) return null;
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    
    const points = history.map((price, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = height - ((price - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    const isUp = history[history.length - 1] >= history[0];
    const color = isUp ? '#10b981' : '#ef4444';

    return (
      <svg width={width} height={height} className="inline-block">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
      </svg>
    );
  };

  if (showTutorial) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-lg bg-slate-900 rounded-2xl p-8 border border-slate-700">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">📈</div>
            <h2 className="text-2xl font-bold text-white mb-2">Stock Market Tycoon</h2>
            <p className="text-slate-400">Become a Wall Street legend!</p>
          </div>
          <div className="space-y-4 text-slate-300 text-sm">
            <div className="flex items-start gap-3">
              <DollarSign className="text-green-400 mt-0.5" size={20} />
              <div><strong>Start with $10,000</strong> - Buy low, sell high to reach $50,000!</div>
            </div>
            <div className="flex items-start gap-3">
              <BarChart3 className="text-blue-400 mt-0.5" size={20} />
              <div><strong>Watch the charts</strong> - Green means profit, red means loss</div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="text-yellow-400 mt-0.5" size={20} />
              <div><strong>Market events</strong> - News affects stock prices!</div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="text-purple-400 mt-0.5" size={20} />
              <div><strong>Time speeds up</strong> - Use speed controls to fast-forward</div>
            </div>
          </div>
          <button
            onClick={() => setShowTutorial(false)}
            className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all"
          >
            Start Trading! 💰
          </button>
        </div>
      </div>
    );
  }

  if (gameState.gameOver) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-lg bg-slate-900 rounded-2xl p-8 border border-slate-700 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-white mb-2">You Did It!</h2>
          <p className="text-slate-400 mb-6">You reached ${gameState.portfolio.totalValue.toLocaleString()}!</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-400">${gameState.portfolio.totalValue.toLocaleString()}</div>
              <div className="text-slate-400 text-sm">Final Value</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-400">{gameState.day} days</div>
              <div className="text-slate-400 text-sm">Time Taken</div>
            </div>
          </div>
          <button
            onClick={onExit}
            className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      {/* Top Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="text-slate-400 hover:text-white">🏠</button>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">Day {gameState.day}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 text-sm">⏰ {Math.floor(gameState.time)}:00</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-green-400 font-bold">${gameState.portfolio.cash.toLocaleString()}</div>
            <div className="text-slate-500 text-xs">Cash</div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold">${gameState.portfolio.totalValue.toLocaleString()}</div>
            <div className="text-slate-500 text-xs">Total Value</div>
          </div>
          <div className="text-right">
            <div className={`font-bold ${gameState.portfolio.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {gameState.portfolio.profit >= 0 ? '+' : ''}{gameState.portfolio.profit.toLocaleString()}
            </div>
            <div className="text-slate-500 text-xs">Profit</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-3 py-1 bg-slate-800 text-white rounded-lg text-sm"
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-slate-800 text-white rounded-lg px-2 py-1 text-sm"
          >
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
            <option value={10}>10x</option>
          </select>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Stock List */}
        <div className="w-80 bg-slate-900 border-r border-slate-800 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-white font-bold mb-4">📊 Stocks</h3>
            <div className="space-y-2">
              {gameState.stocks.map(stock => {
                const holding = gameState.portfolio.holdings[stock.id];
                const priceChange = stock.history.length > 1 
                  ? stock.price - stock.history[stock.history.length - 2]
                  : 0;
                const isUp = priceChange >= 0;

                return (
                  <div
                    key={stock.id}
                    onClick={() => setSelectedStock(stock.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      selectedStock === stock.id
                        ? 'bg-slate-700 border border-slate-600'
                        : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{stock.emoji}</span>
                        <div>
                          <div className="text-white font-bold text-sm">{stock.symbol}</div>
                          <div className="text-slate-500 text-xs">{stock.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">${stock.price.toFixed(2)}</div>
                        <div className={`text-xs ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                          {isUp ? '▲' : '▼'} ${Math.abs(priceChange).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      {renderMiniChart(stock.history)}
                      {holding && (
                        <span className="text-xs text-slate-400">
                          {holding.shares} shares
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col">
          {/* Selected Stock Detail */}
          {selectedStock && (() => {
            const stock = gameState.stocks.find(s => s.id === selectedStock);
            if (!stock) return null;
            const holding = gameState.portfolio.holdings[stock.id];
            const priceChange = stock.history.length > 1 
              ? stock.price - stock.history[stock.history.length - 2]
              : 0;
            const isUp = priceChange >= 0;

            return (
              <div className="bg-slate-900 border-b border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{stock.emoji}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{stock.name}</h2>
                      <div className="text-slate-400">{stock.symbol} • {stock.sector}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">${stock.price.toFixed(2)}</div>
                    <div className={`text-lg ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                      {isUp ? '▲' : '▼'} ${Math.abs(priceChange).toFixed(2)} ({((priceChange / stock.price) * 100).toFixed(2)}%)
                    </div>
                  </div>
                </div>

                {/* Trading Panel */}
                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-800 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-2">Buy Shares</div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={tradeAmount}
                        onChange={(e) => setTradeAmount(Number(e.target.value))}
                        min="1"
                        className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
                        placeholder="Amount"
                      />
                      <button
                        onClick={() => buyStock(stock.id, tradeAmount)}
                        disabled={tradeAmount <= 0 || stock.price * tradeAmount > gameState.portfolio.cash}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
                      >
                        Buy
                      </button>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Cost: ${(stock.price * tradeAmount).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-800 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-2">Sell Shares</div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={tradeAmount}
                        onChange={(e) => setTradeAmount(Number(e.target.value))}
                        min="1"
                        max={holding?.shares || 0}
                        className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
                        placeholder="Amount"
                      />
                      <button
                        onClick={() => sellStock(stock.id, tradeAmount)}
                        disabled={tradeAmount <= 0 || !holding || tradeAmount > holding.shares}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700"
                      >
                        Sell
                      </button>
                    </div>
                    {holding && (
                      <div className="text-xs text-slate-500 mt-2">
                        Holdings: {holding.shares} @ ${holding.avgPrice.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 bg-slate-800 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-2">Quick Trade</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setTradeAmount(1); buyStock(stock.id, 1); }}
                        className="px-2 py-1 bg-slate-700 text-white rounded text-xs hover:bg-slate-600"
                      >
                        Buy 1
                      </button>
                      <button
                        onClick={() => { setTradeAmount(10); buyStock(stock.id, 10); }}
                        className="px-2 py-1 bg-slate-700 text-white rounded text-xs hover:bg-slate-600"
                      >
                        Buy 10
                      </button>
                      <button
                        onClick={() => { setTradeAmount(1); sellStock(stock.id, 1); }}
                        disabled={!holding || holding.shares < 1}
                        className="px-2 py-1 bg-slate-700 text-white rounded text-xs hover:bg-slate-600 disabled:opacity-50"
                      >
                        Sell 1
                      </button>
                      <button
                        onClick={() => { setTradeAmount(holding?.shares || 0); sellStock(stock.id, holding?.shares || 0); }}
                        disabled={!holding}
                        className="px-2 py-1 bg-slate-700 text-white rounded text-xs hover:bg-slate-600 disabled:opacity-50"
                      >
                        Sell All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Chart Area */}
          <div className="flex-1 bg-slate-950 p-6 overflow-y-auto">
            {selectedStock ? (
              <div className="h-full">
                <h3 className="text-white font-bold mb-4">Price History</h3>
                <div className="bg-slate-900 rounded-xl p-4 h-64">
                  {(() => {
                    const stock = gameState.stocks.find(s => s.id === selectedStock);
                    if (!stock || stock.history.length < 2) return <div className="text-slate-500">No data yet</div>;
                    
                    const min = Math.min(...stock.history);
                    const max = Math.max(...stock.history);
                    const range = max - min || 1;
                    const height = 200;
                    const width = 800;
                    
                    const points = stock.history.map((price, i) => {
                      const x = (i / (stock.history.length - 1)) * width;
                      const y = height - ((price - min) / range) * height;
                      return `${x},${y}`;
                    }).join(' ');

                    const isUp = stock.history[stock.history.length - 1] >= stock.history[0];
                    const color = isUp ? '#10b981' : '#ef4444';

                    return (
                      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                        <defs>
                          <linearGradient id={`gradient-${stock.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <polygon
                          points={`0,${height} ${points} ${width},${height}`}
                          fill={`url(#gradient-${stock.id})`}
                        />
                        <polyline
                          points={points}
                          fill="none"
                          stroke={color}
                          strokeWidth="3"
                        />
                        <circle
                          cx={width}
                          cy={height - ((stock.history[stock.history.length - 1] - min) / range) * height}
                          r="6"
                          fill={color}
                        />
                      </svg>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📈</div>
                  <h3 className="text-xl font-bold text-white mb-2">Select a Stock</h3>
                  <p className="text-slate-400">Click on a stock to view details and trade</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Events & Portfolio */}
        <div className="w-72 bg-slate-900 border-l border-slate-800 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-white font-bold mb-4">📰 Market News</h3>
            <div className="space-y-3">
              {gameState.events.length === 0 ? (
                <div className="text-slate-500 text-sm">No events yet...</div>
              ) : (
                gameState.events.slice().reverse().map(event => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-xl ${
                      event.impact === 'positive' ? 'bg-green-900/30 border border-green-800' :
                      event.impact === 'negative' ? 'bg-red-900/30 border border-red-800' :
                      'bg-slate-800 border border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {event.impact === 'positive' ? <CheckCircle className="text-green-400 mt-0.5" size={16} /> :
                       event.impact === 'negative' ? <AlertTriangle className="text-red-400 mt-0.5" size={16} /> :
                       <DollarSign className="text-slate-400 mt-0.5" size={16} />}
                      <div className="text-sm text-slate-300">{event.text}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-800">
            <h3 className="text-white font-bold mb-4">💼 Portfolio</h3>
            <div className="space-y-3">
              <div className="bg-slate-800 rounded-xl p-3">
                <div className="text-slate-400 text-sm">Cash</div>
                <div className="text-white font-bold">${gameState.portfolio.cash.toLocaleString()}</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-3">
                <div className="text-slate-400 text-sm">Holdings Value</div>
                <div className="text-white font-bold">
                  ${(gameState.portfolio.totalValue - gameState.portfolio.cash).toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-800 rounded-xl p-3">
                <div className="text-slate-400 text-sm">Total Portfolio</div>
                <div className="text-white font-bold">${gameState.portfolio.totalValue.toLocaleString()}</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-3">
                <div className="text-slate-400 text-sm">Goal</div>
                <div className="text-green-400 font-bold">${gameState.goal.toLocaleString()}</div>
                <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                    style={{ width: `${Math.min(100, (gameState.portfolio.totalValue / gameState.goal) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
