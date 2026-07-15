import React, { useState, useEffect, useCallback } from 'react';
import { Droplet, DollarSign, TrendingUp, Wrench, Users, MapPin, AlertTriangle } from 'lucide-react';

interface OilField {
  id: string;
  name: string;
  emoji: string;
  production: number;
  reserve: number;
  efficiency: number;
  workers: number;
}

interface Refinery {
  id: string;
  name: string;
  emoji: string;
  capacity: number;
  currentLoad: number;
  efficiency: number;
}

interface GameState {
  day: number;
  cash: number;
  oilPrice: number;
  oilFields: OilField[];
  refineries: Refinery[];
  totalProduction: number;
  totalRevenue: number;
  goal: number;
  gameOver: boolean;
}

const FIELD_NAMES = ['North Field', 'South Field', 'East Basin', 'West Reserve'];
const FIELD_EMOJIS = ['🛢️', '⛽', '🏗️', '🏭'];

export const OilCompanyTycoonGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    cash: 50000,
    oilPrice: 70,
    oilFields: FIELD_NAMES.slice(0, 2).map((name, i) => ({
      id: `field_${i}`,
      name,
      emoji: FIELD_EMOJIS[i],
      production: 100,
      reserve: 1000,
      efficiency: 80,
      workers: 10,
    })),
    refineries: [{ id: 'ref_1', name: 'Main Refinery', emoji: '🏭', capacity: 200, currentLoad: 0, efficiency: 90 }],
    totalProduction: 0,
    totalRevenue: 0,
    goal: 200000,
    gameOver: false,
  });

  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Drill new field
  const drillField = useCallback(() => {
    setGameState(prev => {
      if (prev.cash < 25000) {
        setNotification('Not enough cash!');
        setTimeout(() => setNotification(null), 1500);
        return prev;
      }

      return {
        ...prev,
        cash: prev.cash - 25000,
        oilFields: [...prev.oilFields, {
          id: `field_${Date.now()}`,
          name: `Field ${prev.oilFields.length + 1}`,
          emoji: FIELD_EMOJIS[prev.oilFields.length % FIELD_EMOJIS.length],
          production: 80 + Math.floor(Math.random() * 40),
          reserve: 800 + Math.floor(Math.random() * 400),
          efficiency: 70 + Math.floor(Math.random() * 20),
          workers: 8,
        }],
      };
    });
    setNotification('New oil field drilled!');
    setTimeout(() => setNotification(null), 1500);
  }, []);

  // Game tick
  const tick = useCallback(() => {
    if (isPaused || gameState.gameOver) return;

    setGameState(prev => {
      let newDay = prev.day + 0.1 * speed;

      // Fluctuate oil price
      const priceChange = (Math.random() - 0.5) * 5;
      const newOilPrice = Math.max(30, Math.min(150, prev.oilPrice + priceChange));

      // Produce oil
      let dayProduction = 0;
      const updatedFields = prev.oilFields.map(field => {
        if (field.reserve <= 0) return field;
        
        const produced = Math.floor(field.production * (field.efficiency / 100) * 0.1 * speed);
        dayProduction += produced;
        
        return {
          ...field,
          reserve: Math.max(0, field.reserve - produced),
        };
      });

      // Process refineries
      const updatedRefineries = prev.refineries.map(ref => ({
        ...ref,
        currentLoad: Math.min(ref.capacity, dayProduction),
      }));

      const revenue = dayProduction * newOilPrice;

      return {
        ...prev,
        day: newDay,
        oilPrice: newOilPrice,
        oilFields: updatedFields,
        refineries: updatedRefineries,
        cash: prev.cash + revenue,
        totalProduction: prev.totalProduction + dayProduction,
        totalRevenue: prev.totalRevenue + revenue,
        gameOver: prev.cash + revenue >= prev.goal,
      };
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
          <span className="text-white font-bold">Day {Math.floor(gameState.day)}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-green-400 font-bold">${gameState.cash.toLocaleString()}</div>
            <div className="text-slate-500 text-xs">Cash</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-bold">🛢️ ${gameState.oilPrice.toFixed(2)}</div>
            <div className="text-slate-500 text-xs">Oil Price</div>
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
        {/* Oil Fields */}
        <div className="flex-1 bg-slate-950 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">🛢️ Oil Fields</h3>
            <button onClick={drillField} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
              + Drill New Field ($25,000)
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {gameState.oilFields.map(field => (
              <div
                key={field.id}
                onClick={() => setSelectedField(field.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedField === field.id
                    ? 'bg-slate-700 border-2 border-yellow-500'
                    : 'bg-slate-800/50 border border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{field.emoji}</span>
                  <div>
                    <div className="text-white font-bold">{field.name}</div>
                    <div className="text-slate-400 text-sm">{field.workers} workers</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Production</span>
                    <span className="text-green-400">{field.production} bbl/day</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Reserve</span>
                    <span className="text-yellow-400">{field.reserve.toLocaleString()} bbl</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all"
                      style={{ width: `${(field.reserve / 1000) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Panel */}
        <div className="w-72 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto">
          <h3 className="text-white font-bold mb-4">📊 Oil Company Stats</h3>
          <div className="space-y-3">
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Total Production</div>
              <div className="text-blue-400 font-bold">{gameState.totalProduction.toLocaleString()} bbl</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Total Revenue</div>
              <div className="text-green-400 font-bold">${gameState.totalRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Oil Fields</div>
              <div className="text-yellow-400 font-bold">{gameState.oilFields.length}</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Refineries</div>
              <div className="text-purple-400 font-bold">{gameState.refineries.length}</div>
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
