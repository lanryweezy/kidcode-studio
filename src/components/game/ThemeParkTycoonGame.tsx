import React, { useState, useEffect, useCallback } from 'react';
import { Ticket, Users, Star, TrendingUp, DollarSign, Clock, Wrench, Palette } from 'lucide-react';

interface Ride {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  ticketPrice: number;
  capacity: number;
  currentRiders: number;
  excitement: number;
  maintenance: number;
  level: number;
}

interface Guest {
  id: string;
  emoji: string;
  happiness: number;
  money: number;
  ridesRidden: number;
}

interface GameState {
  day: number;
  hour: number;
  cash: number;
  reputation: number;
  rides: Ride[];
  guests: Guest[];
  totalRevenue: number;
  totalGuests: number;
  goal: number;
  gameOver: boolean;
}

const RIDE_TYPES = [
  { name: 'Ferris Wheel', emoji: '🎡', cost: 2000, ticketPrice: 10, capacity: 20, excitement: 50 },
  { name: 'Roller Coaster', emoji: '🎢', cost: 5000, ticketPrice: 15, capacity: 30, excitement: 90 },
  { name: 'Carousel', emoji: '🎠', cost: 1500, ticketPrice: 8, capacity: 15, excitement: 40 },
  { name: 'Bumper Cars', emoji: '🚗', cost: 3000, ticketPrice: 12, capacity: 10, excitement: 70 },
  { name: 'Drop Tower', emoji: '🗼', cost: 4000, ticketPrice: 14, capacity: 12, excitement: 85 },
  { name: 'Water Slide', emoji: '🏊', cost: 3500, ticketPrice: 11, capacity: 25, excitement: 75 },
];

const GUEST_EMOJIS = ['🧑', '👩', '👴', '👧', '👦', '👨‍👩‍👧', '👫', '🧒'];

