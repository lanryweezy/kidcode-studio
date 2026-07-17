import React, { useState, useEffect, useCallback } from 'react';
import { Film, Ticket, Users, Star, TrendingUp, DollarSign, Clock, Popcorn } from 'lucide-react';

interface Movie {
  id: string;
  title: string;
  emoji: string;
  genre: string;
  budget: number;
  quality: number;
  ticketsSold: number;
  rating: number;
  status: 'showing' | 'coming_soon' | 'archived';
}

interface Screen {
  id: string;
  movie: Movie | null;
  capacity: number;
  currentAudience: number;
}

interface GameState {
  day: number;
  cash: number;
  reputation: number;
  screens: Screen[];
  movieLibrary: Movie[];
  totalRevenue: number;
  totalTicketsSold: number;
  goal: number;
  gameOver: boolean;
}

const MOVIE_TITLES = [
  { title: 'Space Adventure', emoji: '🚀', genre: 'Sci-Fi', budget: 5000, quality: 70 },
  { title: 'Love Story', emoji: '💕', genre: 'Romance', budget: 2000, quality: 60 },
  { title: 'Action Hero', emoji: '💥', genre: 'Action', budget: 8000, quality: 80 },
  { title: 'Comedy Night', emoji: '😂', genre: 'Comedy', budget: 3000, quality: 65 },
  { title: 'Horror House', emoji: '👻', genre: 'Horror', budget: 4000, quality: 75 },
  { title: 'Animated Tale', emoji: '🎨', genre: 'Animation', budget: 6000, quality: 85 },
];

export const CinemaTycoonGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    cash: 15000,
    reputation: 50,
    screens: [
      { id: 'screen_1', movie: null, capacity: 100, currentAudience: 0 },
      { id: 'screen_2', movie: null, capacity: 80, currentAudience: 0 },
      { id: 'screen_3', movie: null, capacity: 120, currentAudience: 0 },
    ],
    movieLibrary: [],
    totalRevenue: 0,
    totalTicketsSold: 0,
    goal: 75000,
    gameOver: false,
  });

  const [selectedScreen, setSelectedScreen] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Acquire movie
  const acquireMovie = useCallback((movieIndex: number) => {
    setGameState(prev => {
      const template = MOVIE_TITLES[movieIndex];
      if (prev.cash < template.budget) {
        setNotification('Not enough cash!');
        setTimeout(() => setNotification(null), 1500);
        return prev;
      }

      const newMovie: Movie = {
        id: `movie_${Date.now()}`,
        ...template,
        ticketsSold: 0,
        rating: template.quality,
        status: 'showing' as const,
      };

      return {
        ...prev,
        cash: prev.cash - template.budget,
        movieLibrary: [...prev.movieLibrary, newMovie],
      };
    });
    setNotification('Movie acquired!');
    setTimeout(() => setNotification(null), 1500);
  }, []);

  // Assign movie to screen
  const assignMovie = useCallback((screenId: string, movieId: string) => {
    setGameState(prev => {
      const movie = prev.movieLibrary.find(m => m.id === movieId);
      if (!movie) return prev;

      return {
        ...prev,
        screens: prev.screens.map(s =>
          s.id === screenId ? { ...s, movie } : s
        ),
        movieLibrary: prev.movieLibrary.map(m =>
          m.id === movieId ? { ...m, status: 'showing' as const } : m
        ),
      };
    });
    setNotification('Movie assigned!');
    setTimeout(() => setNotification(null), 1500);
  }, []);

  // Game tick
  const tick = useCallback(() => {
    if (isPaused || gameState.gameOver) return;

    setGameState(prev => {
      const newDay = prev.day + 0.1 * speed;

      // Process screenings
      let dayRevenue = 0;
      let dayTickets = 0;

      const updatedScreens = prev.screens.map(screen => {
        if (!screen.movie) return screen;

        const audience = Math.floor(screen.capacity * (screen.movie.quality / 100) * (0.3 + Math.random() * 0.4));
        const ticketPrice = 10 + Math.floor(screen.movie.quality / 10);
        const screenRevenue = audience * ticketPrice;

        dayRevenue += screenRevenue;
        dayTickets += audience;

        return { ...screen, currentAudience: audience };
      });

      return {
        ...prev,
        day: newDay,
        screens: updatedScreens,
        cash: prev.cash + dayRevenue,
        totalRevenue: prev.totalRevenue + dayRevenue,
        totalTicketsSold: prev.totalTicketsSold + dayTickets,
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
            <div className="text-blue-400 font-bold">🎬 {gameState.screens.filter(s => s.movie).length}</div>
            <div className="text-slate-500 text-xs">Active Screens</div>
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
        {/* Screens */}
        <div className="flex-1 bg-slate-950 p-6">
          <h3 className="text-white font-bold mb-4">🎬 Screens</h3>
          <div className="grid grid-cols-3 gap-6">
            {gameState.screens.map(screen => (
              <div
                key={screen.id}
                onClick={() => setSelectedScreen(screen.id)}
                className={`p-6 rounded-xl cursor-pointer transition-all ${
                  selectedScreen === screen.id
                    ? 'bg-slate-700 border-2 border-yellow-500'
                    : 'bg-slate-800/50 border border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="text-center mb-4">
                  <div className="text-sm text-slate-400 mb-2">Screen {screen.id.split('_')[1]}</div>
                  {screen.movie ? (
                    <>
                      <span className="text-5xl">{screen.movie.emoji}</span>
                      <div className="text-white font-bold mt-2">{screen.movie.title}</div>
                      <div className="text-slate-400 text-sm">{screen.movie.genre}</div>
                      <div className="mt-3 flex justify-center gap-4 text-sm">
                        <span className="text-green-400">⭐ {screen.movie.quality}</span>
                        <span className="text-blue-400">👥 {screen.currentAudience}/{screen.capacity}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-500">
                      <div className="text-4xl mb-2">🎬</div>
                      <p>No movie showing</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Movie Library */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto">
          <h3 className="text-white font-bold mb-4">🎞️ Movie Library</h3>
          <div className="space-y-3">
            {MOVIE_TITLES.map((template, i) => (
              <div key={i} className="bg-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{template.emoji}</span>
                  <div className="flex-1">
                    <div className="text-white font-bold text-sm">{template.title}</div>
                    <div className="text-slate-400 text-xs">{template.genre}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 text-sm">${template.budget}</div>
                    <div className="text-slate-500 text-xs">Quality: {template.quality}</div>
                  </div>
                </div>
                <button
                  onClick={() => acquireMovie(i)}
                  disabled={gameState.cash < template.budget}
                  className="w-full px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                >
                  Acquire
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="text-white font-bold mb-3">📊 Stats</h4>
            <div className="space-y-2">
              <div className="bg-slate-800 rounded-xl p-3">
                <div className="text-slate-400 text-sm">Total Revenue</div>
                <div className="text-green-400 font-bold">${gameState.totalRevenue.toLocaleString()}</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-3">
                <div className="text-slate-400 text-sm">Tickets Sold</div>
                <div className="text-blue-400 font-bold">{gameState.totalTicketsSold.toLocaleString()}</div>
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
