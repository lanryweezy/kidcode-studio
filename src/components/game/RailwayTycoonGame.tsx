import React, { useState, useEffect, useCallback } from 'react';
import { Train, MapPin, Users, DollarSign, Clock, Wrench, Route, Package } from 'lucide-react';

interface Station {
  id: string;
  name: string;
  emoji: string;
  passengers: number;
  cargo: number;
}

interface TrainLine {
  id: string;
  name: string;
  stations: string[];
  ticketPrice: number;
  frequency: number;
  passengers: number;
  revenue: number;
}

interface GameState {
  day: number;
  cash: number;
  reputation: number;
  stations: Station[];
  lines: TrainLine[];
  totalRevenue: number;
  totalPassengers: number;
  goal: number;
  gameOver: boolean;
}

const STATION_NAMES = ['Central', 'North', 'South', 'East', 'West', 'Airport', 'Harbor', 'University'];
const STATION_EMOJIS = ['🏛️', '🏔️', '🏖️', '🌅', '🌄', '✈️', '⚓', '🎓'];

export const RailwayTycoonGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    cash: 20000,
    reputation: 50,
    stations: STATION_NAMES.slice(0, 5).map((name, i) => ({
      id: `station_${i}`,
      name,
      emoji: STATION_EMOJIS[i],
      passengers: 50 + Math.floor(Math.random() * 50),
      cargo: 20 + Math.floor(Math.random() * 30),
    })),
    lines: [],
    totalRevenue: 0,
    totalPassengers: 0,
    goal: 100000,
    gameOver: false,
  });

  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [creatingLine, setCreatingLine] = useState<string[]>([]);

  // Create train line
  const createLine = useCallback(() => {
    if (creatingLine.length < 2) {
      setNotification('Select at least 2 stations!');
      setTimeout(() => setNotification(null), 1500);
      return;
    }

    setGameState(prev => {
      const cost = creatingLine.length * 5000;
      if (prev.cash < cost) {
        setNotification('Not enough cash!');
        setTimeout(() => setNotification(null), 1500);
        return prev;
      }

      return {
        ...prev,
        cash: prev.cash - cost,
        lines: [...prev.lines, {
          id: `line_${Date.now()}`,
          name: `Line ${prev.lines.length + 1}`,
          stations: creatingLine,
          ticketPrice: 10,
          frequency: 5,
          passengers: 0,
          revenue: 0,
        }],
      };
    });
    setCreatingLine([]);
    setNotification('Train line created!');
    setTimeout(() => setNotification(null), 1500);
  }, [creatingLine]);

  // Game tick
  const tick = useCallback(() => {
    if (isPaused || gameState.gameOver) return;

    setGameState(prev => {
      let newDay = prev.day + 0.1 * speed;

      // Process train lines
      let dayRevenue = 0;
      let dayPassengers = 0;

      const updatedLines = prev.lines.map(line => {
        const passengers = Math.floor(line.stations.length * 20 * (prev.reputation / 100));
        const revenue = passengers * line.ticketPrice;

        dayRevenue += revenue;
        dayPassengers += passengers;

        return { ...line, passengers, revenue };
      });

      // Update station passengers
      const updatedStations = prev.stations.map(station => ({
        ...station,
        passengers: Math.max(10, station.passengers + Math.floor((Math.random() - 0.5) * 10)),
      }));

      return {
        ...prev,
        day: newDay,
        lines: updatedLines,
        stations: updatedStations,
        cash: prev.cash + dayRevenue,
        totalRevenue: prev.totalRevenue + dayRevenue,
        totalPassengers: prev.totalPassengers + dayPassengers,
        gameOver: prev.cash + dayRevenue >= prev.goal,
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
            <div className="text-blue-400 font-bold">🚂 {gameState.lines.length}</div>
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
        {/* Map */}
        <div className="flex-1 bg-slate-950 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">🗺️ Railway Map</h3>
            <button
              onClick={createLine}
              disabled={creatingLine.length < 2}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
            >
              🚂 Create Line ({creatingLine.length} stations)
            </button>
          </div>
          
          <div className="relative w-full h-96 bg-slate-900 rounded-xl border border-slate-700 p-8">
            {gameState.stations.map((station, i) => {
              const angle = (i / gameState.stations.length) * Math.PI * 2;
              const x = 400 + Math.cos(angle) * 200;
              const y = 180 + Math.sin(angle) * 150;
              const isSelected = creatingLine.includes(station.id);

              return (
                <div
                  key={station.id}
                  onClick={() => {
                    if (isSelected) {
                      setCreatingLine(creatingLine.filter(id => id !== station.id));
                    } else {
                      setCreatingLine([...creatingLine, station.id]);
                    }
                  }}
                  className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 ${
                    isSelected ? 'z-10' : 'z-0'
                  }`}
                  style={{ left: x, top: y }}
                >
                  <div className={`text-center p-3 rounded-xl ${
                    isSelected ? 'bg-green-800 border-2 border-green-400' : 'bg-slate-800 border border-slate-600'
                  }`}>
                    <span className="text-3xl">{station.emoji}</span>
                    <div className="text-xs text-white mt-1">{station.name}</div>
                    <div className="text-xs text-slate-400">👥 {station.passengers}</div>
                  </div>
                </div>
              );
            })}

            {/* Draw lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {gameState.lines.map(line => {
                const points = line.stations.map(stationId => {
                  const idx = gameState.stations.findIndex(s => s.id === stationId);
                  const angle = (idx / gameState.stations.length) * Math.PI * 2;
                  return {
                    x: 400 + Math.cos(angle) * 200,
                    y: 180 + Math.sin(angle) * 150,
                  };
                });
                
                const pathPoints = points.map(p => `${p.x},${p.y}`).join(' ');
                return (
                  <polyline
                    key={line.id}
                    points={pathPoints}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* Lines Panel */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto">
          <h3 className="text-white font-bold mb-4">🚂 Train Lines</h3>
          <div className="space-y-3">
            {gameState.lines.map(line => (
              <div
                key={line.id}
                onClick={() => setSelectedLine(line.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  selectedLine === line.id
                    ? 'bg-slate-700 border border-slate-600'
                    : 'bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-bold">{line.name}</div>
                  <div className="text-green-400 font-bold">${line.revenue}</div>
                </div>
                <div className="text-slate-400 text-xs mb-2">
                  {line.stations.length} stations • {line.passengers} passengers
                </div>
                <div className="flex gap-1">
                  {line.stations.map(stationId => {
                    const station = gameState.stations.find(s => s.id === stationId);
                    return station ? (
                      <span key={stationId} className="text-lg">{station.emoji}</span>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
            {gameState.lines.length === 0 && (
              <div className="text-slate-500 text-center py-8">
                <div className="text-4xl mb-2">🚂</div>
                <p>Click stations on the map to create a line</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h4 className="text-white font-bold mb-3">📊 Stats</h4>
            <div className="space-y-2">
              <div className="bg-slate-800 rounded-xl p-3">
                <div className="text-slate-400 text-sm">Total Revenue</div>
                <div className="text-green-400 font-bold">${gameState.totalRevenue.toLocaleString()}</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-3">
                <div className="text-slate-400 text-sm">Total Passengers</div>
                <div className="text-blue-400 font-bold">{gameState.totalPassengers.toLocaleString()}</div>
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