export const ThemeParkTycoonGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    hour: 9,
    cash: 10000,
    reputation: 50,
    rides: RIDE_TYPES.slice(0, 3).map((type, i) => ({
      id: `ride_${i}`,
      ...type,
      currentRiders: 0,
      maintenance: 100,
      level: 1,
    })),
    guests: [],
    totalRevenue: 0,
    totalGuests: 0,
    goal: 50000,
    gameOver: false,
  });

  const [selectedRide, setSelectedRide] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Add ride
  const addRide = useCallback((typeIndex: number) => {
    setGameState(prev => {
      const type = RIDE_TYPES[typeIndex];
      if (prev.cash < type.cost) {
        setNotification('Not enough cash!');
        setTimeout(() => setNotification(null), 1500);
        return prev;
      }

      return {
        ...prev,
        cash: prev.cash - type.cost,
        rides: [...prev.rides, {
          id: `ride_${Date.now()}`,
          ...type,
          currentRiders: 0,
          maintenance: 100,
          level: 1,
        }],
      };
    });
    setNotification('New ride built!');
    setTimeout(() => setNotification(null), 1500);
  }, []);

  // Upgrade ride
  const upgradeRide = useCallback((rideId: string) => {
    setGameState(prev => {
      const ride = prev.rides.find(r => r.id === rideId);
      if (!ride || prev.cash < ride.cost * 0.5) return prev;

      return {
        ...prev,
        cash: prev.cash - ride.cost * 0.5,
        rides: prev.rides.map(r =>
          r.id === rideId ? {
            ...r,
            level: r.level + 1,
            capacity: Math.floor(r.capacity * 1.2),
            excitement: Math.min(100, r.excitement + 10),
          } : r
        ),
      };
    });
    setNotification('Ride upgraded!');
    setTimeout(() => setNotification(null), 1500);
  }, []);

  // Spawn guest
  const spawnGuest = useCallback(() => {
    setGameState(prev => {
      if (prev.guests.length >= 50) return prev;

      return {
        ...prev,
        guests: [...prev.guests, {
          id: `guest_${Date.now()}`,
          emoji: GUEST_EMOJIS[Math.floor(Math.random() * GUEST_EMOJIS.length)],
          happiness: 80,
          money: 50 + Math.floor(Math.random() * 100),
          ridesRidden: 0,
        }],
      };
    });
  }, []);

  // Game tick
  const tick = useCallback(() => {
    if (isPaused || gameState.gameOver) return;

    setGameState(prev => {
      let newHour = prev.hour + 0.1 * speed;
      let newDay = prev.day;

      if (newHour >= 22) {
        newHour = 9;
        newDay++;
      }

      // Spawn guests during opening hours
      if (newHour >= 10 && newHour <= 20 && Math.random() < 0.3 * speed) {
        setTimeout(spawnGuest, 0);
      }

      // Process rides
      let revenue = 0;
      const updatedRides = prev.rides.map(ride => {
        if (ride.maintenance <= 0) return ride;
        
        const riders = Math.min(ride.capacity, Math.floor(Math.random() * ride.capacity * 0.5));
        const rideRevenue = riders * ride.ticketPrice;
        revenue += rideRevenue;

        return {
          ...ride,
          currentRiders: riders,
          maintenance: Math.max(0, ride.maintenance - 0.1 * speed),
        };
      });

      // Update guests
      const updatedGuests = prev.guests
        .map(guest => {
          if (Math.random() < 0.2 * speed) {
            return {
              ...guest,
              happiness: Math.max(0, guest.happiness - 2),
              ridesRidden: guest.ridesRidden + 1,
            };
          }
          return guest;
        })
        .filter(guest => guest.happiness > 0);

      return {
        ...prev,
        hour: newHour,
        day: newDay,
        rides: updatedRides,
        guests: updatedGuests,
        cash: prev.cash + revenue,
        totalRevenue: prev.totalRevenue + revenue,
        totalGuests: prev.totalGuests + updatedGuests.length,
        gameOver: prev.cash + revenue >= prev.goal,
      };
    });
  }, [isPaused, gameState.gameOver, speed, spawnGuest]);

  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="text-slate-400 hover:text-white">🏠</button>
          <span className="text-white font-bold">Day {gameState.day}</span>
          <span className="text-slate-400">⏰ {Math.floor(gameState.hour)}:00</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-green-400 font-bold">${gameState.cash.toLocaleString()}</div>
            <div className="text-slate-500 text-xs">Cash</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-bold">👥 {gameState.guests.length}</div>
            <div className="text-slate-500 text-xs">Guests</div>
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
        {/* Rides Grid */}
        <div className="flex-1 bg-slate-950 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">🎢 Your Rides</h3>
            <div className="flex gap-2">
              {RIDE_TYPES.slice(0, 4).map((type, i) => (
                <button
                  key={i}
                  onClick={() => addRide(i)}
                  disabled={gameState.cash < type.cost}
                  className="px-3 py-1 bg-slate-700 text-white rounded text-xs hover:bg-slate-600 disabled:opacity-50"
                >
                  + {type.emoji} ${type.cost}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {gameState.rides.map(ride => (
              <div
                key={ride.id}
                onClick={() => setSelectedRide(ride.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedRide === ride.id
                    ? 'bg-slate-700 border-2 border-yellow-500'
                    : 'bg-slate-800/50 border border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="text-center mb-3">
                  <span className="text-4xl">{ride.emoji}</span>
                </div>
                <div className="text-white font-bold text-center mb-1">{ride.name}</div>
                <div className="text-slate-400 text-xs text-center mb-3">Level {ride.level}</div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Riders</span>
                    <span className="text-blue-400">{ride.currentRiders}/{ride.capacity}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Excitement</span>
                    <span className="text-yellow-400">{ride.excitement}%</span>
                  </div>
                  <div className="h-1 bg-slate-700 rounded-full">
                    <div
                      className={`h-full transition-all ${
                        ride.maintenance > 50 ? 'bg-green-500' : ride.maintenance > 20 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${ride.maintenance}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); upgradeRide(ride.id); }}
                    disabled={gameState.cash < ride.cost * 0.5}
                    className="flex-1 px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 disabled:opacity-50"
                  >
                    ⬆️
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="flex-1 px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                  >
                    🔧
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guests Panel */}
        <div className="w-72 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto">
          <h3 className="text-white font-bold mb-4">👥 Guests ({gameState.guests.length})</h3>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {gameState.guests.slice(0, 20).map(guest => (
              <div key={guest.id} className="text-center">
                <span className="text-2xl">{guest.emoji}</span>
                <div className="h-1 bg-slate-700 rounded-full mt-1">
                  <div
                    className={`h-full ${
                      guest.happiness > 60 ? 'bg-green-500' : guest.happiness > 30 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${guest.happiness}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <h4 className="text-white font-bold mb-3">📊 Stats</h4>
          <div className="space-y-3">
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Total Revenue</div>
              <div className="text-green-400 font-bold">${gameState.totalRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Total Guests</div>
              <div className="text-blue-400 font-bold">{gameState.totalGuests.toLocaleString()}</div>
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
