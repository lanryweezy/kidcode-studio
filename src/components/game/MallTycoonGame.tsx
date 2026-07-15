import React, { useState, useEffect, useCallback } from 'react';
import { Building, ShoppingCart, Users, Star, TrendingUp, DollarSign, Clock, Wrench } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  emoji: string;
  rent: number;
  revenue: number;
  customers: number;
  satisfaction: number;
  level: number;
}

interface MallStats {
  totalRevenue: number;
  totalCustomers: number;
  avgSatisfaction: number;
  month: number;
}

interface GameState {
  month: number;
  cash: number;
  reputation: number;
  shops: Shop[];
  stats: MallStats;
  goal: number;
  gameOver: boolean;
}

const SHOP_TYPES = [
  { name: 'Food Court', emoji: '🍔', rent: 500, baseRevenue: 800, baseCustomers: 50 },
  { name: 'Clothing Store', emoji: '👗', rent: 600, baseRevenue: 700, baseCustomers: 40 },
  { name: 'Electronics', emoji: '📱', rent: 800, baseRevenue: 1200, baseCustomers: 30 },
  { name: 'Bookstore', emoji: '📚', rent: 400, baseRevenue: 400, baseCustomers: 20 },
  { name: 'Cinema', emoji: '🎬', rent: 1000, baseRevenue: 1500, baseCustomers: 100 },
  { name: 'Arcade', emoji: '🎮', rent: 700, baseRevenue: 900, baseCustomers: 60 },
  { name: 'Coffee Shop', emoji: '☕', rent: 350, baseRevenue: 500, baseCustomers: 35 },
  { name: 'Gym', emoji: '🏋️', rent: 900, baseRevenue: 1100, baseCustomers: 25 },
];

