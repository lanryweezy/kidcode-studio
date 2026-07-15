import React, { useState, useEffect, useCallback } from 'react';
import { Building, Users, Star, Clock, DollarSign, Wrench, Coffee, Bed } from 'lucide-react';

interface Room {
  id: string;
  type: string;
  emoji: string;
  name: string;
  price: number;
  cleanliness: number;
  occupied: boolean;
  guest: Guest | null;
}

interface Guest {
  id: string;
  emoji: string;
  name: string;
  stayDuration: number;
  satisfaction: number;
  budget: number;
}

interface Staff {
  id: string;
  type: string;
  emoji: string;
  name: string;
  salary: number;
  skill: number;
}

interface GameState {
  day: number;
  hour: number;
  cash: number;
  reputation: number;
  rooms: Room[];
  staff: Staff[];
  totalRevenue: number;
  totalGuests: number;
  goal: number;
  gameOver: boolean;
}

const ROOM_TYPES = [
  { type: 'single', emoji: '🛏️', name: 'Single Room', price: 80, baseRate: 0.3 },
  { type: 'double', emoji: '🛌', name: 'Double Room', price: 120, baseRate: 0.25 },
  { type: 'suite', emoji: '🏨', name: 'Suite', price: 200, baseRate: 0.15 },
  { type: 'penthouse', emoji: '👑', name: 'Penthouse', price: 500, baseRate: 0.05 },
];

const STAFF_TYPES = [
  { type: 'cleaner', emoji: '🧹', name: 'Cleaner', salary: 50, skill: 1 },
  { type: 'receptionist', emoji: '💁', name: 'Receptionist', salary: 80, skill: 1 },
  { type: 'chef', emoji: '👨‍🍳', name: 'Chef', salary: 100, skill: 1 },
];

const GUEST_EMOJIS = ['🧑', '👩', '👴', '👧', '💼', '🎓', '👩‍⚕️', '👨‍💼'];

