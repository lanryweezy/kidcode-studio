import React, { useState, useEffect, useCallback } from 'react';
import { Truck, MapPin, Package, DollarSign, Clock, Fuel, Wrench, Route } from 'lucide-react';

interface Depot {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  capacity: number;
  currentLoad: number;
}

interface Delivery {
  id: string;
  from: string;
  to: string;
  package: string;
  reward: number;
  deadline: number;
  status: 'pending' | 'in_transit' | 'delivered';
}

interface GameState {
  day: number;
  cash: number;
  fuel: number;
  reputation: number;
  depots: Depot[];
  deliveries: Delivery[];
  completedDeliveries: number;
  totalEarnings: number;
  goal: number;
  gameOver: boolean;
  upgrades: Record<string, number>;
}

const DEPOT_NAMES = ['Warehouse A', 'Warehouse B', 'Distribution Center', 'Factory', 'Retail Store'];
const DEPOT_EMOJIS = ['🏭', '🏢', '🏬', '🏗️', '🏪'];
const PACKAGE_TYPES = ['📦', '📬', '📫', '📦', '🎁'];

export const LogisticsGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    cash: 2000,
    fuel: 100,
    reputation: 50,
    depots: DEPOT_NAMES.slice(0, 4).map((name, i) => ({
      id: `depot_${i}`,
      name,
      emoji: DEPOT_EMOJIS[i],
      x: 50 + Math.random() * 700,
      y: 50 + Math.random() * 500,
      capacity: 100,
      currentLoad: 50,
    })),
    deliveries: [],
    completedDeliveries: 0,
    totalEarnings: 0,
    goal: 25000,
    gameOver: false,
    upgrades: { truck_speed: 1, fuel_efficiency: 1, capacity: 1 },
  });

  const [selectedDepot, setSelectedDepot] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Generate delivery
  const generateDelivery = useCallback(() => {
    setGameState(prev => {
      if (prev.deliveries.length >= 5) return prev;

      const fromIdx = Math.floor(Math.random() * prev.depots.length);
      let toIdx = Math.floor(Math.random() * prev.depots.length);
      while (toIdx === fromIdx) toIdx = Math.floor(Math.random() * prev.depots.length);

      const from = prev.depots[fromIdx];
      const to = prev.depots[toIdx];
      const distance = Math.sqrt((from.x - to.x) ** 2 + (from.y - to.y) ** 2);
      const reward = Math.floor(distance * 2 + 100);

      return {
        ...prev,
        deliveries: [...prev.deliveries, {
          id: `del_${Date.now()}`,
          from: from.id,
          to: to.id,
          package: PACKAGE_TYPES[Math.floor(Math.random() * PACKAGE_TYPES.length)],
          reward,
          deadline: prev.day + 2,
          status: 'pending',
        }],
      };
    });
  }, []);

  // Complete delivery
  const completeDelivery = useCallback((deliveryId: string) => {
    setGameState(prev => {
      const delivery = prev.deliveries.find(d => d.id === deliveryId);
      if (!delivery || delivery.status !== 'pending') return prev;

      return {
        ...prev,
        cash: prev.cash + delivery.reward,
        totalEarnings: prev.totalEarnings + delivery.reward,
        completedDeliveries: prev.completedDeliveries + 1,
        reputation: Math.min(100, prev.reputation + 5),
        deliveries: prev.deliveries.map(d =>
          d.id === deliveryId ? { ...d, status: 'delivered' as const } : d
        ),
      };
    });
    setNotification('Delivery completed!');
    setTimeout(() => setNotification(null), 1500);
  }, []);

  // Game tick
  const tick = useCallback(() => {
    if (isPaused || gameState.gameOver) return;

    setGameState(prev => {
      let newDay = prev.day + 0.05 * speed;

      // Generate new deliveries
      if (Math.random() < 0.1 * speed) {
        setTimeout(generateDelivery, 0);
      }

      // Process pending deliveries
      const updatedDeliveries = prev.deliveries
        .filter(d => d.status !== 'delivered')
        .map(d => {
          if (d.deadline < newDay) {
            return { ...d, status: 'failed' as const };
          }
          return d;
        })
        .filter(d => d.status !== 'failed');

      return {
        ...prev,
        day: newDay,
        deliveries: updatedDeliveries,
        gameOver: prev.cash >= prev.goal,
      };
    });
  }, [isPaused, gameState.gameOver, speed, generateDelivery]);

  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="text-slate-400 hover:text-white">🏠</button>
          <span className="text-white font-bold">Day {Math.floor(gameState.day)}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-green-400 font-bold">${gameState.cash.toLocaleString()}</div>
            <div className="text-slate-500 text-xs">Cash</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-bold">⛽ {gameState.fuel}%</div>
            <div className="text-slate-500 text-xs">Fuel</div>
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
        {/* Map View */}
        <div className="flex-1 bg-slate-950 p-6 relative">
          <h3 className="text-white font-bold mb-4">🗺️ Logistics Map</h3>
          <div className="relative w-full h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
            {gameState.depots.map(depot => (
              <div
                key={depot.id}
                onClick={() => setSelectedDepot(depot.id)}
                className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 ${
                  selectedDepot === depot.id ? 'z-10' : 'z-0'
                }`}
                style={{ left: depot.x, top: depot.y }}
              >
                <div className={`text-center p-2 rounded-xl ${
                  selectedDepot === depot.id ? 'bg-slate-700 border-2 border-yellow-500' : 'bg-slate-800/80 border border-slate-600'
                }`}>
                  <span className="text-3xl">{depot.emoji}</span>
                  <div className="text-xs text-white mt-1">{depot.name}</div>
                </div>
              </div>
            ))}
            
            {/* Draw delivery lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {gameState.deliveries.filter(d => d.status === 'pending').map(delivery => {
                const from = gameState.depots.find(d => d.id === delivery.from);
                const to = gameState.depots.find(d => d.id === delivery.to);
                if (!from || !to) return null;
                return (
                  <line
                    key={delivery.id}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* Deliveries Panel */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto">
          <h3 className="text-white font-bold mb-4">📦 Deliveries</h3>
          <div className="space-y-3">
            {gameState.deliveries.filter(d => d.status === 'pending').map(delivery => {
              const from = gameState.depots.find(d => d.id === delivery.from);
              const to = gameState.depots.find(d => d.id === delivery.to);
              return (
                <div
                  key={delivery.id}
                  className="bg-slate-800 rounded-xl p-3 border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{delivery.package}</span>
                    <span className="text-green-400 font-bold">${delivery.reward}</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-2">
                    {from?.name} → {to?.name}
                  </div>
                  <div className="text-xs text-slate-500 mb-2">
                    Deadline: Day {Math.floor(delivery.deadline)}
                  </div>
                  <button
                    onClick={() => completeDelivery(delivery.id)}
                    className="w-full px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    🚚 Complete Delivery
                  </button>
                </div>
              );
            })}
            {gameState.deliveries.filter(d => d.status === 'pending').length === 0 && (
              <div className="text-slate-500 text-center py-8">
                <div className="text-4xl mb-2">📭</div>
                <p>No pending deliveries</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h4 className="text-white font-bold mb-3">📊 Stats</h4>
            <div className="space-y-2">
              <div className="bg-slate-800 rounded-xl p-3">
                <div className="text-slate-400 text-sm">Completed</div>
                <div className="text-blue-400 font-bold">{gameState.completedDeliveries}</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-3">
                <div className="text-slate-400 text-sm">Total Earnings</div>
                <div className="text-green-400 font-bold">${gameState.totalEarnings.toLocaleString()}</div>
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
    </div>
  );
};