export const MallTycoonGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [gameState, setGameState] = useState<GameState>({
    month: 1,
    cash: 5000,
    reputation: 50,
    shops: SHOP_TYPES.slice(0, 4).map((type, i) => ({
      id: `shop_${i}`,
      ...type,
      revenue: type.baseRevenue,
      customers: type.baseCustomers,
      satisfaction: 80,
      level: 1,
    })),
    stats: { totalRevenue: 0, totalCustomers: 0, avgSatisfaction: 80, month: 1 },
    goal: 100000,
    gameOver: false,
  });

  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Add new shop
  const addShop = useCallback((typeIndex: number) => {
    setGameState(prev => {
      const type = SHOP_TYPES[typeIndex];
      if (prev.cash < type.rent * 3) {
        setNotification('Not enough cash!');
        setTimeout(() => setNotification(null), 1500);
        return prev;
      }

      return {
        ...prev,
        cash: prev.cash - type.rent * 3,
        shops: [...prev.shops, {
          id: `shop_${Date.now()}`,
          ...type,
          revenue: type.baseRevenue,
          customers: type.baseCustomers,
          satisfaction: 80,
          level: 1,
        }],
      };
    });
    setNotification('New shop added!');
    setTimeout(() => setNotification(null), 1500);
  }, []);

  // Upgrade shop
  const upgradeShop = useCallback((shopId: string) => {
    setGameState(prev => {
      const shop = prev.shops.find(s => s.id === shopId);
      if (!shop || prev.cash < shop.rent) return prev;

      return {
        ...prev,
        cash: prev.cash - shop.rent,
        shops: prev.shops.map(s =>
          s.id === shopId ? {
            ...s,
            level: s.level + 1,
            revenue: Math.floor(s.revenue * 1.3),
            customers: Math.floor(s.customers * 1.2),
            satisfaction: Math.min(100, s.satisfaction + 5),
          } : s
        ),
      };
    });
    setNotification('Shop upgraded!');
    setTimeout(() => setNotification(null), 1500);
  }, []);

  // Game tick
  const tick = useCallback(() => {
    if (isPaused || gameState.gameOver) return;

    setGameState(prev => {
      let newMonth = prev.month + 0.1 * speed;

      // Monthly processing
      if (Math.floor(newMonth) > Math.floor(prev.month)) {
        const totalRevenue = prev.shops.reduce((sum, s) => sum + s.revenue, 0);
        const totalRent = prev.shops.reduce((sum, s) => sum + s.rent, 0);
        const totalCustomers = prev.shops.reduce((sum, s) => sum + s.customers, 0);

        return {
          ...prev,
          month: newMonth,
          cash: prev.cash + totalRevenue - totalRent,
          stats: {
            ...prev.stats,
            totalRevenue: prev.stats.totalRevenue + totalRevenue,
            totalCustomers: prev.stats.totalCustomers + totalCustomers,
            avgSatisfaction: prev.shops.reduce((sum, s) => sum + s.satisfaction, 0) / prev.shops.length,
            month: Math.floor(newMonth),
          },
          gameOver: prev.cash + totalRevenue - totalRent >= prev.goal,
        };
      }

      return { ...prev, month: newMonth };
    });
  }, [isPaused, gameState.gameOver, speed]);

  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="text-slate-400 hover:text-white">🏠</button>
          <span className="text-white font-bold">Month {Math.floor(gameState.month)}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-green-400 font-bold">${gameState.cash.toLocaleString()}</div>
            <div className="text-slate-500 text-xs">Cash</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-bold">⭐ {gameState.reputation}</div>
            <div className="text-slate-500 text-xs">Reputation</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsPaused(!isPaused)} className="px-3 py-1 bg-slate-800 text-white rounded-lg text-sm">
            {isPaused ? '▶️' : '⏸️'}
          </button>
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="bg-slate-800 text-white rounded-lg px-2 py-1 text-sm">
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
          </select>
        </div>
      </div>

      {notification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Shops Grid */}
        <div className="flex-1 bg-slate-950 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">🏪 Your Mall</h3>
            <div className="flex gap-2">
              {SHOP_TYPES.slice(0, 4).map((type, i) => (
                <button
                  key={i}
                  onClick={() => addShop(i)}
                  className="px-3 py-1 bg-slate-700 text-white rounded text-xs hover:bg-slate-600"
                >
                  + {type.emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {gameState.shops.map(shop => (
              <div
                key={shop.id}
                onClick={() => setSelectedShop(shop.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedShop === shop.id
                    ? 'bg-slate-700 border-2 border-yellow-500'
                    : 'bg-slate-800/50 border border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="text-center mb-3">
                  <span className="text-4xl">{shop.emoji}</span>
                </div>
                <div className="text-white font-bold text-center mb-1">{shop.name}</div>
                <div className="text-slate-400 text-xs text-center mb-3">Level {shop.level}</div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Revenue</span>
                    <span className="text-green-400">${shop.revenue}/mo</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Customers</span>
                    <span className="text-blue-400">{shop.customers}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Rent</span>
                    <span className="text-red-400">${shop.rent}/mo</span>
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); upgradeShop(shop.id); }}
                  className="w-full mt-3 px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                >
                  ⬆️ Upgrade (${shop.rent})
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Panel */}
        <div className="w-72 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto">
          <h3 className="text-white font-bold mb-4">📊 Mall Stats</h3>
          <div className="space-y-3">
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Total Revenue</div>
              <div className="text-green-400 font-bold">${gameState.stats.totalRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Total Customers</div>
              <div className="text-blue-400 font-bold">{gameState.stats.totalCustomers.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Avg Satisfaction</div>
              <div className="text-yellow-400 font-bold">{gameState.stats.avgSatisfaction.toFixed(0)}%</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Shops</div>
              <div className="text-purple-400 font-bold">{gameState.shops.length}</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Goal</div>
              <div className="text-yellow-400 font-bold">${gameState.goal.toLocaleString()}</div>
              <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all"
                  style={{ width: `${Math.min(100, (gameState.cash / gameState.goal) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