export const HotelManagementGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    hour: 6,
    cash: 2000,
    reputation: 50,
    rooms: Array(8).fill(null).map((_, i) => ({
      id: `room_${i}`,
      ...ROOM_TYPES[i % ROOM_TYPES.length],
      cleanliness: 100,
      occupied: false,
      guest: null,
    })),
    staff: [{ id: 'staff_1', ...STAFF_TYPES[0], name: 'Alice' }],
    totalRevenue: 0,
    totalGuests: 0,
    goal: 20000,
    gameOver: false,
  });

  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Check in guest
  const checkInGuest = useCallback((roomId: string) => {
    setGameState(prev => {
      const room = prev.rooms.find(r => r.id === roomId);
      if (!room || room.occupied) return prev;

      const guest: Guest = {
        id: `guest_${Date.now()}`,
        emoji: GUEST_EMOJIS[Math.floor(Math.random() * GUEST_EMOJIS.length)],
        name: `Guest ${prev.totalGuests + 1}`,
        stayDuration: 1 + Math.floor(Math.random() * 3),
        satisfaction: 100,
        budget: room.price * (1 + Math.random() * 0.5),
      };

      return {
        ...prev,
        rooms: prev.rooms.map(r => r.id === roomId ? { ...r, occupied: true, guest } : r),
        cash: prev.cash + room.price,
        totalRevenue: prev.totalRevenue + room.price,
        totalGuests: prev.totalGuests + 1,
      };
    });
    setNotification('Guest checked in!');
    setTimeout(() => setNotification(null), 1500);
  }, []);

  // Check out guest
  const checkOutGuest = useCallback((roomId: string) => {
    setGameState(prev => {
      const room = prev.rooms.find(r => r.id === roomId);
      if (!room || !room.occupied) return prev;

      return {
        ...prev,
        rooms: prev.rooms.map(r => r.id === roomId ? { ...r, occupied: false, guest: null, cleanliness: Math.max(0, r.cleanliness - 30) } : r),
      };
    });
  }, []);

  // Clean room
  const cleanRoom = useCallback((roomId: string) => {
    setGameState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id === roomId ? { ...r, cleanliness: 100 } : r),
    }));
  }, []);

  // Hire staff
  const hireStaff = useCallback((type: string) => {
    setGameState(prev => {
      const staffType = STAFF_TYPES.find(s => s.type === type);
      if (!staffType || prev.cash < staffType.salary * 3) return prev;

      return {
        ...prev,
        cash: prev.cash - staffType.salary * 3,
        staff: [...prev.staff, { ...staffType, id: `staff_${Date.now()}`, name: `Staff ${prev.staff.length + 1}` }],
      };
    });
  }, []);

  // Game tick
  const tick = useCallback(() => {
    if (isPaused || gameState.gameOver) return;

    setGameState(prev => {
      let newHour = prev.hour + 0.1 * speed;
      let newDay = prev.day;

      if (newHour >= 24) {
        newHour = 0;
        newDay++;
      }

      // Process guest checkouts
      const updatedRooms = prev.rooms.map(room => {
        if (!room.occupied || !room.guest) return room;
        
        const newGuest = { ...room.guest, stayDuration: room.guest.stayDuration - 0.1 * speed };
        
        if (newGuest.stayDuration <= 0) {
          return { ...room, occupied: false, guest: null, cleanliness: Math.max(0, room.cleanliness - 20) };
        }
        
        return { ...room, guest: newGuest };
      });

      // Spawn new guests
      const emptyRooms = updatedRooms.filter(r => !r.occupied);
      if (emptyRooms.length > 0 && Math.random() < 0.2 * speed) {
        const roomToFill = emptyRooms[Math.floor(Math.random() * emptyRooms.length)];
        const guest: Guest = {
          id: `guest_${Date.now()}`,
          emoji: GUEST_EMOJIS[Math.floor(Math.random() * GUEST_EMOJIS.length)],
          name: `Guest ${prev.totalGuests + 1}`,
          stayDuration: 1 + Math.floor(Math.random() * 3),
          satisfaction: 100,
          budget: roomToFill.price * (1 + Math.random() * 0.5),
        };
        
        const idx = updatedRooms.findIndex(r => r.id === roomToFill.id);
        updatedRooms[idx] = { ...roomToFill, occupied: true, guest };
      }

      // Pay staff
      const staffCost = prev.staff.reduce((sum, s) => sum + s.salary / 30, 0) * speed;

      return {
        ...prev,
        hour: newHour,
        day: newDay,
        rooms: updatedRooms,
        cash: prev.cash - staffCost,
        totalRevenue: prev.totalRevenue,
        gameOver: prev.cash >= prev.goal,
      };
    });
  }, [isPaused, gameState.gameOver, speed]);

  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      {/* Top Bar */}
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
        {/* Rooms Grid */}
        <div className="flex-1 bg-slate-950 p-6">
          <h3 className="text-white font-bold mb-4">🏨 Hotel Rooms</h3>
          <div className="grid grid-cols-4 gap-4">
            {gameState.rooms.map(room => (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedRoom === room.id
                    ? 'bg-slate-700 border-2 border-slate-500'
                    : room.occupied
                    ? 'bg-slate-800 border border-green-700'
                    : 'bg-slate-800/50 border border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="text-center mb-2">
                  <span className="text-3xl">{room.emoji}</span>
                </div>
                <div className="text-white text-sm font-bold text-center">{room.name}</div>
                <div className="text-slate-400 text-xs text-center">${room.price}/night</div>
                
                {room.occupied && room.guest ? (
                  <div className="mt-3 text-center">
                    <span className="text-2xl">{room.guest.emoji}</span>
                    <div className="text-xs text-green-400 mt-1">Occupied</div>
                    <div className="h-1 bg-slate-700 rounded-full mt-2">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${(room.guest.stayDuration / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); checkInGuest(room.id); }}
                    className="w-full mt-3 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                  >
                    Check In
                  </button>
                )}

                <div className="mt-2">
                  <div className="text-xs text-slate-500 mb-1">Cleanliness</div>
                  <div className="h-1 bg-slate-700 rounded-full">
                    <div
                      className={`h-full transition-all ${
                        room.cleanliness > 70 ? 'bg-green-500' : room.cleanliness > 30 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${room.cleanliness}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Panel */}
        <div className="w-72 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto">
          <h3 className="text-white font-bold mb-4">👥 Staff</h3>
          <div className="space-y-3">
            {gameState.staff.map(staff => (
              <div key={staff.id} className="bg-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{staff.emoji}</span>
                  <div>
                    <div className="text-white font-bold text-sm">{staff.name}</div>
                    <div className="text-slate-500 text-xs">{staff.type} • ${staff.salary}/mo</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <h4 className="text-white font-bold text-sm mb-2">Hire Staff</h4>
            {STAFF_TYPES.map(type => (
              <button
                key={type.type}
                onClick={() => hireStaff(type.type)}
                disabled={gameState.cash < type.salary * 3}
                className="w-full p-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50"
              >
                {type.emoji} Hire {type.name} (${type.salary * 3})
              </button>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="text-white font-bold text-sm mb-2">Goal</h4>
            <div className="bg-slate-800 rounded-xl p-3">
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
