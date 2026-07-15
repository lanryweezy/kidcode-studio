import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShoppingCart, Users, Clock, Star, TrendingUp, Package, DollarSign, AlertTriangle } from 'lucide-react';
import { StatCard, ProgressBar, GameTopBar, NotificationToast, GoalProgress, GamePanel } from '../ui/TycoonUI';
import { CUSTOMER_EVENTS, generateEvent } from '../../services/businessEventSystem';
import { saveTycoonGame } from '../../services/tycoonSaveService';

interface Product {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  price: number;
  stock: number;
  maxStock: number;
  sellRate: number;
  category: string;
}

interface Customer {
  id: string;
  emoji: string;
  patience: number;
  items: string[];
  satisfaction: number;
}

interface GameState {
  day: number;
  hour: number;
  cash: number;
  reputation: number;
  products: Product[];
  customers: Customer[];
  totalSales: number;
  totalCustomers: number;
  unhappyCustomers: number;
  goal: number;
  gameOver: boolean;
  upgrades: Record<string, number>;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: 'bread', name: 'Bread', emoji: '🍞', cost: 1, price: 3, stock: 20, maxStock: 50, sellRate: 0.8, category: 'food' },
  { id: 'milk', name: 'Milk', emoji: '🥛', cost: 2, price: 5, stock: 15, maxStock: 30, sellRate: 0.6, category: 'food' },
  { id: 'apple', name: 'Apples', emoji: '🍎', cost: 1.5, price: 4, stock: 25, maxStock: 40, sellRate: 0.7, category: 'food' },
  { id: 'cheese', name: 'Cheese', emoji: '🧀', cost: 3, price: 8, stock: 10, maxStock: 20, sellRate: 0.4, category: 'food' },
  { id: 'candy', name: 'Candy', emoji: '🍬', cost: 0.5, price: 2, stock: 50, maxStock: 100, sellRate: 1.2, category: 'snacks' },
  { id: 'chocolate', name: 'Chocolate', emoji: '🍫', cost: 2, price: 6, stock: 15, maxStock: 30, sellRate: 0.5, category: 'snacks' },
];

const CUSTOMER_EMOJIS = ['🧑', '👩', '👴', '👧', '👦', '🧔', '👩‍🦰', '👨‍🦱'];

