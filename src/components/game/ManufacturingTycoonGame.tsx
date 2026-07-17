import React, { useState, useEffect, useCallback } from 'react';
import { Factory, DollarSign, Users, Package, TrendingUp, Wrench, Cog, Truck } from 'lucide-react';

interface ProductionLine {
  id: string;
  name: string;
  emoji: string;
  product: string;
  rate: number;
  cost: number;
  efficiency: number;
  workers: number;
  level: number;
}

interface Resource {
  type: string;
  emoji: string;
  amount: number;
  cost: number;
}

interface GameState {
  day: number;
  cash: number;
  productionLines: ProductionLine[];
  resources: Resource[];
  totalProduction: number;
  totalRevenue: number;
  goal: number;
  gameOver: boolean;
}

const PRODUCTION_TYPES = [
  { name: 'Assembly Line', emoji: '🔧', product: 'Widgets', rate: 10, cost: 5000 },
  { name: 'Press Machine', emoji: '⚙️', product: 'Parts', rate: 15, cost: 8000 },
  { name: 'Chemical Plant', emoji: '🧪', product: 'Chemicals', rate: 8, cost: 12000 },
  { name: 'Textile Mill', emoji: '🧵', product: 'Fabrics', rate: 20, cost: 6000 },
  { name: 'Food Processing', emoji: '🍔', product: 'Food', rate: 25, cost: 4000 },
  { name: 'Electronics', emoji: '💻', product: 'Circuits', rate: 5, cost: 15000 },
];

const RESOURCE_TYPES = [
  { type: 'Steel', emoji: '🪨', cost: 100 },
  { type: 'Plastic', emoji: '♻️', cost: 50 },
  { type: 'Energy', emoji: '⚡', cost: 200 },
  { type: 'Labor', emoji: '👷', cost: 150 },
];

export const ManufacturingTycoonGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    cash: 30000,
    productionLines: PRODUCTION_TYPES.slice(0, 2).map((type, i) => ({
      id: `line_${i}`,
      ...type,
      efficiency: 80,
      workers: 10,
      level: 1,
    })),
    resources: RESOURCE_TYPES.map(r => ({ ...r, amount: 100 })),
    totalProduction: 0,
    totalRevenue: 0,
    goal: 150000,
    gameOver: false,
  });

  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Add production line
  const addProductionLine = useCallback((typeIndex: number) => {
    setGameState(prev => {
      const type = PRODUCTION_TYPES[typeIndex];
      if (prev.cash < type.cost) {
        setNotification('Not enough cash!');
        setTimeout(() => setNotification(null), 1500);
        return prev;
      }

      return {
        ...prev,
        cash: prev.cash - type.cost,
        productionLines: [...prev.productionLines, {
          id: `line_${Date.now()}`,
          ...type,
          efficiency: 80,
          workers: 10,
          level: 1,
        }],
      };
    });
    setNotification('Production line added!');
    setTimeout(() => setNotification(null), 1500);
  }, []);

  // Game tick
  const tick = useCallback(() => {
    if (isPaused || gameState.gameOver) return;

    setGameState(prev => {
      const newDay = prev.day + 0.1 * speed;

      // Produce
      let dayProduction = 0;
      let dayCost = 0;

      const updatedLines = prev.productionLines.map(line => {
        const produced = Math.floor(line.rate * (line.efficiency / 100) * 0.1 * speed);
        const cost = line.cost * 0.01 * speed;
        
        dayProduction += produced;
        dayCost += cost;

        return line;
      });

      const revenue = dayProduction * 50;

      return {
        ...prev,
        day: newDay,
        productionLines: updatedLines,
        cash: prev.cash + revenue - dayCost,
        totalProduction: prev.totalProduction + dayProduction,
        totalRevenue: prev.totalRevenue + revenue,
        gameOver: prev.cash + revenue - dayCost >= prev.goal,
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
            <div className="text-blue-400 font-bold">🏭 {gameState.productionLines.length}</div>
            <div className="text-slate-500 text-xs">Lines</div>
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
        {/* Production Lines */}
        <div className="flex-1 bg-slate-950 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">🏭 Production Lines</h3>
            <div className="flex gap-2">
              {PRODUCTION_TYPES.slice(0, 3).map((type, i) => (
                <button
                  key={i}
                  onClick={() => addProductionLine(i)}
                  disabled={gameState.cash < type.cost}
                  className="px-3 py-1 bg-slate-700 text-white rounded text-xs hover:bg-slate-600 disabled:opacity-50"
                >
                  + {type.emoji} ${type.cost}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {gameState.productionLines.map(line => (
              <div
                key={line.id}
                onClick={() => setSelectedLine(line.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedLine === line.id
                    ? 'bg-slate-700 border-2 border-yellow-500'
                    : 'bg-slate-800/50 border border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="text-center mb-3">
                  <span className="text-4xl">{line.emoji}</span>
                </div>
                <div className="text-white font-bold text-center mb-1">{line.name}</div>
                <div className="text-slate-400 text-xs text-center mb-3">Level {line.level}</div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Product</span>
                    <span className="text-blue-400">{line.product}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Rate</span>
                    <span className="text-green-400">{line.rate}/day</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Efficiency</span>
                    <span className="text-yellow-400">{line.efficiency}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                      style={{ width: `${line.efficiency}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Panel */}
        <div className="w-72 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto">
          <h3 className="text-white font-bold mb-4">📊 Manufacturing Stats</h3>
          <div className="space-y-3">
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Total Production</div>
              <div className="text-blue-400 font-bold">{gameState.totalProduction.toLocaleString()} units</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Total Revenue</div>
              <div className="text-green-400 font-bold">${gameState.totalRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Production Lines</div>
              <div className="text-purple-400 font-bold">{gameState.productionLines.length}</div>
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
