import React, { useState, useEffect, useCallback } from 'react';
import { Ship, Anchor, Package, DollarSign, Clock, Fuel, MapPin, Wrench } from 'lucide-react';

interface Port {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  demand: Record<string, number>;
  supply: Record<string, number>;
}

interface Cargo {
  id: string;
  type: string;
  emoji: string;
  quantity: number;
  value: number;
}

interface Ship {
  id: string;
  name: string;
  emoji: string;
  capacity: number;
  speed: number;
  cargo: Cargo[];
  fuel: number;
  status: 'docked' | 'sailing' | 'loading';
}

interface GameState {
  day: number;
  cash: number;
  ships: Ship[];
  ports: Port[];
  totalRevenue: number;
  totalTrips: number;
  goal: number;
  gameOver: boolean;
}

const PORT_NAMES = ['Port Alpha', 'Port Beta', 'Port Gamma', 'Port Delta', 'Port Omega'];
const PORT_EMOJIS = ['⚓', '🚢', '⛴️', '🛳️', '🛥️'];
const CARGO_TYPES = [
  { type: 'electronics', emoji: '📱', baseValue: 100 },
  { type: 'food', emoji: '🍎', baseValue: 30 },
  { type: 'fuel', emoji: '⛽', baseValue: 50 },
  { type: 'materials', emoji: '🪨', baseValue: 40 },
  { type: 'luxury', emoji: '💎', baseValue: 200 },
];