export const ShopManagementGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    hour: 8,
    cash: 500,
    reputation: 50,
    products: INITIAL_PRODUCTS.map(p => ({ ...p })),
    customers: [],
    totalSales: 0,
    totalCustomers: 0,
    unhappyCustomers: 0,
    goal: 10000,
    gameOver: false,
    upgrades: { shelves: 1, cashier: 1, storage: 1 },
  });

  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showRestock, setShowRestock] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Spawn customers
  const spawnCustomer = useCallback(() => {
    setGameState(prev => {
      if (prev.customers.length >= 5 + prev.upgrades.shelves) return prev;
      
      const customer: Customer = {
        id: `cust_${Date.now()}`,
        emoji: CUSTOMER_EMOJIS[Math.floor(Math.random() * CUSTOMER_EMOJIS.length)],
        patience: 30 + Math.random() * 30,
        items: [prev.products[Math.floor(Math.random() * prev.products.length)].id],
        satisfaction: 100,
      };
      
      return { ...prev, customers: [...prev.customers, customer] };
    });
  }, []);

  // Update customers
  const updateCustomers = useCallback((dt: number) => {
    setGameState(prev => {
      let unhappyCount = 0;
      const updatedCustomers = prev.customers
        .map(c => {
          const newPatience = c.patience - dt;
          if (newPatience <= 0) {
            unhappyCount++;
            return null;
          }
          return { ...c, patience: newPatience, satisfaction: Math.min(100, (newPatience / 60) * 100) };
        })
        .filter(Boolean) as Customer[];

      return {
        ...prev,
        customers: updatedCustomers,
        unhappyCustomers: prev.unhappyCustomers + unhappyCount,
        reputation: Math.max(0, prev.reputation - unhappyCount * 5),
      };
    });
  }, []);

  // Sell to customer
  const sellToCustomer = useCallback((customerId: string, productId: string) => {
    setGameState(prev => {
      const customer = prev.customers.find(c => c.id === customerId);
      const product = prev.products.find(p => p.id === productId);
      
      if (!customer || !product || product.stock <= 0) return prev;

      const revenue = product.price;
      const newStock = product.stock - 1;
      
      return {
        ...prev,
        cash: prev.cash + revenue,
        totalSales: prev.totalSales + revenue,
        totalCustomers: prev.totalCustomers + 1,
        reputation: Math.min(100, prev.reputation + 2),
        products: prev.products.map(p => 
          p.id === productId ? { ...p, stock: newStock } : p
        ),
        customers: prev.customers.filter(c => c.id !== customerId),
      };
    });
    setNotification('Sale complete!');
    setTimeout(() => setNotification(null), 1500);
  }, []);

  // Restock product
  const restockProduct = useCallback((productId: string, amount: number) => {
    setGameState(prev => {
      const product = prev.products.find(p => p.id === productId);
      if (!product) return prev;

      const cost = product.cost * amount;
      if (cost > prev.cash) {
        setNotification('Not enough cash!');
        setTimeout(() => setNotification(null), 1500);
        return prev;
      }

      return {
        ...prev,
        cash: prev.cash - cost,
        products: prev.products.map(p =>
          p.id === productId ? { ...p, stock: Math.min(p.maxStock, p.stock + amount) } : p
        ),
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
        newHour = 8;
        newDay++;
      }

      // Spawn customers based on time and reputation
      const spawnChance = (prev.reputation / 100) * 0.3 * speed;
      if (Math.random() < spawnChance) {
        setTimeout(spawnCustomer, 0);
      }

      // Update customers
      updateCustomers(0.1 * speed);

      // Check game over
      const gameOver = prev.cash >= prev.goal;

      return {
        ...prev,
        hour: newHour,
        day: newDay,
        gameOver,
      };
    });
  }, [isPaused, gameState.gameOver, speed, spawnCustomer, updateCustomers]);

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
          <div className="text-center">
            <div className="text-blue-400 font-bold">{gameState.totalCustomers}</div>
            <div className="text-slate-500 text-xs">Customers</div>
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
        {/* Products Panel */}
        <div className="w-80 bg-slate-900 border-r border-slate-800 overflow-y-auto p-4">
          <h3 className="text-white font-bold mb-4">📦 Inventory</h3>
          <div className="space-y-3">
            {gameState.products.map(product => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  selectedProduct === product.id
                    ? 'bg-slate-700 border border-slate-600'
                    : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{product.emoji}</span>
                    <div>
                      <div className="text-white font-bold text-sm">{product.name}</div>
                      <div className="text-slate-500 text-xs">Cost: ${product.cost}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">${product.price}</div>
                    <div className="text-slate-500 text-xs">Stock: {product.stock}/{product.maxStock}</div>
                  </div>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      product.stock < product.maxStock * 0.2 ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(product.stock / product.maxStock) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowRestock(!showRestock)}
            className="w-full mt-4 bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700"
          >
            📦 Restock
          </button>
        </div>

        {/* Shop Floor */}
        <div className="flex-1 bg-slate-950 p-6">
          <h3 className="text-white font-bold mb-4">🏪 Shop Floor</h3>
          <div className="grid grid-cols-3 gap-4">
            {gameState.customers.map(customer => (
              <div key={customer.id} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <div className="text-center mb-3">
                  <span className="text-4xl">{customer.emoji}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full transition-all ${
                      customer.patience > 30 ? 'bg-green-500' : customer.patience > 15 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(customer.patience / 60) * 100}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {customer.items.map(itemId => {
                    const product = gameState.products.find(p => p.id === itemId);
                    return product ? (
                      <button
                        key={itemId}
                        onClick={() => sellToCustomer(customer.id, itemId)}
                        disabled={product.stock <= 0}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                      >
                        {product.emoji} ${product.price}
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
            {gameState.customers.length === 0 && (
              <div className="col-span-3 text-center text-slate-500 py-12">
                <div className="text-4xl mb-2">🛒</div>
                <p>Waiting for customers...</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Panel */}
        <div className="w-64 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto">
          <h3 className="text-white font-bold mb-4">📊 Statistics</h3>
          <div className="space-y-3">
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Total Sales</div>
              <div className="text-green-400 font-bold">${gameState.totalSales.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Customers Served</div>
              <div className="text-blue-400 font-bold">{gameState.totalCustomers}</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Unhappy Customers</div>
              <div className="text-red-400 font-bold">{gameState.unhappyCustomers}</div>
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