export const ShippingTycoonGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    cash: 30000,
    ships: [
      { id: 'ship_1', name: 'Titan', emoji: '🚢', capacity: 100, speed: 2, cargo: [], fuel: 100, status: 'docked' },
      { id: 'ship_2', name: 'Explorer', emoji: '⛵', capacity: 50, speed: 3, cargo: [], fuel: 100, status: 'docked' },
    ],
    ports: PORT_NAMES.slice(0, 4).map((name, i) => ({
      id: `port_${i}`,
      name,
      emoji: PORT_EMOJIS[i],
      x: 100 + Math.random() * 600,
      y: 100 + Math.random() * 300,
      demand: { electronics: Math.floor(Math.random() * 50), food: Math.floor(Math.random() * 100) },
      supply: { fuel: Math.floor(Math.random() * 80), materials: Math.floor(Math.random() * 60) },
    })),
    totalRevenue: 0,
    totalTrips: 0,
    goal: 150000,
    gameOver: false,
  });

  const [selectedShip, setSelectedShip] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Load cargo
  const loadCargo = useCallback((shipId: string, cargoType: string, quantity: number) => {
    setGameState(prev => {
      const ship = prev.ships.find(s => s.id === shipId);
      if (!ship) return prev;

      const cargoTemplate = CARGO_TYPES.find(c => c.type === cargoType);
      if (!cargoTemplate) return prev;

      const cost = cargoTemplate.baseValue * quantity;
      if (prev.cash < cost) {
        setNotification('Not enough cash!');
        setTimeout(() => setNotification(null), 1500);
        return prev;
      }

      const totalCargo = ship.cargo.reduce((sum, c) => sum + c.quantity, 0);
      if (totalCargo + quantity > ship.capacity) {
        setNotification('Ship is full!');
        setTimeout(() => setNotification(null), 1500);
        return prev;
      }

      return {
        ...prev,
        cash: prev.cash - cost,
        ships: prev.ships.map(s =>
          s.id === shipId ? {
            ...s,
            cargo: [...s.cargo, { id: `cargo_${Date.now()}`, ...cargoTemplate, quantity, value: cargoTemplate.baseValue }],
          } : s
        ),
      };
    });
  }, []);

  // Send ship
  const sendShip = useCallback((shipId: string, portId: string) => {
    setGameState(prev => {
      const ship = prev.ships.find(s => s.id === shipId);
      if (!ship || ship.cargo.length === 0) return prev;

      return {
        ...prev,
        ships: prev.ships.map(s =>
          s.id === shipId ? { ...s, status: 'sailing' as const } : s
        ),
      };
    });
    setNotification('Ship dispatched!');
    setTimeout(() => setNotification(null), 1500);
  }, []);

  // Game tick
  const tick = useCallback(() => {
    if (isPaused || gameState.gameOver) return;

    setGameState(prev => {
      const newDay = prev.day + 0.1 * speed;
      const dayRevenue = 0;

      const updatedShips = prev.ships.map(ship => {
        if (ship.status !== 'sailing') return ship;

        const newFuel = ship.fuel - 0.5 * speed;
        if (newFuel <= 0) {
          return { ...ship, fuel: 100, status: 'docked' as const, cargo: [] };
        }

        return { ...ship, fuel: newFuel };
      });

      // Deliver cargo when ships dock
      const deliveredShips = updatedShips.filter(s => s.status === 'docked' && s.cargo.length === 0);
      const deliveryRevenue = deliveredShips.reduce((sum, ship) => {
        return sum + ship.cargo.reduce((cSum, c) => cSum + c.value * c.quantity, 0);
      }, 0);

      return {
        ...prev,
        day: newDay,
        ships: updatedShips,
        cash: prev.cash + deliveryRevenue,
        totalRevenue: prev.totalRevenue + deliveryRevenue,
        gameOver: prev.cash + deliveryRevenue >= prev.goal,
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
            <div className="text-blue-400 font-bold">🚢 {gameState.ships.length}</div>
            <div className="text-slate-500 text-xs">Ships</div>
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
        {/* Ocean Map */}
        <div className="flex-1 bg-slate-950 p-6">
          <h3 className="text-white font-bold mb-4">🌊 Shipping Routes</h3>
          <div className="relative w-full h-80 bg-blue-950/50 rounded-xl border border-blue-800 overflow-hidden">
            {gameState.ports.map(port => (
              <div
                key={port.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: port.x, top: port.y }}
              >
                <div className="text-center p-2 bg-slate-800/80 rounded-lg border border-slate-600">
                  <span className="text-2xl">{port.emoji}</span>
                  <div className="text-xs text-white mt-1">{port.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ships Panel */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto">
          <h3 className="text-white font-bold mb-4">🚢 Fleet</h3>
          <div className="space-y-3">
            {gameState.ships.map(ship => (
              <div
                key={ship.id}
                onClick={() => setSelectedShip(ship.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  selectedShip === ship.id
                    ? 'bg-slate-700 border border-slate-600'
                    : 'bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{ship.emoji}</span>
                    <div>
                      <div className="text-white font-bold">{ship.name}</div>
                      <div className={`text-xs ${
                        ship.status === 'sailing' ? 'text-blue-400' : 'text-green-400'
                      }`}>
                        {ship.status === 'sailing' ? '🌊 Sailing' : '⚓ Docked'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 text-xs">Fuel</div>
                    <div className="h-1 bg-slate-700 rounded-full w-16">
                      <div
                        className={`h-full ${ship.fuel > 50 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${ship.fuel}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  Cargo: {ship.cargo.reduce((sum, c) => sum + c.quantity, 0)}/{ship.capacity}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="text-white font-bold mb-3">📦 Load Cargo</h4>
            <div className="space-y-2">
              {CARGO_TYPES.map(cargo => (
                <button
                  key={cargo.type}
                  onClick={() => selectedShip && loadCargo(selectedShip, cargo.type, 10)}
                  disabled={!selectedShip || gameState.cash < cargo.baseValue * 10}
                  className="w-full p-2 bg-slate-800 text-white rounded-lg text-xs hover:bg-slate-700 disabled:opacity-50 flex justify-between"
                >
                  <span>{cargo.emoji} {cargo.type}</span>
                  <span>${cargo.baseValue * 10}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-white font-bold mb-3">📊 Stats</h4>
            <div className="space-y-2">
              <div className="bg-slate-800 rounded-xl p-3">
                <div className="text-slate-400 text-sm">Total Revenue</div>
                <div className="text-green-400 font-bold">${gameState.totalRevenue.toLocaleString()}</div>
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
